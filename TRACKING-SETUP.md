# Facebook Conversions API & SEO Setup Guide

## 🎯 Overview

This guide covers the complete setup for:
1. **Server-side event tracking** via Facebook Conversions API
2. **Aggressive SEO optimization** targeting "namecheap" keywords

---

## 📊 Facebook Conversions API Setup

### Step 1: Get Your Meta Pixel ID

1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager2)
2. Select your pixel or create a new one
3. Copy the **Pixel ID** (e.g., `123456789012345`)

### Step 2: Generate Conversions API Access Token

**Option A: System User Token (Recommended)**
1. Go to [Business Settings](https://business.facebook.com/settings/system-users)
2. Click **Add** to create a new system user
3. Assign the system user to your ad account with **Ads Management** permission
4. Click **Generate New Token**
5. Select the permissions: `ads_management`
6. Copy the token

**Option B: User Access Token**
1. Go to [Meta for Developers](https://developers.facebook.com/tools/explorer/)
2. Select your app
3. Generate a token with `ads_management` permission
4. Use this as `META_ACCESS_TOKEN`

### Step 3: Configure Environment Variables

Add to your `.env.local`:

```bash
# Required: Meta Pixel ID for client-side tracking
META_PIXEL_ID=your_pixel_id_here

# Required: Conversions API token for server-side tracking
# Use EITHER META_CONVERSIONS_API_TOKEN (recommended) OR META_ACCESS_TOKEN
META_CONVERSIONS_API_TOKEN=your_conversions_api_token_here

# Alternative: Main Facebook access token
# META_ACCESS_TOKEN=your_facebook_access_token_here

# Optional: Test event code for debugging
# Get from Events Manager > Test Events
# META_TEST_EVENT_CODE=TEST12345
```

### Step 4: Verify Client-Side Pixel

Add the Facebook Pixel to your site (if not already done):

1. In `/app/layout.tsx`, add the pixel script in the `<head>`:

```tsx
<Script id="facebook-pixel" strategy="afterInteractive">
  {`
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
    fbq('track', 'PageView');
  `}
</Script>
```

2. Add to your `.env.local`:
```bash
NEXT_PUBLIC_META_PIXEL_ID=your_pixel_id_here
```

### Step 5: Test Events

1. Go to [Events Manager](https://business.facebook.com/events_manager2)
2. Click **Test Events** in the sidebar
3. Browse your website with the test browser/extension
4. Verify events appear in real-time:
   - ✅ **PageView** - When any page loads
   - ✅ **ViewContent** - When viewing product pages
   - ✅ **AddToCart** - When adding products to cart
   - ✅ **InitiateCheckout** - When visiting checkout page
   - ✅ **Purchase** - When completing an order

---

## 🔍 SEO Setup

### Already Implemented

The following SEO optimizations are already active:

#### 1. **Robots.txt** (`/app/robots.ts`)
- Allows all search engines
- Blocks admin, API, and checkout success pages
- Sitemap reference included

#### 2. **Dynamic Sitemap** (`/app/sitemap.ts`)
- Static pages: Home, Shop, Cart, Wishlist
- Dynamic product pages (auto-updated)
- ISR with 1-hour revalidation
- Proper priorities and change frequencies

#### 3. **Enhanced Metadata** (`/app/layout.tsx`)
- Title: "Namecheap.to - Premium Domains, Hosting & SSL Certificates | Namecheap Deals"
- 20+ "namecheap" keyword variations
- Complete OpenGraph and Twitter Card tags
- Canonical URLs
- Structured data (JSON-LD)

#### 4. **Structured Data** (`/components/seo/structured-data.tsx`)
- Organization schema
- WebSite schema with search action
- BreadcrumbList schema

### Verify SEO Setup

1. **Test robots.txt**: Visit `https://yourdomain.com/robots.txt`
2. **Test sitemap**: Visit `https://yourdomain.com/sitemap.xml`
3. **Validate structured data**: Use [Google Rich Results Test](https://search.google.com/test/rich-results)
4. **Submit to search engines**:
   - [Google Search Console](https://search.google.com/search-console)
   - [Bing Webmaster Tools](https://www.bing.com/webmasters)

---

## 📈 Event Tracking Implementation

### Tracking Events

The following events are automatically tracked:

#### 1. **PageView**
- **When**: Every route change
- **Component**: `AutoPageViewTracker` in root layout
- **Data**: URL, referrer

#### 2. **ViewContent**
- **When**: Product page loads
- **File**: `/app/product/[id]/client.tsx`
- **Data**: Product ID, name, price

#### 3. **AddToCart**
- **When**: User adds product to cart
- **File**: `/app/product/[id]/client.tsx`
- **Data**: Product ID, name, price, quantity

#### 4. **InitiateCheckout**
- **When**: User visits checkout page with items
- **File**: `/app/checkout/page.tsx`
- **Data**: Cart contents, total value

#### 5. **Purchase**
- **When**: Order is successfully placed
- **File**: `/app/checkout/page.tsx`
- **Data**: Order ID, contents, value, customer info

### Dual Tracking Architecture

Each event is tracked **twice** for maximum accuracy:

1. **Client-side** (Facebook Pixel):
   ```js
   window.fbq('track', 'ViewContent', {...})
   ```

2. **Server-side** (Conversions API):
   ```js
   fetch('/api/events/view-content', {...})
   ```

This ensures iOS 14+ tracking works correctly and provides event deduplication.

---

## 🔐 Privacy & Security

### User Data Hashing

All personally identifiable information (PII) is hashed with SHA256 before sending:
- Email addresses
- Phone numbers
- Names
- Addresses

### Cookie Integration

The system automatically extracts:
- `_fbp` - Facebook Browser ID
- `_fbc` - Facebook Click ID

These help with event attribution and deduplication.

---

## 🐛 Troubleshooting

### Events Not Showing in Facebook

1. **Check environment variables**: Ensure `META_PIXEL_ID` and `META_CONVERSIONS_API_TOKEN` are set
2. **Verify token permissions**: Token must have `ads_management` permission
3. **Check browser console**: Look for errors in tracking calls
4. **Use test events**: Enable `META_TEST_EVENT_CODE` for debugging

### SEO Not Working

1. **Wait for indexing**: Search engines can take 1-2 weeks to index
2. **Check robots.txt**: Ensure it's not blocking search engines
3. **Submit sitemap**: Manually submit to Google Search Console
4. **Verify structured data**: Use Google's Rich Results Test

### Server-side Events Failing

1. **Check API routes**: Visit `/api/events/pageview` directly
2. **Verify IP extraction**: Ensure `x-forwarded-for` headers are present
3. **Check response**: Look for 200 status in Network tab
4. **Review server logs**: Check for Conversions API errors

---

## 📝 Next Steps

1. ✅ Configure `META_PIXEL_ID` and `META_CONVERSIONS_API_TOKEN`
2. ✅ Test events in Facebook Events Manager
3. ✅ Submit sitemap to Google Search Console
4. ✅ Monitor tracking data in Facebook Analytics
5. ✅ Optimize based on conversion funnel data

---

## 🔗 Useful Links

- [Facebook Events Manager](https://business.facebook.com/events_manager2)
- [Conversions API Documentation](https://developers.facebook.com/docs/marketing-api/conversions-api)
- [Google Search Console](https://search.google.com/search-console)
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Documentation](https://schema.org/)
