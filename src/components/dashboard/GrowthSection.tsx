import { useEffect, useState } from 'react';
import { TrendingUp, Target, Zap, Users } from "lucide-react";
import MetricCard from "./MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";

interface GrowthMetrics {
  currentYearRevenue: number;
  previousYearRevenue: number;
  customerCount: number;
  productCount: number;
  growthRate: number;
}

const GrowthSection = ({ dateFilters }: { dateFilters?: { startMonth: number; endMonth: number; year: number } }) => {
  const { currentCompany } = useCompany();
  const [metrics, setMetrics] = useState<GrowthMetrics | null>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentCompany?.id) return;

    const fetchGrowthMetrics = async () => {
      try {
        const currentDate = new Date();
        const currentYear = dateFilters?.year || currentDate.getFullYear();
        const currentQuarter = Math.floor((currentDate.getMonth() / 3)) + 1;
        const currentQuarterStartMonth = (currentQuarter - 1) * 3 + 1;
        const currentQuarterEndMonth = currentQuarter * 3;

        // Calculate previous quarter (could be in previous year)
        let previousQuarter = currentQuarter - 1;
        let previousQuarterYear = currentYear;
        if (previousQuarter === 0) {
          previousQuarter = 4;
          previousQuarterYear = currentYear - 1;
        }
        const previousQuarterStartMonth = (previousQuarter - 1) * 3 + 1;
        const previousQuarterEndMonth = previousQuarter * 3;

        // Fetch current quarter revenue
        const { data: currentQuarterData } = await supabase
          .from('qbo_profit_loss')
          .select('current_month, fiscal_month')
          .eq('company_id', currentCompany.id)
          .eq('fiscal_year', currentYear)
          .eq('account_type', 'revenue')
          .gte('fiscal_month', currentQuarterStartMonth)
          .lte('fiscal_month', currentQuarterEndMonth);

        // Fetch previous quarter revenue
        const { data: previousQuarterData } = await supabase
          .from('qbo_profit_loss')
          .select('current_month, fiscal_month')
          .eq('company_id', currentCompany.id)
          .eq('fiscal_year', previousQuarterYear)
          .eq('account_type', 'revenue')
          .gte('fiscal_month', previousQuarterStartMonth)
          .lte('fiscal_month', previousQuarterEndMonth);

        // Fetch customer count from sales pipeline
        const { data: customers } = await supabase
          .from('sales_pipeline')
          .select('client_name')
          .eq('company_id', currentCompany.id);

        // Fetch product count
        const { data: products } = await supabase
          .from('products')
          .select('id')
          .eq('company_id', currentCompany.id)
          .eq('is_active', true);

        const currentRevenue = currentQuarterData?.reduce((sum, item) => sum + Math.abs(item.current_month || 0), 0) || 0;
        const previousRevenue = previousQuarterData?.reduce((sum, item) => sum + Math.abs(item.current_month || 0), 0) || 0;
        const growthRate = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
        
        const uniqueCustomers = [...new Set(customers?.map(c => c.client_name).filter(Boolean))];

        setMetrics({
          currentYearRevenue: currentRevenue,
          previousYearRevenue: previousRevenue,
          customerCount: uniqueCustomers.length,
          productCount: products?.length || 0,
          growthRate
        });

        // Set dynamic goals based on current metrics
        const revenueTarget = currentRevenue > 0 ? Math.round(currentRevenue * 1.25) : 250000;
        const customerTarget = uniqueCustomers.length > 0 ? Math.round(uniqueCustomers.length * 1.5) : 100;
        
        setGoals([
          { title: "Quarterly Revenue Target", current: currentRevenue, target: revenueTarget, unit: "$" },
          { title: "Customer Acquisition", current: uniqueCustomers.length, target: customerTarget, unit: "" },
          { title: "Product Lines", current: products?.length || 0, target: Math.max((products?.length || 0) + 2, 5), unit: "" },
          { title: "Growth Rate Target", current: Math.max(growthRate, 0), target: 15, unit: "%" },
        ]);

      } catch (error) {
        console.error('Error fetching growth metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrowthMetrics();
  }, [currentCompany?.id, dateFilters]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-gradient-card">
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle>Growth Goals Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No growth data available. Sync with QuickBooks to see your growth metrics.
      </div>
    );
  }

  const formatCurrency = (value: number) => `$${(value / 1000).toFixed(0)}K`;
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Revenue Growth (QoQ)"
          value={formatPercent(metrics.growthRate)}
          change={{ 
            value: `vs ${formatCurrency(metrics.previousYearRevenue)} last quarter`, 
            trend: metrics.growthRate > 0 ? "up" : "down" 
          }}
          icon={<TrendingUp className="h-5 w-5" />}
          variant={metrics.growthRate > 0 ? "success" : "warning"}
        />
        <MetricCard
          title="Current Quarter Revenue"
          value={formatCurrency(metrics.currentYearRevenue)}
          change={{ 
            value: `${formatPercent(Math.abs(metrics.growthRate))} ${metrics.growthRate > 0 ? 'increase' : 'decrease'}`, 
            trend: metrics.growthRate > 0 ? "up" : "down" 
          }}
          icon={<Target className="h-5 w-5" />}
          variant="info"
        />
        <MetricCard
          title="Active Customers"
          value={metrics.customerCount.toString()}
          change={{ value: "from sales pipeline", trend: "neutral" }}
          icon={<Users className="h-5 w-5" />}
          variant="default"
        />
        <MetricCard
          title="Product Lines"
          value={metrics.productCount.toString()}
          change={{ value: "active products", trend: "neutral" }}
          icon={<Zap className="h-5 w-5" />}
          variant="warning"
        />
      </div>

      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle>Q{Math.floor((new Date().getMonth() / 3)) + 1} {new Date().getFullYear()} Growth Goals Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {goals.map((goal, index) => {
              const progress = Math.min((goal.current / goal.target) * 100, 100);
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{goal.title}</h4>
                    <span className="text-sm text-muted-foreground">
                      {goal.unit === "$" ? formatCurrency(goal.current) : `${goal.current}${goal.unit}`} / {goal.unit === "$" ? formatCurrency(goal.target) : `${goal.target}${goal.unit}`}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {progress.toFixed(1)}% complete
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GrowthSection;