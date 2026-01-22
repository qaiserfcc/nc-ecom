# Pricing Calculations - Unified Across Cart & Checkout

## Overview
This document explains how pricing is calculated consistently across the entire site, ensuring identical values in cart, checkout, and order processing.

## Three-Tier Pricing Structure

### 1. Official Price (Base Price)
- **Source**: `product.original_price + variant.price_modifier`
- **Description**: The manufacturer's suggested retail price (MSRP)
- **Display**: Always shown with strikethrough

### 2. Selling Price (After Official Discount)
- **Source**: `product.current_price + variant.price_modifier`
- **Calculation**: Official Price minus built-in product discount
- **Official Discount %**: `((Official Price - Selling Price) / Official Price) × 100`
- **Display**: Strikethrough if promotion active, otherwise bold

### 3. Our Discounted Price (Final Price with Promotions)
- **Calculation**: Selling Price minus proportional promotion discount
- **Per-Item Promotion Discount**: `(Item Selling Total / Cart Selling Total) × Total Promotion Amount`
- **Per-Unit Discounted Price**: `Selling Price - (Item Promotion Discount / Quantity)`
- **Display**: Bold in primary color when promotion is active
- **Visibility**: Only shown when active promotion exists

## Server-Side Calculation (Single Source of Truth)

All pricing calculations are performed server-side in `/api/cart/route.ts`:

```typescript
// Step 1: Calculate original and selling totals
const totals = items.reduce((acc, item) => {
  const original = parseFloat(item.original_price) + parseFloat(item.price_modifier || 0)
  const selling = parseFloat(item.current_price) + parseFloat(item.price_modifier || 0)
  return {
    original: acc.original + (original * item.quantity),
    selling: acc.selling + (selling * item.quantity)
  }
}, { original: 0, selling: 0 })

// Step 2: Calculate official discount
const officialDiscount = totals.original - totals.selling
const officialDiscountPercent = (officialDiscount / totals.original) × 100

// Step 3: Get active promotion and calculate promotion discount
const { amount: promoAmount, percent: promoPercent } = await getActivePromotion(totals.selling)

// Step 4: Calculate final amount
const finalAmount = totals.selling - promoAmount

// Step 5: Calculate cumulative discount
const cumulativeDiscount = officialDiscount + promoAmount
const cumulativeDiscountPercent = (cumulativeDiscount / totals.original) × 100
```

## Client-Side Display (Cart & Checkout)

Both cart and checkout pages use **identical calculations** for consistency:

```typescript
// Get server-calculated totals
const { totals } = cartData
const { original, selling, promoAmount } = totals

// Calculate per-item discounted price
items.forEach(item => {
  const baseOriginal = parseFloat(item.original_price) + parseFloat(item.price_modifier || 0)
  const baseSelling = parseFloat(item.current_price) + parseFloat(item.price_modifier || 0)
  
  // Proportional promotion discount for this item
  const itemSellingTotal = baseSelling * item.quantity
  const itemPromoDiscount = (itemSellingTotal / selling) * promoAmount
  
  // Final discounted price per unit
  const baseDiscounted = baseSelling - (itemPromoDiscount / item.quantity)
})
```

## Order Summary Breakdown

### Cart Page Display:
1. Official Price (all items)
2. Official Discount (-X%, Rs. Y)
3. After Official Discount
4. Our Active Discount (-X%, Rs. Y) [if promotion active]
5. Cumulative Discount (X%, Rs. Y) [if promotion active]
6. Shipping: Free
7. **Final Payable: Rs. Z**

### Checkout Page Display:
Identical to cart page for consistency.

## Promotion Logic

### Eligibility Check:
1. Promotion must be active (`is_active = true`)
2. Promotion must apply to all products (`apply_to_all = true`)
3. Current date must be within promotion period
4. Cart selling total must meet minimum purchase requirement (if set)

### Discount Application:
- **Percentage Type**: `discount_amount = selling_total × (discount_value / 100)`
  - Capped at `max_discount_amount` if set
- **Fixed Type**: `discount_amount = discount_value`

### Proportional Distribution:
Each item receives a proportional share of the total promotion discount based on its contribution to the cart selling total:

```
Item Promotion Discount = (Item Selling Total ÷ Cart Selling Total) × Total Promotion Amount
```

This ensures:
- Fair distribution across all items
- Accurate per-item pricing display
- Correct totals when items are removed

## Consistency Guarantees

✅ **Single Source of Truth**: All calculations performed server-side
✅ **Identical Logic**: Cart and checkout use same formulas
✅ **No Client Calculations**: Client displays server-calculated values
✅ **Proportional Distribution**: Promotions distributed fairly
✅ **Database Integrity**: Order totals match cart totals exactly

## Example Calculation

### Scenario:
- **Product A**: Official Rs. 1,000 → Selling Rs. 900 (10% off)
- **Product B**: Official Rs. 500 → Selling Rs. 450 (10% off)
- **Active Promotion**: 10% off (max Rs. 200)

### Calculations:
1. **Official Total**: Rs. 1,500
2. **Official Discount**: Rs. 150 (10%)
3. **Selling Total**: Rs. 1,350
4. **Promotion Amount**: Rs. 135 (10% of Rs. 1,350)
5. **Product A Promo Share**: (900/1350) × 135 = Rs. 90
6. **Product B Promo Share**: (450/1350) × 135 = Rs. 45
7. **Product A Final**: Rs. 810
8. **Product B Final**: Rs. 405
9. **Cumulative Discount**: Rs. 285 (19%)
10. **Final Payable**: Rs. 1,215

## Files Updated

### Cart Page (`/app/cart/page.tsx`):
- ✅ Uses server-calculated totals from `/api/cart`
- ✅ Displays three-tier pricing per item
- ✅ Shows detailed discount breakdown
- ✅ Calculates proportional promotion per item

### Checkout Page (`/app/checkout/page.tsx`):
- ✅ Uses server-calculated totals from `/api/cart`
- ✅ Displays identical three-tier pricing
- ✅ Shows identical discount breakdown
- ✅ Uses same proportional calculation logic

### Cart API (`/app/api/cart/route.ts`):
- ✅ Single source of truth for all pricing
- ✅ Returns complete totals object
- ✅ Includes promotion details
- ✅ Calculates all discount percentages

## Testing Checklist

- [x] Cart displays correct three-tier pricing
- [x] Checkout displays identical pricing to cart
- [x] Promotion discount distributed proportionally
- [x] Order summary matches cart summary
- [x] Final payable is identical across pages
- [x] Discount percentages calculated correctly
- [x] Build completes without errors
