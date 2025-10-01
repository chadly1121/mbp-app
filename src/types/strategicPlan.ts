export interface LongTermStrategy {
  id: string;
  company_id: string;
  long_term_vision: string | null;
  three_year_revenue_goal: number | null;
  three_year_gp_percent: number | null;
  three_year_np_percent: number | null;
  values_json: CompanyValue[];
  tactics_json: string[];
  created_at: string;
  updated_at: string;
}

export interface CompanyValue {
  name: string;
  description: string;
}

export interface AnnualStrategicGoals {
  id: string;
  company_id: string;
  fiscal_year: number;
  sales_goal: number | null;
  revenue_goal: number | null;
  financial_goal: string | null;
  people_goal: string | null;
  critical_focus: string | null;
  implementation_items_json: string[];
  created_at: string;
  updated_at: string;
}

export interface QuarterlyStrategicGoals {
  id: string;
  company_id: string;
  year: number;
  quarter: number;
  sales_goal: number | null;
  revenue_goal: number | null;
  financial_goal: string | null;
  people_goal: string | null;
  critical_focus: string | null;
  implementation_items_json: string[];
  results_analysis: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateLongTermStrategyRequest {
  long_term_vision?: string;
  three_year_revenue_goal?: number;
  three_year_gp_percent?: number;
  three_year_np_percent?: number;
  values_json?: CompanyValue[];
  tactics_json?: string[];
}

export interface UpdateLongTermStrategyRequest {
  long_term_vision?: string;
  three_year_revenue_goal?: number;
  three_year_gp_percent?: number;
  three_year_np_percent?: number;
  values_json?: CompanyValue[];
  tactics_json?: string[];
}

export interface CreateAnnualGoalsRequest {
  fiscal_year: number;
  sales_goal?: number;
  revenue_goal?: number;
  financial_goal?: string;
  people_goal?: string;
  critical_focus?: string;
  implementation_items_json?: string[];
}

export interface UpdateAnnualGoalsRequest {
  sales_goal?: number;
  revenue_goal?: number;
  financial_goal?: string;
  people_goal?: string;
  critical_focus?: string;
  implementation_items_json?: string[];
}

export interface CreateQuarterlyGoalsRequest {
  year: number;
  quarter: number;
  sales_goal?: number;
  revenue_goal?: number;
  financial_goal?: string;
  people_goal?: string;
  critical_focus?: string;
  implementation_items_json?: string[];
  results_analysis?: string;
}

export interface UpdateQuarterlyGoalsRequest {
  sales_goal?: number;
  revenue_goal?: number;
  financial_goal?: string;
  people_goal?: string;
  critical_focus?: string;
  implementation_items_json?: string[];
  results_analysis?: string;
}
