-- Drop existing function first
DROP FUNCTION IF EXISTS public.get_qbo_connection_status(uuid);

-- Create security definer functions to handle sensitive token operations

-- Function to securely store QBO connection tokens
CREATE OR REPLACE FUNCTION public.store_qbo_connection(
  p_company_id UUID,
  p_qbo_company_id TEXT,
  p_access_token TEXT,
  p_refresh_token TEXT,
  p_token_expires_at TIMESTAMP WITH TIME ZONE
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  connection_id UUID;
  user_company_count INT;
BEGIN
  -- Verify the user owns this company
  SELECT COUNT(*) INTO user_company_count
  FROM companies 
  WHERE id = p_company_id AND owner_id = auth.uid();
  
  IF user_company_count = 0 THEN
    RAISE EXCEPTION 'Access denied: You do not own this company';
  END IF;

  -- Insert or update the connection
  INSERT INTO qbo_connections (
    company_id, 
    user_id, 
    qbo_company_id, 
    access_token, 
    refresh_token, 
    token_expires_at,
    is_active
  ) VALUES (
    p_company_id,
    auth.uid(),
    p_qbo_company_id,
    p_access_token,
    p_refresh_token,
    p_token_expires_at,
    true
  )
  ON CONFLICT (company_id, user_id) 
  DO UPDATE SET
    qbo_company_id = EXCLUDED.qbo_company_id,
    access_token = EXCLUDED.access_token,
    refresh_token = EXCLUDED.refresh_token,
    token_expires_at = EXCLUDED.token_expires_at,
    is_active = EXCLUDED.is_active,
    updated_at = now()
  RETURNING id INTO connection_id;

  RETURN connection_id;
END;
$$;

-- Function to securely retrieve QBO tokens (only for server-side use)
CREATE OR REPLACE FUNCTION public.get_qbo_tokens(
  p_company_id UUID
) RETURNS TABLE(
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  qbo_company_id TEXT
)
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
  
  IF user_company_count = 0 THEN
    RAISE EXCEPTION 'Access denied: You do not own this company';
  END IF;

  -- Return the tokens
  RETURN QUERY
  SELECT 
    qc.access_token,
    qc.refresh_token,
    qc.token_expires_at,
    qc.qbo_company_id
  FROM qbo_connections qc
  WHERE qc.company_id = p_company_id 
    AND qc.user_id = auth.uid()
    AND qc.is_active = true;
END;
$$;

-- Function to securely update QBO tokens after refresh
CREATE OR REPLACE FUNCTION public.update_qbo_tokens(
  p_company_id UUID,
  p_access_token TEXT,
  p_refresh_token TEXT,
  p_token_expires_at TIMESTAMP WITH TIME ZONE
) RETURNS VOID
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
  
  IF user_company_count = 0 THEN
    RAISE EXCEPTION 'Access denied: You do not own this company';
  END IF;

  -- Update the tokens
  UPDATE qbo_connections 
  SET 
    access_token = p_access_token,
    refresh_token = p_refresh_token,
    token_expires_at = p_token_expires_at,
    updated_at = now()
  WHERE company_id = p_company_id 
    AND user_id = auth.uid();
END;
$$;

-- Function to mark last sync time
CREATE OR REPLACE FUNCTION public.update_qbo_last_sync(
  p_company_id UUID
) RETURNS VOID
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
  
  IF user_company_count = 0 THEN
    RAISE EXCEPTION 'Access denied: You do not own this company';
  END IF;

  -- Update last sync time
  UPDATE qbo_connections 
  SET 
    last_sync_at = now(),
    updated_at = now()
  WHERE company_id = p_company_id 
    AND user_id = auth.uid();
END;
$$;

-- Function to safely get connection status (without tokens)
CREATE OR REPLACE FUNCTION public.get_qbo_connection_status(
  p_company_id UUID
) RETURNS TABLE(
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
DECLARE
  user_company_count INT;
BEGIN
  -- Verify the user owns this company
  SELECT COUNT(*) INTO user_company_count
  FROM companies 
  WHERE id = p_company_id AND owner_id = auth.uid();
  
  IF user_company_count = 0 THEN
    RAISE EXCEPTION 'Access denied: You do not own this company';
  END IF;

  -- Return safe connection info (no tokens)
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