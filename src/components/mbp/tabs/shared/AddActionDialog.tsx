import React, { memo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { ActionItem } from '@/types/supabase';

interface NewActionForm {
  title: string;
  description: string;
  assigned_to: string;
  due_date: string;
  priority: ActionItem['priority'];
  category: string;
}

interface AddActionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newAction: NewActionForm;
  onActionChange: (field: keyof NewActionForm, value: string) => void;
  onSubmit: () => void;
  categories: readonly string[];
}

const PRIORITY_OPTIONS: ActionItem['priority'][] = ['low', 'medium', 'high', 'critical'];

export const AddActionDialog = memo<AddActionDialogProps>(({
  isOpen,
  onOpenChange,
  newAction,
  onActionChange,
  onSubmit,
  categories
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Action Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Action Item</DialogTitle>
          <DialogDescription>
            Create a new action item to track important tasks and initiatives.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={newAction.title}
              onChange={(e) => onActionChange('title', e.target.value)}
              placeholder="Action item title..."
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newAction.description}
              onChange={(e) => onActionChange('description', e.target.value)}
              placeholder="Describe the action item..."
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="assigned_to">Assigned To</Label>
              <Input
                id="assigned_to"
                value={newAction.assigned_to}
                onChange={(e) => onActionChange('assigned_to', e.target.value)}
                placeholder="Team member name"
              />
            </div>
            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={newAction.due_date}
                onChange={(e) => onActionChange('due_date', e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select 
                value={newAction.category} 
                onValueChange={(value) => onActionChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select 
                value={newAction.priority} 
                onValueChange={(value: ActionItem['priority']) => onActionChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!newAction.title.trim()}>
              Add Action Item
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});

AddActionDialog.displayName = 'AddActionDialog';