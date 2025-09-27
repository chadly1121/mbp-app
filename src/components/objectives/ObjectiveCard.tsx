import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronRight, 
  Edit2, 
  Plus, 
  Copy, 
  Eye, 
  Edit3,
  Trash2,
  Calendar,
  Target
} from 'lucide-react';
import { StrategicObjective } from '@/types/strategicPlanning';
import { ChecklistItemComponent } from './ChecklistItem';
import { ObjectivePerformanceGauge } from './ObjectivePerformanceGauge';
import { ObjectiveEditDialog } from './ObjectiveEditDialog';
import { getOrCreateToken } from '@/utils/shareUtils';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ObjectiveCardProps {
  objective: StrategicObjective;
  isExpanded?: boolean;
  onExpand: (id: string) => void;
  onUpdate: (id: string, data: Partial<StrategicObjective>) => void;
  onDelete: (id: string) => void;
  onCreateChecklistItem: (objectiveId: string, itemText: string) => void;
  onUpdateChecklistItem: (id: string, data: { item_text?: string; is_completed?: boolean }) => void;
  onDeleteChecklistItem: (id: string) => void;
  loading?: boolean;
}

export const ObjectiveCard: React.FC<ObjectiveCardProps> = ({
  objective,
  isExpanded = false,
  onExpand,
  onUpdate,
  onDelete,
  onCreateChecklistItem,
  onUpdateChecklistItem,
  onDeleteChecklistItem,
  loading = false
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  // Calculate completion based on checklist items
  const completedItems = objective.checklist?.filter(item => item.is_completed).length || 0;
  const totalItems = objective.checklist?.length || 0;
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      on_hold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      not_started: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status as keyof typeof colors] || colors.not_started;
  };

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      onCreateChecklistItem(objective.id, newChecklistItem.trim());
      setNewChecklistItem('');
    }
  };

  const handleSaveEdit = (data: Partial<StrategicObjective>) => {
    onUpdate(objective.id, data);
    setEditDialogOpen(false);
  };

  const copyShareLink = (mode: 'viewer' | 'editor') => {
    const token = getOrCreateToken(objective.id, mode);
    const url = `${window.location.origin}/strategic-planning/share/${token}/${mode}`;
    navigator.clipboard.writeText(url);
    toast.success(`${mode === 'viewer' ? 'Viewer' : 'Editor'} link copied!`);
  };

  return (
    <>
      <Card className={`transition-all duration-200 hover:shadow-md group ${isExpanded ? 'ring-2 ring-primary/20' : ''}`}>
        <CardHeader 
          className="pb-3 cursor-pointer"
          onClick={() => onExpand(objective.id)}
        >
          <div className="flex items-start gap-4">
            {/* Expand/Collapse Icon */}
            <div className="flex-shrink-0 pt-1">
              {isExpanded ? 
                <ChevronDown className="h-5 w-5 text-muted-foreground" /> : 
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              }
            </div>

            {/* Performance Gauge */}
            <div className="flex-shrink-0">
              <ObjectivePerformanceGauge 
                completion={completionPercentage} 
                size="sm" 
                showLabel={false}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg leading-tight pr-4">
                  {objective.title}
                </h3>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditDialogOpen(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyShareLink('viewer');
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    <Copy className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyShareLink('editor');
                    }}
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    <Copy className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(objective.id);
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Badges and Meta Info */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge className={getPriorityColor(objective.priority)}>
                  {objective.priority}
                </Badge>
                <Badge className={getStatusColor(objective.status)}>
                  {objective.status.replace('_', ' ')}
                </Badge>
                {objective.target_date && (
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(objective.target_date), 'MMM d, yyyy')}
                  </Badge>
                )}
                {totalItems > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <Target className="h-3 w-3 mr-1" />
                    {completedItems}/{totalItems} tasks
                  </Badge>
                )}
              </div>

              {/* Description */}
              {!isExpanded && objective.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {objective.description}
                </p>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Expanded Content */}
        {isExpanded && (
          <CardContent className="pt-0">
            {/* Full Description */}
            {objective.description && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  {objective.description}
                </p>
              </div>
            )}

            {/* Add Checklist Item */}
            <div className="mb-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a new task..."
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                  className="flex-1"
                />
                <Button onClick={handleAddChecklistItem} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Checklist Items */}
            {objective.checklist && objective.checklist.length > 0 && (
              <div className="space-y-2">
                {objective.checklist
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((item) => (
                    <ChecklistItemComponent
                      key={item.id}
                      item={item}
                      onUpdate={onUpdateChecklistItem}
                      onDelete={onDeleteChecklistItem}
                    />
                  ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Edit Dialog */}
      <ObjectiveEditDialog
        objective={objective}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveEdit}
        loading={loading}
      />
    </>
  );
};