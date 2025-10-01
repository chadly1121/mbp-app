import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";
import { TrendingUp, TrendingDown } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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

        // Generate 52 weeks of data (full year)
        for (let week = 1; week <= 52; week++) {
          // Calculate which month this week falls into (roughly 4.33 weeks per month)
          const monthIndex = Math.floor((week - 1) / 4.33);
          const targetMonth = (monthIndex % 12) + 1;
          
          // Get monthly revenue for current and previous periods
          const currentMonthData = currentQuarterData?.filter(d => d.fiscal_month === targetMonth) || [];
          const previousMonthData = previousQuarterData?.filter(d => d.fiscal_month === targetMonth) || [];
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
          <CardTitle className="text-lg font-semibold">Weekly Revenue Trends</CardTitle>
          <CardDescription>Tracking your revenue performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Show all 52 weeks (don't filter out zero values)
  const filteredData = revenueData;

  if (revenueData.length === 0) {
    return (
      <Card className="bg-gradient-card shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Weekly Revenue Trends</CardTitle>
          <CardDescription>Tracking your revenue performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            No revenue data available. Sync with QuickBooks to see your revenue trends.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate year totals for summary
  const currentDate = new Date();
  const currentYear = dateFilters?.year || currentDate.getFullYear();
  
  const totalCurrent = filteredData.reduce((sum, d) => sum + d.current, 0);
  const totalPrevious = filteredData.reduce((sum, d) => sum + d.previous, 0);
  const growthRate = totalPrevious > 0 ? ((totalCurrent - totalPrevious) / totalPrevious) * 100 : 0;

  // Determine if we need logarithmic scale based on data range
  const maxValue = Math.max(...filteredData.map(d => Math.max(d.current, d.previous, d.target)));
  const minValue = Math.min(...filteredData.filter(d => d.current > 0 || d.previous > 0 || d.target > 0).map(d => Math.min(d.current, d.previous, d.target)));
  const useLogScale = maxValue / minValue > 100; // Use log scale if range is over 100x

  return (
    <Card className="bg-gradient-card shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Weekly Revenue Trends</CardTitle>
            <CardDescription>{currentYear} annual performance - 52 weeks</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">${(totalCurrent / 1000).toFixed(1)}K</div>
            <div className={`text-sm flex items-center gap-1 ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growthRate >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}% vs previous
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="h-80" style={{ width: `${filteredData.length * 35}px`, minWidth: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData} margin={{ top: 5, right: 5, left: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="week" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={false}
                  interval={0}
                  angle={-90}
                  textAnchor="end"
                  height={70}
                />
                <YAxis 
                  scale={useLogScale ? 'log' : 'linear'}
                  domain={useLogScale ? ['auto', 'auto'] : [0, 'auto']}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={false}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
                    return `$${value}`;
                  }}
                  label={{ value: 'Revenue ($)', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))' } }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: 8 }}
                  formatter={(value: number) => [`$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, '']}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="rect"
                  formatter={(value) => <span style={{ color: 'hsl(var(--foreground))', fontSize: '14px' }}>{value}</span>}
                />
                <Bar
                  dataKey="current"
                  fill="hsl(var(--primary))"
                  name="Current Year"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="previous"
                  fill="hsl(var(--muted-foreground))"
                  name="Previous Year"
                  radius={[4, 4, 0, 0]}
                  opacity={0.6}
                />
                <Bar
                  dataKey="target"
                  fill="hsl(220 70% 50%)"
                  name="Target"
                  radius={[4, 4, 0, 0]}
                  opacity={0.5}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;