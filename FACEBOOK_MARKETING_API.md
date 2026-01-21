# Facebook Marketing API Integration

## Overview

This implementation provides a complete integration with Facebook Marketing API (Meta API v19.0), enabling management of:

- **Ad Accounts & Campaigns**: Create, view, and manage ad campaigns
- **Lead Forms & Leads**: Capture and manage leads from Facebook Lead Forms
- **Pages & Posts**: Manage Facebook pages and monitor post performance
- **Pixel Events**: Send conversion data via Facebook Conversion API
- **Catalogs**: Manage product catalogs for Dynamic Ads

## Database Schema

The integration uses the following tables (created by `scripts/05-facebook-marketing-schema.sql`):

### Core Tables
- **facebook_accounts**: Business account connections
- **facebook_pages**: Connected Facebook pages
- **facebook_ads_accounts**: Ad account details

### Campaign Management
- **facebook_campaigns**: Ad campaign data with performance metrics
- **facebook_ad_sets**: Ad set configuration and performance
- **facebook_ads**: Individual ads with metrics and targeting

### Leads
- **facebook_lead_forms**: Lead generation forms
- **facebook_leads**: Captured leads from forms

### Content
- **facebook_posts**: Page posts with engagement metrics
- **facebook_messages**: Page inbox messages

### Conversions & Catalog
- **facebook_conversions**: Pixel/Conversion API events
- **facebook_catalogs**: Product catalogs
- **facebook_catalog_products**: Catalog products with sync status

## API Endpoints

### Business Accounts
```
GET /api/facebook/accounts
Returns: { success, accounts[] }
```

### Account Details
```
GET /api/facebook/accounts/[accountId]
Returns: { success, adAccounts[], pages[] }
```

### Campaigns
```
GET /api/facebook/campaigns/[adAccountId]?status=ACTIVE,PAUSED&limit=100
Returns: { success, campaigns[] }

POST /api/facebook/campaigns/[adAccountId]
Body: { name, objective, status? }
Returns: { success, campaign }
```

### Lead Forms
```
GET /api/facebook/leads/forms/[pageId]
Returns: { success, forms[] }
```

### Form Leads
```
GET /api/facebook/leads/[formId]?limit=100
Returns: { success, leads[] }
```

### Posts
```
GET /api/facebook/posts/[pageId]?limit=50
Returns: { success, posts[] }
```

### Pixel Events (Conversion API)
```
POST /api/facebook/pixel
Body: {
  pixelId: string,
  eventName: string, // PageView, ViewContent, AddToCart, Purchase, etc.
  email?: string,
  phone?: string,
  value?: number,
  currency?: string
}
Returns: { success, message, result }
```

## Admin UI

Navigate to the admin dashboard and access Facebook Marketing features:

### Main Dashboard
**Path**: `/admin/facebook`
- Overview of connected accounts
- Quick stats (connected accounts, ad accounts, active campaigns)
- Business account management

### Campaigns
**Path**: `/admin/facebook/campaigns`
- View all active and paused campaigns
- Real-time performance metrics (impressions, clicks, spend)
- Create new campaigns with different objectives
- Available objectives:
  - REACH: Maximize reach to target audience
  - CONVERSIONS: Drive purchase conversions
  - VIDEO_VIEWS: Get more video views
  - TRAFFIC: Drive traffic to website
  - BRAND_AWARENESS: Increase brand awareness

### Leads
**Path**: `/admin/facebook/leads`
- Browse lead forms by page
- View captured leads with all field data
- Search and filter leads
- Monitor lead generation performance

### Pages
**Path**: `/admin/facebook/pages`
- List all connected Facebook pages
- View page statistics (followers, category)
- Page ID reference
- Quick navigation to leads and posts

### Posts
**Path**: `/admin/facebook/posts`
- View page posts with engagement metrics
- Track impressions, clicks, and engagement rate
- Monitor content performance
- Real-time insights

## Service Usage

### Basic Usage

```typescript
import { getFacebookMarketingClient } from "@/lib/facebook-marketing"

// Initialize client
const client = getFacebookMarketingClient()

// Get business accounts
const accounts = await client.getBusinessAccounts()

// Get ad accounts for a business
const adAccounts = await client.getAdAccounts(businessId)

// Get campaigns
const campaigns = await client.getCampaigns(adAccountId, {
  status: ["ACTIVE"],
  limit: 100
})

// Get campaign insights
const insights = await client.getCampaignInsights(campaignId)

// Create a campaign
const newCampaign = await client.createCampaign(adAccountId, {
  name: "Summer Sale Campaign",
  objective: "CONVERSIONS",
  status: "PAUSED"
})
```

### Lead Forms

```typescript
// Get lead forms for a page
const forms = await client.getLeadForms(pageId)

// Get leads from a specific form
const leads = await client.getFormLeads(formId, { limit: 100 })
```

### Posts

```typescript
// Get page posts
const posts = await client.getPagePosts(pageId, { limit: 50 })

// Get post insights
const insights = await client.getPostInsights(postId)

// Create a post
const post = await client.createPost(pageId, {
  message: "Check out our new products!",
  link: "https://yoursite.com/products"
})
```

### Pixel Events (Conversion API)

```typescript
// Send a pixel event
await client.sendPixelEvent(pixelId, {
  event_id: `event_${Date.now()}`,
  event_name: "Purchase",
  event_time: Math.floor(Date.now() / 1000),
  action_source: "website",
  user_data: {
    em: "hashed_email",
    ph: "hashed_phone"
  },
  custom_data: {
    value: 99.99,
    currency: "USD",
    content_name: "Product Name"
  }
})
```

### Catalogs

```typescript
// Create a catalog
const catalog = await client.createCatalog(businessId, {
  name: "Product Catalog",
  catalog_type: "PRODUCT"
})

// Add product to catalog
await client.addProductToCatalog(catalogId, {
  retailer_id: "SKU123",
  title: "Product Name",
  price: 99.99,
  currency: "USD",
  image_url: "https://...",
  url: "https://yoursite.com/product",
  availability: "IN_STOCK"
})
```

## Environment Variables

Required in `.env.local`:

```env
# Facebook API Credentials
META_ACCESS_TOKEN=your_access_token_here

# Facebook App (optional, for OAuth)
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_REDIRECT_URI=http://localhost:3000/api/auth/facebook/callback
```

The access token can be obtained from:
1. Facebook Business Manager
2. App Roles section
3. Generate a system user token
4. Or use Graph API to get a long-lived token

## Key Features

### ✅ Campaign Management
- Real-time campaign metrics
- Create campaigns with different objectives
- Track spend and performance
- Filter by status (ACTIVE, PAUSED, etc.)

### ✅ Lead Generation
- Collect leads from Facebook Lead Forms
- Structured field data capture
- Lead attribution to ad campaigns
- Export and analyze leads

### ✅ Content Management
- Monitor page posts
- Track engagement metrics
- Real-time post insights
- Create posts directly from admin

### ✅ Conversion Tracking
- Send events via Conversion API
- User data hashing (email, phone)
- Custom event tracking
- Development mode support

### ✅ Audience Insights
- Get audience size estimates
- Targeting capabilities preview
- Audience composition data

## Best Practices

1. **Access Tokens**: Keep access tokens secure and regenerate regularly
2. **Rate Limiting**: Facebook API has rate limits; implement caching
3. **Error Handling**: Always wrap API calls in try-catch blocks
4. **Data Privacy**: Hash user data before sending to Conversion API
5. **Testing**: Use test_event_code in development mode
6. **Permissions**: Ensure your app has required permissions:
   - ads_management
   - pages_manage_posts
   - pages_read_engagement
   - lead_retrieval

## Troubleshooting

### "Access token not valid"
- Verify token hasn't expired
- Regenerate token from Business Manager
- Check token permissions

### "Insufficient permissions"
- Add required permissions to app
- Reinstall app and re-grant permissions
- Check Business Manager role

### "Invalid objective"
- Use exact objective names (REACH, CONVERSIONS, VIDEO_VIEWS, etc.)
- Check Facebook API documentation for latest objectives

### Rate Limiting
- Implement request caching (Redis recommended)
- Add delays between batch requests
- Use batch API for multiple requests

## Integration Points

### With Existing Features
- **Email Campaigns**: Lead data can be exported to email campaigns
- **Analytics**: Campaign metrics feed into analytics dashboard
- **Product Catalog**: Sync products to Facebook catalog for dynamic ads
- **WhatsApp**: Lead data can trigger WhatsApp follow-ups

### Webhooks
Set up webhooks to receive real-time updates:
- Campaign status changes
- Lead form submissions
- Page message received
- Post engagement updates

## Future Enhancements

- [ ] Automatic lead data sync to CRM
- [ ] Lead scoring based on engagement
- [ ] Dynamic catalog sync with products
- [ ] Automated campaign optimization
- [ ] Lead form creation from admin UI
- [ ] Message inbox integration
- [ ] A/B testing automation
