-- Real-time notification triggers for the e-commerce platform

-- Function to notify about product price changes
CREATE OR REPLACE FUNCTION notify_product_price_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.price IS DISTINCT FROM NEW.price THEN
    PERFORM pg_notify(
      'product_price_changed',
      json_build_object(
        'productId', NEW.id,
        'productName', NEW.name,
        'productSlug', NEW.slug,
        'oldPrice', OLD.price,
        'newPrice', NEW.price,
        'timestamp', NOW()
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS product_price_change_trigger ON products;
CREATE TRIGGER product_price_change_trigger
AFTER UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION notify_product_price_change();

-- Function to notify about discount changes
CREATE OR REPLACE FUNCTION notify_discount_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM pg_notify(
      'discount_created',
      json_build_object(
        'discountId', NEW.id,
        'discountCode', NEW.code,
        'percentage', NEW.percentage,
        'description', NEW.description,
        'startDate', NEW.start_date,
        'endDate', NEW.end_date,
        'timestamp', NOW()
      )::text
    );
  ELSIF OLD.percentage IS DISTINCT FROM NEW.percentage THEN
    PERFORM pg_notify(
      'discount_percentage_changed',
      json_build_object(
        'discountId', NEW.id,
        'discountCode', NEW.code,
        'oldPercentage', OLD.percentage,
        'newPercentage', NEW.percentage,
        'timestamp', NOW()
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS discount_change_trigger ON discounts;
CREATE TRIGGER discount_change_trigger
AFTER INSERT OR UPDATE ON discounts
FOR EACH ROW
EXECUTE FUNCTION notify_discount_change();

-- Function to notify about new orders
CREATE OR REPLACE FUNCTION notify_order_placed()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM pg_notify(
      'order_placed',
      json_build_object(
        'orderId', NEW.id,
        'orderNumber', NEW.order_number,
        'userId', NEW.user_id,
        'totalAmount', NEW.total_amount,
        'status', NEW.status,
        'timestamp', NOW()
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS order_placed_trigger ON orders;
CREATE TRIGGER order_placed_trigger
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION notify_order_placed();

-- Function to notify about order status changes
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM pg_notify(
      'order_status_changed',
      json_build_object(
        'orderId', NEW.id,
        'orderNumber', NEW.order_number,
        'userId', NEW.user_id,
        'oldStatus', OLD.status,
        'newStatus', NEW.status,
        'timestamp', NOW()
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS order_status_change_trigger ON orders;
CREATE TRIGGER order_status_change_trigger
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION notify_order_status_change();

-- Add indexes for better performance on notification queries
CREATE INDEX IF NOT EXISTS idx_cart_items_product_user ON cart_items(product_id, user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_user ON wishlist(product_id, user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
