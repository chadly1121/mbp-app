import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";

interface WeeklyRevenue {
  week: string;
  current: number;
  previous: number;
  target: number;
}

const RevenueChart = ({ dateFilters }: { dateFilters?: { startMonth: number; endMonth: number; year: number } }) => {
  const { currentCompany } = useCompany();
  const [revenueData, setRevenueData] = useState<WeeklyRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentCompany?.id) return;

    const fetchRevenueData = async () => {
      try {
        const currentDate = new Date();
        const currentYear = dateFilters?.year || currentDate.getFullYear();
        const previousYear = currentYear - 1;
        
        // Get current quarter to show last 13 weeks
        const currentQuarter = Math.floor((currentDate.getMonth() / 3)) + 1;
        const quarterStartMonth = (currentQuarter - 1) * 3 + 1;
        const quarterEndMonth = currentQuarter * 3;

        // Fetch current quarter data
        const { data: currentQuarterData } = await supabase
          .from('qbo_profit_loss')
          .select('fiscal_month, current_month')
          .eq('company_id', currentCompany.id)
          .eq('fiscal_year', currentYear)
          .eq('account_type', 'revenue')
          .gte('fiscal_month', quarterStartMonth)
          .lte('fiscal_month', quarterEndMonth)
          .order('fiscal_month');

        // Fetch previous quarter data (for comparison)
        let prevQuarter = currentQuarter - 1;
        let prevQuarterYear = currentYear;
        if (prevQuarter === 0) {
          prevQuarter = 4;
          prevQuarterYear = previousYear;
        }
        const prevQuarterStartMonth = (prevQuarter - 1) * 3 + 1;
        const prevQuarterEndMonth = prevQuarter * 3;

        const { data: previousQuarterData } = await supabase
          .from('qbo_profit_loss')
          .select('fiscal_month, current_month')
          .eq('company_id', currentCompany.id)
          .eq('fiscal_year', prevQuarterYear)
          .eq('account_type', 'revenue')
          .gte('fiscal_month', prevQuarterStartMonth)
          .lte('fiscal_month', prevQuarterEndMonth)
          .order('fiscal_month');

        // Fetch forecasted targets
        const { data: forecastData } = await supabase
          .from('revenue_forecasts')
          .select('month, forecasted_amount')
          .eq('company_id', currentCompany.id)
          .eq('year', currentYear)
          .gte('month', quarterStartMonth)
          .lte('month', quarterEndMonth)
          .order('month');

        const processedData: WeeklyRevenue[] = [];

        // Generate 13 weeks of data (approximately one quarter)
        for (let week = 1; week <= 13; week++) {
          // Calculate which month this week falls into (roughly)
          const monthIndex = Math.floor((week - 1) / 4.33);
          const targetMonth = quarterStartMonth + monthIndex;
          
          // Get monthly revenue for current and previous periods
          const currentMonthData = currentQuarterData?.filter(d => d.fiscal_month === targetMonth) || [];
          const previousMonthData = previousQuarterData?.filter(d => d.fiscal_month === prevQuarterStartMonth + monthIndex) || [];
          const forecastMonth = forecastData?.find(d => d.month === targetMonth);

          // Sum all revenue account entries for the month and divide by ~4.33 weeks/month
          const monthlyCurrentRevenue = currentMonthData.reduce((sum, item) => sum + Math.abs(item.current_month || 0), 0);
          const monthlyPreviousRevenue = previousMonthData.reduce((sum, item) => sum + Math.abs(item.current_month || 0), 0);
          const monthlyTargetRevenue = forecastMonth?.forecasted_amount || (monthlyCurrentRevenue > 0 ? monthlyCurrentRevenue * 1.1 : 0);

          // Estimate weekly values (divide monthly by 4.33)
          const weeklyCurrentRevenue = monthlyCurrentRevenue / 4.33;
          const weeklyPreviousRevenue = monthlyPreviousRevenue / 4.33;
          const weeklyTargetRevenue = monthlyTargetRevenue / 4.33;

          processedData.push({
            week: `W${week}`,
            current: weeklyCurrentRevenue,
            previous: weeklyPreviousRevenue,
            target: weeklyTargetRevenue
          });
        }

        setRevenueData(processedData);
      } catch (error) {
        console.error('Error fetching revenue data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [currentCompany?.id, dateFilters]);

  if (loading) {
    return (
      <Card className="bg-gradient-card shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Revenue Trends</CardTitle>
          <p className="text-sm text-muted-foreground">Weekly revenue comparison (current quarter)</p>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Filter to show only months with data
  const filteredData = revenueData.filter(d => d.current > 0 || d.previous > 0);

  if (filteredData.length === 0) {
    return (
      <Card className="bg-gradient-card shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Revenue Trends</CardTitle>
          <p className="text-sm text-muted-foreground">Weekly revenue comparison (current quarter)</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            No revenue data available. Sync with QuickBooks to see your revenue trends.
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="bg-gradient-card shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Revenue Trends</CardTitle>
        <p className="text-sm text-muted-foreground">Weekly revenue comparison (current quarter)</p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="week" 
                className="text-muted-foreground text-xs"
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                className="text-muted-foreground text-xs"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                        <p className="font-medium text-foreground">{label}</p>
                        {payload.map((entry, index) => (
                          <p key={index} style={{ color: entry.color }} className="text-sm">
                            {entry.name}: ${(entry.value as number).toLocaleString()}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="current"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                name="Current Year"
              />
              <Line
                type="monotone"
                dataKey="previous"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "hsl(var(--muted-foreground))", strokeWidth: 2, r: 3 }}
                name="Previous Quarter"
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 3 }}
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;