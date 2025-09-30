-- Remove the problematic SECURITY DEFINER view
DROP VIEW IF EXISTS public.current_user_memberships;

-- Enable RLS on org_members table if not already enabled (it should be)
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

-- Create a secure function to get current user memberships
-- This replaces the view with a more secure approach
CREATE OR REPLACE FUNCTION public.get_current_user_memberships()
RETURNS TABLE(org_id uuid, role member_role)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    om.org_id,
    om.role
  FROM public.org_members om
  WHERE om.user_id = auth.uid();
$$;

-- Grant execute permission to authenticated users only
GRANT EXECUTE ON FUNCTION public.get_current_user_memberships() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_current_user_memberships() FROM anon;