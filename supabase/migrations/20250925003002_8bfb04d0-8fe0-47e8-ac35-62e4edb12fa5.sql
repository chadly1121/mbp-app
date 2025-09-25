-- Reactivate the QBO connection for the latest connection attempt
UPDATE qbo_connections 
SET is_active = true, updated_at = now() 
WHERE company_id = '062d7fa5-3b3a-4a65-8e25-a2ce9c9f9120' 
AND user_id = '6c0bbe9c-0c7e-4d90-bc30-799040e7cf7f';