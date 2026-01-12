-- Add original_price_at_purchase column to order_items table
-- This stores the original price before any discounts for historical order tracking

ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS original_price_at_purchase DECIMAL(10, 2);

-- Backfill existing records: set original_price_at_purchase to price_at_purchase for old orders
UPDATE order_items 
SET original_price_at_purchase = price_at_purchase 
WHERE original_price_at_purchase IS NULL;
