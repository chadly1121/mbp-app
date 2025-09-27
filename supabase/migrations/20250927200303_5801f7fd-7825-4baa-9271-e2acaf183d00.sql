-- Add is_completed field to objective_checklist_items table
ALTER TABLE public.objective_checklist_items 
ADD COLUMN is_completed BOOLEAN NOT NULL DEFAULT FALSE;