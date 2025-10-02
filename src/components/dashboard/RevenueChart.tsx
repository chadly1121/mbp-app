import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";
import { TrendingUp, TrendingDown } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface MonthlyRevenue {
  month: string;
  monthNum: number;
  current: number;
  previous: number;
  target: number;
  yoyIndicator: number;
  yoyColor: string;
}

const RevenueChart = ({ dateFilters }: { dateFilters?: { startMonth: number; endMonth: number; year: number } }) => {
  const { currentCompany } = useCompany();
  const [revenueData, setRevenueData] = useState<MonthlyRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentCompany?.id) return;

    const fetchRevenueData = async () => {
      try {
        const currentDate = new Date();
        const currentYear = dateFilters?.year || currentDate.getFullYear();
        const previousYear = currentYear - 1;

        // Fetch full year current data
        const { data: currentYearData } = await supabase
          .from('qbo_profit_loss')
          .select('fiscal_month, current_month')
          .eq('company_id', currentCompany.id)
          .eq('fiscal_year', currentYear)
          .eq('account_type', 'revenue')
          .order('fiscal_month');

        // Fetch full year previous data
        const { data: previousYearData } = await supabase
          .from('qbo_profit_loss')
          .select('fiscal_month, current_month')
          .eq('company_id', currentCompany.id)
          .eq('fiscal_year', previousYear)
          .eq('account_type', 'revenue')
          .order('fiscal_month');

        // Fetch forecasted targets for full year
        const { data: forecastData } = await supabase
          .from('revenue_forecasts')
          .select('month, forecasted_amount')
          .eq('company_id', currentCompany.id)
          .eq('year', currentYear)
          .order('month');

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const processedData: MonthlyRevenue[] = [];

        // Generate 12 months of data
        for (let monthNum = 1; monthNum <= 12; monthNum++) {
          // Get monthly revenue for current and previous year
          const currentMonthData = currentYearData?.filter(d => d.fiscal_month === monthNum) || [];
          const previousMonthData = previousYearData?.filter(d => d.fiscal_month === monthNum) || [];
          const forecastMonth = forecastData?.find(d => d.month === monthNum);

          // Sum all revenue account entries for the month
          const monthlyCurrentRevenue = currentMonthData.reduce((sum, item) => sum + Math.abs(item.current_month || 0), 0);
          const monthlyPreviousRevenue = previousMonthData.reduce((sum, item) => sum + Math.abs(item.current_month || 0), 0);
          const monthlyTargetRevenue = forecastMonth?.forecasted_amount || (monthlyCurrentRevenue > 0 ? monthlyCurrentRevenue * 1.1 : 0);

          // Determine win/loss color based on year-over-year comparison
          const isWin = monthlyPreviousRevenue > 0 && monthlyCurrentRevenue >= monthlyPreviousRevenue;
          const isLoss = monthlyPreviousRevenue > 0 && monthlyCurrentRevenue < monthlyPreviousRevenue;
          const yoyColor = isWin 
            ? 'hsl(var(--success) / 0.15)' 
            : isLoss 
            ? 'hsl(var(--destructive) / 0.15)' 
            : 'transparent';
          
          const maxValue = Math.max(monthlyCurrentRevenue, monthlyPreviousRevenue, monthlyTargetRevenue);

          processedData.push({
            month: monthNames[monthNum - 1],
            monthNum: monthNum,
            current: monthlyCurrentRevenue,
            previous: monthlyPreviousRevenue,
            target: monthlyTargetRevenue,
            yoyIndicator: maxValue * 1.2,
            yoyColor
          });
        }

        setRevenueData(processedData);
        
        console.log('Revenue Chart Data:', {
          totalMonths: processedData.length,
          sampleMonths: processedData.slice(0, 3),
          maxCurrent: Math.max(...processedData.map(d => d.current)),
          maxPrevious: Math.max(...processedData.map(d => d.previous)),
          monthsWithData: processedData.filter(d => d.current > 0 || d.previous > 0).length
        });
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
            <CardTitle className="text-lg font-semibold">Monthly Revenue Trends</CardTitle>
            <CardDescription>{currentYear} annual performance</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">${(totalCurrent / 1000).toFixed(1)}K</div>
            <div className={`text-sm flex items-center gap-1 ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growthRate >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}% vs previous year
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="h-96" style={{ width: `${filteredData.length * 120}px`, minWidth: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData} margin={{ top: 10, right: 10, left: 60, bottom: 50 }} barGap={4} barCategoryGap="15%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={false}
                  height={40}
                />
                <YAxis 
                  scale="linear"
                  domain={[0, 'auto']}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={false}
                  width={55}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
                    return `$${value}`;
                  }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    padding: '8px 12px'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: 4 }}
                  formatter={(value: number, name: string) => {
                    const label = name === 'current' ? 'Current Year' : name === 'previous' ? 'Previous Year' : 'Target';
                    return [`$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, label];
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px' }}
                  iconType="rect"
                  formatter={(value) => {
                    const labels: any = { current: 'Current Year', previous: 'Previous Year', target: 'Target' };
                    return <span style={{ color: 'hsl(var(--foreground))', fontSize: '13px' }}>{labels[value] || value}</span>;
                  }}
                />
                <Bar 
                  dataKey="yoyIndicator" 
                  fill="transparent"
                  stackId="background"
                  shape={(props: any) => {
                    const { x, y, width, height, payload } = props;
                    return (
                      <rect
                        x={x}
                        y={0}
                        width={width}
                        height={height + y}
                        fill={payload.yoyColor}
                        rx={4}
                      />
                    );
                  }}
                />
                <Bar
                  dataKey="current"
                  fill="hsl(var(--primary))"
                  name="current"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                />
                <Bar
                  dataKey="previous"
                  fill="hsl(var(--muted-foreground))"
                  name="previous"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                />
                <Bar
                  dataKey="target"
                  fill="hsl(220 70% 50%)"
                  name="target"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                  fillOpacity={0.4}
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