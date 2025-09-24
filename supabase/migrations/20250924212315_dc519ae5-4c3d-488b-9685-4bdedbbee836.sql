-- Comprehensive MBP Database Schema based on Google Sheets structure

-- Global MBP Configuration table
CREATE TABLE public.mbp_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  fiscal_year INTEGER NOT NULL DEFAULT 2025,
  fiscal_year_start DATE NOT NULL DEFAULT '2025-01-01',
  tracking_period TEXT CHECK (tracking_period IN ('weekly', 'monthly')) DEFAULT 'weekly',
  file_type TEXT CHECK (file_type IN ('mbp', 'gsr')) DEFAULT 'mbp',
  budget_type TEXT DEFAULT 'Budget - 1',
  planning_fiscal_year TEXT DEFAULT 'FY2',
  insurance_inclusion TEXT DEFAULT 'Typical Only',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sales Plans table (supports both weekly and monthly plans)
CREATE TABLE public.sales_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  plan_name TEXT NOT NULL,
  plan_type TEXT CHECK (plan_type IN ('weekly', 'monthly')) NOT NULL,
  is_total_plan BOOLEAN DEFAULT false,
  year INTEGER NOT NULL,
  week_number INTEGER, -- For weekly plans
  month_number INTEGER, -- For monthly plans (1-12)
  planned_revenue NUMERIC DEFAULT 0,
  actual_revenue NUMERIC DEFAULT 0,
  variance_revenue NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Revenue Production tracking
CREATE TABLE public.revenue_produced (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  production_name TEXT NOT NULL,
  production_type TEXT CHECK (production_type IN ('weekly', 'monthly')) NOT NULL,
  is_total_production BOOLEAN DEFAULT false,
  year INTEGER NOT NULL,
  week_number INTEGER,
  month_number INTEGER,
  produced_revenue NUMERIC DEFAULT 0,
  target_revenue NUMERIC DEFAULT 0,
  variance_revenue NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Budget Planning (Budget-1, Budget-2)
CREATE TABLE public.budget_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  budget_type TEXT NOT NULL DEFAULT 'Budget - 1',
  category TEXT NOT NULL, -- e.g., 'revenue', 'cogs', 'expenses'
  subcategory TEXT,
  account_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  month_number INTEGER NOT NULL,
  budgeted_amount NUMERIC DEFAULT 0,
  actual_amount NUMERIC DEFAULT 0,
  variance_amount NUMERIC DEFAULT 0,
  variance_percent NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Income Statement tracking
CREATE TABLE public.income_statements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  statement_type TEXT NOT NULL DEFAULT 'Income Statement - 1',
  category TEXT NOT NULL,
  subcategory TEXT,
  line_item TEXT NOT NULL,
  year INTEGER NOT NULL,
  month_number INTEGER NOT NULL,
  current_month NUMERIC DEFAULT 0,
  year_to_date NUMERIC DEFAULT 0,
  budget_amount NUMERIC DEFAULT 0,
  variance_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Lead Funnel tracking
CREATE TABLE public.lead_funnel (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  stage_name TEXT NOT NULL,
  stage_order INTEGER NOT NULL,
  leads_count INTEGER DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  average_value NUMERIC DEFAULT 0,
  year INTEGER NOT NULL,
  month_number INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sales Pipeline tracking
CREATE TABLE public.sales_pipeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  opportunity_name TEXT NOT NULL,
  client_name TEXT,
  stage TEXT NOT NULL,
  probability NUMERIC DEFAULT 0,
  estimated_value NUMERIC DEFAULT 0,
  estimated_close_date DATE,
  actual_close_date DATE,
  status TEXT CHECK (status IN ('open', 'won', 'lost')) DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Production Planning
CREATE TABLE public.production_planning (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  project_name TEXT NOT NULL,
  production_type TEXT NOT NULL,
  planned_start_date DATE,
  planned_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  planned_hours NUMERIC DEFAULT 0,
  actual_hours NUMERIC DEFAULT 0,
  planned_cost NUMERIC DEFAULT 0,
  actual_cost NUMERIC DEFAULT 0,
  status TEXT CHECK (status IN ('planned', 'in_progress', 'completed', 'on_hold')) DEFAULT 'planned',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Implementation Plan
CREATE TABLE public.implementation_plan (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  initiative_name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  planned_start_date DATE,
  planned_completion_date DATE,
  actual_start_date DATE,
  actual_completion_date DATE,
  progress_percentage INTEGER DEFAULT 0,
  responsible_person TEXT,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'blocked')) DEFAULT 'not_started',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Victories/Wins tracking
CREATE TABLE public.victories_wins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  victory_title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  impact_level TEXT CHECK (impact_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  date_achieved DATE NOT NULL,
  team_members TEXT,
  lessons_learned TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Job Planner
CREATE TABLE public.job_planner (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  job_name TEXT NOT NULL,
  client_name TEXT,
  job_type TEXT,
  estimated_hours NUMERIC DEFAULT 0,
  actual_hours NUMERIC DEFAULT 0,
  hourly_rate NUMERIC DEFAULT 0,
  estimated_cost NUMERIC DEFAULT 0,
  actual_cost NUMERIC DEFAULT 0,
  planned_start_date DATE,
  planned_completion_date DATE,
  actual_start_date DATE,
  actual_completion_date DATE,
  status TEXT CHECK (status IN ('quoted', 'scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'quoted',
  profitability NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AR Tracker (Accounts Receivable)
CREATE TABLE public.ar_tracker (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  invoice_number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  invoice_amount NUMERIC NOT NULL,
  paid_amount NUMERIC DEFAULT 0,
  balance_due NUMERIC NOT NULL,
  days_outstanding INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'disputed')) DEFAULT 'pending',
  payment_terms TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Marketing Plan
CREATE TABLE public.marketing_plan (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  campaign_name TEXT NOT NULL,
  marketing_channel TEXT NOT NULL,
  target_audience TEXT,
  campaign_start_date DATE,
  campaign_end_date DATE,
  planned_budget NUMERIC DEFAULT 0,
  actual_spend NUMERIC DEFAULT 0,
  planned_leads INTEGER DEFAULT 0,
  actual_leads INTEGER DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  roi NUMERIC DEFAULT 0,
  status TEXT CHECK (status IN ('planned', 'active', 'paused', 'completed', 'cancelled')) DEFAULT 'planned',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Organizational Structure
CREATE TABLE public.organizational_structure (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  position_title TEXT NOT NULL,
  department TEXT,
  reports_to_position TEXT,
  employee_name TEXT,
  employment_type TEXT CHECK (employment_type IN ('full_time', 'part_time', 'contractor', 'intern')) DEFAULT 'full_time',
  salary_range TEXT,
  responsibilities TEXT,
  required_skills TEXT,
  status TEXT CHECK (status IN ('filled', 'vacant', 'recruiting', 'planned')) DEFAULT 'vacant',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habits Tracker
CREATE TABLE public.habits_tracker (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  habit_name TEXT NOT NULL,
  habit_category TEXT,
  target_frequency TEXT, -- e.g., 'daily', 'weekly', '3x per week'
  date_tracked DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  streak_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.mbp_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_produced ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_funnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_planning ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.implementation_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.victories_wins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_planner ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizational_structure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits_tracker ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for all tables
CREATE POLICY "Users can manage mbp_config for their companies" ON public.mbp_config FOR ALL USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "Users can manage sales_plans for their companies" ON public.sales_plans FOR ALL USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "Users can manage revenue_produced for their companies" ON public.revenue_produced FOR ALL USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "Users can manage budget_plans for their companies" ON public.budget_plans FOR ALL USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "Users can manage income_statements for their companies" ON public.income_statements FOR ALL USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "Users can manage lead_funnel for their companies" ON public.lead_funnel FOR ALL USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "Users can manage sales_pipeline for their companies" ON public.sales_pipeline FOR ALL USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "Users can manage production_planning for their companies" ON public.production_planning FOR ALL USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "Users can manage implementation_plan for their companies" ON public.implementation_plan FOR ALL USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "Users can manage victories_wins for their companies" ON public.victories_wins FOR ALL USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "Users can manage job_planner for their companies" ON public.job_planner FOR ALL USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "Users can manage ar_tracker for their companies" ON public.ar_tracker FOR ALL USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "Users can manage marketing_plan for their companies" ON public.marketing_plan FOR ALL USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "Users can manage organizational_structure for their companies" ON public.organizational_structure FOR ALL USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));
CREATE POLICY "Users can manage habits_tracker for their companies" ON public.habits_tracker FOR ALL USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Create triggers for updating timestamps
CREATE TRIGGER update_mbp_config_updated_at BEFORE UPDATE ON public.mbp_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sales_plans_updated_at BEFORE UPDATE ON public.sales_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_revenue_produced_updated_at BEFORE UPDATE ON public.revenue_produced FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_budget_plans_updated_at BEFORE UPDATE ON public.budget_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_income_statements_updated_at BEFORE UPDATE ON public.income_statements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lead_funnel_updated_at BEFORE UPDATE ON public.lead_funnel FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sales_pipeline_updated_at BEFORE UPDATE ON public.sales_pipeline FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_production_planning_updated_at BEFORE UPDATE ON public.production_planning FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_implementation_plan_updated_at BEFORE UPDATE ON public.implementation_plan FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_victories_wins_updated_at BEFORE UPDATE ON public.victories_wins FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_job_planner_updated_at BEFORE UPDATE ON public.job_planner FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ar_tracker_updated_at BEFORE UPDATE ON public.ar_tracker FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_marketing_plan_updated_at BEFORE UPDATE ON public.marketing_plan FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_organizational_structure_updated_at BEFORE UPDATE ON public.organizational_structure FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_habits_tracker_updated_at BEFORE UPDATE ON public.habits_tracker FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();