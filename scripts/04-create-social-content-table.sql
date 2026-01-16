-- Create social_content table for storing AI-generated content
CREATE TABLE IF NOT EXISTS social_content (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL, -- 'facebook', 'instagram', 'both'
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  hashtags TEXT,
  image_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'scheduled', 'posted', 'failed'
  scheduled_at TIMESTAMP WITH TIME ZONE,
  posted_at TIMESTAMP WITH TIME ZONE,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5, 2),
  ad_type VARCHAR(50), -- 'free', 'paid', 'boosted'
  ad_budget DECIMAL(10, 2),
  ad_start_date TIMESTAMP WITH TIME ZONE,
  ad_end_date TIMESTAMP WITH TIME ZONE,
  ad_status VARCHAR(50), -- 'active', 'paused', 'ended', 'pending'
  target_audience VARCHAR(255),
  performance_data JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(product_id, platform, posted_at)
);

-- Create social_content_history table for tracking changes
CREATE TABLE IF NOT EXISTS social_content_history (
  id SERIAL PRIMARY KEY,
  social_content_id INTEGER NOT NULL REFERENCES social_content(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  action VARCHAR(100),
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Create social_account table for storing connected accounts
CREATE TABLE IF NOT EXISTS social_accounts (
  id SERIAL PRIMARY KEY,
  platform VARCHAR(50) NOT NULL, -- 'facebook', 'instagram'
  account_name VARCHAR(255) NOT NULL,
  account_id VARCHAR(255) NOT NULL,
  access_token VARCHAR(1000) NOT NULL,
  refresh_token VARCHAR(1000),
  token_expires_at TIMESTAMP WITH TIME ZONE,
  followers_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  connected_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(platform, account_id)
);

-- Create social_automation_schedule table
CREATE TABLE IF NOT EXISTS social_automation_schedule (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  frequency VARCHAR(50), -- 'daily', 'weekly', 'custom'
  day_of_week INTEGER, -- 0-6 for weekly
  time_of_day TIME,
  generate_count INTEGER DEFAULT 3, -- Number of posts to generate daily
  selected_platforms TEXT[], -- Array of platforms
  content_type VARCHAR(50), -- 'promotional', 'educational', 'entertainment'
  include_hashtags BOOLEAN DEFAULT true,
  hashtag_count INTEGER DEFAULT 5,
  use_product_images BOOLEAN DEFAULT true,
  enable_ai_optimization BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  run_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_social_content_product_id ON social_content(product_id);
CREATE INDEX IF NOT EXISTS idx_social_content_platform ON social_content(platform);
CREATE INDEX IF NOT EXISTS idx_social_content_status ON social_content(status);
CREATE INDEX IF NOT EXISTS idx_social_content_scheduled_at ON social_content(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_social_content_created_at ON social_content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_social_accounts_is_active ON social_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_social_automation_schedule_active ON social_automation_schedule(is_active);
CREATE INDEX IF NOT EXISTS idx_social_automation_schedule_next_run ON social_automation_schedule(next_run_at);

-- Add a trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_social_content_updated_at BEFORE UPDATE ON social_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON social_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_automation_schedule_updated_at BEFORE UPDATE ON social_automation_schedule
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
