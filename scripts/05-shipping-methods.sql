-- Create shipping_methods table
CREATE TABLE IF NOT EXISTS shipping_methods (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  base_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  min_order_amount DECIMAL(10, 2),
  max_order_amount DECIMAL(10, 2),
  is_free_shipping BOOLEAN DEFAULT FALSE,
  location_type TEXT CHECK (location_type IN ('all', 'lahore', 'out_of_lahore')),
  is_same_day BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add shipping_method_id and delivery_time to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_method_id INTEGER REFERENCES shipping_methods(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_time TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_location TEXT;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_shipping_methods_active ON shipping_methods(is_active);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_sort ON shipping_methods(sort_order);

-- Insert default shipping methods
INSERT INTO shipping_methods (name, description, base_cost, min_order_amount, is_free_shipping, location_type, is_same_day, is_active, sort_order)
VALUES 
  ('Free Shipping', 'Free shipping for orders over Rs 2999', 0, 2999, true, 'all', false, true, 1),
  ('Standard Shipping', 'Standard shipping for orders below Rs 2999', 650, 0, false, 'all', false, true, 2),
  ('Same Day Delivery - Lahore', 'Same day delivery within Lahore', 1000, 0, false, 'lahore', true, true, 3),
  ('Same Day Delivery - Outside Lahore', 'Same day delivery outside Lahore', 1500, 0, false, 'out_of_lahore', true, true, 4)
ON CONFLICT DO NOTHING;
