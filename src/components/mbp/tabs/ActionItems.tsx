import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, User, Clock, AlertTriangle, CheckSquare } from 'lucide-react';

import { BaseMBPTab } from '@/components/mbp/shared/BaseMBPTab';
import { FormDialog } from '@/components/mbp/tabs/shared/FormDialog';
import { DataTable } from '@/components/mbp/tabs/shared/DataTable';
import { useCompany } from '@/hooks/useCompany';
import { useActionItems } from '@/hooks/useActionItems';
import {
  ActionItem,
  ActionItemFormData,
  ActionItemFilters,
  ACTION_ITEM_CATEGORIES,
  ACTION_ITEM_PRIORITIES,
  ACTION_ITEM_STATUSES,
  isActionItemOverdue,
  getActionItemPriorityColor,
  getActionItemStatusColor,
} from '@/types/actionItems';

const initialFormData: ActionItemFormData = {
  title: '',
  description: '',
  assigned_to: '',
  due_date: '',
  priority: 'medium',
  category: '',
};

const initialFilters: ActionItemFilters = {
  status: 'all',
  priority: 'all',
  category: 'all',
};

export const ActionItems = () => {
  const { currentCompany } = useCompany();
  const [isAddingAction, setIsAddingAction] = useState(false);
  const [filters, setFilters] = useState<ActionItemFilters>(initialFilters);
  const [formData, setFormData] = useState<ActionItemFormData>(initialFormData);

  const {
    actionItems,
    filteredActionItems,
    loading,
    error,
    refetch,
    createActionItem,
    updateActionItem,
    deleteActionItem,
    toggleCompletion,
    creating,
  } = useActionItems(filters);

  // Statistics
  const stats = useMemo(() => {
    if (!actionItems) return { total: 0, inProgress: 0, completed: 0, overdue: 0 };

    return {
      total: actionItems.length,
      inProgress: actionItems.filter(item => item.status === 'in_progress').length,
      completed: actionItems.filter(item => item.status === 'completed').length,
      overdue: actionItems.filter(item => isActionItemOverdue(item.due_date, item.status)).length,
    };
  }, [actionItems]);

  // Group items by category for display
  const groupedItems = useMemo(() => {
    return filteredActionItems.reduce((acc, item) => {
      const category = item.category || 'General';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {} as Record<string, ActionItem[]>);
  }, [filteredActionItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCompany || !formData.title) return;

    await createActionItem({
      ...formData,
      company_id: currentCompany.id,
    });

    setFormData(initialFormData);
    setIsAddingAction(false);
  };

  const handleStatusChange = (id: string, completed: boolean) => {
    toggleCompletion(id, completed);
  };

  const handleEdit = (item: ActionItem) => {
    setFormData({
      title: item.title,
      description: item.description || '',
      assigned_to: item.assigned_to || '',
      due_date: item.due_date || '',
      priority: item.priority,
      category: item.category || '',
    });
    // TODO: Implement edit functionality
  };

  const handleDelete = (item: ActionItem) => {
    if (confirm('Are you sure you want to delete this action item?')) {
      deleteActionItem(item.id);
    }
  };

  const renderActionItem = (item: ActionItem) => (
    <Card
      key={item.id}
      className={`border ${
        isActionItemOverdue(item.due_date, item.status)
          ? 'border-destructive/50 bg-destructive/5'
          : 'border-border'
      } p-4`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={item.status === 'completed'}
          onCheckedChange={(checked) => handleStatusChange(item.id, checked as boolean)}
          className="mt-1"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h4
                className={`font-semibold ${
                  item.status === 'completed' ? 'line-through text-muted-foreground' : ''
                }`}
              >
                {item.title}
              </h4>
              {item.description && (
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isActionItemOverdue(item.due_date, item.status) && (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              )}
              <Badge variant="outline" className={`text-xs`}>
                {item.priority}
              </Badge>
              <Badge variant="outline" className={`text-xs`}>
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
              <span
                className={
                  isActionItemOverdue(item.due_date, item.status)
                    ? 'text-destructive font-medium'
                    : ''
                }
              >
                Due: {item.due_date ? new Date(item.due_date).toLocaleDateString() : 'No due date'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <BaseMBPTab
      title="Action Items & Tasks"
      description="Track and manage your business action items and tasks"
      loading={loading}
      error={error}
      onRefresh={refetch}
      onAdd={() => setIsAddingAction(true)}
      addButtonLabel="Add Action Item"
      isEmpty={!actionItems || actionItems.length === 0}
      emptyStateTitle="No Action Items"
      emptyStateDescription="Start by creating your first action item to track tasks and deliverables."
    >
      <div className="space-y-6">
        {/* Filters & Summary */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-4">
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {ACTION_ITEM_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>
                      {status.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Priority</Label>
              <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {ACTION_ITEM_PRIORITIES.map(priority => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 ml-auto">
            <Card className="p-3">
              <div className="text-sm font-medium">Total</div>
              <div className="text-xl font-bold">{stats.total}</div>
            </Card>
            <Card className="p-3">
              <div className="text-sm font-medium text-blue-600">In Progress</div>
              <div className="text-xl font-bold text-blue-600">{stats.inProgress}</div>
            </Card>
            <Card className="p-3">
              <div className="text-sm font-medium text-green-600">Completed</div>
              <div className="text-xl font-bold text-green-600">{stats.completed}</div>
            </Card>
            <Card className="p-3">
              <div className="text-sm font-medium text-destructive">Overdue</div>
              <div className="text-xl font-bold text-destructive">{stats.overdue}</div>
            </Card>
          </div>
        </div>

        {/* Action Items */}
        {Object.entries(groupedItems).length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No action items match your current filters.</p>
          </Card>
        ) : (
          Object.entries(groupedItems).map(([category, categoryItems]) => (
            <Card key={category} className="p-6">
              <h3 className="text-lg font-semibold mb-4">{category} Action Items</h3>
              <div className="space-y-3">
                {categoryItems.map(renderActionItem)}
              </div>
            </Card>
          ))
        )}

        {/* Add Action Item Dialog */}
        <FormDialog
          open={isAddingAction}
          onOpenChange={setIsAddingAction}
          title="Add Action Item"
          description="Create a new action item or task"
          onSubmit={handleSubmit}
          loading={creating}
          submitDisabled={!formData.title}
        >
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Review monthly reports"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what needs to be done..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTION_ITEM_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Priority</Label>
                <Select value={formData.priority} onValueChange={(value: ActionItem['priority']) => setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTION_ITEM_PRIORITIES.map(priority => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Assigned To</Label>
              <Input
                value={formData.assigned_to}
                onChange={(e) => setFormData(prev => ({ ...prev, assigned_to: e.target.value }))}
                placeholder="Person or team responsible"
              />
            </div>
          </div>
        </FormDialog>
      </div>
    </BaseMBPTab>
  );
};