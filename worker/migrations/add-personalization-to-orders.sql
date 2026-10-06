-- Add personalization_data column to order_items to store character details
ALTER TABLE order_items ADD COLUMN personalization_data TEXT;

-- Update existing records to have null instead of missing column
UPDATE order_items SET personalization_data = NULL WHERE personalization_data IS NULL;


