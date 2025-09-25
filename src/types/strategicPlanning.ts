// Proper TypeScript interfaces for Strategic Planning
export interface StrategicObjective {
  id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  completion_percentage: number;
  company_id: string;
  created_at: string;
  updated_at: string;
  checklist?: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  objective_id: string;
  item_text: string;
  is_completed: boolean;
  sort_order: number;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateObjectiveRequest {
  title: string;
  description?: string;
  target_date?: string;
  priority: StrategicObjective['priority'];
  status?: StrategicObjective['status'];
  completion_percentage?: number;
  company_id: string;
}

export interface UpdateObjectiveRequest {
  title?: string;
  description?: string;
  target_date?: string;
  priority?: StrategicObjective['priority'];
  status?: StrategicObjective['status'];
  completion_percentage?: number;
}

export interface CreateChecklistItemRequest {
  objective_id: string;
  item_text: string;
  sort_order?: number;
}

export interface UpdateChecklistItemRequest {
  item_text?: string;
  is_completed?: boolean;
  sort_order?: number;
}

export interface ObjectiveFormData {
  title: string;
  description: string;
  target_date: string;
  priority: StrategicObjective['priority'];
  status: StrategicObjective['status'];
  completion_percentage: number;
}

export const OBJECTIVE_PRIORITIES: StrategicObjective['priority'][] = [
  'low',
  'medium',
  'high', 
  'critical'
];

export const OBJECTIVE_STATUSES: StrategicObjective['status'][] = [
  'not_started',
  'in_progress',
  'completed',
  'on_hold'
];

// Helper functions
export const getObjectivePriorityColor = (priority: StrategicObjective['priority']): string => {
  const colors = {
    critical: 'destructive',
    high: 'orange',
    medium: 'yellow',
    low: 'green'
  } as const;
  return colors[priority] || 'secondary';
};

export const getObjectiveStatusColor = (status: StrategicObjective['status']): string => {
  const colors = {
    completed: 'green',
    in_progress: 'blue',
    on_hold: 'yellow', 
    not_started: 'gray'
  } as const;
  return colors[status] || 'secondary';
};

export const calculateChecklistProgress = (checklist: ChecklistItem[]): number => {
  if (!checklist || checklist.length === 0) return 0;
  const completed = checklist.filter(item => item.is_completed).length;
  return Math.round((completed / checklist.length) * 100);
};