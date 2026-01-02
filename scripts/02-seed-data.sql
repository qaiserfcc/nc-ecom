-- Seed categories
INSERT INTO categories (name, slug, description, image_url) VALUES
('Skincare', 'skincare', 'Premium organic skincare products for all skin types', '/placeholder.svg?height=300&width=300'),
('Haircare', 'haircare', 'Natural hair oils and treatments for healthy hair', '/placeholder.svg?height=300&width=300'),
('Foods & Supplements', 'foods-supplements', 'Organic superfoods and health supplements', '/placeholder.svg?height=300&width=300'),
('Cosmetics', 'cosmetics', 'Organic beauty and cosmetics products', '/placeholder.svg?height=300&width=300')
ON CONFLICT (slug) DO NOTHING;

-- Seed products - Skincare
INSERT INTO products (category_id, name, slug, description, short_description, original_price, current_price, stock_quantity, is_featured, is_new_arrival, image_url) VALUES
((SELECT id FROM categories WHERE slug = 'skincare'), 'Vitamin C Serum', 'vitamin-c-serum', 'Premium vitamin C serum for reducing wrinkles and brightening skin. Promotes shiny and healthier skin.', 'Anti-aging vitamin C serum', 1560.00, 1099.00, 45, TRUE, FALSE, '/placeholder.svg?height=400&width=400'),
((SELECT id FROM categories WHERE slug = 'skincare'), 'Pinkish Lips & Cheek Tint', 'pinkish-lips-cheek-tint', 'Organic liquid stain for lips that nourishes and hydrates all day. A customer favorite.', 'Natural lip and cheek tint', 1000.00, 599.00, 60, TRUE, FALSE, '/placeholder.svg?height=400&width=400'),
((SELECT id FROM categories WHERE slug = 'skincare'), 'Glow Facial Kit', 'glow-facial-kit', 'Complete facial kit with deep cleansing and anti-aging properties. 4x results in one kit.', 'All-in-one facial treatment', 6865.00, 4599.00, 25, TRUE, TRUE, '/placeholder.svg?height=400&width=400'),
((SELECT id FROM categories WHERE slug = 'skincare'), 'Niacinamide Serum', 'niacinamide-serum', 'Strengthens skin barrier and boosts immunity. Perfect for sensitive skin.', 'Skin barrier strengthening serum', 1560.00, 1099.00, 35, FALSE, FALSE, '/placeholder.svg?height=400&width=400'),
((SELECT id FROM categories WHERE slug = 'skincare'), 'Tea Tree Anti Acne Face Wash', 'tea-tree-face-wash', 'Prevents acne eruptions and removes excess oil. Reduces blackheads and whiteheads.', 'Anti-acne face wash', 800.00, 599.00, 50, FALSE, TRUE, '/placeholder.svg?height=400&width=400'),
((SELECT id FROM categories WHERE slug = 'skincare'), 'Hand & Foot Glowing Cream', 'hand-foot-cream', 'Formulated with multi-vitamins. Moisturizes, soothes and makes skin soft and glowing.', 'Moisturizing hand and foot cream', 1276.00, 899.00, 40, FALSE, FALSE, '/placeholder.svg?height=400&width=400')
ON CONFLICT (slug) DO NOTHING;

-- Seed products - Haircare
INSERT INTO products (category_id, name, slug, description, short_description, original_price, current_price, stock_quantity, is_featured, is_new_arrival, image_url) VALUES
((SELECT id FROM categories WHERE slug = 'haircare'), 'Red Onion Oil', 'red-onion-oil', 'Reduces hair fall and accelerates hair regrowth. Trending formula with proven results.', 'Hair growth onion oil', 1560.00, 1099.00, 70, TRUE, FALSE, '/placeholder.svg?height=400&width=400'),
((SELECT id FROM categories WHERE slug = 'haircare'), 'Henna Hair and Beard Dye', 'henna-dye', 'Prevents premature hair greying and improves scalp health. Natural color in chocolate and coffee shades.', 'Natural henna dye', 1134.00, 799.00, 55, FALSE, FALSE, '/placeholder.svg?height=400&width=400'),
((SELECT id FROM categories WHERE slug = 'haircare'), 'Rosemary Infused Oil', 'rosemary-oil', 'Deeply hydrates hair, controls sebum production and reduces blemishes. 100% pure organic.', 'Premium rosemary oil', 1844.00, 1299.00, 30, TRUE, TRUE, '/placeholder.svg?height=400&width=400'),
((SELECT id FROM categories WHERE slug = 'haircare'), 'Argan Hair Serum', 'argan-serum', 'Strengthens hair and adds shine. Perfect for dry and damaged hair.', 'Argan hair serum', 1400.00, 999.00, 38, FALSE, FALSE, '/placeholder.svg?height=400&width=400')
ON CONFLICT (slug) DO NOTHING;

-- Seed products - Foods & Supplements
INSERT INTO products (category_id, name, slug, description, short_description, original_price, current_price, stock_quantity, is_featured, is_new_arrival, image_url) VALUES
((SELECT id FROM categories WHERE slug = 'foods-supplements'), 'Chia Seeds', 'chia-seeds', 'High in fiber and protein. Aids in weight loss and boosts metabolism.', 'Organic chia seeds', 2412.00, 1699.00, 100, TRUE, FALSE, '/placeholder.svg?height=400&width=400'),
((SELECT id FROM categories WHERE slug = 'foods-supplements'), 'Mix Seeds Pack', 'mix-seeds', 'Rich in antioxidants and metabolism booster. Good source of Omega-3 fatty acids.', 'Superfood seed mix', 1560.00, 1099.00, 85, FALSE, FALSE, '/placeholder.svg?height=400&width=400'),
((SELECT id FROM categories WHERE slug = 'foods-supplements'), 'Sidr Beri Honey', 'sidr-beri-honey', 'Pure natural honey with 100% purity guaranteed. Rich in antioxidants and minerals.', 'Premium sidr honey', 1699.00, 1699.00, 60, TRUE, TRUE, '/placeholder.svg?height=400&width=400'),
((SELECT id FROM categories WHERE slug = 'foods-supplements'), 'Desi Cow Ghee', 'desi-cow-ghee', 'Pure clarified butter from grass-fed cows. Traditional superfood for health.', 'Organic cow ghee', 2500.00, 1999.00, 50, TRUE, FALSE, '/placeholder.svg?height=400&width=400'),
((SELECT id FROM categories WHERE slug = 'foods-supplements'), 'Almond Butter', 'almond-butter', 'Rich in protein and healthy fats. Perfect for fitness enthusiasts and health-conscious people.', 'Natural almond butter', 2000.00, 1499.00, 45, FALSE, TRUE, '/placeholder.svg?height=400&width=400')
ON CONFLICT (slug) DO NOTHING;

-- Seed products - Cosmetics
INSERT INTO products (category_id, name, slug, description, short_description, original_price, current_price, stock_quantity, is_featured, is_new_arrival, image_url) VALUES
((SELECT id FROM categories WHERE slug = 'cosmetics'), 'Activated Charcoal Teeth Whitening', 'charcoal-teeth-whitener', 'Whitens teeth naturally and kills cavity-causing bacteria. Eliminates bad breath.', 'Natural teeth whitening', 1418.00, 999.00, 75, TRUE, FALSE, '/placeholder.svg?height=400&width=400'),
((SELECT id FROM categories WHERE slug = 'cosmetics'), 'Rice Facial Kit', 'rice-facial-kit', 'Revitalize your skin with rice extract. Complete bright and glow kit.', 'Rice facial treatment', 6865.00, 4599.00, 20, TRUE, TRUE, '/placeholder.svg?height=400&width=400'),
((SELECT id FROM categories WHERE slug = 'cosmetics'), 'Halawa Finger Wax', 'halawa-wax', 'Natural hair removal wax made with apple extract. Gentle on skin.', 'Natural waxing product', 1200.00, 990.00, 40, FALSE, FALSE, '/placeholder.svg?height=400&width=400'),
((SELECT id FROM categories WHERE slug = 'cosmetics'), 'Red Apple Moisturizing Cream', 'apple-moisturizer', 'Illuminate your skins hydration with apple bliss. Rich and nourishing formula.', 'Apple moisturizing cream', 1200.00, 999.00, 50, FALSE, FALSE, '/placeholder.svg?height=400&width=400')
ON CONFLICT (slug) DO NOTHING;

-- Seed product bundles
INSERT INTO product_bundles (name, description, bundle_price, is_active, image_url) VALUES
('Complete Skincare Bundle', 'Essential skincare routine with serum, moisturizer and face wash', 8999.00, TRUE, '/placeholder.svg?height=400&width=400'),
('Hair Care Essentials', 'Premium haircare with oil and serum for complete hair treatment', 6999.00, TRUE, '/placeholder.svg?height=400&width=400'),
('Organic Health Pack', 'Superfoods and supplements for complete wellness', 7499.00, TRUE, '/placeholder.svg?height=400&width=400')
ON CONFLICT (name) DO NOTHING;

-- Seed bundle items
INSERT INTO bundle_items (bundle_id, product_id, quantity) VALUES
((SELECT id FROM product_bundles WHERE name = 'Complete Skincare Bundle'), (SELECT id FROM products WHERE slug = 'vitamin-c-serum'), 1),
((SELECT id FROM product_bundles WHERE name = 'Complete Skincare Bundle'), (SELECT id FROM products WHERE slug = 'hand-foot-cream'), 1),
((SELECT id FROM product_bundles WHERE name = 'Complete Skincare Bundle'), (SELECT id FROM products WHERE slug = 'tea-tree-face-wash'), 1),
((SELECT id FROM product_bundles WHERE name = 'Hair Care Essentials'), (SELECT id FROM products WHERE slug = 'red-onion-oil'), 1),
((SELECT id FROM product_bundles WHERE name = 'Hair Care Essentials'), (SELECT id FROM products WHERE slug = 'rosemary-oil'), 1),
((SELECT id FROM product_bundles WHERE name = 'Organic Health Pack'), (SELECT id FROM products WHERE slug = 'chia-seeds'), 1),
((SELECT id FROM product_bundles WHERE name = 'Organic Health Pack'), (SELECT id FROM products WHERE slug = 'sidr-beri-honey'), 1),
((SELECT id FROM product_bundles WHERE name = 'Organic Health Pack'), (SELECT id FROM products WHERE slug = 'desi-cow-ghee'), 1);

-- Seed brand partnerships
INSERT INTO brand_partnerships (name, logo_url, website_url, description, is_featured) VALUES
('Chiltanpure Organics', '/placeholder.svg?height=100&width=100', 'https://chiltanpure.com', 'Premium organic skincare and food products from Pakistan', TRUE),
('Nature Pure', '/placeholder.svg?height=100&width=100', 'https://naturepure.com', 'Natural and organic beauty solutions', TRUE),
('Green Wellness', '/placeholder.svg?height=100&width=100', 'https://greenwellness.com', 'Holistic health and wellness products', FALSE),
('Pure Botanicals', '/placeholder.svg?height=100&width=100', 'https://purebotanicals.com', 'Plant-based organic products', FALSE),
('Organic Essentials', '/placeholder.svg?height=100&width=100', 'https://orgessentials.com', 'Essential oils and organic extracts', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Seed sample discount
INSERT INTO discounts (code, name, description, discount_type, discount_value, min_purchase_amount, apply_to_all, is_active, start_date, end_date) VALUES
('WELCOME20', 'Welcome Discount', '20% off on first purchase', 'percentage', 20, 0, TRUE, TRUE, NOW(), NOW() + INTERVAL '30 days'),
('BUNDLE10', 'Bundle Discount', '10% off on bundle purchases above 5000', 'percentage', 10, 5000, FALSE, TRUE, NOW(), NOW() + INTERVAL '60 days')
ON CONFLICT (code) DO NOTHING;
