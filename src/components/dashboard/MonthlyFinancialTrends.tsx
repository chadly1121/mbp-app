import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";

interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  yoyIndicator: number;
  yoyColor: string;
}

const MonthlyFinancialTrends = ({ dateFilters }: { dateFilters?: { startMonth: number; endMonth: number; year: number } }) => {
  const { currentCompany } = useCompany();
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentCompany?.id) return;

    const fetchMonthlyData = async () => {
      try {
        const fiscalYear = dateFilters?.year || new Date().getFullYear();
        const startMonth = dateFilters?.startMonth || 1;
        const endMonth = dateFilters?.endMonth || 12;
        
        // Fetch current year monthly trends
        const { data: monthlyTrends } = await supabase
          .from('qbo_profit_loss')
          .select('fiscal_month, current_month, account_type')
          .eq('company_id', currentCompany.id)
          .eq('fiscal_year', fiscalYear)
          .gte('fiscal_month', startMonth)
          .lte('fiscal_month', endMonth)
          .order('fiscal_month');
        
        // Fetch previous year data for comparison
        const { data: prevYearTrends } = await supabase
          .from('qbo_profit_loss')
          .select('fiscal_month, current_month, account_type')
          .eq('company_id', currentCompany.id)
          .eq('fiscal_year', fiscalYear - 1)
          .gte('fiscal_month', startMonth)
          .lte('fiscal_month', endMonth)
          .order('fiscal_month');
        
        // Process monthly data
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const processedMonthly: MonthlyData[] = [];
        
        for (let i = startMonth; i <= endMonth; i++) {
          const monthData = monthlyTrends?.filter(d => d.fiscal_month === i) || [];
          const revenue = monthData
            .filter(d => d.account_type === 'revenue')
            .reduce((sum, d) => sum + Math.abs(d.current_month || 0), 0);
          const expenses = monthData
            .filter(d => d.account_type === 'expense' || d.account_type === 'cost_of_goods_sold')
            .reduce((sum, d) => sum + Math.abs(d.current_month || 0), 0);
          
          // Calculate previous year revenue for comparison
          const prevMonthData = prevYearTrends?.filter(d => d.fiscal_month === i) || [];
          const prevRevenue = prevMonthData
            .filter(d => d.account_type === 'revenue')
            .reduce((sum, d) => sum + Math.abs(d.current_month || 0), 0);
          
          // Determine color based on year-over-year comparison
          const isWin = prevRevenue > 0 && revenue >= prevRevenue;
          const isLoss = prevRevenue > 0 && revenue < prevRevenue;
          const yoyColor = isWin 
            ? 'hsl(var(--success) / 0.15)' 
            : isLoss 
            ? 'hsl(var(--destructive) / 0.15)' 
            : 'transparent';
          
          // Find max value for scaling the background indicator
          const maxValue = Math.max(revenue, expenses);
          
          processedMonthly.push({
            month: monthNames[i - 1],
            revenue,
            expenses,
            profit: revenue - expenses,
            yoyIndicator: maxValue * 1.2, // Slightly higher than the tallest bar
            yoyColor
          });
        }
        
        setMonthlyData(processedMonthly);
      } catch (error) {
        console.error('Error fetching monthly financial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, [currentCompany?.id, dateFilters]);

  if (loading) {
    return (
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle>Monthly Financial Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Filter monthly data to show only months with data
  const filteredMonthlyData = monthlyData.filter(d => d.revenue > 0 || d.expenses > 0);

  return (
    <Card className="bg-gradient-card">
      <CardHeader>
        <CardTitle>Monthly Financial Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {filteredMonthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredMonthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name]}
                />
                <Legend />
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
                <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue" />
                <Bar dataKey="expenses" fill="hsl(var(--destructive))" name="Expenses" />
                <Bar dataKey="profit" fill="hsl(var(--success))" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No financial data available. Sync with QuickBooks to see your monthly trends.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyFinancialTrends;
