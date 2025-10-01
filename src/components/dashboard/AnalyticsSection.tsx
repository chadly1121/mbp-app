import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";

interface RevenueData {
  account_name: string;
  year_to_date: number;
  account_type: string;
}

interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

const AnalyticsSection = ({ dateFilters }: { dateFilters?: { startMonth: number; endMonth: number; year: number } }) => {
  const { currentCompany } = useCompany();
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentCompany?.id) return;

    const fetchAnalyticsData = async () => {
      try {
        const fiscalYear = dateFilters?.year || new Date().getFullYear();
        const startMonth = dateFilters?.startMonth || 1;
        const endMonth = dateFilters?.endMonth || 12;
        
        // Fetch revenue by account type for pie chart
        const { data: plData } = await supabase
          .from('qbo_profit_loss')
          .select('account_name, current_month, fiscal_month, account_type')
          .eq('company_id', currentCompany.id)
          .eq('fiscal_year', fiscalYear)
          .eq('account_type', 'revenue')
          .gte('fiscal_month', startMonth)
          .lte('fiscal_month', endMonth);

        // Aggregate revenue by account for the selected period
        const aggregatedRevenue = plData?.reduce((acc, item) => {
          const key = item.account_name;
          if (!acc[key]) {
            acc[key] = { account_name: item.account_name, year_to_date: 0, account_type: item.account_type };
          }
          acc[key].year_to_date += Math.abs(item.current_month || 0);
          return acc;
        }, {} as Record<string, RevenueData>);

        // Fetch monthly trends for bar chart
        const { data: monthlyTrends } = await supabase
          .from('qbo_profit_loss')
          .select('fiscal_month, current_month, account_type')
          .eq('company_id', currentCompany.id)
          .eq('fiscal_year', fiscalYear)
          .gte('fiscal_month', startMonth)
          .lte('fiscal_month', endMonth)
          .order('fiscal_month');

        setRevenueData(Object.values(aggregatedRevenue || {}));
        
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
          
          processedMonthly.push({
            month: monthNames[i - 1],
            revenue,
            expenses,
            profit: revenue - expenses
          });
        }
        
        setMonthlyData(processedMonthly);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [currentCompany?.id, dateFilters]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle>Revenue by Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle>Monthly Financial Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Process revenue data for pie chart
  const pieData = revenueData.map((item, index) => ({
    name: item.account_name,
    value: Math.abs(item.year_to_date),
    color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
  }));

  // Filter monthly data to show only months with data
  const filteredMonthlyData = monthlyData.filter(d => d.revenue > 0 || d.expenses > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Revenue by Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No revenue data available. Sync with QuickBooks to see your revenue breakdown.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
};

export default AnalyticsSection;