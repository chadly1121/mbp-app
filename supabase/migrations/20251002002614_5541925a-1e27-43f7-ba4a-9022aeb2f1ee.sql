-- Insert 2024 monthly revenue data for Roll On Painting
-- Company ID: 062d7fa5-3b3a-4a65-8e25-a2ce9c9f9120

-- Delete existing 2024 revenue data if any
DELETE FROM qbo_profit_loss 
WHERE company_id = '062d7fa5-3b3a-4a65-8e25-a2ce9c9f9120' 
  AND fiscal_year = 2024 
  AND account_type = 'revenue';

-- Insert fresh 2024 monthly revenue data
INSERT INTO qbo_profit_loss (
  company_id,
  fiscal_year,
  fiscal_month,
  account_type,
  account_name,
  current_month,
  year_to_date,
  report_date
) VALUES
  ('062d7fa5-3b3a-4a65-8e25-a2ce9c9f9120', 2024, 1, 'revenue', 'Sales', 94400, 94400, '2024-01-31'),
  ('062d7fa5-3b3a-4a65-8e25-a2ce9c9f9120', 2024, 2, 'revenue', 'Sales', 43020, 137420, '2024-02-29'),
  ('062d7fa5-3b3a-4a65-8e25-a2ce9c9f9120', 2024, 3, 'revenue', 'Sales', 28100, 165520, '2024-03-31'),
  ('062d7fa5-3b3a-4a65-8e25-a2ce9c9f9120', 2024, 4, 'revenue', 'Sales', 74400, 239920, '2024-04-30'),
  ('062d7fa5-3b3a-4a65-8e25-a2ce9c9f9120', 2024, 5, 'revenue', 'Sales', 58200, 298120, '2024-05-31'),
  ('062d7fa5-3b3a-4a65-8e25-a2ce9c9f9120', 2024, 6, 'revenue', 'Sales', 71400, 369520, '2024-06-30'),
  ('062d7fa5-3b3a-4a65-8e25-a2ce9c9f9120', 2024, 7, 'revenue', 'Sales', 110900, 480420, '2024-07-31'),
  ('062d7fa5-3b3a-4a65-8e25-a2ce9c9f9120', 2024, 8, 'revenue', 'Sales', 74300, 554720, '2024-08-31'),
  ('062d7fa5-3b3a-4a65-8e25-a2ce9c9f9120', 2024, 9, 'revenue', 'Sales', 68200, 622920, '2024-09-30'),
  ('062d7fa5-3b3a-4a65-8e25-a2ce9c9f9120', 2024, 10, 'revenue', 'Sales', 56000, 678920, '2024-10-31'),
  ('062d7fa5-3b3a-4a65-8e25-a2ce9c9f9120', 2024, 11, 'revenue', 'Sales', 3400, 682320, '2024-11-30'),
  ('062d7fa5-3b3a-4a65-8e25-a2ce9c9f9120', 2024, 12, 'revenue', 'Sales', 38700, 721020, '2024-12-31');