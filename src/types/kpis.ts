export interface KPI {
  id: string;
  name: string;
  description: string | null;
  current_value: number;
  target_value: number;
  unit: string | null;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  is_active: boolean;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateKPIRequest {
  name: string;
  description?: string;
  current_value: number;
  target_value: number;
  unit?: string;
  frequency: KPI['frequency'];
  company_id: string;
}

export interface UpdateKPIRequest {
  name?: string;
  description?: string;
  current_value?: number;
  target_value?: number;
  unit?: string;
  frequency?: KPI['frequency'];
  is_active?: boolean;
}

export interface KPIStats {
  total: number;
  onTrack: number;
  atRisk: number;
  behind: number;
  averageProgress: number;
}

export type KPIStatus = 'on-track' | 'at-risk' | 'behind';

export interface KPIFormData {
  name: string;
  description: string;
  current_value: number;
  target_value: number;
  unit: string;
  frequency: KPI['frequency'];
}

// Helper functions
export const getKPIStatus = (current: number, target: number): KPIStatus => {
  const percentage = (current / target) * 100;
  if (percentage >= 100) return 'on-track';
  if (percentage >= 75) return 'at-risk';
  return 'behind';
};

export const getProgressPercentage = (current: number, target: number): number => {
  return Math.min((current / target) * 100, 100);
};

export const calculateKPIStats = (kpis: KPI[]): KPIStats => {
  const total = kpis.length;
  const onTrack = kpis.filter(k => getKPIStatus(k.current_value, k.target_value) === 'on-track').length;
  const atRisk = kpis.filter(k => getKPIStatus(k.current_value, k.target_value) === 'at-risk').length;
  const behind = kpis.filter(k => getKPIStatus(k.current_value, k.target_value) === 'behind').length;
  const averageProgress = total > 0
    ? Math.round(kpis.reduce((sum, k) => sum + getProgressPercentage(k.current_value, k.target_value), 0) / total)
    : 0;

  return { total, onTrack, atRisk, behind, averageProgress };
};