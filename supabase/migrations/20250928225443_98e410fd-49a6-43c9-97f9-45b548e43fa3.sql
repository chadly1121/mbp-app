-- Fix security vulnerability in objective_collab_members table
-- The current policy allows public read access to collaborator emails

-- First, let's see if we have an objectives table by checking the structure
-- We need to establish the relationship between objectives and organizations

-- Create the objectives table if it doesn't exist (based on the pattern from other tables)
CREATE TABLE IF NOT EXISTS public.objectives (
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

-- Enable RLS on objectives table
ALTER TABLE public.objectives ENABLE ROW LEVEL SECURITY;

-- Add proper RLS policies for objectives
DROP POLICY IF EXISTS "objectives read" ON public.objectives;
CREATE POLICY "objectives read" ON public.objectives
FOR SELECT USING (is_org_member(org_id));

DROP POLICY IF EXISTS "objectives write" ON public.objectives;
CREATE POLICY "objectives write" ON public.objectives
FOR ALL USING (has_org_role(org_id, ARRAY['owner'::member_role, 'admin'::member_role, 'coach'::member_role]))
WITH CHECK (has_org_role(org_id, ARRAY['owner'::member_role, 'admin'::member_role, 'coach'::member_role]));

-- Now fix the critical security issue in objective_collab_members
-- Replace the dangerous "true" policy with proper org-based access control

DROP POLICY IF EXISTS "read all collab" ON public.objective_collab_members;
CREATE POLICY "collab members read" ON public.objective_collab_members
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.objectives obj
    WHERE obj.id = objective_collab_members.objective_id 
    AND is_org_member(obj.org_id)
  )
);

DROP POLICY IF EXISTS "write collab" ON public.objective_collab_members;
CREATE POLICY "collab members write" ON public.objective_collab_members
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.objectives obj
    WHERE obj.id = objective_collab_members.objective_id 
    AND has_org_role(obj.org_id, ARRAY['owner'::member_role, 'admin'::member_role, 'coach'::member_role])
  )
);

DROP POLICY IF EXISTS "delete collab" ON public.objective_collab_members;
CREATE POLICY "collab members delete" ON public.objective_collab_members
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.objectives obj
    WHERE obj.id = objective_collab_members.objective_id 
    AND has_org_role(obj.org_id, ARRAY['owner'::member_role, 'admin'::member_role, 'coach'::member_role])
  )
);

-- Also secure other objective-related tables that had similar issues
DROP POLICY IF EXISTS "read comments" ON public.objective_comments;
CREATE POLICY "objective comments read" ON public.objective_comments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.objectives obj
    WHERE obj.id = objective_comments.objective_id 
    AND is_org_member(obj.org_id)
  )
);

DROP POLICY IF EXISTS "write comments" ON public.objective_comments;
CREATE POLICY "objective comments write" ON public.objective_comments
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.objectives obj
    WHERE obj.id = objective_comments.objective_id 
    AND is_org_member(obj.org_id)
  )
);

-- Secure objective invites
DROP POLICY IF EXISTS "read invites auth" ON public.objective_invites;
CREATE POLICY "objective invites read" ON public.objective_invites
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.objectives obj
    WHERE obj.id = objective_invites.objective_id 
    AND has_org_role(obj.org_id, ARRAY['owner'::member_role, 'admin'::member_role, 'coach'::member_role])
  )
);

DROP POLICY IF EXISTS "insert invites auth" ON public.objective_invites;
CREATE POLICY "objective invites write" ON public.objective_invites
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.objectives obj
    WHERE obj.id = objective_invites.objective_id 
    AND has_org_role(obj.org_id, ARRAY['owner'::member_role, 'admin'::member_role, 'coach'::member_role])
  )
);

-- Secure objective links
DROP POLICY IF EXISTS "Users can manage objective links" ON public.objective_links;
CREATE POLICY "objective links manage" ON public.objective_links
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.objectives obj
    WHERE obj.id = objective_links.objective_id 
    AND has_org_role(obj.org_id, ARRAY['owner'::member_role, 'admin'::member_role, 'coach'::member_role])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.objectives obj
    WHERE obj.id = objective_links.objective_id 
    AND has_org_role(obj.org_id, ARRAY['owner'::member_role, 'admin'::member_role, 'coach'::member_role])
  )
);

-- Secure objective activity logs
DROP POLICY IF EXISTS "read activity" ON public.objective_activity;
CREATE POLICY "objective activity read" ON public.objective_activity
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.objectives obj
    WHERE obj.id = objective_activity.objective_id 
    AND is_org_member(obj.org_id)
  )
);

DROP POLICY IF EXISTS "write activity" ON public.objective_activity;
CREATE POLICY "objective activity write" ON public.objective_activity
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.objectives obj
    WHERE obj.id = objective_activity.objective_id 
    AND is_org_member(obj.org_id)
  )
);

-- Secure objective link access
DROP POLICY IF EXISTS "Users can view link access" ON public.objective_link_access;
CREATE POLICY "objective link access read" ON public.objective_link_access
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.objective_links ol
    JOIN public.objectives obj ON obj.id = ol.objective_id
    WHERE ol.id = objective_link_access.link_id 
    AND is_org_member(obj.org_id)
  )
);

DROP POLICY IF EXISTS "Users can insert link access" ON public.objective_link_access;
CREATE POLICY "objective link access write" ON public.objective_link_access
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.objective_links ol
    JOIN public.objectives obj ON obj.id = ol.objective_id
    WHERE ol.id = objective_link_access.link_id 
    AND is_org_member(obj.org_id)
  )
);