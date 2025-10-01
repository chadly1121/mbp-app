-- Create long_term_strategy table for BHAG and foundation
CREATE TABLE IF NOT EXISTS public.long_term_strategy (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  long_term_vision TEXT,
  three_year_revenue_goal NUMERIC,
  three_year_gp_percent NUMERIC,
  three_year_np_percent NUMERIC,
  values_json JSONB DEFAULT '[]'::jsonb,
  tactics_json JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create annual_strategic_goals table
CREATE TABLE IF NOT EXISTS public.annual_strategic_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  fiscal_year INTEGER NOT NULL,
  sales_goal NUMERIC,
  revenue_goal NUMERIC,
  financial_goal TEXT,
  people_goal TEXT,
  critical_focus TEXT,
  implementation_items_json JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quarterly_strategic_goals table
CREATE TABLE IF NOT EXISTS public.quarterly_strategic_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  year INTEGER NOT NULL,
  quarter INTEGER NOT NULL,
  sales_goal NUMERIC,
  revenue_goal NUMERIC,
  financial_goal TEXT,
  people_goal TEXT,
  critical_focus TEXT,
  implementation_items_json JSONB DEFAULT '[]'::jsonb,
  results_analysis TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_quarter CHECK (quarter >= 1 AND quarter <= 4)
);

-- Enable RLS
ALTER TABLE public.long_term_strategy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annual_strategic_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quarterly_strategic_goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for long_term_strategy
CREATE POLICY "Users can manage long_term_strategy for their companies"
  ON public.long_term_strategy
  FOR ALL
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Create RLS policies for annual_strategic_goals
CREATE POLICY "Users can manage annual_strategic_goals for their companies"
  ON public.annual_strategic_goals
  FOR ALL
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Create RLS policies for quarterly_strategic_goals
CREATE POLICY "Users can manage quarterly_strategic_goals for their companies"
  ON public.quarterly_strategic_goals
  FOR ALL
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- Create triggers for updated_at
CREATE TRIGGER update_long_term_strategy_updated_at
  BEFORE UPDATE ON public.long_term_strategy
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_annual_strategic_goals_updated_at
  BEFORE UPDATE ON public.annual_strategic_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quarterly_strategic_goals_updated_at
  BEFORE UPDATE ON public.quarterly_strategic_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();