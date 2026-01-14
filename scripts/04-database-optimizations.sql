-- Database Performance Optimizations
-- Add indexes for frequently queried fields

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_is_new_arrival ON products(is_new_arrival) WHERE is_new_arrival = true;
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_current_price ON products(current_price);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin (name gin_trgm_ops);

-- Product variants indexes
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);

-- Product images indexes
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_is_primary ON product_images(is_primary) WHERE is_primary = true;

-- Cart items indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_product ON cart_items(user_id, product_id);

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_total_amount ON orders(total_amount);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Wishlists indexes
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON wishlists(product_id);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Brand partnerships indexes
CREATE INDEX IF NOT EXISTS idx_brand_partnerships_is_featured ON brand_partnerships(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_brand_partnerships_slug ON brand_partnerships(slug);

-- Analytics and conversion tracking indexes
CREATE INDEX IF NOT EXISTS idx_conversion_events_event_name ON conversion_events(event_name);
CREATE INDEX IF NOT EXISTS idx_conversion_events_user_id ON conversion_events(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_created_at ON conversion_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversion_events_sent_to_meta ON conversion_events(sent_to_meta);

-- Discounts indexes
CREATE INDEX IF NOT EXISTS idx_discounts_is_active ON discounts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_discounts_code ON discounts(code);
CREATE INDEX IF NOT EXISTS idx_discounts_expires_at ON discounts(expires_at);

-- Banners indexes
CREATE INDEX IF NOT EXISTS idx_banners_is_active ON banners(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_banners_position ON banners(position);

-- Bundles indexes
CREATE INDEX IF NOT EXISTS idx_bundles_is_active ON bundles(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_bundles_created_at ON bundles(created_at DESC);

-- Bundle items indexes
CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle_id ON bundle_items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_items_product_id ON bundle_items(product_id);

-- Shipping methods indexes
CREATE INDEX IF NOT EXISTS idx_shipping_methods_is_active ON shipping_methods(is_active) WHERE is_active = true;

-- Quotes indexes
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);