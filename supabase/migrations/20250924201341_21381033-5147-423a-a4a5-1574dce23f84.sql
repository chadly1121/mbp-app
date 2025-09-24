-- Create QBO connections table
CREATE TABLE public.qbo_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  user_id UUID NOT NULL,
  qbo_company_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, qbo_company_id)
);

-- Enable RLS
ALTER TABLE public.qbo_connections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage QBO connections for their companies" 
ON public.qbo_connections 
FOR ALL 
USING (company_id IN (
  SELECT companies.id 
  FROM companies 
  WHERE companies.owner_id = auth.uid()
));

-- Add qbo_id columns to existing tables for sync mapping
ALTER TABLE public.products 
ADD COLUMN qbo_id TEXT;

ALTER TABLE public.chart_of_accounts 
ADD COLUMN qbo_id TEXT;

-- Create unique constraints for QBO sync
ALTER TABLE public.products 
ADD CONSTRAINT products_company_qbo_unique 
UNIQUE (company_id, qbo_id);

ALTER TABLE public.chart_of_accounts 
ADD CONSTRAINT accounts_company_qbo_unique 
UNIQUE (company_id, qbo_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_qbo_connections_updated_at
BEFORE UPDATE ON public.qbo_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();