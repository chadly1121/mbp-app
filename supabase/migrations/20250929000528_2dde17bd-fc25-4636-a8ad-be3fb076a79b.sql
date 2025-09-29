-- Fix foreign key constraint for strategic planning sub-items
-- Drop the existing foreign key constraint
ALTER TABLE objective_checklist_subitems 
DROP CONSTRAINT IF EXISTS objective_checklist_subitems_parent_item_id_fkey;

-- Add the correct foreign key constraint pointing to strategic_objective_checklist
ALTER TABLE objective_checklist_subitems 
ADD CONSTRAINT objective_checklist_subitems_parent_item_id_fkey 
FOREIGN KEY (parent_item_id) 
REFERENCES strategic_objective_checklist(id) 
ON DELETE CASCADE;