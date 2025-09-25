// Extended types for better type safety across the application
import { Company, User, ApiError } from './common';
import { PostgrestError } from '@supabase/supabase-js';

// Error handling types
export type SupabaseError = PostgrestError | ApiError | Error;

export interface SupabaseResponse<T = unknown> {
  data: T | null;
  error: SupabaseError | null;
}

// Select component value types (commonly used across forms)
export type SelectChangeHandler<T extends string = string> = (value: T) => void;

// Common form state types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export type FormStatus = 'idle' | 'loading' | 'success' | 'error';

// MBP Tab specific types
export interface BaseRecord {
  id: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface ActionItem extends BaseRecord {
  title: string;
  description: string;
  assigned_to: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  category: string;
}

export interface StrategicObjective extends BaseRecord {
  title: string;
  description: string;
  target_date: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  completion_percentage: number;
  checklist?: ChecklistItem[];
}

export interface ChecklistItem extends BaseRecord {
  objective_id: string;
  item_text: string;
  is_completed: boolean;
  sort_order: number;
}

export interface KPI extends BaseRecord {
  name: string;
  description: string;
  target_value: number;
  current_value: number;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  is_active: boolean;
}

export interface Job extends BaseRecord {
  job_name: string;
  client_name: string;
  job_type: string;
  status: 'quoted' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  estimated_hours: number;
  actual_hours: number;
  hourly_rate: number;
  estimated_cost: number;
  actual_cost: number;
  planned_start_date: string;
  planned_completion_date: string;
  actual_start_date: string;
  actual_completion_date: string;
  profitability: number;
  notes: string;
}

export interface MarketingCampaign extends BaseRecord {
  campaign_name: string;
  marketing_channel: string;
  target_audience: string;
  campaign_start_date: string;
  campaign_end_date: string;
  planned_budget: number;
  actual_spend: number;
  planned_leads: number;
  actual_leads: number;
  conversion_rate: number;
  roi: number;
  status: 'planned' | 'active' | 'paused' | 'completed' | 'cancelled';
  notes: string;
}

export interface OrganizationalPosition extends BaseRecord {
  position_title: string;
  department: string;
  employee_name: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'intern';
  status: 'vacant' | 'filled' | 'recruiting';
  salary_range: string;
  reports_to_position: string;
  responsibilities: string;
  required_skills: string;
}

export interface ProductionPlan extends BaseRecord {
  project_name: string;
  production_type: string;
  planned_start_date: string;
  planned_end_date: string;
  actual_start_date: string;
  actual_end_date: string;
  planned_hours: number;
  actual_hours: number;
  planned_cost: number;
  actual_cost: number;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  notes: string;
}

export interface VictoryWin extends BaseRecord {
  victory_title: string;
  description: string;
  date_achieved: string;
  category: string;
  impact_level: 'low' | 'medium' | 'high' | 'transformational';
  team_members: string;
  lessons_learned: string;
}

export interface HabitTracker extends BaseRecord {
  user_name: string;
  habit_name: string;
  habit_category: string;
  date_tracked: string;
  completed: boolean;
  target_frequency: string;
  streak_count: number;
  notes: string;
}

export interface ImplementationPlan extends BaseRecord {
  initiative_name: string;
  description: string;
  category: string;
  planned_start_date: string;
  planned_completion_date: string;
  actual_start_date: string;
  actual_completion_date: string;
  responsible_person: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress_percentage: number;
  notes: string;
}

// Data processing utility types
export interface GroupedData<T> {
  [key: string]: T[];
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: unknown;
}

// Form validation types
export interface FormFieldError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: FormFieldError[];
}