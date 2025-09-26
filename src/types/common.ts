// Common types used across the application

export interface Company {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  display_name?: string;
  beta_access_status?: 'pending' | 'approved' | 'denied';
  user_role?: 'user' | 'admin';
}

export interface QBOConnection {
  id: string;
  company_id: string;
  user_id: string;
  qbo_company_id: string;
  is_active: boolean;
  last_sync_at: string | null;
  token_expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

// Filter types
export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  dateRange?: [Date, Date];
  status?: string[];
  category?: string[];
}

// Form validation helpers
export type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

// Select component value types
export type SelectValue = string | number;

// Status types used across forms
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type StatusType = 'success' | 'warning' | 'error' | 'info';