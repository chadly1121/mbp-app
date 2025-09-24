import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Factory, Plus, Calendar, Clock, DollarSign } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProductionPlan {
  id: string;
  project_name: string;
  production_type: string;
  status: 'planned' | 'in_progress' | 'completed' | 'on_hold';
  planned_start_date?: string;
  planned_end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  planned_hours?: number;
  actual_hours?: number;
  planned_cost?: number;
  actual_cost?: number;
  notes?: string;
}

export const ProductionPlanning = () => {
  const { currentCompany } = useCompany();
  const { toast } = useToast();
  const [productionPlans, setProductionPlans] = useState<ProductionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newPlan, setNewPlan] = useState({
    project_name: '',
    production_type: 'manufacturing',
    status: 'planned' as const,
    planned_start_date: '',
    planned_end_date: '',
    planned_hours: '',
    planned_cost: '',
    notes: ''
  });

  const productionTypes = [
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'assembly', label: 'Assembly' },
    { value: 'packaging', label: 'Packaging' },
    { value: 'quality_control', label: 'Quality Control' },
    { value: 'custom_production', label: 'Custom Production' }
  ];

  useEffect(() => {
    if (currentCompany) {
      fetchProductionPlans();
    }
  }, [currentCompany]);

  const fetchProductionPlans = async () => {
    if (!currentCompany) return;

    try {
      const { data, error } = await supabase
        .from('production_planning')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProductionPlans((data as ProductionPlan[]) || []);
    } catch (error: any) {
      toast({
        title: "Error loading production plans",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProductionPlan = async () => {
    if (!currentCompany || !newPlan.project_name) return;

    try {
      const { error } = await supabase
        .from('production_planning')
        .insert([{
          company_id: currentCompany.id,
          project_name: newPlan.project_name,
          production_type: newPlan.production_type,
          status: newPlan.status,
          planned_start_date: newPlan.planned_start_date || null,
          planned_end_date: newPlan.planned_end_date || null,
          planned_hours: newPlan.planned_hours ? parseFloat(newPlan.planned_hours) : null,
          planned_cost: newPlan.planned_cost ? parseFloat(newPlan.planned_cost) : null,
          notes: newPlan.notes
        }]);

      if (error) throw error;

      toast({
        title: "Production plan created",
        description: `${newPlan.project_name} has been added to your production planning.`,
      });

      setNewPlan({
        project_name: '',
        production_type: 'manufacturing',
        status: 'planned',
        planned_start_date: '',
        planned_end_date: '',
        planned_hours: '',
        planned_cost: '',
        notes: ''
      });
      setIsDialogOpen(false);
      fetchProductionPlans();
    } catch (error: any) {
      toast({
        title: "Error creating production plan",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading production plans...</div>;
  }

  if (!currentCompany) {
    return <div className="flex items-center justify-center p-8">Please select a company first.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Factory className="h-6 w-6" />
            Production Planning
          </h2>
          <p className="text-muted-foreground">
            Plan and track your production projects and manufacturing processes
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Production Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Production Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="project_name">Project Name</Label>
                <Input
                  id="project_name"
                  value={newPlan.project_name}
                  onChange={(e) => setNewPlan({ ...newPlan, project_name: e.target.value })}
                  placeholder="e.g., Widget Production Batch #1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="production_type">Production Type</Label>
                  <Select value={newPlan.production_type} onValueChange={(value) => setNewPlan({ ...newPlan, production_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {productionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={newPlan.status} onValueChange={(value: any) => setNewPlan({ ...newPlan, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="planned_start_date">Planned Start Date</Label>
                  <Input
                    id="planned_start_date"
                    type="date"
                    value={newPlan.planned_start_date}
                    onChange={(e) => setNewPlan({ ...newPlan, planned_start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="planned_end_date">Planned End Date</Label>
                  <Input
                    id="planned_end_date"
                    type="date"
                    value={newPlan.planned_end_date}
                    onChange={(e) => setNewPlan({ ...newPlan, planned_end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="planned_hours">Planned Hours</Label>
                  <Input
                    id="planned_hours"
                    type="number"
                    value={newPlan.planned_hours}
                    onChange={(e) => setNewPlan({ ...newPlan, planned_hours: e.target.value })}
                    placeholder="e.g., 40"
                  />
                </div>
                <div>
                  <Label htmlFor="planned_cost">Planned Cost</Label>
                  <Input
                    id="planned_cost"
                    type="number"
                    value={newPlan.planned_cost}
                    onChange={(e) => setNewPlan({ ...newPlan, planned_cost: e.target.value })}
                    placeholder="e.g., 5000"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newPlan.notes}
                  onChange={(e) => setNewPlan({ ...newPlan, notes: e.target.value })}
                  placeholder="Additional notes about the production plan..."
                />
              </div>
              <Button onClick={createProductionPlan} className="w-full" disabled={!newPlan.project_name}>
                Create Production Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {productionPlans.length === 0 ? (
        <Card className="p-8 text-center">
          <Factory className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="text-lg font-semibold mb-2">No Production Plans Yet</h4>
          <p className="text-muted-foreground">Start by adding your first production plan to track manufacturing processes.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {productionPlans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{plan.project_name}</CardTitle>
                    <CardDescription className="capitalize">
                      {plan.production_type.replace('_', ' ')}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(plan.status)}>
                    {plan.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {plan.planned_start_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-muted-foreground">Start</div>
                        <div>{new Date(plan.planned_start_date).toLocaleDateString()}</div>
                      </div>
                    </div>
                  )}
                  {plan.planned_end_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-muted-foreground">End</div>
                        <div>{new Date(plan.planned_end_date).toLocaleDateString()}</div>
                      </div>
                    </div>
                  )}
                  {plan.planned_hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-muted-foreground">Hours</div>
                        <div>{plan.planned_hours}</div>
                      </div>
                    </div>
                  )}
                  {plan.planned_cost && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-muted-foreground">Cost</div>
                        <div>${plan.planned_cost.toLocaleString()}</div>
                      </div>
                    </div>
                  )}
                </div>
                {plan.notes && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <div className="text-sm text-muted-foreground mb-1">Notes</div>
                    <div className="text-sm">{plan.notes}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};