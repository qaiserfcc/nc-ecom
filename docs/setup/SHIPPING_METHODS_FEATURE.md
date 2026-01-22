# Shipping Methods Feature

This document explains the shipping methods feature implementation.

## Database Migration

To add shipping methods to your database, run the migration script:

```sql
-- Run this SQL file in your database
-- Location: scripts/05-shipping-methods.sql
```

Or if using PostgreSQL command line:
```bash
psql YOUR_DATABASE_URL -f scripts/05-shipping-methods.sql
```

## Features Implemented

### 1. Lighter Orange Color Theme
- Updated primary color from `oklch(0.65 0.2 45)` to `oklch(0.72 0.18 45)`
- Updated hardcoded orange colors in landing page/story page
- Gradient colors lightened from `#ff5f00` to `#ff8f40`

### 2. Currency - Rs (Already Implemented)
- The application already uses "Rs" as currency throughout
- No changes needed for currency symbol

### 3. Shipping Methods Management (Admin)

Access: `/admin/shipping-methods`

**Features:**
- Create, Edit, Delete shipping methods
- Toggle active/inactive status
- Configure:
  - Name and description
  - Base cost
  - Minimum order amount for free shipping
  - Location type (All, Lahore, Outside Lahore)
  - Same-day delivery option
  - Sort order

**Default Shipping Methods (Pre-configured):**
1. Free Shipping - Free for orders over Rs 2999
2. Standard Shipping - Rs 650 for orders below Rs 2999
3. Same Day Delivery - Lahore - Rs 1000
4. Same Day Delivery - Outside Lahore - Rs 1500

### 4. Checkout Integration

**Customer Experience:**
1. Select delivery location (All, Lahore, Outside Lahore)
2. See applicable shipping methods based on:
   - Order total
   - Selected location
   - Active status
3. Select preferred shipping method
4. For same-day delivery: select delivery time slot
   - Morning (9 AM - 12 PM)
   - Afternoon (12 PM - 3 PM)
   - Evening (3 PM - 6 PM)
   - Night (6 PM - 9 PM)
5. Shipping cost is calculated and added to order total

## API Endpoints

### Shipping Methods
- `GET /api/shipping-methods` - List all shipping methods (add `?activeOnly=true` for active only)
- `POST /api/shipping-methods` - Create new shipping method (Admin only)
- `GET /api/shipping-methods/[id]` - Get single shipping method
- `PUT /api/shipping-methods/[id]` - Update shipping method (Admin only)
- `DELETE /api/shipping-methods/[id]` - Delete shipping method (Admin only)

### Orders
- Updated `POST /api/orders` to accept:
  - `shipping_method_id` - Selected shipping method
  - `shipping_cost` - Calculated shipping cost
  - `delivery_time` - Preferred delivery time (for same-day)
  - `delivery_location` - Delivery location type

## Database Schema

### shipping_methods Table
```sql
- id (SERIAL PRIMARY KEY)
- name (TEXT NOT NULL)
- description (TEXT)
- base_cost (DECIMAL(10, 2) NOT NULL DEFAULT 0)
- min_order_amount (DECIMAL(10, 2))
- max_order_amount (DECIMAL(10, 2))
- is_free_shipping (BOOLEAN DEFAULT FALSE)
- location_type (TEXT) -- 'all', 'lahore', 'out_of_lahore'
- is_same_day (BOOLEAN DEFAULT FALSE)
- is_active (BOOLEAN DEFAULT TRUE)
- sort_order (INTEGER DEFAULT 0)
- created_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
```

### orders Table (New Fields)
```sql
- shipping_method_id (INTEGER REFERENCES shipping_methods(id))
- shipping_cost (DECIMAL(10, 2) DEFAULT 0)
- delivery_time (TEXT)
- delivery_location (TEXT)
```

## Testing Checklist

- [ ] Run database migration script
- [ ] Access admin panel at `/admin/shipping-methods`
- [ ] Create/edit/delete shipping methods
- [ ] Test checkout flow:
  - [ ] Select different locations
  - [ ] Verify correct shipping methods appear
  - [ ] Test free shipping threshold (Rs 2999)
  - [ ] Select same-day delivery and choose time slot
  - [ ] Verify shipping cost in order summary
- [ ] Place test order and verify shipping details are saved
- [ ] Check order details show shipping method and delivery time

## Notes

- Shipping methods are filtered based on order amount and location
- Free shipping is automatically applied when order meets minimum amount
- Same-day delivery time selection only appears for same-day methods
- Admin can activate/deactivate methods without deleting them
- Sort order determines display order in checkout
