import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, CheckSquare, Clock, User, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/hooks/useCompany';
import { supabase } from '@/integrations/supabase/client';
import { ActionItem as ActionItemType, SelectChangeHandler, LoadingState } from '@/types/supabase';
import { handleSupabaseError, normalizeError } from '@/utils/errorHandling';

interface NewActionForm {
  title: string;
  description: string;
  assigned_to: string;
  due_date: string;
  priority: ActionItemType['priority'];
  category: string;
}

const CATEGORIES = ['Strategic', 'Financial', 'Operations', 'Marketing', 'Technology', 'HR'] as const;

export const ActionItems = () => {
  const { toast } = useToast();
  const { currentCompany } = useCompany();
  const [actionItems, setActionItems] = useState<ActionItemType[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: true, error: null });
  const [isAddingAction, setIsAddingAction] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  
  const [newAction, setNewAction] = useState<NewActionForm>({
    title: '',
    description: '',
    assigned_to: '',
    due_date: '',
    priority: 'medium',
    category: ''
  });

  const fetchActionItems = useCallback(async () => {
    if (!currentCompany) return;

    setLoadingState({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('action_items')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActionItems((data as ActionItemType[]) || []);
    } catch (error) {
      const apiError = handleSupabaseError(error);
      setLoadingState({ isLoading: false, error: apiError.message });
      toast({
        title: "Error loading action items",
        description: apiError.message,
        variant: "destructive",
      });
    } finally {
      setLoadingState(prev => ({ ...prev, isLoading: false }));
    }
  }, [currentCompany, toast]);

  const handleAddAction = async () => {
    if (!currentCompany || !newAction.title) return;

    try {
      const { error } = await supabase
        .from('action_items')
        .insert([{
          ...newAction,
          company_id: currentCompany.id
        }]);

      if (error) throw error;
      
      toast({
        title: "Action item added",
        description: `${newAction.title} has been added to your action items.`
      });
      
      setNewAction({
        title: '',
        description: '',
        assigned_to: '',
        due_date: '',
        priority: 'medium',
        category: ''
      });
      setIsAddingAction(false);
      await fetchActionItems();
    } catch (error) {
      const apiError = handleSupabaseError(error);
      toast({
        title: "Error adding action item",
        description: apiError.message,
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('action_items')
        .update({ status: completed ? 'completed' : 'pending' })
        .eq('id', id);

      if (error) throw error;
      
      setActionItems(actionItems.map(item => 
        item.id === id 
          ? { ...item, status: completed ? 'completed' : 'pending' as const }
          : item
      ));
    } catch (error) {
      const apiError = handleSupabaseError(error);
      toast({
        title: "Error updating action item",
        description: apiError.message,
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
      case 'overdue': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status !== 'completed';
  };

  const filteredItems = actionItems.filter(item => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (filterPriority !== 'all' && item.priority !== filterPriority) return false;
    return true;
  });

  const groupedItems = filteredItems.reduce((acc, item) => {
    const category = item.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ActionItemType[]>);

  if (loadingState.isLoading) {
    return <div className="flex items-center justify-center p-8">Loading action items...</div>;
  }

  if (!currentCompany) {
    return <div className="flex items-center justify-center p-8">Please select a company first.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">Action Items & Tasks</h3>
          <p className="text-sm text-muted-foreground">
            Track and manage your business action items and tasks
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Dialog open={isAddingAction} onOpenChange={setIsAddingAction}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Action Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Action Item</DialogTitle>
                <DialogDescription>
                  Create a new action item or task
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newAction.title}
                    onChange={(e) => setNewAction({ ...newAction, title: e.target.value })}
                    placeholder="e.g., Review monthly reports"
                  />
                </div>
                
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newAction.description}
                    onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
                    placeholder="Describe what needs to be done..."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Category</Label>
                    <Select value={newAction.category} onValueChange={(value) => setNewAction({ ...newAction, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={newAction.priority} onValueChange={(value: ActionItemType['priority']) => setNewAction({ ...newAction, priority: value })}>
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
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={newAction.due_date}
                      onChange={(e) => setNewAction({ ...newAction, due_date: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Assigned To</Label>
                  <Input
                    value={newAction.assigned_to}
                    onChange={(e) => setNewAction({ ...newAction, assigned_to: e.target.value })}
                    placeholder="Person or team responsible"
                  />
                </div>
                
                <Button 
                  onClick={handleAddAction} 
                  className="w-full"
                  disabled={!newAction.title || !newAction.category}
                >
                  Add Action Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters & Summary */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-center gap-4">
          <div>
            <Label className="text-xs">Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-xs">Priority</Label>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4 ml-auto">
          <Card className="p-3">
            <div className="text-sm font-medium">Total</div>
            <div className="text-xl font-bold">{actionItems.length}</div>
          </Card>
          <Card className="p-3">
            <div className="text-sm font-medium text-blue-600">In Progress</div>
            <div className="text-xl font-bold text-blue-600">
              {actionItems.filter(item => item.status === 'in_progress').length}
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-sm font-medium text-green-600">Completed</div>
            <div className="text-xl font-bold text-green-600">
              {actionItems.filter(item => item.status === 'completed').length}
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-sm font-medium text-red-600">Overdue</div>
            <div className="text-xl font-bold text-red-600">
              {actionItems.filter(item => isOverdue(item.due_date, item.status)).length}
            </div>
          </Card>
        </div>
      </div>

      {/* Action Items */}
      {actionItems.length === 0 ? (
        <Card className="p-8 text-center">
          <CheckSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="text-lg font-semibold mb-2">No Action Items</h4>
          <p className="text-muted-foreground mb-4">Start by creating your first action item to track tasks and deliverables.</p>
          <Dialog open={isAddingAction} onOpenChange={setIsAddingAction}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create First Action Item
              </Button>
            </DialogTrigger>
          </Dialog>
        </Card>
      ) : Object.entries(groupedItems).length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No action items match your current filters.</p>
        </Card>
      ) : (
        Object.entries(groupedItems).map(([category, categoryItems]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg">{category} Action Items</CardTitle>
              <CardDescription>
                Tasks and action items for {category.toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryItems.map((item) => (
                  <Card key={item.id} className={`border ${
                    isOverdue(item.due_date, item.status) ? 'border-red-200 bg-red-50/50' : 'border-muted'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={item.status === 'completed'}
                          onCheckedChange={(checked) => handleStatusChange(item.id, checked as boolean)}
                          className="mt-1"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h4 className={`font-semibold ${item.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                {item.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.description}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {isOverdue(item.due_date, item.status) && (
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                              )}
                              <Badge variant="outline" className={`text-xs ${getPriorityColor(item.priority)}`}>
                                {item.priority}
                              </Badge>
                              <Badge variant="outline" className={`text-xs ${getStatusColor(item.status)}`}>
                                {item.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{item.assigned_to || 'Unassigned'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span className={isOverdue(item.due_date, item.status) ? 'text-red-600 font-medium' : ''}>
                                Due: {item.due_date ? new Date(item.due_date).toLocaleDateString() : 'No due date'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};