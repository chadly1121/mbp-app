// Proper TypeScript interfaces for Action Items
export interface ActionItem {
  id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  category: string | null;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateActionItemRequest {
  title: string;
  description?: string;
  assigned_to?: string;
  due_date?: string;
  priority: ActionItem['priority'];
  category?: string;
  company_id: string;
}

export interface UpdateActionItemRequest {
  title?: string;
  description?: string;
  assigned_to?: string;
  due_date?: string;
  priority?: ActionItem['priority'];
  status?: ActionItem['status'];
  category?: string;
}

export interface ActionItemFormData {
  title: string;
  description: string;
  assigned_to: string;
  due_date: string;
  priority: ActionItem['priority'];
  category: string;
}

export interface ActionItemFilters {
  status: string;
  priority: string;
  category?: string;
  assigned_to?: string;
}

export const ACTION_ITEM_CATEGORIES = [
  'Strategic',
  'Financial', 
  'Operations',
  'Marketing',
  'Technology',
  'HR'
] as const;

export const ACTION_ITEM_PRIORITIES: ActionItem['priority'][] = [
  'low',
  'medium', 
  'high',
  'critical'
];

export const ACTION_ITEM_STATUSES: ActionItem['status'][] = [
  'pending',
  'in_progress',
  'completed', 
  'cancelled'
];

// Helper functions
export const isActionItemOverdue = (dueDate: string | null, status: ActionItem['status']): boolean => {
  if (!dueDate || status === 'completed') return false;
  return new Date(dueDate) < new Date();
};

export const getActionItemPriorityColor = (priority: ActionItem['priority']): string => {
  const colors = {
    critical: 'destructive',
    high: 'orange',
    medium: 'yellow', 
    low: 'green'
  } as const;
  return colors[priority] || 'secondary';
};

export const getActionItemStatusColor = (status: ActionItem['status']): string => {
  const colors = {
    completed: 'green',
    in_progress: 'blue', 
    pending: 'gray',
    cancelled: 'red'
  } as const;
  return colors[status] || 'secondary';
};