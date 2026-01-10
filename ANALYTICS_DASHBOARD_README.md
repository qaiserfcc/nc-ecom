# Enhanced Admin Dashboard and Analytics System

This document describes the enhanced admin dashboard and analytics system with Meta Pixel and Conversion API integration.

## Features

### 1. Enhanced Admin Dashboard (`/admin/dashboard`)

A comprehensive analytics dashboard with multiple visualization types:

- **Key Metrics Cards**: Revenue, Orders, Customers, Products, Views, Avg Order Value
- **Revenue Analytics**: Area charts showing revenue trends over time
- **Conversion Funnel**: Visualization of user journey from views to purchases
- **Product Performance**: Top selling and most viewed products
- **Customer Analytics**: Customer growth and top customers by spend
- **Hourly Distribution**: Order distribution by hour of day
- **Category Performance**: Revenue breakdown by product category
- **Time Period Filtering**: View data for 7 days, 30 days, 90 days, or 1 year

### 2. Meta Pixel & Conversion API Integration (`/admin/meta-pixel`)

Configure Facebook/Meta Pixel for advanced tracking:

- **Pixel Configuration**: Set Pixel ID and Access Token
- **Automatic Events**: Auto-track PageView, ViewContent, etc.
- **Advanced Matching**: Send hashed user data for better attribution
- **Test Mode**: Use Test Event Code for testing before going live
- **Event Stats**: View tracked events and their status
- **Server-Side Tracking**: Conversion API for reliable event tracking

### 3. Analytics Tracking System

#### Database Schema

New tables for enhanced analytics:

- **`analytics_events`**: Detailed event tracking with user, session, device, and location data
- **`meta_pixel_config`**: Configuration for Meta Pixel and Conversion API
- **`conversion_events`**: Meta Conversion API events log
- **`customer_analytics`**: Aggregated customer metrics and lifetime value
- **`product_performance`**: Daily product performance metrics

#### API Endpoints

- **`GET /api/admin/dashboard-analytics`**: Enhanced dashboard data with period filtering
- **`GET/POST /api/admin/meta-pixel`**: Meta Pixel configuration management
- **`POST /api/analytics/track`**: Track custom analytics events
- **`POST /api/analytics/conversion`**: Track Meta Conversion API events
- **`GET /api/analytics/conversion`**: Get conversion event statistics

### 4. Client-Side Tracking

#### Analytics Provider

Use the `AnalyticsProvider` in your components:

```tsx
import { useAnalyticsTracking } from "@/components/analytics/analytics-provider"

function ProductPage() {
  const { trackProductView } = useAnalyticsTracking()
  
  useEffect(() => {
    trackProductView(product.id, product.name, product.price)
  }, [product])
}
```

Available tracking methods:
- `trackPageView(url, title)`: Track page views
- `trackProductView(id, name, price)`: Track product views
- `trackAddToCart(id, name, price, quantity)`: Track add to cart
- `trackAddToWishlist(id, name)`: Track wishlist additions
- `trackPurchase(orderId, value, items)`: Track purchases
- `trackSearch(query)`: Track searches
- `trackCustomEvent(name, data)`: Track custom events

#### Meta Pixel

Meta Pixel is automatically loaded when configured and active. Events are tracked both client-side (Meta Pixel) and server-side (Conversion API) for maximum reliability.

## Setup Instructions

### 1. Database Migration

Run the enhanced analytics schema migration:

```bash
# Using tsx (recommended)
tsx scripts/init-db.ts

# Or manually run the SQL file
psql $DATABASE_URL -f scripts/06-enhanced-analytics-schema.sql
```

### 2. Meta Pixel Configuration

1. Go to [Meta Events Manager](https://business.facebook.com/events_manager)
2. Create or select your Pixel
3. Copy the Pixel ID (16-digit number)
4. Go to Events Manager → Settings → Conversions API → Generate Access Token
5. Navigate to `/admin/meta-pixel` in your app
6. Enter Pixel ID and Access Token
7. Enable the features you want to use
8. Use Test Event Code to verify events in Meta Events Manager
9. Once verified, remove Test Event Code and go live

### 3. Environment Variables

Add to your `.env` file (optional):

```bash
# Meta Pixel is configured via admin UI, but you can also set defaults
META_PIXEL_ID=your_pixel_id_here
META_ACCESS_TOKEN=your_access_token_here
```

## Analytics Events

### Automatically Tracked Events

- **PageView**: Every page view (if automatic events enabled)
- **ViewContent**: Product page views
- **AddToCart**: Items added to cart
- **AddToWishlist**: Items added to wishlist
- **Purchase**: Completed orders
- **Search**: Search queries

### Event Data Captured

Each event captures:
- User ID (if logged in)
- Session ID
- Device type (mobile, tablet, desktop)
- Browser information
- IP address and location (for geo-targeting)
- Referrer URL
- Event-specific data (product info, order details, etc.)

### Privacy & GDPR Compliance

- User data (email, phone) is hashed (SHA256) before sending to Meta
- No plain-text PII is transmitted
- IP addresses are anonymized where required
- Users can opt-out via cookie consent mechanisms

## Dashboard Analytics

### Metrics Calculated

- **Conversion Rate**: (Purchases / Views) × 100
- **Average Order Value**: Total Revenue / Total Orders
- **Customer Lifetime Value**: Sum of all customer orders
- **Category Performance**: Revenue and quantity sold by category
- **Product Performance**: Views, add-to-cart rate, conversion rate per product
- **Hourly Trends**: Order distribution by hour of day

### Performance Optimization

- Dashboard metrics can be cached for faster loading
- Database queries use indexes for performance
- API supports period filtering to reduce data load
- Chart data is aggregated on the server

## Troubleshooting

### Events Not Showing in Meta Events Manager

1. Check that Pixel is active in `/admin/meta-pixel`
2. Verify Pixel ID is correct (16 digits)
3. Use Test Event Code to see events in test mode
4. Check browser console for errors
5. Verify Access Token has Conversions API permissions

### Dashboard Data Not Loading

1. Check database connection
2. Verify analytics tables exist (run migration)
3. Check browser console for API errors
4. Verify user has admin role

### Conversion API Events Not Sending

1. Verify Access Token is set and valid
2. Check `/api/analytics/conversion` endpoint is accessible
3. Review conversion events in admin panel
4. Check `sent_to_meta` status in database

## Advanced Features

### Custom Events

Track custom events for specific business needs:

```tsx
const { trackCustomEvent } = useAnalyticsTracking()

trackCustomEvent("newsletter_signup", {
  source: "homepage",
  email_provided: true
})
```

### Product Performance Tracking

Automatically calculated daily for each product:
- View count
- Add-to-cart count
- Wishlist additions
- Purchases
- Revenue
- Conversion rate

### Customer Analytics

Automatically updated on each order:
- Total orders
- Total spent
- Average order value
- Last order date
- Customer lifetime value

## API Reference

### Dashboard Analytics

```
GET /api/admin/dashboard-analytics?period=7days

Response:
{
  overview: { totalRevenue, totalOrders, ... },
  revenueTrend: [...],
  ordersByStatus: [...],
  topSellingProducts: [...],
  mostViewedProducts: [...],
  conversionFunnel: { views, add_to_cart, purchases },
  ...
}
```

### Track Event

```
POST /api/analytics/track

Body:
{
  event_name: "view",
  product_id: 123,
  event_value: 99.99,
  event_data: { product_name: "Product Name" }
}
```

### Meta Conversion API

```
POST /api/analytics/conversion

Body:
{
  event_name: "Purchase",
  product_id: 123,
  order_id: 456,
  value: 199.99,
  currency: "PKR"
}
```

## Maintenance

### Database Cleanup

Consider implementing cleanup for old analytics data:

```sql
-- Remove events older than 1 year
DELETE FROM analytics_events WHERE created_at < NOW() - INTERVAL '1 year';

-- Remove old conversion events
DELETE FROM conversion_events WHERE created_at < NOW() - INTERVAL '90 days';
```

### Performance Monitoring

Monitor query performance:
- Check slow query logs
- Add indexes as needed
- Review dashboard load times
- Monitor API response times

## Future Enhancements

Potential improvements:
- A/B testing framework
- Real-time analytics dashboard
- Predictive analytics (customer churn, product recommendations)
- Email campaign tracking
- Attribution modeling
- Cohort analysis
- Revenue forecasting

## Support

For issues or questions:
1. Check this documentation
2. Review API error responses
3. Check database logs
4. Verify Meta Events Manager
5. Contact development team
