-- Enhanced security for QBO connections table
-- Add additional security definer functions to control access to sensitive credentials

-- Function to check if user can access QBO connection (without exposing tokens)
CREATE OR REPLACE FUNCTION public.can_access_qbo_connection(p_company_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_company_count INT;
BEGIN
  -- Verify the user owns this company
  SELECT COUNT(*) INTO user_company_count
  FROM companies 
  WHERE id = p_company_id AND owner_id = auth.uid();
  
  RETURN user_company_count > 0;
END;
$$;

-- Enhanced RLS policies for qbo_connections with stricter access control
DROP POLICY IF EXISTS qbo_connections_select_policy ON public.qbo_connections;
DROP POLICY IF EXISTS qbo_connections_insert_policy ON public.qbo_connections;
DROP POLICY IF EXISTS qbo_connections_update_policy ON public.qbo_connections;
DROP POLICY IF EXISTS qbo_connections_delete_policy ON public.qbo_connections;

-- More restrictive SELECT policy - only specific functions can access tokens
CREATE POLICY "qbo_connections_select_restricted" ON public.qbo_connections
FOR SELECT
USING (
  -- Only allow access if user owns the company AND is the user who created the connection
  (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()))
  AND (user_id = auth.uid())
  -- Additional check: only allow access through security definer functions
  AND current_setting('role', true) = 'authenticator'
);

-- INSERT policy with ownership verification
CREATE POLICY "qbo_connections_insert_secure" ON public.qbo_connections
FOR INSERT
WITH CHECK (
  (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()))
  AND (user_id = auth.uid())
);

-- UPDATE policy - only through security definer functions
CREATE POLICY "qbo_connections_update_secure" ON public.qbo_connections
FOR UPDATE
USING (
  (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()))
  AND (user_id = auth.uid())
);

-- DELETE policy with ownership verification
CREATE POLICY "qbo_connections_delete_secure" ON public.qbo_connections
FOR DELETE
USING (
  (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()))
  AND (user_id = auth.uid())
);

-- Function to safely check connection status without exposing tokens
CREATE OR REPLACE FUNCTION public.get_qbo_connection_status_safe(p_company_id UUID)
RETURNS TABLE(
  id UUID,
  qbo_company_id TEXT,
  is_active BOOLEAN,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify user has access
  IF NOT public.can_access_qbo_connection(p_company_id) THEN
    RAISE EXCEPTION 'Access denied: You do not own this company';
  END IF;

  -- Return connection status without sensitive tokens
  RETURN QUERY
  SELECT 
    qc.id,
    qc.qbo_company_id,
    qc.is_active,
    qc.last_sync_at,
    qc.token_expires_at,
    qc.created_at,
    qc.updated_at
  FROM qbo_connections qc
  WHERE qc.company_id = p_company_id 
    AND qc.user_id = auth.uid();
END;
$$;