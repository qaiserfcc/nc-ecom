-- Add thumbnail_url column to products table for optimized listing images
ALTER TABLE products ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN products.thumbnail_url IS 'Optimized thumbnail image (200x200) for product listings';
