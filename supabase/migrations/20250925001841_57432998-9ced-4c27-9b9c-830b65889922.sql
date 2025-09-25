-- Reactivate the QBO connection that was deactivated
UPDATE qbo_connections 
SET is_active = true, updated_at = now() 
WHERE company_id = '062d7fa5-3b3a-4a65-8e25-a2ce9c9f9120' 
AND user_id = '6c0bbe9c-0c7e-4d90-bc30-799040e7cf7f';

-- Also add an index to improve performance for future lookups
CREATE INDEX IF NOT EXISTS idx_qbo_connections_company_user_active 
ON qbo_connections (company_id, user_id, is_active);