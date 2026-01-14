-- Save Meta Pixel configuration (defaults)
-- This script saves the provided Meta Pixel credentials and settings

BEGIN;

-- Delete any existing configuration
DELETE FROM meta_pixel_config;

-- Insert the default configuration with your credentials
INSERT INTO meta_pixel_config (
  pixel_id,
  access_token,
  test_event_code,
  is_active,
  enable_automatic_events,
  enable_advanced_matching,
  created_at,
  updated_at
) VALUES (
  '932014878052619',
  'EAAWcOaIQDsEBQfVCS3wU1K4zpLZB4bRwQZBRIUrtlZAFMr7HtUliWWmSt8rqCz95bRz3fQZCbX0TolZBgpBpvu42lM8lhaOv7n8scjazNcENBFqj440vjkbkAHENhZBo43LE4s4fpxk3jZAxGqzvNnesZAXaZCPrB8WQijU1TGwPEFLWtEmUmMyzyU7iNGKJmcAZDZD',
  'TEST15893',
  true,
  true,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Verify the configuration was saved
SELECT * FROM meta_pixel_config ORDER BY id DESC LIMIT 1;

COMMIT;
