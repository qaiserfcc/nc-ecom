# Meta Pixel Configuration - Setup Guide

## Overview
Your Meta Pixel credentials are now fully integrated and will be automatically saved to the database and loaded on every visit.

## Credentials Saved
```
Pixel ID: 932014878052619
Access Token: EAAWcOaIQDsEBQfVCS3wU1K4zpLZB4bRwQZBRIUrtlZAFMr7HtUliWWmSt8rqCz95bRz3fQZCbX0TolZBgpBpvu42lM8lhaOv7n8scjazNcENBFqj440vjkbkAHENhZBo43LE4s4fpxk3jZAxGqzvNnesZAXaZCPrB8WQijU1TGwPEFLWtEmUmMyzyU7iNGKJmcAZDZD
Test Event Code: TEST15893
```

## Quick Start

### Step 1: Initialize Configuration (One-Time)
1. Navigate to: `http://localhost:3000/admin/meta-pixel/init`
2. Click **"Save Meta Pixel Configuration"** button
3. Credentials will be saved to the database ✓

### Step 2: Verify Configuration (Every Visit After)
1. Go to: `http://localhost:3000/admin/meta-pixel`
2. Your saved credentials are **automatically loaded** from the database
3. All settings are pre-configured and ready to use

## Features Enabled by Default

✅ **Meta Pixel Tracking**: Active  
✅ **Automatic Events**: Enabled (PageView, ViewContent, etc.)  
✅ **Advanced Matching**: Enabled (hashed user data for better attribution)  
✅ **Conversion API**: Configured and ready

## How It Works

### Database Persistence
- Configuration is stored in the `meta_pixel_config` table
- GET `/api/admin/meta-pixel` - Fetches saved config from DB
- POST `/api/admin/meta-pixel` - Updates config in DB
- POST `/api/admin/meta-pixel/init` - Initializes/seeds with default credentials

### Auto-Load on Visit
1. Admin Meta Pixel page loads (`/admin/meta-pixel`)
2. Component fetches current config from DB via `useSWR`
3. `useEffect` hook updates the form with saved values
4. All fields pre-populated with your saved credentials
5. You can modify and re-save anytime

### Form Data Flow
```
Admin Page Load
    ↓
Fetch /api/admin/meta-pixel (DB)
    ↓
useEffect populates form state with DB values
    ↓
Form displays all saved settings
    ↓
User modifies (optional) and clicks Save
    ↓
POST /api/admin/meta-pixel (updates DB)
```

## Making Changes

### Modify Existing Configuration
1. Go to: `http://localhost:3000/admin/meta-pixel`
2. Edit any field (Pixel ID, Access Token, Test Event Code, etc.)
3. Toggle switches to enable/disable features
4. Click **"Save Configuration"**
5. Changes are instantly saved to the database

### Reset to Defaults
If you need to reset to default credentials:
```bash
curl -X POST http://localhost:3000/api/admin/meta-pixel/init \
  -H "Content-Type: application/json" \
  -d '{"pixel_id":"932014878052619",...}'
```

Or use the initialization page again at `/admin/meta-pixel/init`

## Database Schema

Configuration is stored in `meta_pixel_config` table:
```sql
CREATE TABLE meta_pixel_config (
  id SERIAL PRIMARY KEY,
  pixel_id VARCHAR(50),
  access_token TEXT,
  test_event_code VARCHAR(50),
  is_active BOOLEAN DEFAULT false,
  enable_automatic_events BOOLEAN DEFAULT true,
  enable_advanced_matching BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### GET Current Configuration
```
GET /api/admin/meta-pixel
Response: { pixel_id, access_token, test_event_code, is_active, ... }
```

### Save/Update Configuration
```
POST /api/admin/meta-pixel
Body: { pixel_id, access_token, test_event_code, is_active, ... }
Response: Updated configuration object
```

### Initialize with Default Credentials
```
POST /api/admin/meta-pixel/init
Body: (optional - uses defaults if not provided)
Response: { success: true, config: { ... } }
```

## Verification Checklist

- [x] Meta Pixel Pixel ID saved to database
- [x] Conversion API Access Token saved securely
- [x] Test Event Code configured
- [x] Configuration auto-loads on page visit
- [x] All features enabled by default
- [x] Changes persist across sessions
- [x] Form fields pre-populate from database

## Troubleshooting

### Configuration Not Loading
1. Check browser console for errors
2. Verify you're logged in as admin
3. Check database connection in `.env.local`
4. Clear browser cache and refresh

### Changes Not Saving
1. Ensure "Save Configuration" button was clicked
2. Check network tab for successful POST request
3. Verify no validation errors (e.g., Pixel ID required)
4. Check server logs for API errors

### Credentials Lost
1. Go to `/admin/meta-pixel/init` page
2. Click "Save Meta Pixel Configuration" again
3. This will re-seed the database with your credentials

## Next Steps

1. ✅ Configuration saved and auto-loading
2. Start tracking events on your website
3. Monitor events in Meta Events Manager
4. Test conversion tracking end-to-end
5. Adjust settings as needed in `/admin/meta-pixel`

---

**Last Updated**: January 14, 2026  
**Status**: ✅ Production Ready
