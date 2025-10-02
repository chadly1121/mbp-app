import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";

interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  isWin: boolean;
  isLoss: boolean;
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
          
          // Determine win/loss based on year-over-year comparison
          const isWin = prevRevenue > 0 && revenue >= prevRevenue;
          const isLoss = prevRevenue > 0 && revenue < prevRevenue;
          
          processedMonthly.push({
            month: monthNames[i - 1],
            revenue,
            expenses,
            profit: revenue - expenses,
            isWin,
            isLoss
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

  // Calculate totals for summary
  const currentDate = new Date();
  const currentYear = dateFilters?.year || currentDate.getFullYear();
  const totalRevenue = filteredMonthlyData.reduce((sum, d) => sum + d.revenue, 0);
  const totalExpenses = filteredMonthlyData.reduce((sum, d) => sum + d.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return (
    <Card className="bg-gradient-card shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Monthly Financial Trends</CardTitle>
            <p className="text-sm text-muted-foreground">{currentYear} financial performance</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">${(totalProfit / 1000).toFixed(1)}K</div>
            <div className={`text-sm flex items-center gap-1 ${profitMargin >= 0 ? 'text-success' : 'text-destructive'}`}>
              {profitMargin >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {profitMargin.toFixed(1)}% profit margin
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredMonthlyData.length > 0 ? (
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="h-96" style={{ width: `${filteredMonthlyData.length * 120}px`, minWidth: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredMonthlyData} margin={{ top: 10, right: 10, left: 60, bottom: 50 }} barGap={4} barCategoryGap="15%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    tick={(props) => {
                      const { x, y, payload } = props;
                      const monthData = filteredMonthlyData.find(d => d.month === payload.value);
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <text 
                            x={0} 
                            y={0} 
                            dy={16} 
                            textAnchor="middle" 
                            fill="hsl(var(--muted-foreground))" 
                            fontSize={12}
                          >
                            {payload.value}
                          </text>
                          {monthData?.isWin && (
                            <circle 
                              cx={0} 
                              cy={28} 
                              r={4} 
                              fill="hsl(var(--success))" 
                            />
                          )}
                          {monthData?.isLoss && (
                            <circle 
                              cx={0} 
                              cy={28} 
                              r={4} 
                              fill="hsl(var(--destructive))" 
                            />
                          )}
                        </g>
                      );
                    }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={false}
                    height={50}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
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
                      const labels: any = { revenue: 'Revenue', expenses: 'Expenses', profit: 'Profit' };
                      return [`$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, labels[name] || name];
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '10px' }}
                    iconType="rect"
                    formatter={(value) => {
                      const labels: any = { revenue: 'Revenue', expenses: 'Expenses', profit: 'Profit' };
                      return <span style={{ color: 'hsl(var(--foreground))', fontSize: '13px' }}>{labels[value] || value}</span>;
                    }}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="hsl(var(--primary))" 
                    name="revenue" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                  <Bar 
                    dataKey="expenses" 
                    fill="hsl(var(--destructive))" 
                    name="expenses" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                  <Bar 
                    dataKey="profit" 
                    fill="hsl(var(--success))" 
                    name="profit" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            No financial data available. Sync with QuickBooks to see your monthly trends.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyFinancialTrends;
