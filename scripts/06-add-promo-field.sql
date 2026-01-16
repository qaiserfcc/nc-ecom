-- Add promo/offer field to social_content_formats
ALTER TABLE social_content_formats ADD COLUMN IF NOT EXISTS promo_offer VARCHAR(500);
ALTER TABLE social_content_formats ADD COLUMN IF NOT EXISTS include_website BOOLEAN DEFAULT TRUE;

-- Add blob_url to store Vercel Blob URLs
ALTER TABLE social_content_formats ADD COLUMN IF NOT EXISTS blob_media_url VARCHAR(1000);
ALTER TABLE social_content_formats ADD COLUMN IF NOT EXISTS blob_media_type VARCHAR(50); -- 'image' or 'video'

-- Add indexes for blob storage
CREATE INDEX IF NOT EXISTS idx_social_content_formats_blob_media_url ON social_content_formats(blob_media_url);
