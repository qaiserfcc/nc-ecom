-- Image Optimization Feature - Database Reference Queries

-- ============================================
-- 1. CHECK FOR BASE64 IMAGES
-- ============================================

-- Count base64 images in products table
SELECT COUNT(*) as base64_product_images
FROM products
WHERE image_url IS NOT NULL AND image_url LIKE 'data:image%';

-- Count base64 images in product_images table
SELECT COUNT(*) as base64_gallery_images
FROM product_images
WHERE image_url IS NOT NULL AND image_url LIKE 'data:image%';

-- View details of products with base64 images
SELECT id, name, image_url SUBSTR(image_url, 1, 50) as image_preview
FROM products
WHERE image_url IS NOT NULL AND image_url LIKE 'data:image%'
LIMIT 10;

-- ============================================
-- 2. CHECK OPTIMIZATION RESULTS
-- ============================================

-- Count file-based images after optimization
SELECT COUNT(*) as file_based_product_images
FROM products
WHERE image_url IS NOT NULL AND image_url LIKE '/uploads/%';

-- Products with both image and thumbnail
SELECT id, name, image_url, thumbnail_url
FROM products
WHERE image_url LIKE '/uploads/%' AND thumbnail_url LIKE '/uploads/%'
LIMIT 10;

-- Products with image but missing thumbnail
SELECT id, name, image_url, thumbnail_url
FROM products
WHERE image_url LIKE '/uploads/%' AND (thumbnail_url IS NULL OR thumbnail_url NOT LIKE '/uploads/%')
LIMIT 10;

-- ============================================
-- 3. VERIFY FILE SIZES REDUCTION
-- ============================================

-- Estimate database size reduction (before/after)
-- Base64 images are roughly 33% larger than binary
SELECT 
  COUNT(*) as total_products,
  SUM(OCTET_LENGTH(image_url)) / 1024 / 1024 as image_urls_size_mb,
  SUM(OCTET_LENGTH(thumbnail_url)) / 1024 / 1024 as thumbnail_urls_size_mb
FROM products
WHERE image_url IS NOT NULL;

-- ============================================
-- 4. MAINTENANCE QUERIES
-- ============================================

-- Remove file paths and revert to NULL (if needed)
-- ⚠️ WARNING: Only run after backing up your data!
-- UPDATE products SET image_url = NULL, thumbnail_url = NULL
-- WHERE image_url LIKE '/uploads/%';

-- Remove specific product images
-- ⚠️ WARNING: Only run after backing up your data!
-- DELETE FROM products WHERE id IN (1, 2, 3);

-- Update product images to use new thumbnails
UPDATE products
SET thumbnail_url = CONCAT(
  SUBSTR(image_url, 1, LENGTH(image_url) - 5),
  '-thumb.webp'
)
WHERE image_url LIKE '/uploads/%.webp' AND (thumbnail_url IS NULL OR thumbnail_url = '');

-- ============================================
-- 5. MONITORING QUERIES
-- ============================================

-- Products by image storage type
SELECT 
  CASE 
    WHEN image_url LIKE 'data:image%' THEN 'Base64'
    WHEN image_url LIKE '/uploads/%' THEN 'File-based'
    ELSE 'Other/Missing'
  END as storage_type,
  COUNT(*) as count
FROM products
GROUP BY storage_type;

-- Gallery images by storage type
SELECT 
  CASE 
    WHEN image_url LIKE 'data:image%' THEN 'Base64'
    WHEN image_url LIKE '/uploads/%' THEN 'File-based'
    ELSE 'Other/Missing'
  END as storage_type,
  COUNT(*) as count
FROM product_images
GROUP BY storage_type;

-- Products with missing thumbnails
SELECT 
  id, name, image_url, thumbnail_url
FROM products
WHERE image_url LIKE '/uploads/%' AND thumbnail_url IS NULL
ORDER BY id;

-- ============================================
-- 6. CLEANUP QUERIES (OPTIONAL)
-- ============================================

-- Find and review large base64 images (before optimization)
SELECT 
  id, name, 
  LENGTH(image_url) as bytes,
  LENGTH(image_url) / 1024 as kilobytes
FROM products
WHERE image_url LIKE 'data:image%'
ORDER BY LENGTH(image_url) DESC
LIMIT 20;

-- Archive old data (create backup table first)
-- CREATE TABLE products_backup AS SELECT * FROM products;
-- CREATE TABLE product_images_backup AS SELECT * FROM product_images;

-- Clear base64 images after verifying file-based ones load correctly
-- ⚠️ BACKUP FIRST! This cannot be undone!
-- UPDATE products SET image_url = NULL WHERE image_url LIKE 'data:image%';
-- UPDATE product_images SET image_url = NULL WHERE image_url LIKE 'data:image%';

-- ============================================
-- 7. DIAGNOSTIC QUERIES
-- ============================================

-- Products with potential issues
SELECT 
  p.id, p.name,
  CASE 
    WHEN image_url IS NULL THEN 'No image'
    WHEN image_url LIKE 'data:image%' THEN 'Base64 (not optimized)'
    WHEN image_url LIKE '/uploads/%' THEN 'Optimized'
    ELSE 'Unknown format'
  END as image_status,
  CASE 
    WHEN thumbnail_url IS NULL THEN 'No thumbnail'
    WHEN thumbnail_url LIKE '/uploads/%' THEN 'Has thumbnail'
    ELSE 'Unknown'
  END as thumbnail_status
FROM products p
ORDER BY p.id;

-- Find orphaned image files (images in DB but files might be missing)
SELECT 
  DISTINCT REGEXP_SUBSTR(image_url, '[^/]+$') as filename
FROM products
WHERE image_url LIKE '/uploads/%'
UNION
SELECT 
  DISTINCT REGEXP_SUBSTR(thumbnail_url, '[^/]+$') as filename
FROM products
WHERE thumbnail_url LIKE '/uploads/%'
UNION
SELECT 
  DISTINCT REGEXP_SUBSTR(image_url, '[^/]+$') as filename
FROM product_images
WHERE image_url LIKE '/uploads/%'
ORDER BY filename;

-- ============================================
-- 8. STATS QUERIES
-- ============================================

-- Overall optimization status
SELECT 
  (SELECT COUNT(*) FROM products) as total_products,
  (SELECT COUNT(*) FROM products WHERE image_url LIKE '/uploads/%') as optimized_products,
  (SELECT COUNT(*) FROM products WHERE image_url LIKE 'data:image%') as remaining_base64,
  (SELECT COUNT(*) FROM product_images) as total_gallery_images,
  (SELECT COUNT(*) FROM product_images WHERE image_url LIKE '/uploads/%') as optimized_gallery,
  (SELECT COUNT(*) FROM product_images WHERE image_url LIKE 'data:image%') as base64_gallery;

-- Optimization progress by category
SELECT 
  c.name,
  COUNT(p.id) as total_products,
  SUM(CASE WHEN p.image_url LIKE '/uploads/%' THEN 1 ELSE 0 END) as optimized,
  SUM(CASE WHEN p.image_url LIKE 'data:image%' THEN 1 ELSE 0 END) as base64,
  SUM(CASE WHEN p.image_url IS NULL THEN 1 ELSE 0 END) as no_image
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
GROUP BY c.id, c.name
ORDER BY c.name;

-- ============================================
-- NOTES
-- ============================================

-- 1. Replace 'data:image%' with actual LIKE pattern if database uses different format
-- 2. REGEXP_SUBSTR may vary by database (PostgreSQL uses different syntax)
-- 3. Always backup before running UPDATE or DELETE queries
-- 4. Test queries on small datasets first
-- 5. Monitor database performance after large updates
-- 6. Consider archiving old base64 images instead of deleting
