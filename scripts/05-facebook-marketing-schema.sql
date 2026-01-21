-- Facebook Marketing Integration Schema
-- Supports Meta Business Suite, Ads Manager, and Marketing APIs

-- Facebook Accounts Table
CREATE TABLE IF NOT EXISTS facebook_accounts (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_name VARCHAR(255) NOT NULL,
  facebook_account_id VARCHAR(255) UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  access_token_expires_at TIMESTAMP WITH TIME ZONE,
  refresh_token TEXT,
  is_active BOOLEAN DEFAULT true,
  timezone VARCHAR(100),
  currency VARCHAR(10),
  data_use_settings JSONB,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_synced_at TIMESTAMP WITH TIME ZONE
);

-- Facebook Pages Table
CREATE TABLE IF NOT EXISTS facebook_pages (
  id SERIAL PRIMARY KEY,
  facebook_account_id INTEGER NOT NULL REFERENCES facebook_accounts(id) ON DELETE CASCADE,
  page_id VARCHAR(255) UNIQUE NOT NULL,
  page_name VARCHAR(255) NOT NULL,
  page_category VARCHAR(255),
  page_url VARCHAR(512),
  access_token TEXT NOT NULL,
  is_connected BOOLEAN DEFAULT true,
  followers_count INTEGER,
  verified BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Facebook Ads Accounts Table
CREATE TABLE IF NOT EXISTS facebook_ads_accounts (
  id SERIAL PRIMARY KEY,
  facebook_account_id INTEGER NOT NULL REFERENCES facebook_accounts(id) ON DELETE CASCADE,
  ads_account_id VARCHAR(255) UNIQUE NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  account_status VARCHAR(50),
  timezone VARCHAR(100),
  currency VARCHAR(10),
  business_name VARCHAR(255),
  ad_account_creation_request_status VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Facebook Campaigns Table
CREATE TABLE IF NOT EXISTS facebook_campaigns (
  id SERIAL PRIMARY KEY,
  ads_account_id INTEGER NOT NULL REFERENCES facebook_ads_accounts(id) ON DELETE CASCADE,
  campaign_id VARCHAR(255) UNIQUE NOT NULL,
  campaign_name VARCHAR(255) NOT NULL,
  objective VARCHAR(100) NOT NULL, -- REACH, CONVERSIONS, VIDEO_VIEWS, etc.
  status VARCHAR(50), -- ACTIVE, PAUSED, DELETED, ARCHIVED
  budget_amount DECIMAL(12, 2),
  budget_type VARCHAR(20), -- DAILY_BUDGET, LIFETIME_BUDGET
  start_date DATE,
  end_date DATE,
  created_time TIMESTAMP WITH TIME ZONE,
  updated_time TIMESTAMP WITH TIME ZONE,
  insights_impressions BIGINT,
  insights_clicks BIGINT,
  insights_spend DECIMAL(12, 2),
  insights_actions INTEGER,
  insights_action_value DECIMAL(12, 2),
  synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Facebook Ad Sets Table
CREATE TABLE IF NOT EXISTS facebook_ad_sets (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER NOT NULL REFERENCES facebook_campaigns(id) ON DELETE CASCADE,
  adset_id VARCHAR(255) UNIQUE NOT NULL,
  adset_name VARCHAR(255) NOT NULL,
  status VARCHAR(50),
  budget_amount DECIMAL(12, 2),
  budget_type VARCHAR(20),
  bid_strategy VARCHAR(100),
  bid_amount DECIMAL(12, 2),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  targeting JSONB,
  created_time TIMESTAMP WITH TIME ZONE,
  insights_impressions BIGINT,
  insights_clicks BIGINT,
  insights_spend DECIMAL(12, 2),
  synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Facebook Ads Table
CREATE TABLE IF NOT EXISTS facebook_ads (
  id SERIAL PRIMARY KEY,
  adset_id INTEGER NOT NULL REFERENCES facebook_ad_sets(id) ON DELETE CASCADE,
  ad_id VARCHAR(255) UNIQUE NOT NULL,
  ad_name VARCHAR(255) NOT NULL,
  creative_id VARCHAR(255),
  status VARCHAR(50),
  created_time TIMESTAMP WITH TIME ZONE,
  updated_time TIMESTAMP WITH TIME ZONE,
  insights_impressions BIGINT,
  insights_clicks BIGINT,
  insights_spend DECIMAL(12, 2),
  insights_actions INTEGER,
  insights_ctr DECIMAL(5, 2),
  insights_cpc DECIMAL(10, 2),
  insights_cpa DECIMAL(10, 2),
  synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Facebook Lead Forms Table
CREATE TABLE IF NOT EXISTS facebook_lead_forms (
  id SERIAL PRIMARY KEY,
  page_id INTEGER NOT NULL REFERENCES facebook_pages(id) ON DELETE CASCADE,
  form_id VARCHAR(255) UNIQUE NOT NULL,
  form_name VARCHAR(255) NOT NULL,
  form_status VARCHAR(50),
  questions JSONB,
  created_time TIMESTAMP WITH TIME ZONE,
  updated_time TIMESTAMP WITH TIME ZONE,
  leads_count INTEGER DEFAULT 0,
  last_lead_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Facebook Leads Table
CREATE TABLE IF NOT EXISTS facebook_leads (
  id SERIAL PRIMARY KEY,
  lead_form_id INTEGER NOT NULL REFERENCES facebook_lead_forms(id) ON DELETE CASCADE,
  lead_id VARCHAR(255) UNIQUE NOT NULL,
  field_data JSONB, -- Array of {key, value} pairs
  created_time TIMESTAMP WITH TIME ZONE,
  is_imported BOOLEAN DEFAULT false,
  imported_to_system_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Facebook Posts Table
CREATE TABLE IF NOT EXISTS facebook_posts (
  id SERIAL PRIMARY KEY,
  page_id INTEGER NOT NULL REFERENCES facebook_pages(id) ON DELETE CASCADE,
  post_id VARCHAR(255) UNIQUE NOT NULL,
  message TEXT,
  link VARCHAR(512),
  created_time TIMESTAMP WITH TIME ZONE,
  updated_time TIMESTAMP WITH TIME ZONE,
  insights_impressions BIGINT,
  insights_engaged_users BIGINT,
  insights_post_engaged_users BIGINT,
  insights_post_clicks BIGINT,
  insights_post_negative_feedback BIGINT,
  insights_post_impressions_organic BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Facebook Conversions (Pixel) Table
CREATE TABLE IF NOT EXISTS facebook_conversions (
  id SERIAL PRIMARY KEY,
  pixel_id VARCHAR(255) NOT NULL,
  event_id VARCHAR(255) UNIQUE NOT NULL,
  event_name VARCHAR(100), -- PageView, ViewContent, AddToCart, Purchase, etc.
  user_data JSONB, -- hashed email, phone, etc.
  content_data JSONB, -- content_ids, content_name, value, currency, etc.
  custom_data JSONB, -- additional custom properties
  event_source_url VARCHAR(512),
  event_timestamp TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Facebook Catalog Table
CREATE TABLE IF NOT EXISTS facebook_catalogs (
  id SERIAL PRIMARY KEY,
  facebook_account_id INTEGER NOT NULL REFERENCES facebook_accounts(id) ON DELETE CASCADE,
  catalog_id VARCHAR(255) UNIQUE NOT NULL,
  catalog_name VARCHAR(255) NOT NULL,
  catalog_type VARCHAR(100), -- PRODUCT, EVENT, DESTINATION, HOTEL_ROOM, HOME_LISTING, FLIGHT, OFFER, VEHICLE
  category_default VARCHAR(100),
  currency VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Facebook Catalog Products Table
CREATE TABLE IF NOT EXISTS facebook_catalog_products (
  id SERIAL PRIMARY KEY,
  catalog_id INTEGER NOT NULL REFERENCES facebook_catalogs(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  retailer_id VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12, 2),
  currency VARCHAR(10),
  image_url VARCHAR(512),
  url VARCHAR(512),
  availability VARCHAR(50),
  condition VARCHAR(50),
  brand VARCHAR(255),
  category VARCHAR(255),
  product_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Facebook Page Inbox Messages Table
CREATE TABLE IF NOT EXISTS facebook_messages (
  id SERIAL PRIMARY KEY,
  page_id INTEGER NOT NULL REFERENCES facebook_pages(id) ON DELETE CASCADE,
  message_id VARCHAR(255) UNIQUE NOT NULL,
  conversation_id VARCHAR(255),
  sender_id VARCHAR(255),
  sender_name VARCHAR(255),
  message_text TEXT,
  attachments JSONB,
  created_time TIMESTAMP WITH TIME ZONE,
  is_page_admin BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_facebook_accounts_user_id ON facebook_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_facebook_pages_account_id ON facebook_pages(facebook_account_id);
CREATE INDEX IF NOT EXISTS idx_facebook_ads_accounts_account_id ON facebook_ads_accounts(facebook_account_id);
CREATE INDEX IF NOT EXISTS idx_facebook_campaigns_ads_account_id ON facebook_campaigns(ads_account_id);
CREATE INDEX IF NOT EXISTS idx_facebook_campaigns_status ON facebook_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_facebook_adsets_campaign_id ON facebook_ad_sets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_facebook_ads_adset_id ON facebook_ads(adset_id);
CREATE INDEX IF NOT EXISTS idx_facebook_lead_forms_page_id ON facebook_lead_forms(page_id);
CREATE INDEX IF NOT EXISTS idx_facebook_leads_form_id ON facebook_leads(lead_form_id);
CREATE INDEX IF NOT EXISTS idx_facebook_posts_page_id ON facebook_posts(page_id);
CREATE INDEX IF NOT EXISTS idx_facebook_conversions_pixel_id ON facebook_conversions(pixel_id);
CREATE INDEX IF NOT EXISTS idx_facebook_conversions_event_name ON facebook_conversions(event_name);
CREATE INDEX IF NOT EXISTS idx_facebook_catalog_products_product_id ON facebook_catalog_products(product_id);
CREATE INDEX IF NOT EXISTS idx_facebook_messages_page_id ON facebook_messages(page_id);
