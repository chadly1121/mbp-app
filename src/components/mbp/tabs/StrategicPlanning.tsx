import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CalendarIcon, Plus, Target, Users, MessageSquare, Share2, ChevronDown, ChevronRight, Trash2, CheckSquare, CheckCircle, ChevronUp, Pencil } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useCompany } from "@/hooks/useCompany";
import { useStrategicPlanning } from "@/hooks/useStrategicPlanning";
import {
  StrategicObjective,
  OBJECTIVE_PRIORITIES,
  OBJECTIVE_STATUSES,
  getObjectivePriorityColor,
  getObjectiveStatusColor,
  ObjectiveFormData
} from "@/types/strategicPlanning";
import { BaseMBPTab } from "../shared/BaseMBPTab";
import { ErrorHandlingTemplate } from "./shared/ErrorHandlingTemplate";
import { CountdownTimer } from "./shared/CountdownTimer";
import { PerformanceGauge } from "./shared/PerformanceGauge";
import { useToast } from "@/hooks/use-toast";

export const StrategicPlanning = () => {
  const { currentCompany } = useCompany();
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState<ObjectiveFormData>({
    title: '',
    description: '',
    target_date: '',
    priority: 'medium',
    status: 'not_started',
    completion_percentage: 0
  });
  
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newSubItems, setNewSubItems] = useState<Record<string, string>>({});
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Strategic planning hook
  const {
    objectives,
    loading,
    error,
    createObjective,
    updateObjective,
    deleteObjective,
    createChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
    createSubItem,
    updateSubItem,
    deleteSubItem
  } = useStrategicPlanning();

  // Helper functions
  const handleInputChange = (field: keyof ObjectiveFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!currentCompany || !formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please fill in the required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await createObjective({
        ...formData,
        company_id: currentCompany.id,
        title: formData.title.trim(),
        description: formData.description.trim()
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        target_date: '',
        priority: 'medium',
        status: 'not_started',
        completion_percentage: 0
      });
      setSelectedDate(undefined);

      toast({
        title: "Success",
        description: "Strategic objective created successfully"
      });
    } catch (error) {
      console.error('Error creating objective:', error);
      toast({
        title: "Error",
        description: "Failed to create strategic objective",
        variant: "destructive"
      });
    }
  };

  const toggleObjectiveExpansion = (objectiveId: string) => {
    setExpandedObjectives(prev => {
      const newSet = new Set(prev);
      if (newSet.has(objectiveId)) {
        newSet.delete(objectiveId);
      } else {
        newSet.add(objectiveId);
      }
      return newSet;
    });
  };

  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'on_hold': return 'outline';
      case 'not_started': return 'destructive';
      default: return 'secondary';
    }
  };

  // Loading and error states
  const LoadingTemplate = ({ message }: { message: string }) => (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );

  // Helper function to calculate checklist progress
  const calculateChecklistProgress = (checklist: any[]): number => {
    if (!checklist || checklist.length === 0) return 0;
    const completed = checklist.filter(item => item.is_completed).length;
    return Math.round((completed / checklist.length) * 100);
  };

  // Objective Component
  const ObjectiveCard = ({ objective }: { objective: StrategicObjective }) => {
    const isExpanded = expandedObjectives.has(objective.id);
    const checklistProgress = calculateChecklistProgress(objective.checklist || []);
    
    // Calculate total items and completed items including sub-items
    const totalItems = (objective.checklist || []).reduce((total, item) => {
      return total + 1 + (item.subitems?.length || 0);
    }, 0);
    
    const completedItems = (objective.checklist || []).reduce((completed, item) => {
      let itemCount = item.is_completed ? 1 : 0;
      const completedSubItems = (item.subitems || []).filter(sub => sub.is_completed).length;
      return completed + itemCount + completedSubItems;
    }, 0);
    
    const calculatedCompletion = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    const handleUpdateChecklistItem = (itemId: string, updates: { item_text?: string; is_completed?: boolean }) => {
      updateChecklistItem({ id: itemId, data: updates });
    };

    const handleDeleteChecklistItem = (itemId: string) => {
      deleteChecklistItem(itemId);
    };

    const handleUpdateSubItem = (subItemId: string, updates: { title?: string; is_completed?: boolean }) => {
      updateSubItem({ id: subItemId, data: updates });
    };

    const addChecklistItem = () => {
      if (newChecklistItem.trim()) {
        const sortOrder = (objective.checklist?.length || 0) + 1;
        createChecklistItem({
          objective_id: objective.id,
          item_text: newChecklistItem.trim(),
          sort_order: sortOrder
        });
        setNewChecklistItem('');
      }
    };

    const handleAddSubItem = (parentItemId: string) => {
      const subItemText = newSubItems[parentItemId];
      
      if (subItemText?.trim()) {
        const parentItem = objective.checklist?.find(item => item.id === parentItemId);
        const sortOrder = (parentItem?.subitems?.length || 0) + 1;
        
        createSubItem({
          parent_item_id: parentItemId,
          title: subItemText.trim(),
          sort_order: sortOrder
        });
        
        // Auto-expand the parent item to show the new sub-item
        setExpandedItems(prev => new Set([...prev, parentItemId]));
        setNewSubItems(prev => ({ ...prev, [parentItemId]: '' }));
      }
    };

    const handleSaveEdit = () => {
      if (editingItem && editText.trim()) {
        handleUpdateChecklistItem(editingItem, { item_text: editText.trim() });
        setEditingItem(null);
        setEditText('');
      }
    };

    const handleCancelEdit = () => {
      setEditingItem(null);
      setEditText('');
    };

    return (
      <Card key={objective.id} className="mb-4">
        <Collapsible open={isExpanded} onOpenChange={() => toggleObjectiveExpansion(objective.id)}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground mt-1" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground mt-1" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">{objective.title}</h3>
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
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {isExpanded && objective.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{objective.description}</p>
                  </div>
                )}

                {/* Checklist Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium flex items-center gap-2">
                      <CheckSquare className="h-4 w-4" />
                      Checklist ({completedItems}/{totalItems})
                    </h5>
                  </div>
                  
                  {objective.checklist && objective.checklist.length > 0 && (
                    <div className="space-y-2">
                      {objective.checklist.map((item) => {
                        const hasSubItems = item.subitems && item.subitems.length > 0;
                        const isItemExpanded = expandedItems.has(item.id);
                        
                        return (
                          <div key={item.id} className="space-y-2">
                            {/* Edit mode for checklist item */}
                            {editingItem === item.id ? (
                              <div className="flex items-center gap-3">
                                <Input
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      handleSaveEdit();
                                    } else if (e.key === 'Escape') {
                                      handleCancelEdit();
                                    }
                                  }}
                                  autoFocus
                                  className="flex-1"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleSaveEdit}
                                >
                                  Save
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleCancelEdit}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 group">
                                <Checkbox
                                  checked={item.is_completed}
                                  onCheckedChange={(checked) => 
                                    handleUpdateChecklistItem(item.id, { is_completed: checked as boolean })
                                  }
                                />
                                
                                {/* Expand/Collapse button for sub-items */}
                                {hasSubItems && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleItemExpansion(item.id);
                                    }}
                                    className="p-0 h-4 w-4"
                                  >
                                    {isItemExpanded ? 
                                      <ChevronDown className="h-3 w-3" /> : 
                                      <ChevronRight className="h-3 w-3" />
                                    }
                                  </Button>
                                )}
                                
                                <span className={`flex-1 ${item.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {item.item_text}
                                </span>
                                
                                {/* Edit button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingItem(item.id);
                                    setEditText(item.item_text);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                
                                {/* Add sub-item button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedItems(prev => new Set([...prev, item.id]));
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                                
                                {/* Delete button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteChecklistItem(item.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            )}

                            {/* Sub-items */}
                            {hasSubItems && isItemExpanded && (
                              <div className="ml-8 space-y-2">
                                {item.subitems?.map((subitem) => (
                                  <div key={subitem.id} className="flex items-center gap-3 group">
                                    <Checkbox
                                      checked={subitem.is_completed}
                                      onCheckedChange={(checked) => 
                                        handleUpdateSubItem(subitem.id, { is_completed: checked as boolean })
                                      }
                                    />
                                    <span className={`flex-1 text-sm ${subitem.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                                      {subitem.title}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteSubItem(subitem.id);
                                      }}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Trash2 className="h-3 w-3 text-destructive" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Add sub-item input */}
                            {expandedItems.has(item.id) && (
                              <div className="ml-8 flex gap-2">
                                <Input
                                  placeholder="Add sub-step..."
                                  value={newSubItems[item.id] || ''}
                                  onChange={(e) => setNewSubItems(prev => ({ ...prev, [item.id]: e.target.value }))}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      e.stopPropagation();
                                      handleAddSubItem(item.id);
                                    }
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  onFocus={(e) => e.stopPropagation()}
                                  onBlur={(e) => e.stopPropagation()}
                                  className="text-sm"
                                />
                                <Button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddSubItem(item.id);
                                  }} 
                                  size="sm"
                                  className="text-xs"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add checklist item..."
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.stopPropagation();
                          addChecklistItem();
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                    />
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        addChecklistItem();
                      }} 
                      size="sm"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
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
      
      {/* Create New Objective Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Create New Strategic Objective
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                placeholder="Enter objective title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Date</label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Select target date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      handleInputChange('target_date', date ? format(date, 'yyyy-MM-dd') : '');
                      setCalendarOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OBJECTIVE_PRIORITIES.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OBJECTIVE_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Describe your strategic objective"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>
          
          <Button onClick={handleSubmit} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Create Objective
          </Button>
        </CardContent>
      </Card>

      {/* Objectives List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Strategic Objectives</h2>
        {objectives.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Strategic Objectives</h3>
              <p className="text-muted-foreground">
                Create your first strategic objective to start tracking your business goals.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {objectives.map((objective) => (
              <ObjectiveCard key={objective.id} objective={objective} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};