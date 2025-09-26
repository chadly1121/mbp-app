import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Clock, User, AlertTriangle, Trash2 } from 'lucide-react';
import { ActionItem } from '@/types/supabase';

interface ActionItemCardProps {
  item: ActionItem;
  onStatusChange: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

const isOverdue = (dueDate: string, status: string): boolean => {
  if (status === 'completed') return false;
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

const getPriorityColor = (priority: string): "default" | "destructive" | "outline" | "secondary" => {
  switch (priority) {
    case 'critical': return 'destructive';
    case 'high': return 'destructive';
    case 'medium': return 'secondary';
    case 'low': return 'outline';
    default: return 'secondary';
  }
};

const getStatusColor = (status: string): "default" | "destructive" | "outline" | "secondary" => {
  switch (status) {
    case 'completed': return 'default';
    case 'in_progress': return 'secondary';
    case 'overdue': return 'destructive';
    case 'pending': return 'outline';
    default: return 'outline';
  }
};

const formatDate = (dateString: string): string => {
  if (!dateString) return 'No date';
  return new Date(dateString).toLocaleDateString();
};

export const ActionItemCard = memo<ActionItemCardProps>(({ 
  item, 
  onStatusChange, 
  onDelete 
}) => {
  const overdue = isOverdue(item.due_date, item.status);
  
  return (
    <Card className={`border ${
      overdue ? 'border-red-200 bg-red-50/50' : 'border-muted'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={item.status === 'completed'}
            onCheckedChange={(checked) => onStatusChange(item.id, checked as boolean)}
            className="mt-1"
          />
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <h4 className={`font-medium ${
                item.status === 'completed' ? 'line-through text-muted-foreground' : ''
              }`}>
                {item.title}
              </h4>
              <div className="flex items-center gap-2">
                <Badge variant={getPriorityColor(item.priority)}>
                  {item.priority}
                </Badge>
                <Badge variant={getStatusColor(item.status)}>
                  {item.status.replace('_', ' ')}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(item.id)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {item.description && (
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {item.assigned_to && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {item.assigned_to}
                </div>
              )}
              {item.due_date && (
                <div className={`flex items-center gap-1 ${
                  overdue ? 'text-red-600 font-medium' : ''
                }`}>
                  {overdue && <AlertTriangle className="h-3 w-3" />}
                  <Clock className="h-3 w-3" />
                  Due: {formatDate(item.due_date)}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ActionItemCard.displayName = 'ActionItemCard';