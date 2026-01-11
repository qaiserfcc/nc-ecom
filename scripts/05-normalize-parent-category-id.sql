-- Clean up parent_category_id values
-- Normalize 0 and invalid values to NULL to ensure consistent behavior
UPDATE categories 
SET parent_category_id = NULL 
WHERE parent_category_id = 0 OR (parent_category_id IS NOT NULL AND parent_category_id NOT IN (SELECT id FROM categories));
