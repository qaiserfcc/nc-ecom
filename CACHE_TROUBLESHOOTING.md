# Cache Troubleshooting Guide

## Problem: Images Not Loading

If you're experiencing issues with product images not loading, it's likely due to cached failed image requests from before we fixed the cache strategy.

### Quick Fix - Clear Service Worker Cache

#### Option 1: Use Dev Tools (Easiest)
1. Open your browser's DevTools (F12 or Cmd+Option+I on Mac)
2. Go to the **Application** tab
3. Find **Service Workers** in the left sidebar
4. Click **Unregister** next to the sw.js entry
5. Go to **Cache Storage** section
6. Delete all caches:
   - `images-v1`
   - `api-v1`
   - `pages-v1`
7. Refresh the page (Ctrl+Shift+R or Cmd+Shift+R for hard refresh)

#### Option 2: Use Development Mode Panel (If Available)
1. Navigate to `/shop` page
2. If in development mode, look for a **metrics button** (bottom-right corner)
3. Click the button and expand the metrics panel
4. Click the **"Clear Cache"** button
5. Refresh the page

#### Option 3: Hard Refresh Browser
1. Press **Ctrl+Shift+R** (Windows/Linux) or **Cmd+Shift+R** (Mac)
2. This forces the browser to reload and revalidate cache

### What Changed

**Before (Broken Cache):**
```
Cache-Control: public, max-age=2592000, immutable
                ↓
30-day cache with NO revalidation
↓
Failed images stayed cached for 30 days
```

**After (Fixed Cache):**
```
Cache-Control: public, max-age=3600, must-revalidate
                ↓
1-hour cache with revalidation
↓
Images automatically refresh every hour
```

**Service Worker Strategy Change:**
```
Images:
  Before: Cache-first (try cache, then network)
  After:  Network-first (try network, then cache)
          ↓
          Prevents caching of failed requests
```

### How to Prevent This in the Future

1. **Service Worker Caching**: Now uses network-first strategy for images
2. **Cache Duration**: Reduced from 30 days to 1 hour
3. **Error Handling**: Added toast notifications when images fail to load
4. **Revalidation**: Added `must-revalidate` header to force browser cache refresh

### Toast Notifications Added

The app now shows helpful notifications:

| Notification | Meaning | Action |
|-------------|---------|--------|
| ✓ Success (green) | Feature worked | Wait for auto-dismiss (4s) |
| ⚠ Warning (orange) | Non-critical issue | Some images loading delayed |
| ✕ Error (red) | Critical problem | Check browser console, refresh page |
| ℹ Info (blue) | Informational | General feedback |

### Monitoring Performance

In development mode, you can:

1. Open DevTools → Application tab
2. Check "Cache Storage" for:
   - How many items are cached
   - Cache sizes
   - Last modified times
3. Click "Clear Cache" button in metrics panel to test cache clearing

### Browser DevTools Tips

**View All Caches:**
```
DevTools → Application → Cache Storage
```

**Check Network Activity:**
```
DevTools → Network tab
Filter by: js, css, img, fetch, xhr
```

**Disable Cache During Development:**
```
DevTools → Network tab → Disable cache (checkbox)
```

**Test Offline Mode:**
```
DevTools → Network tab → Offline (dropdown)
Then navigate to see Service Worker fallback
```

### Reporting Issues

If images still don't load after clearing cache:

1. **Check Browser Console** (F12 → Console tab):
   - Look for red error messages
   - Screenshot and report

2. **Check Network Tab**:
   - Open Network tab in DevTools
   - Refresh page
   - Look for failed requests (red text)
   - Check HTTP status codes

3. **Check Service Worker Status**:
   - DevTools → Application → Service Workers
   - Should show: "sw.js - active and running"

### Testing the Fix

1. Open `/shop` in browser
2. Scroll to see product images
3. Should see:
   - Blur placeholder while loading
   - Smooth fade-in once loaded
   - No broken image icons

4. Open DevTools Network tab:
   - Should see image requests returning 200 (success)
   - Not getting 304 (cached/unchanged)

### FAQ

**Q: How long until cache clears automatically?**
A: 1 hour. New cache policies ensure fresh images every hour.

**Q: Will cache clearing affect performance?**
A: Temporarily slower, but images load correctly. Performance normalizes within 1-2 page loads.

**Q: Do I need to clear cache every time?**
A: No, just once after update. Future images will use new cache strategy.

**Q: What if images still don't show?**
A: 
1. Clear browser cache (Ctrl+Shift+Delete)
2. Clear Service Worker cache (see Option 1 above)
3. Hard refresh (Ctrl+Shift+R)
4. Check browser console for errors

### Cache Strategy Details

```javascript
// BEFORE (Broken)
fetch image → 
  if in cache (any state) → return cached 
  else → network request

// AFTER (Fixed)
fetch image →
  try network first → if success, cache it
  if network fails → fallback to cache
  if no cache → show error with fallback image
```

This prevents caching of failed requests while still providing offline support.
