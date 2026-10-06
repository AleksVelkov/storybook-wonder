-- Fix: Add personalization_data column to order_items table
-- This column was lost when the table was recreated in update-order-items.sql

ALTER TABLE order_items ADD COLUMN personalization_data TEXT;


