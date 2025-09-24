-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  company_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create companies table for multi-tenancy
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chart of accounts
CREATE TABLE public.chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  account_code TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  parent_id UUID REFERENCES public.chart_of_accounts(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, account_code)
);

-- Create products/services table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  product_type TEXT NOT NULL CHECK (product_type IN ('product', 'service')),
  unit_price DECIMAL(15,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  description TEXT NOT NULL,
  reference_number TEXT,
  total_amount DECIMAL(15,2) NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transaction line items table
CREATE TABLE public.transaction_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.chart_of_accounts(id),
  product_id UUID REFERENCES public.products(id),
  description TEXT,
  debit_amount DECIMAL(15,2) DEFAULT 0,
  credit_amount DECIMAL(15,2) DEFAULT 0,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(15,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create monthly budgets table for MBP functionality
CREATE TABLE public.monthly_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  account_id UUID NOT NULL REFERENCES public.chart_of_accounts(id),
  budget_year INTEGER NOT NULL,
  budget_month INTEGER NOT NULL CHECK (budget_month BETWEEN 1 AND 12),
  budgeted_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  actual_amount DECIMAL(15,2) DEFAULT 0,
  variance_amount DECIMAL(15,2) GENERATED ALWAYS AS (actual_amount - budgeted_amount) STORED,
  variance_percent DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN budgeted_amount = 0 THEN 0
      ELSE ((actual_amount - budgeted_amount) / budgeted_amount) * 100
    END
  ) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, product_id, account_id, budget_year, budget_month)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_budgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Simple RLS Policies for companies (owner only access)
CREATE POLICY "Users can view their own companies" ON public.companies
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can create companies" ON public.companies
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Company owners can update their companies" ON public.companies
  FOR UPDATE USING (owner_id = auth.uid());

-- RLS Policies for chart of accounts
CREATE POLICY "Users can manage chart of accounts for their companies" ON public.chart_of_accounts
  FOR ALL USING (
    company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid())
  );

-- RLS Policies for products
CREATE POLICY "Users can manage products for their companies" ON public.products
  FOR ALL USING (
    company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid())
  );

-- RLS Policies for transactions
CREATE POLICY "Users can manage transactions for their companies" ON public.transactions
  FOR ALL USING (
    company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid())
  );

-- RLS Policies for transaction line items
CREATE POLICY "Users can manage transaction line items for their companies" ON public.transaction_line_items
  FOR ALL USING (
    transaction_id IN (
      SELECT id FROM public.transactions 
      WHERE company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid())
    )
  );

-- RLS Policies for monthly budgets
CREATE POLICY "Users can manage budgets for their companies" ON public.monthly_budgets
  FOR ALL USING (
    company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid())
  );

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chart_of_accounts_updated_at
  BEFORE UPDATE ON public.chart_of_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monthly_budgets_updated_at
  BEFORE UPDATE ON public.monthly_budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to create default chart of accounts for a new company
CREATE OR REPLACE FUNCTION public.create_default_chart_of_accounts(company_id_param UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.chart_of_accounts (company_id, account_code, account_name, account_type) VALUES
  (company_id_param, '1000', 'Assets', 'asset'),
  (company_id_param, '1100', 'Current Assets', 'asset'),
  (company_id_param, '1110', 'Cash and Cash Equivalents', 'asset'),
  (company_id_param, '1120', 'Accounts Receivable', 'asset'),
  (company_id_param, '1130', 'Inventory', 'asset'),
  (company_id_param, '2000', 'Liabilities', 'liability'),
  (company_id_param, '2100', 'Current Liabilities', 'liability'),
  (company_id_param, '2110', 'Accounts Payable', 'liability'),
  (company_id_param, '3000', 'Equity', 'equity'),
  (company_id_param, '3100', 'Retained Earnings', 'equity'),
  (company_id_param, '4000', 'Revenue', 'revenue'),
  (company_id_param, '4100', 'Sales Revenue', 'revenue'),
  (company_id_param, '5000', 'Expenses', 'expense'),
  (company_id_param, '5100', 'Cost of Goods Sold', 'expense'),
  (company_id_param, '5200', 'Operating Expenses', 'expense');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;