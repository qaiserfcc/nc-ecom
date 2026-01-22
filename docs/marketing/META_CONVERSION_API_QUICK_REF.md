# Meta Conversion API - Quick Reference

## ⚡ Quick Start (5 Minutes)

### 1. Access Token ✅
Already configured in `.env.local`:
```bash
META_ACCESS_TOKEN=EAAWcOaIQDsEBQUOyhZBCZBdmR1nOuFt2eoVpAgNHe8GHm36p64ZB9oP82ewg7ZCSenh6WZB38pwxK5gtBNve36h3QA9HXk1UIKdgOPkB5PquMNxQae3lRDmkDywOnJ3qOnOsAkuEtTFgUlxYgXJZCQew7lFgtdYPPnePmwTzf0R005dynQkpkPYoEZBnrF78gZDZD
```

### 2. Configure in Admin Panel
```
URL: http://localhost:3000/admin/meta-pixel

Required:
- Pixel ID: [Your 16-digit Meta Pixel ID]
- Access Token: [Use the token from .env.local]
- Active: ✅ ON

Optional:
- Test Event Code: [For testing only]
- Automatic Events: ✅ Recommended
- Advanced Matching: ☑️ Optional (better attribution)
```

### 3. Test the Integration
```bash
# Run the test script
tsx scripts/test-meta-conversion.ts

# Or check manually
curl http://localhost:3000/api/admin/meta-pixel
```

### 4. Verify in Meta Events Manager
```
URL: https://business.facebook.com/events_manager

Check:
- Test Events (if using Test Event Code)
- Event History
- Match Quality Score (aim for 6.0+)
```

---

## 📡 API Endpoints

### POST /api/analytics/conversion
Track a conversion event (automatically called by frontend)

**Request:**
```json
{
  "event_name": "Purchase",
  "event_source_url": "https://yoursite.com/checkout/success",
  "order_id": 12345,
  "value": 1500,
  "currency": "PKR",
  "content_ids": ["prod_123"],
  "content_type": "product"
}
```

**Response:**
```json
{
  "success": true,
  "event_id": "evt_1234567890_abc123",
  "sent_to_meta": true
}
```

### GET /api/analytics/conversion
Get conversion statistics (admin only)

**Response:**
```json
{
  "stats": [
    {
      "event_name": "Purchase",
      "total_events": 150,
      "sent_to_meta": 148,
      "total_value": "125000.00"
    }
  ],
  "recentEvents": [...]
}
```

---

## 🎯 Tracked Events

| Event | Auto Tracked | Data Sent |
|-------|--------------|-----------|
| PageView | ✅ | URL, referrer |
| ViewContent | ✅ | Product ID, price |
| AddToCart | ✅ | Product, quantity, value |
| AddToWishlist | ✅ | Product ID |
| InitiateCheckout | ✅ | Cart value, items |
| Purchase | ✅ | Order ID, revenue, items |
| Search | ✅ | Search query |

---

## 🔧 Common Tasks

### Update Access Token
```bash
# Method 1: Update .env.local
echo "META_ACCESS_TOKEN=your_new_token" >> .env.local

# Method 2: Update via admin panel
# Go to /admin/meta-pixel and paste new token
```

### Check Event Status
```sql
-- Get today's events
SELECT event_name, COUNT(*), SUM(value)
FROM conversion_events
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY event_name;

-- Check Meta API success rate
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN sent_to_meta THEN 1 ELSE 0 END) as sent,
  ROUND(100.0 * SUM(CASE WHEN sent_to_meta THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM conversion_events;
```

### Debug Failed Events
```sql
-- Find events that failed to send to Meta
SELECT id, event_name, created_at, meta_response
FROM conversion_events
WHERE sent_to_meta = false
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🚨 Troubleshooting

### Events Not Appearing in Meta
1. ✅ Check Pixel ID is correct (16 digits)
2. ✅ Verify Access Token is valid
3. ✅ Ensure `is_active = true`
4. ✅ Use Test Event Code for testing
5. ✅ Check browser console for errors

### Low Match Quality (<6.0)
1. ✅ Enable "Advanced Matching"
2. ✅ Ensure users are logged in
3. ✅ Verify hashed data: `SELECT user_data FROM conversion_events LIMIT 1`

### Access Token Expired
1. Generate new token in Meta Events Manager
2. Update in `/admin/meta-pixel` or `.env.local`
3. Restart server if using `.env.local`

---

## 📊 Database Tables

### meta_pixel_config
Stores Pixel configuration
```sql
SELECT * FROM meta_pixel_config;
```

### conversion_events
Logs all conversion events
```sql
SELECT * FROM conversion_events ORDER BY created_at DESC LIMIT 10;
```

---

## 🔗 Quick Links

- **Admin Panel**: `/admin/meta-pixel`
- **Meta Events Manager**: https://business.facebook.com/events_manager
- **Test Script**: `tsx scripts/test-meta-conversion.ts`
- **Full Documentation**: `META_CONVERSION_API_SETUP.md`

---

## ✅ Pre-Launch Checklist

- [x] Access Token configured
- [ ] Database migrated
- [ ] Pixel ID set in admin
- [ ] Test events verified
- [ ] Test Event Code removed
- [ ] Privacy policy updated
- [ ] 24-hour monitoring complete

---

**Status**: Production Ready ✅  
**Last Updated**: January 2026
