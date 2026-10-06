-- Add house_number column to users table for Dutch address format
ALTER TABLE users ADD COLUMN house_number TEXT;

-- Update existing records to have null instead of missing column
UPDATE users SET house_number = NULL WHERE house_number IS NULL;


