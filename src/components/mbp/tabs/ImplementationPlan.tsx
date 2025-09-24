import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Rocket, Plus, Calendar, User, AlertCircle } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Implementation {
  id: string;
  initiative_name: string;
  description?: string;
  category?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  responsible_person?: string;
  planned_start_date?: string;
  planned_completion_date?: string;
  actual_start_date?: string;
  actual_completion_date?: string;
  progress_percentage?: number;
  notes?: string;
}

export const ImplementationPlan = () => {
  const { currentCompany } = useCompany();
  const { toast } = useToast();
  const [implementations, setImplementations] = useState<Implementation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newImplementation, setNewImplementation] = useState({
    initiative_name: '',
    description: '',
    category: 'strategic',
    status: 'not_started' as const,
    priority: 'medium' as const,
    responsible_person: '',
    planned_start_date: '',
    planned_completion_date: '',
    progress_percentage: 0,
    notes: ''
  });

  const categories = [
    { value: 'strategic', label: 'Strategic Initiative' },
    { value: 'operational', label: 'Operational Improvement' },
    { value: 'technology', label: 'Technology Implementation' },
    { value: 'process', label: 'Process Enhancement' },
    { value: 'training', label: 'Training & Development' },
    { value: 'compliance', label: 'Compliance & Governance' },
    { value: 'marketing', label: 'Marketing Initiative' },
    { value: 'financial', label: 'Financial Project' }
  ];

  useEffect(() => {
    if (currentCompany) {
      fetchImplementations();
    }
  }, [currentCompany]);

  const fetchImplementations = async () => {
    if (!currentCompany) return;

    try {
      const { data, error } = await supabase
        .from('implementation_plan')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImplementations((data as Implementation[]) || []);
    } catch (error: any) {
      toast({
        title: "Error loading implementation plans",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createImplementation = async () => {
    if (!currentCompany || !newImplementation.initiative_name) return;

    try {
      const { error } = await supabase
        .from('implementation_plan')
        .insert([{
          company_id: currentCompany.id,
          initiative_name: newImplementation.initiative_name,
          description: newImplementation.description,
          category: newImplementation.category,
          status: newImplementation.status,
          priority: newImplementation.priority,
          responsible_person: newImplementation.responsible_person,
          planned_start_date: newImplementation.planned_start_date || null,
          planned_completion_date: newImplementation.planned_completion_date || null,
          progress_percentage: newImplementation.progress_percentage,
          notes: newImplementation.notes
        }]);

      if (error) throw error;

      toast({
        title: "Implementation plan created",
        description: `${newImplementation.initiative_name} has been added to your implementation plan.`,
      });

      setNewImplementation({
        initiative_name: '',
        description: '',
        category: 'strategic',
        status: 'not_started',
        priority: 'medium',
        responsible_person: '',
        planned_start_date: '',
        planned_completion_date: '',
        progress_percentage: 0,
        notes: ''
      });
      setIsDialogOpen(false);
      fetchImplementations();
    } catch (error: any) {
      toast({
        title: "Error creating implementation plan",
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (plannedDate?: string, status?: string) => {
    if (!plannedDate || status === 'completed') return false;
    return new Date(plannedDate) < new Date();
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading implementation plans...</div>;
  }

  if (!currentCompany) {
    return <div className="flex items-center justify-center p-8">Please select a company first.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Rocket className="h-6 w-6" />
            Implementation Plan
          </h2>
          <p className="text-muted-foreground">
            Track strategic initiatives and implementation progress
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Initiative
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Implementation Initiative</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="initiative_name">Initiative Name</Label>
                <Input
                  id="initiative_name"
                  value={newImplementation.initiative_name}
                  onChange={(e) => setNewImplementation({ ...newImplementation, initiative_name: e.target.value })}
                  placeholder="e.g., CRM System Implementation"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newImplementation.description}
                  onChange={(e) => setNewImplementation({ ...newImplementation, description: e.target.value })}
                  placeholder="Describe the initiative and its objectives..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newImplementation.category} onValueChange={(value) => setNewImplementation({ ...newImplementation, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newImplementation.priority} onValueChange={(value: any) => setNewImplementation({ ...newImplementation, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
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
                    value={newImplementation.planned_start_date}
                    onChange={(e) => setNewImplementation({ ...newImplementation, planned_start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="planned_completion_date">Planned Completion</Label>
                  <Input
                    id="planned_completion_date"
                    type="date"
                    value={newImplementation.planned_completion_date}
                    onChange={(e) => setNewImplementation({ ...newImplementation, planned_completion_date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="responsible_person">Responsible Person</Label>
                <Input
                  id="responsible_person"
                  value={newImplementation.responsible_person}
                  onChange={(e) => setNewImplementation({ ...newImplementation, responsible_person: e.target.value })}
                  placeholder="Who is leading this initiative?"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newImplementation.notes}
                  onChange={(e) => setNewImplementation({ ...newImplementation, notes: e.target.value })}
                  placeholder="Additional notes about the implementation..."
                />
              </div>
              <Button onClick={createImplementation} className="w-full" disabled={!newImplementation.initiative_name}>
                Create Initiative
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Initiatives</CardTitle>
            <Rocket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{implementations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Progress className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {implementations.filter(i => i.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {implementations.filter(i => i.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {implementations.filter(i => isOverdue(i.planned_completion_date, i.status)).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {implementations.length === 0 ? (
        <Card className="p-8 text-center">
          <Rocket className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="text-lg font-semibold mb-2">No Implementation Plans Yet</h4>
          <p className="text-muted-foreground">Start by adding your first strategic initiative or implementation plan.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {implementations.map((implementation) => (
            <Card key={implementation.id} className={`${isOverdue(implementation.planned_completion_date, implementation.status) ? 'border-red-200' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {implementation.initiative_name}
                      {isOverdue(implementation.planned_completion_date, implementation.status) && (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                    </CardTitle>
                    <CardDescription className="capitalize">
                      {categories.find(c => c.value === implementation.category)?.label}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(implementation.priority)}>
                      {implementation.priority}
                    </Badge>
                    <Badge className={getStatusColor(implementation.status)}>
                      {implementation.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {implementation.description && (
                  <p className="text-sm text-muted-foreground mb-4">{implementation.description}</p>
                )}
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {implementation.responsible_person && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-muted-foreground">Owner</div>
                          <div>{implementation.responsible_person}</div>
                        </div>
                      </div>
                    )}
                    {implementation.planned_start_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-muted-foreground">Start</div>
                          <div>{new Date(implementation.planned_start_date).toLocaleDateString()}</div>
                        </div>
                      </div>
                    )}
                    {implementation.planned_completion_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-muted-foreground">Target</div>
                          <div className={isOverdue(implementation.planned_completion_date, implementation.status) ? 'text-red-600 font-medium' : ''}>
                            {new Date(implementation.planned_completion_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    )}
                    {implementation.progress_percentage !== undefined && (
                      <div>
                        <div className="text-muted-foreground text-sm">Progress</div>
                        <div className="flex items-center gap-2">
                          <Progress value={implementation.progress_percentage} className="h-2 flex-1" />
                          <span className="text-sm font-medium">{implementation.progress_percentage}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {implementation.notes && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <div className="text-sm text-muted-foreground mb-1">Notes</div>
                    <div className="text-sm">{implementation.notes}</div>
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