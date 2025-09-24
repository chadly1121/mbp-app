import { useState } from 'react';
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

interface ActionItem {
  id: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in-progress' | 'completed';
  category: string;
  createdAt: string;
}

export const ActionItems = () => {
  const { toast } = useToast();
  const [actionItems, setActionItems] = useState<ActionItem[]>([
    {
      id: '1',
      title: 'Review Q1 financial performance',
      description: 'Analyze revenue, expenses, and variance reports from Q1',
      assignee: 'Finance Team',
      dueDate: '2024-02-15',
      priority: 'high',
      status: 'in-progress',
      category: 'Financial',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'Update customer onboarding process',
      description: 'Streamline the new customer setup workflow based on recent feedback',
      assignee: 'Customer Success',
      dueDate: '2024-02-20',
      priority: 'medium',
      status: 'todo',
      category: 'Operations',
      createdAt: '2024-01-10'
    },
    {
      id: '3',
      title: 'Prepare board presentation',
      description: 'Create comprehensive business review slides for monthly board meeting',
      assignee: 'CEO',
      dueDate: '2024-01-30',
      priority: 'high',
      status: 'completed',
      category: 'Strategic',
      createdAt: '2024-01-01'
    }
  ]);
  
  const [isAddingAction, setIsAddingAction] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  
  const [newAction, setNewAction] = useState({
    title: '',
    description: '',
    assignee: '',
    dueDate: '',
    priority: 'medium' as const,
    category: ''
  });

  const categories = ['Strategic', 'Financial', 'Operations', 'Marketing', 'Technology', 'HR'];

  const handleAddAction = () => {
    const action: ActionItem = {
      id: Date.now().toString(),
      title: newAction.title,
      description: newAction.description,
      assignee: newAction.assignee,
      dueDate: newAction.dueDate,
      priority: newAction.priority,
      status: 'todo',
      category: newAction.category,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setActionItems([...actionItems, action]);
    setIsAddingAction(false);
    setNewAction({
      title: '',
      description: '',
      assignee: '',
      dueDate: '',
      priority: 'medium',
      category: ''
    });
    
    toast({
      title: "Action item added",
      description: `${newAction.title} has been added to your action items.`
    });
  };

  const handleStatusChange = (id: string, completed: boolean) => {
    setActionItems(actionItems.map(item => 
      item.id === id 
        ? { ...item, status: completed ? 'completed' : 'todo' }
        : item
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'in-progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && actionItems.find(item => item.dueDate === dueDate)?.status !== 'completed';
  };

  const filteredItems = actionItems.filter(item => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (filterPriority !== 'all' && item.priority !== filterPriority) return false;
    return true;
  });

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ActionItem[]>);

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
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={newAction.priority} onValueChange={(value: any) => setNewAction({ ...newAction, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={newAction.dueDate}
                      onChange={(e) => setNewAction({ ...newAction, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Assignee</Label>
                  <Input
                    value={newAction.assignee}
                    onChange={(e) => setNewAction({ ...newAction, assignee: e.target.value })}
                    placeholder="Person or team responsible"
                  />
                </div>
                
                <Button 
                  onClick={handleAddAction} 
                  className="w-full"
                  disabled={!newAction.title || !newAction.category || !newAction.assignee}
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
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
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
              {actionItems.filter(item => item.status === 'in-progress').length}
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
              {actionItems.filter(item => isOverdue(item.dueDate)).length}
            </div>
          </Card>
        </div>
      </div>

      {/* Action Items by Category */}
      {Object.entries(groupedItems).map(([category, categoryItems]) => (
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
                  isOverdue(item.dueDate) ? 'border-red-200 bg-red-50/50' : 'border-muted'
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
                            {isOverdue(item.dueDate) && (
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            )}
                            <Badge variant="outline" className={`text-xs ${getPriorityColor(item.priority)}`}>
                              {item.priority}
                            </Badge>
                            <Badge variant="outline" className={`text-xs ${getStatusColor(item.status)}`}>
                              {item.status.replace('-', ' ')}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{item.assignee}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className={isOverdue(item.dueDate) ? 'text-red-600 font-medium' : ''}>
                              Due: {new Date(item.dueDate).toLocaleDateString()}
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
      ))}
    </div>
  );
};