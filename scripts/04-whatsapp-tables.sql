-- WhatsApp Integration Tables
-- This script creates the necessary tables for WhatsApp logging and metrics

-- Create whatsapp_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS whatsapp_logs (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100),
    message_id VARCHAR(255),
    from_number VARCHAR(20),
    to_number VARCHAR(20),
    message_body TEXT,
    direction VARCHAR(20) CHECK (direction IN ('inbound', 'outbound')),
    status VARCHAR(50),
    event_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_created_at ON whatsapp_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_event_type ON whatsapp_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_from_number ON whatsapp_logs(from_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_message_id ON whatsapp_logs(message_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_direction ON whatsapp_logs(direction);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_status ON whatsapp_logs(status);

-- Add WhatsApp-related columns to orders table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='whatsapp_message_id') THEN
        ALTER TABLE orders ADD COLUMN whatsapp_message_id VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='whatsapp_customer_number') THEN
        ALTER TABLE orders ADD COLUMN whatsapp_customer_number VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='metadata') THEN
        ALTER TABLE orders ADD COLUMN metadata JSONB;
    END IF;
END $$;

-- Create index for WhatsApp orders
CREATE INDEX IF NOT EXISTS idx_orders_whatsapp_message_id ON orders(whatsapp_message_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);

-- Add order_number column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='order_number') THEN
        ALTER TABLE orders ADD COLUMN order_number VARCHAR(50) UNIQUE;
        
        -- Generate order numbers for existing orders
        UPDATE orders 
        SET order_number = 'ORD-' || LPAD(id::TEXT, 6, '0')
        WHERE order_number IS NULL;
        
        -- Make it NOT NULL after populating
        ALTER TABLE orders ALTER COLUMN order_number SET NOT NULL;
    END IF;
END $$;

-- Create a function to auto-generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := 'ORD-' || LPAD(NEW.id::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating order numbers
DROP TRIGGER IF EXISTS trg_generate_order_number ON orders;
CREATE TRIGGER trg_generate_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- Add updated_at trigger for whatsapp_logs
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_whatsapp_logs_updated_at ON whatsapp_logs;
CREATE TRIGGER trg_update_whatsapp_logs_updated_at
    BEFORE UPDATE ON whatsapp_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for WhatsApp metrics dashboard
CREATE OR REPLACE VIEW whatsapp_metrics_summary AS
SELECT 
    COUNT(*) as total_messages,
    COUNT(CASE WHEN direction = 'inbound' THEN 1 END) as inbound_messages,
    COUNT(CASE WHEN direction = 'outbound' THEN 1 END) as outbound_messages,
    COUNT(CASE WHEN event_type = 'order_created' THEN 1 END) as orders_created,
    COUNT(CASE WHEN event_type = 'order_status_notification' THEN 1 END) as status_notifications,
    COUNT(DISTINCT from_number) as unique_customers,
    DATE_TRUNC('day', MIN(created_at)) as first_message_date,
    DATE_TRUNC('day', MAX(created_at)) as last_message_date
FROM whatsapp_logs;

-- Add comment to tables
COMMENT ON TABLE whatsapp_logs IS 'Stores all WhatsApp message logs and events for monitoring and analytics';
COMMENT ON COLUMN whatsapp_logs.event_type IS 'Type of event: message_received, order_created, order_status_notification, etc.';
COMMENT ON COLUMN whatsapp_logs.direction IS 'Message direction: inbound (from customer) or outbound (to customer)';
COMMENT ON COLUMN whatsapp_logs.status IS 'Message delivery status: sent, delivered, read, failed';
COMMENT ON COLUMN whatsapp_logs.event_data IS 'Additional JSON data related to the event';

-- Sample query examples
COMMENT ON VIEW whatsapp_metrics_summary IS 'Summary view of WhatsApp metrics for quick dashboard access';
