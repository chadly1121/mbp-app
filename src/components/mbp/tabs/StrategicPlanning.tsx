import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Plus, Target, Calendar, User, TrendingUp, Edit3, Save, X, CheckCircle, ListTodo, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/hooks/useCompany';
import { supabase } from '@/integrations/supabase/client';

interface ChecklistItem {
  id: string;
  item_text: string;
  is_completed: boolean;
  sort_order: number;
}

interface StrategicObjective {
  id: string;
  title: string;
  description: string;
  target_date: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  completion_percentage: number;
  created_at: string;
  checklist?: ChecklistItem[];
}

export const StrategicPlanning = () => {
  const { toast } = useToast();
  const { currentCompany } = useCompany();
  const [objectives, setObjectives] = useState<StrategicObjective[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingObjective, setIsAddingObjective] = useState(false);
  const [editingObjective, setEditingObjective] = useState<string | null>(null);
  const [expandedObjective, setExpandedObjective] = useState<string | null>(null);
  const [newObjective, setNewObjective] = useState({
    title: '',
    description: '',
    target_date: '',
    priority: 'medium' as const,
    status: 'not_started' as const,
    completion_percentage: 0
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
      
      const objectivesWithChecklists = await Promise.all(
        (data || []).map(async (objective) => {
          const { data: checklist } = await supabase
            .from('strategic_objective_checklist')
            .select('*')
            .eq('objective_id', objective.id)
            .order('sort_order');
          
          return { ...objective, checklist: checklist || [] };
        })
      );
      
      setObjectives(objectivesWithChecklists as StrategicObjective[]);
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
        status: 'not_started',
        completion_percentage: 0
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

  const handleUpdateObjective = async (objectiveId: string, updates: Partial<StrategicObjective>) => {
    try {
      const { error } = await supabase
        .from('strategic_objectives')
        .update(updates)
        .eq('id', objectiveId);

      if (error) throw error;
      
      toast({
        title: "Objective updated",
        description: "Strategic objective has been updated successfully."
      });
      
      fetchObjectives();
    } catch (error: any) {
      toast({
        title: "Error updating objective",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddChecklistItem = async (objectiveId: string, itemText: string) => {
    if (!itemText.trim()) return;

    try {
      const objective = objectives.find(o => o.id === objectiveId);
      const sortOrder = (objective?.checklist?.length || 0);

      const { error } = await supabase
        .from('strategic_objective_checklist')
        .insert([{
          objective_id: objectiveId,
          item_text: itemText.trim(),
          sort_order: sortOrder
        }]);

      if (error) throw error;
      fetchObjectives();
    } catch (error: any) {
      toast({
        title: "Error adding checklist item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleChecklistItem = async (itemId: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from('strategic_objective_checklist')
        .update({ is_completed: isCompleted })
        .eq('id', itemId);

      if (error) throw error;
      fetchObjectives();
    } catch (error: any) {
      toast({
        title: "Error updating checklist item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteChecklistItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('strategic_objective_checklist')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      fetchObjectives();
    } catch (error: any) {
      toast({
        title: "Error deleting checklist item",
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

  const ObjectiveCard = ({ objective }: { objective: StrategicObjective }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState(objective);
    const [newChecklistItem, setNewChecklistItem] = useState('');
    const isExpanded = expandedObjective === objective.id;

    const handleSave = () => {
      handleUpdateObjective(objective.id, editForm);
      setIsEditing(false);
    };

    const handleCancel = () => {
      setEditForm(objective);
      setIsEditing(false);
    };

    const toggleExpand = () => {
      setExpandedObjective(isExpanded ? null : objective.id);
    };

    const completedItems = objective.checklist?.filter(item => item.is_completed).length || 0;
    const totalItems = objective.checklist?.length || 0;
    const checklistCompletion = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return (
      <Card 
        key={objective.id} 
        className={`transition-all duration-200 hover:shadow-md cursor-pointer ${isExpanded ? 'ring-2 ring-primary/20' : ''}`}
        onClick={!isEditing ? toggleExpand : undefined}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="text-lg font-semibold mb-2"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <CardTitle className="text-lg mb-2 flex items-center gap-2">
                  {objective.title}
                  {objective.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-600" />}
                </CardTitle>
              )}
              
              {isEditing ? (
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={2}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <CardDescription>{objective.description}</CardDescription>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
              
              {isEditing && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSave();
                    }}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancel();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={getPriorityColor(objective.priority)}>
              {objective.priority}
            </Badge>
            <Badge className={getStatusColor(objective.status)}>
              {objective.status.replace('_', ' ')}
            </Badge>
            {totalItems > 0 && (
              <Badge variant="outline" className="gap-1">
                <ListTodo className="h-3 w-3" />
                {completedItems}/{totalItems}
              </Badge>
            )}
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-4" onClick={(e) => e.stopPropagation()}>
            <Separator />
            
            {/* Editing Fields */}
            {isEditing && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select 
                    value={editForm.status} 
                    onValueChange={(value: any) => setEditForm({ ...editForm, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_started">Not Started</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Priority</Label>
                  <Select 
                    value={editForm.priority} 
                    onValueChange={(value: any) => setEditForm({ ...editForm, priority: value })}
                  >
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
                    value={editForm.target_date}
                    onChange={(e) => setEditForm({ ...editForm, target_date: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Completion Percentage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Completion Percentage</Label>
                <span className="text-sm font-medium">{objective.completion_percentage}%</span>
              </div>
              <Progress value={objective.completion_percentage} className="h-2" />
              {isEditing && (
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={editForm.completion_percentage}
                  onChange={(e) => setEditForm({ ...editForm, completion_percentage: parseInt(e.target.value) || 0 })}
                  className="w-24"
                />
              )}
            </div>

            {/* Target Date Display */}
            {!isEditing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Target: {objective.target_date ? new Date(objective.target_date).toLocaleDateString() : 'No target date set'}
              </div>
            )}

            {/* Checklist */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ListTodo className="h-4 w-4" />
                <Label>Action Items</Label>
              </div>
              
              <div className="space-y-2">
                {objective.checklist?.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 group">
                    <Checkbox
                      checked={item.is_completed}
                      onCheckedChange={(checked) => handleToggleChecklistItem(item.id, !!checked)}
                    />
                    <span className={`flex-1 ${item.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                      {item.item_text}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteChecklistItem(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add new action item..."
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddChecklistItem(objective.id, newChecklistItem);
                      setNewChecklistItem('');
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleAddChecklistItem(objective.id, newChecklistItem);
                    setNewChecklistItem('');
                  }}
                  disabled={!newChecklistItem.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    );
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
            Define and track your strategic goals and initiatives. Click any card to edit or add details.
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
                
                <div className="grid grid-cols-3 gap-3">
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
                  <div>
                    <Label>Initial Progress %</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={newObjective.completion_percentage}
                      onChange={(e) => setNewObjective({ ...newObjective, completion_percentage: parseInt(e.target.value) || 0 })}
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
            <ObjectiveCard key={objective.id} objective={objective} />
          ))
        )}
      </div>
    </div>
  );
};