-- Add new columns to strategic_objectives table for enhanced tracking
ALTER TABLE public.strategic_objectives 
ADD COLUMN completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100);

-- Create a table for checklist items within strategic objectives
CREATE TABLE public.strategic_objective_checklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  objective_id UUID NOT NULL REFERENCES public.strategic_objectives(id) ON DELETE CASCADE,
  item_text TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on the new checklist table
ALTER TABLE public.strategic_objective_checklist ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for checklist items
CREATE POLICY "Users can manage checklist items for their company objectives" 
ON public.strategic_objective_checklist 
FOR ALL 
USING (
  objective_id IN (
    SELECT id FROM public.strategic_objectives 
    WHERE company_id IN (
      SELECT id FROM public.companies 
      WHERE owner_id = auth.uid()
    )
  )
);

-- Add trigger for updated_at on checklist table
CREATE TRIGGER update_strategic_objective_checklist_updated_at
BEFORE UPDATE ON public.strategic_objective_checklist
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();