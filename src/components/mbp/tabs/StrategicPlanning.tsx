import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, Calendar, User, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/hooks/useCompany';
import { supabase } from '@/integrations/supabase/client';

interface StrategicObjective {
  id: string;
  title: string;
  description: string;
  target_date: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
}

export const StrategicPlanning = () => {
  const { toast } = useToast();
  const { currentCompany } = useCompany();
  const [objectives, setObjectives] = useState<StrategicObjective[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingObjective, setIsAddingObjective] = useState(false);
  const [newObjective, setNewObjective] = useState({
    title: '',
    description: '',
    target_date: '',
    priority: 'medium' as const,
    status: 'not_started' as const
  });

  useEffect(() => {
    if (currentCompany) {
      fetchObjectives();
    }
  }, [currentCompany]);

  const fetchObjectives = async () => {
    if (!currentCompany) return;

    try {
      const { data, error } = await supabase
        .from('strategic_objectives')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setObjectives((data as StrategicObjective[]) || []);
    } catch (error: any) {
      toast({
        title: "Error loading objectives",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddObjective = async () => {
    if (!currentCompany || !newObjective.title) return;

    try {
      const { error } = await supabase
        .from('strategic_objectives')
        .insert([{
          ...newObjective,
          company_id: currentCompany.id
        }]);

      if (error) throw error;
      
      toast({
        title: "Strategic objective added",
        description: `${newObjective.title} has been added to your strategic plan.`
      });
      
      setNewObjective({
        title: '',
        description: '',
        target_date: '',
        priority: 'medium',
        status: 'not_started'
      });
      setIsAddingObjective(false);
      fetchObjectives();
    } catch (error: any) {
      toast({
        title: "Error adding objective",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'on_hold': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading strategic objectives...</div>;
  }

  if (!currentCompany) {
    return <div className="flex items-center justify-center p-8">Please select a company first.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">Strategic Planning</h3>
          <p className="text-sm text-muted-foreground">
            Define and track your strategic goals and initiatives
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Dialog open={isAddingObjective} onOpenChange={setIsAddingObjective}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Strategic Objective
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Strategic Objective</DialogTitle>
                <DialogDescription>
                  Create a new strategic objective or initiative
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Objective Title</Label>
                  <Input
                    value={newObjective.title}
                    onChange={(e) => setNewObjective({ ...newObjective, title: e.target.value })}
                    placeholder="e.g., Expand to New Markets"
                  />
                </div>
                
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newObjective.description}
                    onChange={(e) => setNewObjective({ ...newObjective, description: e.target.value })}
                    placeholder="Describe the objective, goals, and expected outcomes..."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Priority</Label>
                    <Select value={newObjective.priority} onValueChange={(value: any) => setNewObjective({ ...newObjective, priority: value })}>
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
                  <div>
                    <Label>Target Date</Label>
                    <Input
                      type="date"
                      value={newObjective.target_date}
                      onChange={(e) => setNewObjective({ ...newObjective, target_date: e.target.value })}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleAddObjective} 
                  className="w-full"
                  disabled={!newObjective.title}
                >
                  Add Strategic Objective
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Total Objectives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {objectives.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {objectives.filter(o => o.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {objectives.filter(o => o.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-red-600" />
              Critical Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {objectives.filter(o => o.priority === 'critical').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Objectives */}
      <div className="space-y-4">
        {objectives.length === 0 ? (
          <Card className="p-8 text-center">
            <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h4 className="text-lg font-semibold mb-2">No Strategic Objectives</h4>
            <p className="text-muted-foreground mb-4">Start by creating your first strategic objective to guide your business planning.</p>
            <Dialog open={isAddingObjective} onOpenChange={setIsAddingObjective}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Objective
                </Button>
              </DialogTrigger>
            </Dialog>
          </Card>
        ) : (
          objectives.map((objective) => (
            <Card key={objective.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-2">{objective.title}</h4>
                  <p className="text-muted-foreground mb-3">{objective.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {objective.target_date ? new Date(objective.target_date).toLocaleDateString() : 'No target date'}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={getPriorityColor(objective.priority)}>
                    {objective.priority}
                  </Badge>
                  <Badge className={getStatusColor(objective.status)}>
                    {objective.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};