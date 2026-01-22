# SEO Verification & Setup Checklist ✅

## 📊 Facebook Conversions API - CONFIGURED ✅

Your Meta Pixel and Conversions API credentials have been retrieved from the database and added to `.env.local`:

```bash
META_PIXEL_ID=932014878052619
META_CONVERSIONS_API_TOKEN=EAAWcOaIQDsEBQ...
META_TEST_EVENT_CODE=TEST15893
NEXT_PUBLIC_META_PIXEL_ID=932014878052619
```

### Test Your Facebook Events

1. **Open Facebook Events Manager**
   - URL: https://business.facebook.com/events_manager2/list/pixel/932014878052619/test_events
   - Look for the "Test Events" tab

2. **Verify Events in Test Mode** (using TEST15893)
   - PageView
   - ViewContent
   - AddToCart
   - InitiateCheckout
   - Purchase

3. **Check Event Quality Score**
   - Go to Events Manager > Overview
   - Verify connection status is "Active"
   - Check event match quality (aim for 8.0+)

---

## 🔍 Google Search Console - Sitemap Submission

### Step 1: Add Your Property

1. **Go to Google Search Console**
   - URL: https://search.google.com/search-console

2. **Add a Property**
   - Click "Add Property"
   - Choose "URL prefix"
   - Enter: `https://namecheap.to`
   - Click "Continue"

### Step 2: Verify Ownership

Choose one of these verification methods:

**Option A: HTML Tag (Recommended)**
1. Copy the meta tag provided by Google
2. Add it to `/app/layout.tsx` in the `<head>` section:
```tsx
<head>
  <meta name="google-site-verification" content="YOUR_CODE_HERE" />
  {/* ... other head content */}
</head>
```

**Option B: DNS Verification**
1. Add a TXT record to your domain's DNS settings
2. Use the code provided by Google

**Option C: HTML File Upload**
1. Download the HTML verification file
2. Upload to `/public` directory

### Step 3: Submit Sitemap

After verification is successful:

1. **Navigate to Sitemaps**
   - In Google Search Console sidebar, click "Sitemaps"

2. **Add New Sitemap**
   - Enter: `https://namecheap.to/sitemap.xml`
   - Click "Submit"

3. **Verify Sitemap Status**
   - Wait 5-10 minutes
   - Refresh the page
   - Status should show "Success" with number of discovered URLs

---

## 🎯 Rich Results Test - Structured Data Validation

### Test Your Structured Data

1. **Go to Rich Results Test**
   - URL: https://search.google.com/test/rich-results

2. **Test Your Homepage**
   - Enter URL: `https://namecheap.to`
   - Click "Test URL"

3. **Verify These Schemas**
   - ✅ **Organization**: Company info, logo, social profiles
   - ✅ **WebSite**: Site name, search action
   - ✅ **BreadcrumbList**: Navigation structure

4. **Expected Results**
   ```
   ✅ Organization schema detected
   ✅ WebSite schema detected
   ✅ BreadcrumbList schema detected
   ✅ No errors or warnings
   ```

5. **Test Product Pages**
   - Test a product URL: `https://namecheap.to/product/[slug]`
   - Verify product schema (if implemented)

---

## 🔗 Additional SEO Tools to Verify

### 1. Meta Tags Validator
- **Open Graph**: https://www.opengraph.xyz/
  - Enter: `https://namecheap.to`
  - Verify social media preview looks good

### 2. Twitter Card Validator
- **Twitter**: https://cards-dev.twitter.com/validator
  - Test how your site appears on Twitter

### 3. Robots.txt Test
- **Direct URL**: https://namecheap.to/robots.txt
- **Expected Output**:
  ```txt
  User-Agent: *
  Allow: /
  Disallow: /admin/
  Disallow: /api/
  Disallow: /checkout/success/
  
  User-Agent: Googlebot
  Allow: /
  Disallow: /admin/
  
  Sitemap: https://namecheap.to/sitemap.xml
  ```

### 4. Sitemap.xml Verification
- **Direct URL**: https://namecheap.to/sitemap.xml
- **Should Include**:
  - Homepage (priority: 1.0)
  - /shop (priority: 0.9)
  - All product pages (priority: 0.8)
  - /cart, /wishlist (priority: 0.5)

---

## 📈 Facebook Analytics - Monitor Conversion Data

### Events Manager Dashboard

1. **Access Your Pixel**
   - URL: https://business.facebook.com/events_manager2/list/pixel/932014878052619/overview

2. **Key Metrics to Monitor**
   - **PageView**: Should track on every page load
   - **ViewContent**: Tracks product page views
   - **AddToCart**: Monitors cart additions
   - **InitiateCheckout**: Checkout page visits
   - **Purchase**: Completed orders

3. **Event Debugging**
   - Click on any event name
   - View "Event Details"
   - Check parameters are being sent correctly:
     ```json
     {
       "content_ids": ["123"],
       "content_name": "Product Name",
       "currency": "PKR",
       "value": 1999
     }
     ```

4. **Conversions API Events**
   - Look for "Server" badge on events
   - Dual tracking should show both "Browser" and "Server"
   - Event deduplication should be working

---

## ✅ Complete Setup Checklist

### Environment Variables ✅
- [x] META_PIXEL_ID configured
- [x] META_CONVERSIONS_API_TOKEN configured
- [x] META_TEST_EVENT_CODE configured
- [x] NEXT_PUBLIC_META_PIXEL_ID configured

### Facebook Setup
- [ ] Verify events in Test Events tab
- [ ] Check event match quality score
- [ ] Move from test mode to production (remove TEST_EVENT_CODE after testing)
- [ ] Monitor conversions in Ads Manager

### Google Search Console
- [ ] Add property (namecheap.to)
- [ ] Verify ownership
- [ ] Submit sitemap (sitemap.xml)
- [ ] Wait for indexing (1-2 weeks)
- [ ] Monitor search performance

### SEO Validation
- [ ] Test Rich Results (Organization, WebSite, BreadcrumbList)
- [ ] Validate OpenGraph tags
- [ ] Test Twitter Cards
- [ ] Verify robots.txt
- [ ] Check sitemap.xml loads correctly

### Performance Tracking
- [ ] Monitor PageView events
- [ ] Track product view funnel
- [ ] Analyze cart abandonment
- [ ] Review purchase conversions
- [ ] Check event quality score weekly

---

## 🚀 Next Steps After Verification

1. **Move to Production**
   - Remove or comment out `META_TEST_EVENT_CODE` in `.env.local`
   - Events will start counting toward real data

2. **Set Up Conversion Events in Ads Manager**
   - Go to Ads Manager > Events Manager
   - Configure Purchase as primary conversion event
   - Set up custom conversions for specific products/categories

3. **Create Facebook Ads Campaigns**
   - Use Purchase event for optimization
   - Target audiences based on tracked events
   - Use Conversions objective

4. **Monitor SEO Performance**
   - Check Google Search Console weekly
   - Track keyword rankings for "namecheap" variations
   - Monitor click-through rates
   - Analyze search impressions

5. **Optimize Based on Data**
   - Review top-performing keywords
   - Identify high-converting products
   - A/B test landing pages
   - Improve product descriptions for SEO

---

## 📞 Support Resources

- **Facebook Events Manager**: https://business.facebook.com/events_manager2
- **Conversions API Docs**: https://developers.facebook.com/docs/marketing-api/conversions-api
- **Google Search Console**: https://search.google.com/search-console
- **Rich Results Test**: https://search.google.com/test/rich-results
- **Schema.org Docs**: https://schema.org/

---

## 🎉 Success Indicators

Your setup is successful when you see:

✅ **Facebook Events**
- Events appearing in Test Events tab
- Both browser and server events showing up
- Event match quality score > 7.0
- All 5 core events tracking (PageView, ViewContent, AddToCart, Checkout, Purchase)

✅ **Google Search Console**
- Property verified
- Sitemap submitted and processed
- Pages being indexed (check "Coverage" report)
- Search appearance increasing over time

✅ **Rich Results**
- No errors in structured data test
- Organization, WebSite, BreadcrumbList schemas validated
- Preview looks good in search results

---

Last Updated: January 18, 2026
Pixel ID: 932014878052619
