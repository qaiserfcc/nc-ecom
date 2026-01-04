-- Add parent_category_id to support subcategories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_category_id);

-- Sample subcategories (optional - can be added through UI)
-- Example: If you have a "Electronics" category with id=1
-- INSERT INTO categories (name, slug, description, parent_category_id) 
-- VALUES ('Laptops', 'laptops', 'Laptop computers', 1);
