-- Add brand_id column to products table
-- This migration ensures all products have a brand relationship

-- First, add the column as nullable
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS brand_id INTEGER REFERENCES brand_partnerships(id) ON DELETE RESTRICT;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);

-- For existing products without a brand, we'll need to set a default brand
-- Insert a default "Unbranded" brand if it doesn't exist
INSERT INTO brand_partnerships (name, logo_url, website_url, description, is_featured)
VALUES ('Unbranded', '', '', 'Default brand for unbranded products', false)
ON CONFLICT (name) DO NOTHING;

-- Update existing products to use the default brand
UPDATE products 
SET brand_id = (SELECT id FROM brand_partnerships WHERE name = 'Unbranded')
WHERE brand_id IS NULL;

-- Now make the column NOT NULL
ALTER TABLE products 
ALTER COLUMN brand_id SET NOT NULL;

-- Update the schema comment
COMMENT ON COLUMN products.brand_id IS 'Foreign key to brand_partnerships table - every product must have a brand';
