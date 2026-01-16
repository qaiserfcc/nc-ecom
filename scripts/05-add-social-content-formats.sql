-- Add columns for format-specific content and media to social_content table
ALTER TABLE social_content ADD COLUMN IF NOT EXISTS media_url VARCHAR(500);
ALTER TABLE social_content ADD COLUMN IF NOT EXISTS media_type VARCHAR(50); -- 'image', 'video'

-- Add columns for format-specific versions
ALTER TABLE social_content ADD COLUMN IF NOT EXISTS facebook_post TEXT;
ALTER TABLE social_content ADD COLUMN IF NOT EXISTS facebook_story TEXT;
ALTER TABLE social_content ADD COLUMN IF NOT EXISTS facebook_reel TEXT;
ALTER TABLE social_content ADD COLUMN IF NOT EXISTS instagram_post TEXT;
ALTER TABLE social_content ADD COLUMN IF NOT EXISTS instagram_story TEXT;
ALTER TABLE social_content ADD COLUMN IF NOT EXISTS instagram_reel TEXT;

-- Add columns to track individual posting status
ALTER TABLE social_content ADD COLUMN IF NOT EXISTS facebook_post_status VARCHAR(50) DEFAULT 'draft';
ALTER TABLE social_content ADD COLUMN IF NOT EXISTS facebook_story_status VARCHAR(50) DEFAULT 'draft';
ALTER TABLE social_content ADD COLUMN IF NOT EXISTS facebook_reel_status VARCHAR(50) DEFAULT 'draft';
ALTER TABLE social_content ADD COLUMN IF NOT EXISTS instagram_post_status VARCHAR(50) DEFAULT 'draft';
ALTER TABLE social_content ADD COLUMN IF NOT EXISTS instagram_story_status VARCHAR(50) DEFAULT 'draft';
ALTER TABLE social_content ADD COLUMN IF NOT EXISTS instagram_reel_status VARCHAR(50) DEFAULT 'draft';

-- Add posted timestamps for each format
ALTER TABLE social_content ADD COLUMN IF NOT EXISTS facebook_post_posted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE social_content ADD COLUMN IF NOT EXISTS facebook_story_posted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE social_content ADD COLUMN IF NOT EXISTS facebook_reel_posted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE social_content ADD COLUMN IF NOT EXISTS instagram_post_posted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE social_content ADD COLUMN IF NOT EXISTS instagram_story_posted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE social_content ADD COLUMN IF NOT EXISTS instagram_reel_posted_at TIMESTAMP WITH TIME ZONE;

-- Create table for storing generated format-specific content versions
CREATE TABLE IF NOT EXISTS social_content_formats (
  id SERIAL PRIMARY KEY,
  social_content_id INTEGER NOT NULL REFERENCES social_content(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL, -- 'facebook', 'instagram'
  format VARCHAR(50) NOT NULL, -- 'post', 'story', 'reel'
  content TEXT NOT NULL,
  title VARCHAR(255),
  hashtags TEXT,
  cta VARCHAR(255),
  media_url VARCHAR(500),
  media_type VARCHAR(50), -- 'image', 'video'
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'posted', 'failed'
  posted_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  external_id VARCHAR(255), -- Social media post ID from API
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(social_content_id, platform, format)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_social_content_formats_social_content_id ON social_content_formats(social_content_id);
CREATE INDEX IF NOT EXISTS idx_social_content_formats_platform_format ON social_content_formats(platform, format);
CREATE INDEX IF NOT EXISTS idx_social_content_formats_status ON social_content_formats(status);
