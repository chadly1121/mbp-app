-- Add collaboration features to strategic planning

-- Create table for objective collaborators/accountability partners
CREATE TABLE public.strategic_objective_collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  objective_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'accountability_partner', -- 'accountability_partner', 'collaborator', 'viewer'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
  invited_by UUID NOT NULL,
  company_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(objective_id, user_email)
);

-- Create table for objective comments/discussions
CREATE TABLE public.strategic_objective_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  objective_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  company_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for objective activity tracking
CREATE TABLE public.strategic_objective_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  objective_id UUID NOT NULL,
  user_email TEXT,
  user_name TEXT,
  activity_type TEXT NOT NULL, -- 'created', 'updated', 'commented', 'shared', 'completed_checklist_item'
  activity_description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  company_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.strategic_objective_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategic_objective_comments ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.strategic_objective_activity ENABLE ROW LEVEL SECURITY;

-- RLS policies for collaborators table
CREATE POLICY "Users can manage collaborators for their company objectives" 
ON public.strategic_objective_collaborators 
FOR ALL 
USING (company_id IN (
  SELECT companies.id FROM companies WHERE companies.owner_id = auth.uid()
));

-- RLS policies for comments table  
CREATE POLICY "Users can manage comments for their company objectives"
ON public.strategic_objective_comments
FOR ALL
USING (company_id IN (
  SELECT companies.id FROM companies WHERE companies.owner_id = auth.uid()
));

-- RLS policies for activity table
CREATE POLICY "Users can view activity for their company objectives"
ON public.strategic_objective_activity
FOR SELECT
USING (company_id IN (
  SELECT companies.id FROM companies WHERE companies.owner_id = auth.uid()
));

CREATE POLICY "Users can create activity for their company objectives"
ON public.strategic_objective_activity
FOR INSERT
WITH CHECK (company_id IN (
  SELECT companies.id FROM companies WHERE companies.owner_id = auth.uid()
));

-- Add updated_at triggers
CREATE TRIGGER update_strategic_objective_collaborators_updated_at
BEFORE UPDATE ON public.strategic_objective_collaborators
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_strategic_objective_comments_updated_at  
BEFORE UPDATE ON public.strategic_objective_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();