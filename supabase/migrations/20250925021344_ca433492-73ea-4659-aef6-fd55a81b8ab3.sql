-- Add 'other_income' as a valid account type
ALTER TABLE qbo_profit_loss 
DROP CONSTRAINT IF EXISTS qbo_profit_loss_account_type_check;

ALTER TABLE qbo_profit_loss 
ADD CONSTRAINT qbo_profit_loss_account_type_check 
CHECK (account_type IN ('revenue', 'expense', 'cost_of_goods_sold', 'other_income'));