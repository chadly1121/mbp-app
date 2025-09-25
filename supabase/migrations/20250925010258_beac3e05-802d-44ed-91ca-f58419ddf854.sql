-- Fix ambiguous column reference in get_qbo_connection_status function
CREATE OR REPLACE FUNCTION public.get_qbo_connection_status(p_company_id uuid)
 RETURNS TABLE(id uuid, qbo_company_id text, is_active boolean, last_sync_at timestamp with time zone, token_expires_at timestamp with time zone, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_company_count INT;
BEGIN
  -- Verify the user owns this company (use table alias to avoid ambiguity)
  SELECT COUNT(*) INTO user_company_count
  FROM companies c
  WHERE c.id = p_company_id AND c.owner_id = auth.uid();
  
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
$function$;