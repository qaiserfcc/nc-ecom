-- Marketing System Database Schema
-- Comprehensive email marketing, lead generation, and customer engagement

-- ==========================================
-- EMAIL SUBSCRIBERS & NEWSLETTER
-- ==========================================

CREATE TABLE IF NOT EXISTS email_subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(50),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Subscription details
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced', 'complained')),
  source VARCHAR(50), -- 'website', 'popup', 'checkout', 'lead_magnet', 'referral'
  
  -- Interests & Segmentation
  interests JSONB DEFAULT '[]', -- ['skincare', 'organic', 'haircare', 'makeup']
  skin_type VARCHAR(50), -- 'dry', 'oily', 'combination', 'sensitive', 'normal'
  age_group VARCHAR(20), -- '18-24', '25-34', '35-44', '45-54', '55+'
  
  -- Engagement metrics
  total_emails_sent INTEGER DEFAULT 0,
  total_emails_opened INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  last_email_opened_at TIMESTAMP,
  last_clicked_at TIMESTAMP,
  
  -- Lead magnet tracking
  lead_magnet_type VARCHAR(50), -- 'discount_code', 'guide', 'quiz', 'free_sample'
  discount_code VARCHAR(50),
  
  -- GDPR Compliance
  consent_given BOOLEAN DEFAULT true,
  consent_date TIMESTAMP DEFAULT NOW(),
  consent_ip VARCHAR(45),
  gdpr_compliant BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  unsubscribed_at TIMESTAMP
);

CREATE INDEX idx_subscribers_email ON email_subscribers(email);
CREATE INDEX idx_subscribers_status ON email_subscribers(status);
CREATE INDEX idx_subscribers_interests ON email_subscribers USING GIN(interests);
CREATE INDEX idx_subscribers_source ON email_subscribers(source);

-- ==========================================
-- EMAIL CAMPAIGNS
-- ==========================================

CREATE TABLE IF NOT EXISTS email_campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  preview_text VARCHAR(500),
  
  -- Content
  html_content TEXT,
  plain_text_content TEXT,
  
  -- Campaign type
  campaign_type VARCHAR(50) DEFAULT 'promotional', -- 'promotional', 'newsletter', 'transactional', 'abandoned_cart', 'welcome'
  
  -- Targeting & Segmentation
  target_segment JSONB, -- Criteria for who receives this
  target_interests JSONB, -- ['skincare', 'organic']
  
  -- Scheduling
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  
  -- Performance metrics
  total_recipients INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_bounced INTEGER DEFAULT 0,
  total_unsubscribed INTEGER DEFAULT 0,
  total_complained INTEGER DEFAULT 0,
  
  -- Revenue tracking
  total_revenue DECIMAL(10, 2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_campaigns_type ON email_campaigns(campaign_type);
CREATE INDEX idx_campaigns_scheduled ON email_campaigns(scheduled_at);

-- ==========================================
-- EMAIL CAMPAIGN RECIPIENTS
-- ==========================================

CREATE TABLE IF NOT EXISTS email_campaign_recipients (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES email_campaigns(id) ON DELETE CASCADE,
  subscriber_id INTEGER REFERENCES email_subscribers(id) ON DELETE CASCADE,
  
  -- Delivery status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'bounced', 'failed', 'complained')),
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  
  -- Engagement
  opened BOOLEAN DEFAULT false,
  opened_at TIMESTAMP,
  open_count INTEGER DEFAULT 0,
  
  clicked BOOLEAN DEFAULT false,
  clicked_at TIMESTAMP,
  click_count INTEGER DEFAULT 0,
  
  -- Conversion
  converted BOOLEAN DEFAULT false,
  conversion_value DECIMAL(10, 2) DEFAULT 0,
  order_id INTEGER REFERENCES orders(id),
  
  -- Error tracking
  error_message TEXT,
  bounce_type VARCHAR(20), -- 'hard', 'soft'
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(campaign_id, subscriber_id)
);

CREATE INDEX idx_campaign_recipients_campaign ON email_campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_subscriber ON email_campaign_recipients(subscriber_id);
CREATE INDEX idx_campaign_recipients_status ON email_campaign_recipients(status);

-- ==========================================
-- LEAD MAGNETS
-- ==========================================

CREATE TABLE IF NOT EXISTS lead_magnets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'discount_code', 'guide', 'ebook', 'checklist', 'quiz', 'free_sample'
  
  -- Offer details
  title VARCHAR(500) NOT NULL,
  description TEXT,
  discount_type VARCHAR(20), -- 'percentage', 'fixed_amount', 'free_shipping'
  discount_value DECIMAL(10, 2),
  
  -- Content
  file_url VARCHAR(500), -- For downloadable guides/ebooks
  content_html TEXT,
  
  -- Requirements
  requires_email BOOLEAN DEFAULT true,
  requires_phone BOOLEAN DEFAULT false,
  requires_interests BOOLEAN DEFAULT false,
  
  -- Conditions
  minimum_purchase DECIMAL(10, 2) DEFAULT 0,
  valid_days INTEGER DEFAULT 30,
  max_uses_per_user INTEGER DEFAULT 1,
  
  -- Tracking
  total_claims INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5, 2) DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- LEAD MAGNET CLAIMS
-- ==========================================

CREATE TABLE IF NOT EXISTS lead_magnet_claims (
  id SERIAL PRIMARY KEY,
  lead_magnet_id INTEGER REFERENCES lead_magnets(id) ON DELETE CASCADE,
  subscriber_id INTEGER REFERENCES email_subscribers(id) ON DELETE CASCADE,
  
  -- Generated code/content
  discount_code VARCHAR(50),
  code_expires_at TIMESTAMP,
  
  -- Usage tracking
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMP,
  order_id INTEGER REFERENCES orders(id),
  
  -- Attribution
  source VARCHAR(50), -- 'popup', 'landing_page', 'checkout'
  referrer_url TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(lead_magnet_id, subscriber_id)
);

CREATE INDEX idx_lead_claims_magnet ON lead_magnet_claims(lead_magnet_id);
CREATE INDEX idx_lead_claims_subscriber ON lead_magnet_claims(subscriber_id);

-- ==========================================
-- ABANDONED CARTS
-- ==========================================

CREATE TABLE IF NOT EXISTS abandoned_carts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  
  -- Cart details
  cart_data JSONB NOT NULL, -- Full cart contents
  total_value DECIMAL(10, 2) NOT NULL,
  items_count INTEGER NOT NULL,
  
  -- Recovery status
  status VARCHAR(20) DEFAULT 'abandoned' CHECK (status IN ('abandoned', 'reminded', 'recovered', 'expired')),
  
  -- Email reminders
  first_reminder_sent_at TIMESTAMP,
  second_reminder_sent_at TIMESTAMP,
  third_reminder_sent_at TIMESTAMP,
  
  -- Recovery tracking
  recovered BOOLEAN DEFAULT false,
  recovered_at TIMESTAMP,
  recovered_order_id INTEGER REFERENCES orders(id),
  recovery_value DECIMAL(10, 2),
  
  -- Attribution
  recovery_source VARCHAR(50), -- 'email', 'whatsapp', 'sms'
  
  abandoned_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_abandoned_carts_user ON abandoned_carts(user_id);
CREATE INDEX idx_abandoned_carts_email ON abandoned_carts(email);
CREATE INDEX idx_abandoned_carts_status ON abandoned_carts(status);
CREATE INDEX idx_abandoned_carts_abandoned ON abandoned_carts(abandoned_at);

-- ==========================================
-- WHATSAPP MARKETING
-- ==========================================

CREATE TABLE IF NOT EXISTS whatsapp_subscribers (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Opt-in details
  opted_in BOOLEAN DEFAULT true,
  opt_in_source VARCHAR(50), -- 'website', 'checkout', 'order_notification'
  opt_in_date TIMESTAMP DEFAULT NOW(),
  opted_out_at TIMESTAMP,
  
  -- Interests
  interests JSONB DEFAULT '[]',
  
  -- Engagement
  total_messages_sent INTEGER DEFAULT 0,
  total_messages_delivered INTEGER DEFAULT 0,
  total_messages_read INTEGER DEFAULT 0,
  last_message_sent_at TIMESTAMP,
  last_message_read_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_phone ON whatsapp_subscribers(phone);
CREATE INDEX idx_whatsapp_opted_in ON whatsapp_subscribers(opted_in);

-- ==========================================
-- WHATSAPP CAMPAIGNS
-- ==========================================

CREATE TABLE IF NOT EXISTS whatsapp_campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  message_template TEXT NOT NULL,
  
  -- Campaign type
  campaign_type VARCHAR(50) DEFAULT 'promotional', -- 'promotional', 'notification', 'abandoned_cart', 'customer_support'
  
  -- Media
  media_url VARCHAR(500),
  media_type VARCHAR(20), -- 'image', 'video', 'document'
  
  -- Targeting
  target_interests JSONB,
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused')),
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  
  -- Metrics
  total_recipients INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_read INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- REFERRAL PROGRAM
-- ==========================================

CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL PRIMARY KEY,
  referrer_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referrer_email VARCHAR(255) NOT NULL,
  
  -- Referral code
  referral_code VARCHAR(50) UNIQUE NOT NULL,
  
  -- Referred user
  referred_email VARCHAR(255),
  referred_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'converted', 'rewarded')),
  
  -- Rewards
  referrer_reward_type VARCHAR(20), -- 'discount', 'credit', 'points'
  referrer_reward_value DECIMAL(10, 2),
  referrer_rewarded BOOLEAN DEFAULT false,
  referrer_rewarded_at TIMESTAMP,
  
  referred_reward_type VARCHAR(20),
  referred_reward_value DECIMAL(10, 2),
  referred_rewarded BOOLEAN DEFAULT false,
  
  -- Conversion tracking
  first_order_id INTEGER REFERENCES orders(id),
  first_order_value DECIMAL(10, 2),
  first_order_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_user_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_user_id);
CREATE INDEX idx_referrals_status ON referrals(status);

-- ==========================================
-- QUIZ FUNNELS
-- ==========================================

CREATE TABLE IF NOT EXISTS quiz_funnels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  
  -- Quiz configuration
  questions JSONB NOT NULL, -- Array of questions with options
  result_mapping JSONB NOT NULL, -- Maps answers to product recommendations
  
  -- Lead capture
  requires_email BOOLEAN DEFAULT true,
  lead_magnet_id INTEGER REFERENCES lead_magnets(id),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metrics
  total_starts INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  completion_rate DECIMAL(5, 2) DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5, 2) DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- QUIZ RESPONSES
-- ==========================================

CREATE TABLE IF NOT EXISTS quiz_responses (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quiz_funnels(id) ON DELETE CASCADE,
  subscriber_id INTEGER REFERENCES email_subscribers(id) ON DELETE SET NULL,
  
  -- Response data
  answers JSONB NOT NULL,
  results JSONB, -- Recommended products
  
  -- Status
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  
  -- Conversion
  converted BOOLEAN DEFAULT false,
  order_id INTEGER REFERENCES orders(id),
  conversion_value DECIMAL(10, 2),
  
  -- Attribution
  source VARCHAR(50),
  referrer_url TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_quiz_responses_quiz ON quiz_responses(quiz_id);
CREATE INDEX idx_quiz_responses_subscriber ON quiz_responses(subscriber_id);

-- ==========================================
-- MARKETING ANALYTICS
-- ==========================================

CREATE TABLE IF NOT EXISTS marketing_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL, -- 'email_open', 'email_click', 'popup_view', 'popup_close', 'form_submit', 'purchase'
  
  -- User identification
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  subscriber_id INTEGER REFERENCES email_subscribers(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  
  -- Event details
  campaign_id INTEGER,
  campaign_type VARCHAR(50),
  
  -- Event data
  event_data JSONB,
  
  -- Attribution
  source VARCHAR(50),
  medium VARCHAR(50),
  campaign VARCHAR(100),
  
  -- Technical
  user_agent TEXT,
  ip_address VARCHAR(45),
  referrer_url TEXT,
  
  event_timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_marketing_events_type ON marketing_events(event_type);
CREATE INDEX idx_marketing_events_user ON marketing_events(user_id);
CREATE INDEX idx_marketing_events_subscriber ON marketing_events(subscriber_id);
CREATE INDEX idx_marketing_events_timestamp ON marketing_events(event_timestamp);

-- ==========================================
-- FACEBOOK ADS TRACKING
-- ==========================================

CREATE TABLE IF NOT EXISTS facebook_ad_campaigns (
  id SERIAL PRIMARY KEY,
  
  -- Facebook details
  facebook_campaign_id VARCHAR(255) UNIQUE,
  campaign_name VARCHAR(255) NOT NULL,
  
  -- Targeting
  target_interests JSONB, -- ['skincare', 'organic_products']
  age_range JSONB, -- {min: 18, max: 65}
  gender VARCHAR(20),
  locations JSONB,
  
  -- Budget
  daily_budget DECIMAL(10, 2),
  lifetime_budget DECIMAL(10, 2),
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  
  -- Performance (synced from Facebook)
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  spend DECIMAL(10, 2) DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  
  -- ROI metrics
  cpc DECIMAL(10, 2) DEFAULT 0, -- Cost per click
  ctr DECIMAL(5, 2) DEFAULT 0, -- Click-through rate
  roas DECIMAL(10, 2) DEFAULT 0, -- Return on ad spend
  
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- FUNCTIONS & TRIGGERS
-- ==========================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_email_subscribers_updated_at BEFORE UPDATE ON email_subscribers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON email_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_abandoned_carts_updated_at BEFORE UPDATE ON abandoned_carts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_whatsapp_subscribers_updated_at BEFORE UPDATE ON whatsapp_subscribers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON referrals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE email_subscribers IS 'Stores all email subscribers with consent, interests, and engagement metrics';
COMMENT ON TABLE email_campaigns IS 'Email marketing campaigns with targeting and performance metrics';
COMMENT ON TABLE lead_magnets IS 'Lead generation offers (discounts, guides, quizzes)';
COMMENT ON TABLE abandoned_carts IS 'Tracks abandoned carts for recovery campaigns';
COMMENT ON TABLE whatsapp_subscribers IS 'WhatsApp Business opt-in subscribers';
COMMENT ON TABLE referrals IS 'Referral program tracking with rewards';
COMMENT ON TABLE quiz_funnels IS 'Interactive quizzes for product recommendations and lead generation';
COMMENT ON TABLE marketing_events IS 'Event tracking for all marketing activities and attribution';
