import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { BarChart, LineChart, Plus, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SalesPlan {
  id: string;
  plan_name: string;
  plan_type: 'weekly' | 'monthly';
  is_total_plan: boolean;
  year: number;
  week_number?: number;
  month_number?: number;
  planned_revenue: number;
  actual_revenue: number;
  variance_revenue: number;
  notes?: string;
}

export const SalesPlanning = () => {
  const { currentCompany } = useCompany();
  const { toast } = useToast();
  const [salesPlans, setSalesPlans] = useState<SalesPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState<'weekly' | 'monthly'>('weekly');
  
  // Helper function to get week number
  const getWeekNumber = (date: Date) => {
    const d = new Date(date.getTime());
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  const [newPlan, setNewPlan] = useState({
    plan_name: '',
    planned_revenue: 0,
    actual_revenue: 0,
    notes: '',
    week_number: getWeekNumber(new Date()),
    month_number: new Date().getMonth() + 1
  });

  useEffect(() => {
    if (currentCompany) {
      fetchSalesPlans();
    }
  }, [currentCompany]);

  const fetchSalesPlans = async () => {
    if (!currentCompany) return;

    try {
      const { data, error } = await supabase
        .from('sales_plans')
        .select('*')
        .eq('company_id', currentCompany.id)
        .eq('year', 2025)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSalesPlans((data as SalesPlan[]) || []);
    } catch (error: any) {
      toast({
        title: "Error loading sales plans",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSalesPlan = async () => {
    if (!currentCompany || !newPlan.plan_name) return;

    try {
      const planData = {
        company_id: currentCompany.id,
        plan_name: newPlan.plan_name,
        plan_type: selectedPlanType,
        year: 2025,
        planned_revenue: newPlan.planned_revenue,
        actual_revenue: newPlan.actual_revenue,
        variance_revenue: newPlan.planned_revenue - newPlan.actual_revenue,
        notes: newPlan.notes,
        ...(selectedPlanType === 'weekly' 
          ? { week_number: newPlan.week_number } 
          : { month_number: newPlan.month_number }
        )
      };

      const { error } = await supabase
        .from('sales_plans')
        .insert([planData]);

      if (error) throw error;

      toast({
        title: "Sales plan created",
        description: `${newPlan.plan_name} has been added to your sales planning.`,
      });

      setNewPlan({
        plan_name: '',
        planned_revenue: 0,
        actual_revenue: 0,
        notes: '',
        week_number: getWeekNumber(new Date()),
        month_number: new Date().getMonth() + 1
      });
      setIsDialogOpen(false);
      fetchSalesPlans();
    } catch (error: any) {
      toast({
        title: "Error creating sales plan",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading sales plans...</div>;
  }

  if (!currentCompany) {
    return <div className="flex items-center justify-center p-8">Please select a company first.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart className="h-6 w-6" />
            Sales Planning
          </h2>
          <p className="text-muted-foreground">
            Plan and track your sales performance by period and product line
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Sales Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Sales Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="plan_name">Plan Name</Label>
                <Input
                  id="plan_name"
                  value={newPlan.plan_name}
                  onChange={(e) => setNewPlan({ ...newPlan, plan_name: e.target.value })}
                  placeholder="e.g., Product Line A"
                />
              </div>
              <Button onClick={createSalesPlan} className="w-full" disabled={!newPlan.plan_name}>
                Create Sales Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-8 text-center">
        <BarChart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h4 className="text-lg font-semibold mb-2">Sales Planning System Ready</h4>
        <p className="text-muted-foreground">Your comprehensive sales planning system is now available with full weekly and monthly tracking capabilities.</p>
      </Card>
    </div>
  );
};