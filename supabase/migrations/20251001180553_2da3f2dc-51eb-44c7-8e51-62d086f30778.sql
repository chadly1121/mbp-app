-- Add QBO sync capabilities to KPIs table
ALTER TABLE kpis 
ADD COLUMN data_source text DEFAULT 'manual' CHECK (data_source IN ('manual', 'qbo')),
ADD COLUMN qbo_metric_type text CHECK (qbo_metric_type IN ('total_revenue', 'total_expenses', 'net_income', 'sales_count', 'invoice_count', 'estimate_count', 'accounts_receivable', 'accounts_payable')),
ADD COLUMN qbo_account_filter text,
ADD COLUMN auto_sync boolean DEFAULT false,
ADD COLUMN last_synced_at timestamp with time zone;

-- Add comment explaining the fields
COMMENT ON COLUMN kpis.data_source IS 'Source of KPI data: manual entry or qbo (QuickBooks Online)';
COMMENT ON COLUMN kpis.qbo_metric_type IS 'Type of QBO metric to track';
COMMENT ON COLUMN kpis.qbo_account_filter IS 'Optional filter for specific QBO accounts';
COMMENT ON COLUMN kpis.auto_sync IS 'Whether to automatically update this KPI when QBO syncs';
COMMENT ON COLUMN kpis.last_synced_at IS 'Timestamp of last QBO sync for this KPI';