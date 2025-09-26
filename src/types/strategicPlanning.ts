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
  collaborators?: ObjectiveCollaborator[];
  comments?: ObjectiveComment[];
  activity?: ObjectiveActivity[];
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

export interface ObjectiveCollaborator {
  id: string;
  objective_id: string;
  user_email: string;
  role: 'accountability_partner' | 'collaborator' | 'viewer';
  status: 'pending' | 'accepted' | 'declined';
  invited_by: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface ObjectiveComment {
  id: string;
  objective_id: string;
  user_email: string;
  user_name: string;
  content: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface ObjectiveActivity {
  id: string;
  objective_id: string;
  user_email: string | null;
  user_name: string | null;
  activity_type: 'created' | 'updated' | 'commented' | 'shared' | 'completed_checklist_item';
  activity_description: string;
  metadata: Record<string, any>;
  company_id: string;
  created_at: string;
}

export interface CreateCollaboratorRequest {
  objective_id: string;
  user_email: string;
  role: ObjectiveCollaborator['role'];
}

export interface CreateCommentRequest {
  objective_id: string;
  content: string;
}

export const calculateChecklistProgress = (checklist: ChecklistItem[]): number => {
  if (!checklist || checklist.length === 0) return 0;
  const completed = checklist.filter(item => item.is_completed).length;
  return Math.round((completed / checklist.length) * 100);
};