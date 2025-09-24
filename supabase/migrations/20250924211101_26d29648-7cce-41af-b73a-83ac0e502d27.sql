-- Create tables for MBP functionality

-- Strategic objectives table
CREATE TABLE public.strategic_objectives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'on_hold')) DEFAULT 'not_started',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- KPIs table
CREATE TABLE public.kpis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  unit TEXT, -- e.g., '$', '%', 'units'
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')) DEFAULT 'monthly',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Action items table
CREATE TABLE public.action_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT,
  due_date DATE,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')) DEFAULT 'pending',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Revenue forecasts table
CREATE TABLE public.revenue_forecasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  product_id UUID,
  forecasted_amount NUMERIC NOT NULL DEFAULT 0,
  actual_amount NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cash flow projections table
CREATE TABLE public.cash_flow_projections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  category TEXT NOT NULL, -- 'income', 'expense', 'investment'
  subcategory TEXT,
  projected_amount NUMERIC NOT NULL DEFAULT 0,
  actual_amount NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Market analysis data table
CREATE TABLE public.market_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  analysis_type TEXT NOT NULL, -- 'competitor', 'market_size', 'trend', 'opportunity'
  title TEXT NOT NULL,
  description TEXT,
  data_value NUMERIC,
  data_unit TEXT,
  source TEXT,
  date_analyzed DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Monthly reviews table
CREATE TABLE public.monthly_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  review_month INTEGER NOT NULL CHECK (review_month >= 1 AND review_month <= 12),
  review_year INTEGER NOT NULL,
  revenue_actual NUMERIC DEFAULT 0,
  revenue_target NUMERIC DEFAULT 0,
  expenses_actual NUMERIC DEFAULT 0,
  expenses_target NUMERIC DEFAULT 0,
  key_achievements TEXT,
  challenges_faced TEXT,
  lessons_learned TEXT,
  next_month_focus TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.strategic_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_flow_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for all tables
CREATE POLICY "Users can manage strategic objectives for their companies" 
ON public.strategic_objectives 
FOR ALL 
USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

CREATE POLICY "Users can manage KPIs for their companies" 
ON public.kpis 
FOR ALL 
USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

CREATE POLICY "Users can manage action items for their companies" 
ON public.action_items 
FOR ALL 
USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

CREATE POLICY "Users can manage revenue forecasts for their companies" 
ON public.revenue_forecasts 
FOR ALL 
USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

CREATE POLICY "Users can manage cash flow projections for their companies" 
ON public.cash_flow_projections 
FOR ALL 
USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

CREATE POLICY "Users can manage market analysis for their companies" 
ON public.market_analysis 
FOR ALL 
USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

CREATE POLICY "Users can manage monthly reviews for their companies" 
ON public.monthly_reviews 
FOR ALL 
USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Create triggers for updating timestamps
CREATE TRIGGER update_strategic_objectives_updated_at
  BEFORE UPDATE ON public.strategic_objectives
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kpis_updated_at
  BEFORE UPDATE ON public.kpis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_action_items_updated_at
  BEFORE UPDATE ON public.action_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_revenue_forecasts_updated_at
  BEFORE UPDATE ON public.revenue_forecasts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cash_flow_projections_updated_at
  BEFORE UPDATE ON public.cash_flow_projections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_market_analysis_updated_at
  BEFORE UPDATE ON public.market_analysis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monthly_reviews_updated_at
  BEFORE UPDATE ON public.monthly_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();