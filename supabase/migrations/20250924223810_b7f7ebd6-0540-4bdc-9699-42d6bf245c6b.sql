-- Function to securely update QBO connection status (active/inactive)
CREATE OR REPLACE FUNCTION public.update_qbo_connection_status(
  p_company_id UUID,
  p_is_active BOOLEAN
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

  -- Update connection status
  UPDATE qbo_connections 
  SET 
    is_active = p_is_active,
    updated_at = now()
  WHERE company_id = p_company_id 
    AND user_id = auth.uid();
END;
$$;