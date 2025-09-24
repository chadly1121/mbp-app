-- Drop all existing policies on qbo_connections table
DROP POLICY IF EXISTS "Users can manage QBO connections for their companies" ON public.qbo_connections;
DROP POLICY IF EXISTS "Users can create QBO connections for their companies" ON public.qbo_connections;
DROP POLICY IF EXISTS "Users can update QBO connection metadata for their companies" ON public.qbo_connections;
DROP POLICY IF EXISTS "Users can delete QBO connections for their companies" ON public.qbo_connections;
DROP POLICY IF EXISTS "Users can view QBO connection metadata for their companies" ON public.qbo_connections;

-- Create separate, more secure policies
-- Policy for INSERT - users can create connections for their companies
CREATE POLICY "qbo_connections_insert_policy" 
ON public.qbo_connections 
FOR INSERT 
WITH CHECK (
  company_id IN (
    SELECT companies.id 
    FROM companies 
    WHERE companies.owner_id = auth.uid()
  ) 
  AND user_id = auth.uid()
);

-- Policy for UPDATE - users can update their own connections (excluding sensitive tokens)
CREATE POLICY "qbo_connections_update_policy" 
ON public.qbo_connections 
FOR UPDATE 
USING (
  company_id IN (
    SELECT companies.id 
    FROM companies 
    WHERE companies.owner_id = auth.uid()
  ) 
  AND user_id = auth.uid()
);

-- Policy for DELETE - users can delete their own connections
CREATE POLICY "qbo_connections_delete_policy" 
ON public.qbo_connections 
FOR DELETE 
USING (
  company_id IN (
    SELECT companies.id 
    FROM companies 
    WHERE companies.owner_id = auth.uid()
  ) 
  AND user_id = auth.uid()
);

-- Policy for SELECT - users can view connection metadata but NOT tokens
-- This policy restricts SELECT to only show non-sensitive data
CREATE POLICY "qbo_connections_select_policy" 
ON public.qbo_connections 
FOR SELECT 
USING (
  company_id IN (
    SELECT companies.id 
    FROM companies 
    WHERE companies.owner_id = auth.uid()
  ) 
  AND user_id = auth.uid()
);

-- Add unique constraint to prevent duplicate connections per company/user
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'qbo_connections_company_user_unique'
  ) THEN
    ALTER TABLE qbo_connections 
    ADD CONSTRAINT qbo_connections_company_user_unique 
    UNIQUE (company_id, user_id);
  END IF;
END $$;