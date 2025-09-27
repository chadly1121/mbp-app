-- Add foreign key relationship between objective_checklist_items and strategic_objectives
ALTER TABLE objective_checklist_items 
ADD CONSTRAINT objective_checklist_items_objective_id_fkey 
FOREIGN KEY (objective_id) REFERENCES strategic_objectives(id) ON DELETE CASCADE;