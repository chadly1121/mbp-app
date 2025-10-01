import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";

interface MonthlyRevenue {
  month: string;
  current: number;
  previous: number;
  target: number;
}

const RevenueChart = ({ dateFilters }: { dateFilters?: { startMonth: number; endMonth: number; year: number } }) => {
  const { currentCompany } = useCompany();
  const [revenueData, setRevenueData] = useState<MonthlyRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentCompany?.id) return;

    const fetchRevenueData = async () => {
      try {
        const currentYear = dateFilters?.year || new Date().getFullYear();
        const previousYear = currentYear - 1;
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Fetch current year data
        const { data: currentYearData } = await supabase
          .from('qbo_profit_loss')
          .select('fiscal_month, current_month')
          .eq('company_id', currentCompany.id)
          .eq('fiscal_year', currentYear)
          .eq('account_type', 'revenue')
          .order('fiscal_month');

        // Fetch previous year data
        const { data: previousYearData } = await supabase
          .from('qbo_profit_loss')
          .select('fiscal_month, current_month')
          .eq('company_id', currentCompany.id)
          .eq('fiscal_year', previousYear)
          .eq('account_type', 'revenue')
          .order('fiscal_month');

        // Fetch forecasted targets
        const { data: forecastData } = await supabase
          .from('revenue_forecasts')
          .select('month, forecasted_amount')
          .eq('company_id', currentCompany.id)
          .eq('year', currentYear)
          .order('month');

        const processedData: MonthlyRevenue[] = [];

        // Determine which months to display based on date filters
        const startMonth = dateFilters?.startMonth || 1;
        const endMonth = dateFilters?.endMonth || 12;

        for (let i = startMonth; i <= endMonth; i++) {
          const currentMonthData = currentYearData?.filter(d => d.fiscal_month === i) || [];
          const previousMonthData = previousYearData?.filter(d => d.fiscal_month === i) || [];
          const forecastMonth = forecastData?.find(d => d.month === i);

          // Sum all revenue account entries for the month
          const currentRevenue = currentMonthData.reduce((sum, item) => sum + Math.abs(item.current_month || 0), 0);
          const previousRevenue = previousMonthData.reduce((sum, item) => sum + Math.abs(item.current_month || 0), 0);
          const targetRevenue = forecastMonth?.forecasted_amount || (currentRevenue > 0 ? currentRevenue * 1.1 : 0);

          processedData.push({
            month: monthNames[i - 1],
            current: currentRevenue,
            previous: previousRevenue,
            target: targetRevenue
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
          <p className="text-sm text-muted-foreground">Monthly revenue comparison and targets</p>
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
          <p className="text-sm text-muted-foreground">Monthly revenue comparison and targets</p>
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
        <p className="text-sm text-muted-foreground">Monthly revenue comparison and targets</p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
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
                name="Previous Year"
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