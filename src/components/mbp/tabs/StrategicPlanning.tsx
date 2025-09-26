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
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Target, Calendar, User, TrendingUp, Edit2, Check, X, ChevronDown, ChevronRight, CheckSquare, Square, Trash2, CheckCircle, ChevronUp } from 'lucide-react';
import { useStrategicPlanning } from '@/hooks/useStrategicPlanning';
import { ErrorHandlingTemplate, LoadingTemplate, EmptyStateTemplate } from '@/components/mbp/tabs/shared/ErrorHandlingTemplate';
import { CountdownTimer } from '@/components/mbp/tabs/shared/CountdownTimer';
import { PerformanceGauge } from '@/components/mbp/tabs/shared/PerformanceGauge';
import { SimpleCollaborationButton } from '@/components/mbp/tabs/shared/SimpleCollaborationButton';

interface NewObjectiveForm {
  title: string;
  description: string;
  target_date: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  completion_percentage: number;
}

export const StrategicPlanning = () => {
  const {
    objectives,
    stats,
    loading,
    error,
    createObjective,
    updateObjective,
    createChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
    addCollaborator,
    addComment,
    addingCollaborator,
    addingComment
  } = useStrategicPlanning();
  
  const [isAddingObjective, setIsAddingObjective] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [newObjective, setNewObjective] = useState<NewObjectiveForm>({
    title: '',
    description: '',
    target_date: '',
    priority: 'medium',
    status: 'not_started',
    completion_percentage: 0
  });

  // Removed manual fetch logic - now using useStrategicPlanning hook

  const handleAddObjective = async () => {
    if (!newObjective.title) return;

    createObjective({
      title: newObjective.title,
      description: newObjective.description,
      target_date: newObjective.target_date,
      priority: newObjective.priority,
      status: newObjective.status,
      completion_percentage: newObjective.completion_percentage,
      company_id: '' // This will be set by the hook
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
  };

  const handleUpdateObjective = (objectiveId: string, updates: any) => {
    // Remove checklist from updates as it's not a column in the table
    const { checklist, ...dbUpdates } = updates;
    updateObjective({ id: objectiveId, data: dbUpdates });
  };

  const handleAddChecklistItem = (objectiveId: string, itemText: string) => {
    if (!itemText.trim()) return;

    const objective = objectives.find(obj => obj.id === objectiveId);
    const sortOrder = (objective?.checklist?.length || 0) + 1;

    createChecklistItem({
      objective_id: objectiveId,
      item_text: itemText.trim(),
      sort_order: sortOrder
    });
  };

  const handleUpdateChecklistItem = (itemId: string, updates: any) => {
    updateChecklistItem({ id: itemId, data: updates });
  };

  const handleDeleteChecklistItem = (itemId: string) => {
    deleteChecklistItem(itemId);
  };

  const toggleCardExpansion = (objectiveId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(objectiveId)) {
      newExpanded.delete(objectiveId);
    } else {
      newExpanded.add(objectiveId);
    }
    setExpandedCards(newExpanded);
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

  const ObjectiveCard = ({ objective }: { objective: any }) => {
    // Debug logging for collaboration data
    console.log('Objective data:', {
      id: objective.id,
      title: objective.title,
      hasCollaborators: !!objective.collaborators,
      hasComments: !!objective.comments,
      hasActivity: !!objective.activity,
      collaboratorsType: typeof objective.collaborators,
      commentsType: typeof objective.comments,
      activityType: typeof objective.activity,
      collaborators: objective.collaborators,
      comments: objective.comments,
      activity: objective.activity
    });
    const [isEditing, setIsEditing] = useState(false);
    const [newChecklistItem, setNewChecklistItem] = useState('');
    const isExpanded = expandedCards.has(objective.id);
    const completedItems = objective.checklist?.filter(item => item.is_completed).length || 0;
    const totalItems = objective.checklist?.length || 0;
    
    // Calculate completion percentage based on checklist items
    const calculatedCompletion = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    const [editData, setEditData] = useState({
      ...objective,
      status: objective.status || 'not_started',
      priority: objective.priority || 'medium',
      completion_percentage: calculatedCompletion, // Use calculated value
      description: objective.description || '',
      target_date: objective.target_date || ''
    });

    const handleSave = () => {
      // Update with calculated completion percentage
      const updatedData = {
        ...editData,
        completion_percentage: calculatedCompletion
      };
      handleUpdateObjective(objective.id, updatedData);
      setIsEditing(false);
    };

    const handleCancel = () => {
      setEditData({
        ...objective,
        status: objective.status || 'not_started',
        priority: objective.priority || 'medium',
        completion_percentage: calculatedCompletion, // Use calculated value
        description: objective.description || '',
        target_date: objective.target_date || ''
      });
      setIsEditing(false);
    };

    const addChecklistItem = () => {
      if (newChecklistItem.trim()) {
        handleAddChecklistItem(objective.id, newChecklistItem);
        setNewChecklistItem('');
      }
    };

    return (
      <Card 
        key={objective.id} 
        className={`transition-all duration-200 hover:shadow-md cursor-pointer group ${isExpanded ? 'ring-2 ring-blue-200' : ''}`}
      >
        <CardHeader 
          className="pb-3"
          onClick={() => !isEditing && toggleCardExpansion(objective.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {isExpanded ? 
                  <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : 
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                }
                {isEditing ? (
                  <Input
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="text-lg font-semibold"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <h4 className="text-lg font-semibold truncate">{objective.title}</h4>
                )}
              </div>
              
              {/* Countdown Timer - shows completion if all items checked */}
              <div className="mb-2">
                <CountdownTimer 
                  targetDate={objective.target_date}
                  isCompleted={totalItems > 0 && completedItems === totalItems}
                  completedAt={totalItems > 0 && completedItems === totalItems ? 
                    objective.checklist?.filter(item => item.is_completed)
                      .reduce((latest, item) => 
                        !latest || new Date(item.updated_at) > new Date(latest) ? 
                        item.updated_at : latest, null as string | null) : null
                  }
                />
              </div>
              
              {!isExpanded && (
                <p className="text-sm text-muted-foreground line-clamp-2">{objective.description}</p>
              )}
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              
              <div className="flex flex-col items-end gap-1">
                <Badge className={getPriorityColor(objective.priority || 'medium')}>
                  {objective.priority || 'medium'}
                </Badge>
                <Badge className={getStatusColor(objective.status || 'not_started')}>
                  {(objective.status || 'not_started').replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>

          {/* Progress Bar - using calculated completion with completion status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{calculatedCompletion}%</span>
                {totalItems > 0 && completedItems === totalItems && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                )}
              </div>
            </div>
            <Progress value={calculatedCompletion} className="h-2" />
            {totalItems > 0 ? (
              <div className="text-sm text-muted-foreground">
                {completedItems} of {totalItems} checklist items completed
                {completedItems === totalItems && totalItems > 0 && (
                  <span className="text-green-600 font-medium ml-2">✓ All done!</span>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Add checklist items to track progress
              </div>
            )}
          </div>
        </CardHeader>

        <Collapsible open={isExpanded}>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={editData.description || ''}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Status</Label>
                      <Select 
                        value={editData.status} 
                        onValueChange={(value: any) => setEditData({ ...editData, status: value })}
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
                        value={editData.priority} 
                        onValueChange={(value: any) => setEditData({ ...editData, priority: value })}
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
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <Label>Target Date & Time</Label>
                      <Input
                        type="datetime-local"
                        value={editData.target_date || ''}
                        onChange={(e) => setEditData({ ...editData, target_date: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm">
                      <Check className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={handleCancel} size="sm">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-muted-foreground">{objective.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {objective.target_date ? 
                          new Date(objective.target_date).toLocaleString() : 
                          'No target date & time'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {calculatedCompletion}% complete (auto-calculated)
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Checklist Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium flex items-center gap-2">
                        <CheckSquare className="h-4 w-4" />
                        Checklist ({completedItems}/{totalItems})
                      </h5>
                      <SimpleCollaborationButton objective={objective} />
                    </div>
                    
                    {objective.checklist && objective.checklist.length > 0 && (
                      <div className="space-y-2">
                        {objective.checklist.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 group">
                            <Checkbox
                              checked={item.is_completed}
                              onCheckedChange={(checked) => 
                                handleUpdateChecklistItem(item.id, { is_completed: checked as boolean })
                              }
                            />
                            <span className={`flex-1 ${item.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                              {item.item_text}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteChecklistItem(item.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add checklist item..."
                        value={newChecklistItem}
                        onChange={(e) => setNewChecklistItem(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()}
                      />
                      <Button onClick={addChecklistItem} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  // Show loading template if loading
  if (loading) {
    return <LoadingTemplate message="Loading strategic objectives..." />;
  }

  // Show error template if error
  if (error) {
    return (
      <ErrorHandlingTemplate
        title="Error Loading Strategic Objectives"
        description="There was a problem loading your strategic planning data."
        error={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Gauge */}
      <PerformanceGauge objectives={objectives} />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">Strategic Planning</h3>
          <p className="text-sm text-muted-foreground">
            Define and track your strategic goals and initiatives. Click cards to expand and edit.
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
                      <Label>Target Date & Time</Label>
                      <Input
                        type="datetime-local"
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
          <div className="space-y-4 group">
            {objectives.map((objective) => (
              <ObjectiveCard key={objective.id} objective={objective} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};