-- Create WhatsApp logs table for monitoring
CREATE TABLE IF NOT EXISTS whatsapp_logs (
  id SERIAL PRIMARY KEY,
  message_id VARCHAR(255) UNIQUE,
  from_number VARCHAR(20),
  to_number VARCHAR(20),
  message_body TEXT,
  event_type VARCHAR(50),
  event_data JSONB,
  direction VARCHAR(20) CHECK (direction IN ('inbound', 'outbound')),
  status VARCHAR(50) CHECK (status IN ('sent', 'delivered', 'read', 'received', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_whatsapp_logs_event_type ON whatsapp_logs(event_type);
CREATE INDEX idx_whatsapp_logs_from_number ON whatsapp_logs(from_number);
CREATE INDEX idx_whatsapp_logs_created_at ON whatsapp_logs(created_at);
CREATE INDEX idx_whatsapp_logs_status ON whatsapp_logs(status);

-- Add WhatsApp fields to orders table if they don't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS whatsapp_message_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS whatsapp_customer_number VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS last_whatsapp_notification TIMESTAMP WITH TIME ZONE;

-- Create indexes for orders WhatsApp fields
CREATE INDEX IF NOT EXISTS idx_orders_whatsapp_customer_number ON orders(whatsapp_customer_number);
CREATE INDEX IF NOT EXISTS idx_orders_whatsapp_message_id ON orders(whatsapp_message_id);

-- Create view for WhatsApp daily metrics
CREATE OR REPLACE VIEW whatsapp_daily_metrics AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE event_type = 'message_received') as messages_received,
  COUNT(*) FILTER (WHERE event_type = 'status_notification_sent') as notifications_sent,
  COUNT(*) FILTER (WHERE event_type = 'order_created') as orders_created,
  COUNT(*) FILTER (WHERE event_type = 'webhook_error') as errors,
  COUNT(DISTINCT from_number) FILTER (WHERE direction = 'inbound') as unique_customers,
  COUNT(*) FILTER (WHERE status = 'delivered') as messages_delivered,
  COUNT(*) FILTER (WHERE status = 'read') as messages_read
FROM whatsapp_logs
GROUP BY DATE(created_at);

-- Create view for WhatsApp customer interactions
CREATE OR REPLACE VIEW whatsapp_customer_interactions AS
SELECT 
  from_number,
  COUNT(*) as total_interactions,
  MAX(created_at) as last_interaction,
  COUNT(*) FILTER (WHERE direction = 'inbound') as customer_messages,
  COUNT(*) FILTER (WHERE direction = 'outbound') as business_messages,
  COUNT(*) FILTER (WHERE event_type = 'order_created') as orders_created
FROM whatsapp_logs
WHERE from_number IS NOT NULL AND from_number != 'business'
GROUP BY from_number;
