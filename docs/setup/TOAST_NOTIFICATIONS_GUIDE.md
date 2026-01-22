# Toast Notifications Implementation Guide

## Overview

Toast notifications provide non-intrusive feedback to users about actions, errors, and status updates throughout the application.

## Current Implementation Status

✅ **Toast system is fully implemented** using [Sonner](https://sonner.emilkowal.ski/)

### Pages with Toast Notifications Enabled:

| Page | Location | Features |
|------|----------|----------|
| Shop | `/shop` | Image loading warnings, filter errors |
| Cart | `/cart` | Add/remove items, quantity updates, clear cart |
| Checkout | `/checkout` | Order placement success/error |
| Product | `/product/[slug]` | Add to cart, wishlist, quantity changes |
| Profile | `/profile` | Profile update success/error |
| Wishlist | `/wishlist` | Add/remove items |

## How Toasts Work

### Toast Types

```typescript
import { notify } from "@/lib/utils/notifications"

// Success notification (green)
notify.success("Action completed", "Optional description")

// Error notification (red)
notify.error("Something went wrong", "Error details here")

// Warning notification (orange)
notify.warning("Be careful", "This action has consequences")

// Info notification (blue)
notify.info("Information", "Here's something useful")

// Loading notification (spinner)
const toastId = notify.loading("Processing...")
notify.dismiss(toastId) // Clear it when done

// Promise notification (auto-state)
notify.promise(
  asyncAction(),
  {
    loading: "Loading...",
    success: "Success!",
    error: "Failed!"
  }
)
```

### Default Settings

```typescript
{
  duration: 4000,        // Auto-dismiss after 4 seconds
  position: "bottom-right", // Default Sonner position
}
```

## Toast Locations in Code

### 1. Shop Page (`app/shop/page.tsx`)

**Success Notifications:**
```typescript
notify.success("Added to cart")
notify.success("Added to wishlist")
```

**Warning Notifications:**
```typescript
notify.warning("Some product images are loading", "Placeholder shown for now")
```

**When Used:**
- Add to cart button click
- Add to wishlist button click
- Image batch loading errors

### 2. Cart Page (`app/cart/page.tsx`)

**Success Notifications:**
```typescript
notify.success("Quantity updated")
notify.success("Item removed from cart")
notify.success("Cart cleared")
```

**Error Notifications:**
```typescript
notify.error("Failed to update quantity")
notify.error("Failed to remove item")
notify.error("Failed to clear cart")
```

### 3. Checkout Page (`app/checkout/page.tsx`)

**Success Notifications:**
```typescript
notify.success("Order placed successfully!", `Order number: ${order.order_number}`)
```

**Error Notifications:**
```typescript
notify.error("Please enter your shipping address")
notify.error("Failed to place order", errorMessage)
```

### 4. Product Page (`app/product/[slug]/page.tsx`)

**Success Notifications:**
```typescript
notify.success("Added to cart")
notify.success("Added to wishlist")
```

**Error Notifications:**
```typescript
notify.error("Failed to add to cart")
notify.error("Failed to add to wishlist")
```

## Adding Toast Notifications to Your Pages

### Step 1: Import the notify utility

```typescript
import { notify } from "@/lib/utils/notifications"
```

### Step 2: Use in async operations

```typescript
const handleAction = async () => {
  try {
    const response = await fetch("/api/endpoint", {
      method: "POST",
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const result = await response.json()
    notify.success("Action completed successfully")
    // Handle success
  } catch (error) {
    console.error("Error:", error)
    notify.error("Failed to complete action", error.message)
  }
}
```

### Step 3: Use with loading states

```typescript
const handleLongOperation = async () => {
  const toastId = notify.loading("Processing your request...")
  
  try {
    const result = await longAsyncOperation()
    notify.dismiss(toastId)
    notify.success("Done!", "Operation completed")
  } catch (error) {
    notify.dismiss(toastId)
    notify.error("Failed", error.message)
  }
}
```

### Step 4: Use with promises

```typescript
handleSubmit = () => {
  notify.promise(
    fetch("/api/submit", { method: "POST" })
      .then(res => res.json()),
    {
      loading: "Saving changes...",
      success: "Changes saved!",
      error: "Failed to save changes"
    }
  )
}
```

## Toast Best Practices

### ✅ DO:

1. **Use clear, action-oriented messages:**
   ```typescript
   ✓ "Cart updated"
   ✓ "Order placed successfully"
   ✗ "OK"
   ✗ "Done"
   ```

2. **Include error details when helpful:**
   ```typescript
   notify.error("Failed to save", "Email already exists")
   ```

3. **Use appropriate notification types:**
   - Success: For positive completions
   - Error: For failures requiring attention
   - Warning: For caution but not failure
   - Info: For informational messages only

4. **Keep messages concise:**
   ```typescript
   ✓ "Added to cart"
   ✗ "Your item has been successfully added to your shopping cart"
   ```

### ❌ DON'T:

1. **Stack multiple toasts for single action:**
   ```typescript
   ✗ Multiple success toasts
   ✓ One success toast per action
   ```

2. **Use toasts for critical errors:**
   ```typescript
   ✗ notify.error("System crashed")
   ✓ Use alert() or modal for critical issues
   ```

3. **Show toasts without user action:**
   ```typescript
   ✗ Auto-show toasts on page load
   ✓ Show only after user action
   ```

4. **Forget to handle errors:**
   ```typescript
   ✗ fetch(url).then(() => notify.success(...))
   ✓ try/catch with error handling
   ```

## Common Patterns

### Pattern 1: Form Submission

```typescript
const handleSubmit = async (formData) => {
  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      body: JSON.stringify(formData),
    })
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    
    notify.success("Form submitted")
    // Handle success
  } catch (error) {
    notify.error("Form submission failed", error.message)
  }
}
```

### Pattern 2: Cart Operations

```typescript
const handleAddToCart = async (productId) => {
  try {
    const res = await fetch("/api/cart", {
      method: "POST",
      body: JSON.stringify({ product_id: productId, quantity: 1 }),
    })
    
    if (!res.ok) throw new Error("Failed")
    notify.success("Added to cart")
    // Update UI
  } catch (error) {
    notify.error("Could not add to cart")
  }
}
```

### Pattern 3: Delete Operations

```typescript
const handleDelete = async (id) => {
  try {
    const res = await fetch(`/api/items/${id}`, { method: "DELETE" })
    
    if (!res.ok) throw new Error("Delete failed")
    notify.success("Item removed")
    // Update list
  } catch (error) {
    notify.error("Failed to delete item")
  }
}
```

### Pattern 4: Validation Errors

```typescript
const handleAction = () => {
  if (!email) {
    notify.error("Please enter email address")
    return
  }
  
  if (!isValidEmail(email)) {
    notify.error("Invalid email format")
    return
  }
  
  // Proceed with action
}
```

## Styling and Customization

### Default Toast Container Style

The Toaster is rendered in `app/layout.tsx`:

```tsx
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout() {
  return (
    <html>
      <body>
        {/* Your app content */}
        <Toaster />
      </body>
    </html>
  )
}
```

### Toast Appearance

- **Position**: Bottom-right corner
- **Duration**: 4 seconds auto-dismiss
- **Animation**: Slide in from right, fade out
- **Colors**:
  - Success: Green (#22c55e)
  - Error: Red (#ef4444)
  - Warning: Orange (#f97316)
  - Info: Blue (#3b82f6)

## Testing Toasts

### In Development

1. Open your page in browser
2. Perform an action (add to cart, submit form, etc.)
3. Should see toast appear at bottom-right
4. Toast auto-dismisses after 4 seconds

### In Development Mode Panel

If you have performance metrics enabled, you can test:
1. Navigate to `/shop`
2. Scroll and observe image loading toasts
3. Add items to cart (should see success toast)
4. Check console for any errors

### Browser DevTools

```javascript
// Test toasts in console:
window.location.href = '/checkout'
// Then trigger actions
```

## Troubleshooting Toasts

### Toasts not showing?

**Check 1: Toaster component in layout**
```tsx
// app/layout.tsx should have:
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster /> {/* Must be here */}
      </body>
    </html>
  )
}
```

**Check 2: Notify import**
```typescript
// Check import is correct:
import { notify } from "@/lib/utils/notifications"
```

**Check 3: Browser DevTools**
- Open console and look for errors
- Check if fetch requests are succeeding (Network tab)

### Toasts appearing but wrong style?

- Check if CSS is loading correctly
- Clear browser cache (see CACHE_TROUBLESHOOTING.md)
- Verify Sonner version in package.json

### Too many toasts stacking?

- Reduce toast frequency
- Combine related messages
- Use `notify.dismiss()` to clear manually

## Integration with Image Loading

Toast notifications have been integrated with image loading to warn users:

```typescript
// In app/shop/page.tsx
useEffect(() => {
  // Load images and warn if failures
  productBatches.slice(2).forEach((batch) => {
    fetch(`/api/products-lite/images?ids=${batch}`)
      .catch((err) => {
        notify.warning(
          "Loading more images",
          "Some images may take a moment to appear"
        )
      })
  })
}, [productBatches])
```

## Performance Notes

- Toasts are lightweight and don't impact performance
- Sonner handles rendering efficiently
- Multiple toasts queue automatically
- No impact on page load time

## Future Enhancements

Potential improvements:
1. Persistent toasts for errors
2. Undo action toasts
3. Custom toast actions
4. Toast history panel
5. Analytics on toast triggers

---

**Remember**: Good toast notifications improve UX by providing immediate feedback without being intrusive. Keep messages clear, concise, and helpful!
