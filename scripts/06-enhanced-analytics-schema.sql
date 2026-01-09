-- Enhanced Analytics Schema for Admin Dashboard and Meta Pixel/Conversion API Integration

-- Create enhanced analytics events table for detailed tracking
CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT,
  event_name TEXT NOT NULL,
  event_category TEXT,
  page_url TEXT,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop', 'unknown')),
  browser TEXT,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  event_value DECIMAL(10, 2),
  event_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Meta Pixel configuration table
CREATE TABLE IF NOT EXISTS meta_pixel_config (
  id SERIAL PRIMARY KEY,
  pixel_id TEXT NOT NULL,
  access_token TEXT,
  test_event_code TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  enable_automatic_events BOOLEAN DEFAULT TRUE,
  enable_advanced_matching BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create conversion tracking table for Meta Conversion API
CREATE TABLE IF NOT EXISTS conversion_events (
  id SERIAL PRIMARY KEY,
  event_name TEXT NOT NULL CHECK (event_name IN ('ViewContent', 'AddToCart', 'AddToWishlist', 'InitiateCheckout', 'AddPaymentInfo', 'Purchase', 'Lead', 'CompleteRegistration', 'Search', 'PageView')),
  event_id TEXT UNIQUE NOT NULL,
  event_source_url TEXT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  event_time BIGINT NOT NULL,
  user_data JSONB,
  custom_data JSONB,
  value DECIMAL(10, 2),
  currency TEXT DEFAULT 'PKR',
  content_ids TEXT[],
  content_type TEXT,
  sent_to_meta BOOLEAN DEFAULT FALSE,
  meta_response JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create dashboard metrics cache table for performance
CREATE TABLE IF NOT EXISTS dashboard_metrics_cache (
  id SERIAL PRIMARY KEY,
  metric_key TEXT UNIQUE NOT NULL,
  metric_value JSONB NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create customer behavior analytics table
CREATE TABLE IF NOT EXISTS customer_analytics (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  avg_order_value DECIMAL(10, 2) DEFAULT 0,
  total_products_viewed INTEGER DEFAULT 0,
  total_products_added_to_cart INTEGER DEFAULT 0,
  total_products_wishlisted INTEGER DEFAULT 0,
  last_order_date TIMESTAMP,
  last_visit_date TIMESTAMP,
  customer_lifetime_value DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Create product performance analytics table
CREATE TABLE IF NOT EXISTS product_performance (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  add_to_cart INTEGER DEFAULT 0,
  add_to_wishlist INTEGER DEFAULT 0,
  purchases INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  conversion_rate DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_category ON analytics_events(event_category);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_product ON analytics_events(product_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_order ON analytics_events(order_id);

CREATE INDEX IF NOT EXISTS idx_conversion_events_name ON conversion_events(event_name);
CREATE INDEX IF NOT EXISTS idx_conversion_events_user ON conversion_events(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_created ON conversion_events(created_at);
CREATE INDEX IF NOT EXISTS idx_conversion_events_sent ON conversion_events(sent_to_meta);

CREATE INDEX IF NOT EXISTS idx_customer_analytics_user ON customer_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_analytics_lifetime ON customer_analytics(customer_lifetime_value);
CREATE INDEX IF NOT EXISTS idx_customer_analytics_last_order ON customer_analytics(last_order_date);

CREATE INDEX IF NOT EXISTS idx_product_performance_product ON product_performance(product_id);
CREATE INDEX IF NOT EXISTS idx_product_performance_date ON product_performance(date);
CREATE INDEX IF NOT EXISTS idx_product_performance_revenue ON product_performance(revenue);

-- Insert default Meta Pixel configuration (disabled by default)
INSERT INTO meta_pixel_config (pixel_id, is_active) 
VALUES ('YOUR_PIXEL_ID', FALSE)
ON CONFLICT DO NOTHING;

-- Create function to update customer analytics
CREATE OR REPLACE FUNCTION update_customer_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO customer_analytics (
    user_id,
    total_orders,
    total_spent,
    avg_order_value,
    last_order_date,
    customer_lifetime_value
  )
  SELECT 
    NEW.user_id,
    COUNT(*),
    COALESCE(SUM(total_amount), 0),
    COALESCE(AVG(total_amount), 0),
    MAX(created_at),
    COALESCE(SUM(total_amount), 0)
  FROM orders
  WHERE user_id = NEW.user_id AND status != 'cancelled'
  GROUP BY user_id
  ON CONFLICT (user_id) 
  DO UPDATE SET
    total_orders = EXCLUDED.total_orders,
    total_spent = EXCLUDED.total_spent,
    avg_order_value = EXCLUDED.avg_order_value,
    last_order_date = EXCLUDED.last_order_date,
    customer_lifetime_value = EXCLUDED.customer_lifetime_value,
    updated_at = CURRENT_TIMESTAMP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update customer analytics on order changes
DROP TRIGGER IF EXISTS trigger_update_customer_analytics ON orders;
CREATE TRIGGER trigger_update_customer_analytics
AFTER INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_customer_analytics();

-- Create function to update product performance
CREATE OR REPLACE FUNCTION update_product_performance_daily()
RETURNS void AS $$
BEGIN
  -- Update product performance for yesterday
  INSERT INTO product_performance (product_id, date, views, add_to_cart, add_to_wishlist, purchases, revenue, conversion_rate)
  SELECT 
    p.id,
    CURRENT_DATE - INTERVAL '1 day',
    COALESCE(views.count, 0) as views,
    COALESCE(cart.count, 0) as add_to_cart,
    COALESCE(wishlist.count, 0) as add_to_wishlist,
    COALESCE(purchases.count, 0) as purchases,
    COALESCE(purchases.revenue, 0) as revenue,
    CASE WHEN COALESCE(views.count, 0) > 0 
      THEN (COALESCE(purchases.count, 0)::DECIMAL / views.count * 100)
      ELSE 0 
    END as conversion_rate
  FROM products p
  LEFT JOIN (
    SELECT product_id, COUNT(*) as count
    FROM analytics
    WHERE event_type = 'view' 
      AND created_at >= CURRENT_DATE - INTERVAL '1 day'
      AND created_at < CURRENT_DATE
    GROUP BY product_id
  ) views ON p.id = views.product_id
  LEFT JOIN (
    SELECT product_id, COUNT(*) as count
    FROM analytics
    WHERE event_type = 'add_to_cart' 
      AND created_at >= CURRENT_DATE - INTERVAL '1 day'
      AND created_at < CURRENT_DATE
    GROUP BY product_id
  ) cart ON p.id = cart.product_id
  LEFT JOIN (
    SELECT product_id, COUNT(*) as count
    FROM analytics
    WHERE event_type = 'add_to_wishlist' 
      AND created_at >= CURRENT_DATE - INTERVAL '1 day'
      AND created_at < CURRENT_DATE
    GROUP BY product_id
  ) wishlist ON p.id = wishlist.product_id
  LEFT JOIN (
    SELECT oi.product_id, COUNT(*) as count, SUM(oi.price_at_purchase * oi.quantity) as revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status != 'cancelled'
      AND o.created_at >= CURRENT_DATE - INTERVAL '1 day'
      AND o.created_at < CURRENT_DATE
    GROUP BY oi.product_id
  ) purchases ON p.id = purchases.product_id
  ON CONFLICT (product_id, date)
  DO UPDATE SET
    views = EXCLUDED.views,
    add_to_cart = EXCLUDED.add_to_cart,
    add_to_wishlist = EXCLUDED.add_to_wishlist,
    purchases = EXCLUDED.purchases,
    revenue = EXCLUDED.revenue,
    conversion_rate = EXCLUDED.conversion_rate,
    updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE analytics_events IS 'Enhanced analytics tracking for detailed user behavior and events';
COMMENT ON TABLE meta_pixel_config IS 'Configuration for Meta Pixel and Conversion API integration';
COMMENT ON TABLE conversion_events IS 'Meta Conversion API events log for server-side tracking';
COMMENT ON TABLE customer_analytics IS 'Aggregated customer behavior and lifetime value metrics';
COMMENT ON TABLE product_performance IS 'Daily product performance metrics for analytics dashboard';
