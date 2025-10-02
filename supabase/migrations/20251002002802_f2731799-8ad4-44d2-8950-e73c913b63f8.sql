-- Add unique constraint for qbo_profit_loss to prevent duplicate entries
ALTER TABLE qbo_profit_loss 
ADD CONSTRAINT qbo_profit_loss_unique_entry 
UNIQUE (company_id, fiscal_year, fiscal_month, account_name);

-- Insert 2024 monthly revenue data for Roll On Painting
INSERT INTO qbo_profit_loss (
  company_id,
  report_date,
  fiscal_year,
  fiscal_month,
  account_type,
  account_name,
  current_month,
  year_to_date
) VALUES
  ('062d7fa5-3b3a-4a65-8e25-a2ce9c9f9120', '2024-01-01', 2024, 1, 'revenue', 'Sales', 94400, 94400),
  ('062d7fa5-3b3a-4a65-8e25-a2ce9c9f9120', '2024-02-01', 2024, 2, 'revenue', 'Sales', 43020, 137420),
  ('062d7fa5-3b3a-4a65-8e25-a2ce9c9f9120', '2024-03-01', 2024, 3, 'revenue', 'Sales', 28100, 165520),
  ('062d7fa5-3b3a-4a65-8e25-a2ce9c9f9120', '2024-04-01', 2024, 4, 'revenue', 'Sales', 74400, 239920),
  ('062d7fa5-3b3a-4a65-8e25-a2ce9c9f9120', '2024-05-01', 2024, 5, 'revenue', 'Sales', 58200, 298120),
  ('062d7fa5-3b3a-4a65-8e25-a2ce9c9f9120', '2024-06-01', 2024, 6, 'revenue', 'Sales', 71400, 369520),
  ('062d7fa5-3b3a-4a65-8e25-a2ce9c9f9120', '2024-07-01', 2024, 7, 'revenue', 'Sales', 110900, 480420),
  ('062d7fa5-3b3a-4a65-8e25-a2ce9c9f9120', '2024-08-01', 2024, 8, 'revenue', 'Sales', 74300, 554720),
  ('062d7fa5-3b3a-4a65-8e25-a2ce9c9f9120', '2024-09-01', 2024, 9, 'revenue', 'Sales', 68200, 622920),
  ('062d7fa5-3b3a-4a65-8e25-a2ce9c9f9120', '2024-10-01', 2024, 10, 'revenue', 'Sales', 56000, 678920),
  ('062d7fa5-3b3a-4a65-8e25-a2ce9c9f9120', '2024-11-01', 2024, 11, 'revenue', 'Sales', 3400, 682320),
  ('062d7fa5-3b3a-4a65-8e25-a2ce9c9f9120', '2024-12-01', 2024, 12, 'revenue', 'Sales', 38700, 721020)
ON CONFLICT (company_id, fiscal_year, fiscal_month, account_name) 
DO UPDATE SET
  current_month = EXCLUDED.current_month,
  year_to_date = EXCLUDED.year_to_date,
  report_date = EXCLUDED.report_date,
  updated_at = now();