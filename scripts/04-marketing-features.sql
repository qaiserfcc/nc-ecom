-- Email Campaigns System
CREATE TABLE IF NOT EXISTS email_campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  preview_text TEXT,
  campaign_type VARCHAR(50) DEFAULT 'promotional',
  html_content TEXT NOT NULL,
  text_content TEXT,
  
  -- Targeting
  target_segment VARCHAR(50),
  target_interests JSONB,
  exclude_unsubscribed BOOLEAN DEFAULT true,
  
  -- Scheduling
  scheduled_for TIMESTAMP,
  sent_at TIMESTAMP,
  
  -- Sender info
  from_name VARCHAR(255) DEFAULT 'NC Ecom',
  from_email VARCHAR(255) DEFAULT 'noreply@ncecom.com',
  reply_to VARCHAR(255),
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_campaigns_scheduled ON email_campaigns(scheduled_for);
CREATE INDEX idx_campaigns_sent ON email_campaigns(sent_at);

-- Campaign Recipients
CREATE TABLE IF NOT EXISTS email_campaign_recipients (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES email_campaigns(id) ON DELETE CASCADE,
  subscriber_id INTEGER REFERENCES email_subscribers(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  
  -- Delivery tracking
  status VARCHAR(50) DEFAULT 'pending',
  delivered_at TIMESTAMP,
  bounced_at TIMESTAMP,
  bounce_reason TEXT,
  
  -- Engagement tracking
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  unsubscribed_at TIMESTAMP,
  
  -- Conversion tracking
  converted_at TIMESTAMP,
  conversion_value DECIMAL(10, 2),
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(campaign_id, subscriber_id)
);

CREATE INDEX idx_campaign_recipients_campaign ON email_campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_subscriber ON email_campaign_recipients(subscriber_id);
CREATE INDEX idx_campaign_recipients_status ON email_campaign_recipients(status);

-- Abandoned Cart Recovery
CREATE TABLE IF NOT EXISTS abandoned_carts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Cart details
  cart_value DECIMAL(10, 2),
  cart_items JSONB,
  
  -- Recovery tracking
  recovery_status VARCHAR(50) DEFAULT 'pending',
  first_reminder_sent_at TIMESTAMP,
  second_reminder_sent_at TIMESTAMP,
  third_reminder_sent_at TIMESTAMP,
  
  -- Recovery outcome
  recovered_order_id INTEGER,
  recovery_value DECIMAL(10, 2),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_abandoned_carts_user ON abandoned_carts(user_id);
CREATE INDEX idx_abandoned_carts_order ON abandoned_carts(order_id);
CREATE INDEX idx_abandoned_carts_status ON abandoned_carts(recovery_status);
CREATE INDEX idx_abandoned_carts_created ON abandoned_carts(created_at);

-- Update lead_magnets table (add file_url and content columns if not exists)
ALTER TABLE lead_magnets 
  ADD COLUMN IF NOT EXISTS file_url TEXT,
  ADD COLUMN IF NOT EXISTS content TEXT;

-- Update orders table to track abandoned status
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';

UPDATE orders SET status = 'pending' WHERE status IS NULL;

-- Function to auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_email_campaigns_updated_at ON email_campaigns;
CREATE TRIGGER update_email_campaigns_updated_at
    BEFORE UPDATE ON email_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_abandoned_carts_updated_at ON abandoned_carts;
CREATE TRIGGER update_abandoned_carts_updated_at
    BEFORE UPDATE ON abandoned_carts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE email_campaigns IS 'Email marketing campaigns';
COMMENT ON TABLE email_campaign_recipients IS 'Campaign recipients and engagement tracking';
COMMENT ON TABLE abandoned_carts IS 'Abandoned cart recovery tracking';
