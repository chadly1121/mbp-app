-- Create table for P&L report data from QuickBooks Online
CREATE TABLE public.qbo_profit_loss (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  account_id UUID REFERENCES chart_of_accounts(id),
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL, -- revenue, expense, cost_of_goods_sold
  qbo_account_id TEXT,
  
  -- Time periods
  report_date DATE NOT NULL,
  fiscal_year INTEGER NOT NULL,
  fiscal_quarter INTEGER, -- 1, 2, 3, 4
  fiscal_month INTEGER NOT NULL, -- 1-12
  
  -- Financial amounts
  current_month NUMERIC DEFAULT 0,
  quarter_to_date NUMERIC DEFAULT 0,
  year_to_date NUMERIC DEFAULT 0,
  
  -- Variance analysis (vs budget if available)
  budget_current_month NUMERIC DEFAULT 0,
  budget_quarter_to_date NUMERIC DEFAULT 0,
  budget_year_to_date NUMERIC DEFAULT 0,
  variance_current_month NUMERIC DEFAULT 0,
  variance_quarter_to_date NUMERIC DEFAULT 0,
  variance_year_to_date NUMERIC DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.qbo_profit_loss ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can manage P&L data for their companies" 
ON public.qbo_profit_loss 
FOR ALL 
USING (company_id IN (
  SELECT companies.id FROM companies 
  WHERE companies.owner_id = auth.uid()
));

-- Create indexes for better performance
CREATE INDEX idx_qbo_profit_loss_company_date ON public.qbo_profit_loss(company_id, report_date);
CREATE INDEX idx_qbo_profit_loss_fiscal_year ON public.qbo_profit_loss(company_id, fiscal_year, fiscal_quarter);
CREATE INDEX idx_qbo_profit_loss_account_type ON public.qbo_profit_loss(company_id, account_type);

-- Create trigger for updated_at
CREATE TRIGGER update_qbo_profit_loss_updated_at
  BEFORE UPDATE ON public.qbo_profit_loss
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();