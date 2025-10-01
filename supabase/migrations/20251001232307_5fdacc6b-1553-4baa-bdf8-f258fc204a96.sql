-- Add display_order column to kpis table
ALTER TABLE public.kpis 
ADD COLUMN display_order INTEGER;

-- Set initial display_order based on created_at
UPDATE public.kpis 
SET display_order = (
  SELECT COUNT(*) 
  FROM public.kpis AS k2 
  WHERE k2.company_id = kpis.company_id 
    AND k2.created_at <= kpis.created_at
);

-- Add default value for new records
ALTER TABLE public.kpis 
ALTER COLUMN display_order SET DEFAULT 0;