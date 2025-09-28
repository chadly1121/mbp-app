-- Fix ONLY the critical security vulnerability in objective_collab_members
-- The current "read all collab" policy uses "Using Expression: true" which allows public access

-- First check if objectives table exists, if not create it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'objectives') THEN
        CREATE TABLE public.objectives (
          id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
          org_id uuid NOT NULL,
          title text NOT NULL,
          description text,
          status text DEFAULT 'active',
          created_at timestamp with time zone NOT NULL DEFAULT now(),
          updated_at timestamp with time zone NOT NULL DEFAULT now(),
          created_by uuid,
          due_date date,
          priority text DEFAULT 'medium'
        );
        
        ALTER TABLE public.objectives ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "objectives read" ON public.objectives
        FOR SELECT USING (is_org_member(org_id));

        CREATE POLICY "objectives write" ON public.objectives
        FOR ALL USING (has_org_role(org_id, ARRAY['owner'::member_role, 'admin'::member_role, 'coach'::member_role]))
        WITH CHECK (has_org_role(org_id, ARRAY['owner'::member_role, 'admin'::member_role, 'coach'::member_role]));
    END IF;
END
$$;

-- Now fix the security vulnerability: Replace the dangerous public read policy
-- This is the critical fix - replacing "Using Expression: true" with proper access control

DROP POLICY IF EXISTS "read all collab" ON public.objective_collab_members;

-- Create secure policy that only allows organization members to read collaborator data
CREATE POLICY "secure collab read" ON public.objective_collab_members
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.objectives obj
    WHERE obj.id = objective_collab_members.objective_id 
    AND is_org_member(obj.org_id)
  )
);

-- Also fix the write policy if it exists with "true" expression
DROP POLICY IF EXISTS "write collab" ON public.objective_collab_members;

CREATE POLICY "secure collab write" ON public.objective_collab_members
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.objectives obj
    WHERE obj.id = objective_collab_members.objective_id 
    AND has_org_role(obj.org_id, ARRAY['owner'::member_role, 'admin'::member_role, 'coach'::member_role])
  )
);

-- Fix delete policy too
DROP POLICY IF EXISTS "delete collab" ON public.objective_collab_members;

CREATE POLICY "secure collab delete" ON public.objective_collab_members
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.objectives obj
    WHERE obj.id = objective_collab_members.objective_id 
    AND has_org_role(obj.org_id, ARRAY['owner'::member_role, 'admin'::member_role, 'coach'::member_role])
  )
);