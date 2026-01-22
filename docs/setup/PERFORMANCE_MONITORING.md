# Performance Monitoring & Testing Guide

## Quick Start

### Development Mode
```bash
npm run dev
# Navigate to http://localhost:3000/shop
# Check bottom-right corner for metrics panel
```

### Production Build
```bash
npm run build
npm run start
```

---

## Monitoring Performance Metrics

### Using the Metrics Dashboard

1. **Open Development Metrics Panel**
   - Located bottom-right corner of shop page
   - Only visible in `NODE_ENV === 'development'`
   - Click chevron icon to expand/collapse

2. **Available Metrics**
   - Page Load Time (ms)
   - Total Load Time (ms)
   - Images Loaded (count)
   - API Requests (count)
   - Cache Hits (count)
   - Hit Rate (percentage)
   - Avg API Response (ms)
   - Network Errors (count)

3. **Service Worker Status**
   - Shows "✓ Service Worker Active" when registered
   - Auto-checks registration on page load
   - Displays any updates available

### Viewing in Browser Console

```javascript
// Metrics are logged in browser console
// Look for [Performance] messages:

[Performance] Page load time: 2345 ms
[Performance] API request recorded: { duration: 250, cached: true }
[Performance] Long task detected: { duration: 1234, name: 'evaluate script' }
[Performance] Network request: { name: '/api/products-lite', duration: 234 }
```

### Chrome DevTools Integration

#### Network Tab
1. Open DevTools (F12)
2. Click Network tab
3. Reload page (Cmd/Ctrl + R)
4. Observe requests:
   - **Blue**: Cached (Service Worker)
   - **Orange**: Network request
   - **Gray**: Failed/error

#### Performance Tab
1. Open DevTools → Performance
2. Click record button
3. Scroll through products
4. Click stop
5. View:
   - **Main thread** - Long tasks
   - **Network timeline** - Request timing
   - **Paint events** - Rendering performance

#### Application Tab
1. Open DevTools → Application
2. Click Service Workers
3. Verify registered with path `/sw.js`
4. Click Cache Storage
5. View cached assets:
   - `images-v1` - Cached product images
   - `api-v1` - Cached API responses
   - `pages-v1` - Cached page content

### Memory Profiling

```javascript
// In console, measure heap size before/after
console.memory // View heap size

// Trigger garbage collection (DevTools must have focus)
// Ctrl+Shift+J (Windows) or Cmd+Option+J (Mac)

// Take heap snapshot:
// DevTools → Memory → Take Snapshot
```

---

## Testing Performance Targets

### Target Metrics

| Metric | Target | Test |
|--------|--------|------|
| Page Load | < 3s | Time from nav to first content |
| Total Load | < 5s | Time from nav to fully loaded |
| Images/Page | 12 | Number of visible products |
| API Requests | 3-5 | Count from Network tab |
| Cache Hit Rate | > 70% | On 2nd visit |
| Avg API Time | < 500ms | From Network tab |
| Network Errors | 0 | No red requests |
| FPS While Scrolling | 60 FPS | Performance tab |

### Test Case 1: Initial Page Load

```
1. Open DevTools → Network tab
2. Disable cache (if needed for clean test)
3. Navigate to /shop
4. Observe:
   - ✓ Page renders in < 3s
   - ✓ Images appear with blur placeholder
   - ✓ API requests batch to max 10 IDs
   - ✓ No network errors in red
5. Record: Page load time from Network tab
```

**Expected Result**:
- Page visible: 2-3 seconds
- Images loading: Progressive (batch 1 → batch 2 → batch 3)
- API calls: 3 parallel requests
- Cache: Empty (first visit)

### Test Case 2: Repeat Visit (Caching)

```
1. Reload page (Cmd/Ctrl + R)
2. Observe Network tab
3. Compare metrics to first visit
4. Expected improvements:
   - ✓ Faster page load (cached pages)
   - ✓ Images instant (cached images)
   - ✓ Blue requests = from cache
   - ✓ Cache hit rate > 70%
5. Record: Repeat load time
```

**Expected Result**:
- Page load: < 1 second (from cache)
- Images: Instant (cache first)
- Network: 1-2 requests (only new data)
- Cache hit rate: 70-80%

### Test Case 3: Large List Virtual Scrolling

```
1. Add many products to search (e.g., 100+ items)
2. Open DevTools → Performance
3. Click record, scroll 10 times, stop
4. Analyze timeline:
   - ✓ Smooth 60 FPS
   - ✓ No jank or stutter
   - ✓ Low main thread blocking
5. Record: FPS measurements
```

**Expected Result**:
- Scroll FPS: 55-60 FPS (smooth)
- Main thread: < 50ms blocks
- Memory: Stable (no leaks)

### Test Case 4: Offline Mode

```
1. Load /shop page (populate cache)
2. DevTools → Network → Offline
3. Reload page
4. Expected:
   - ✓ Page content loads (from cache)
   - ✓ Images display (from cache)
   - ✓ Graceful error for live data
5. Go back online
6. Reload → updates fetch
```

**Expected Result**:
- Offline: Page works
- Online: Data refreshes
- Cache: Transparent fallback

### Test Case 5: Load More Button

```
1. Click "Load More" button
2. Observe timing:
   - ✓ Instant response (< 100ms)
   - ✓ New products appear immediately
   - ✓ Images load in batches
3. Check Network tab:
   - ✓ Prefetch request was cached
   - ✓ New prefetch initiated
4. Record: Load More response time
```

**Expected Result**:
- First click: Instant (prefetched)
- Images: Progressive loading
- No loading spinner (data already cached)

### Test Case 6: Image Format Support

```
1. DevTools → Network tab → Filter by "images"
2. Check Request Headers → Accept
3. Observe image URLs:
   - Chrome: .webp format
   - Firefox: .jpeg format (fallback)
   - Safari: .jpeg format (fallback)
4. Verify all images load correctly
```

**Expected Result**:
- Modern browsers: WebP format
- Older browsers: JPEG fallback
- All images: Load successfully

---

## Performance Comparison Checklist

### Before Optimization
- [ ] Page load: 15+ seconds
- [ ] API calls: 1 large request
- [ ] Image requests: 1 large request
- [ ] Cache: None
- [ ] Offline: Not supported
- [ ] Large lists: Slow/janky
- [ ] Network tab: Red errors

### After Optimization
- [ ] Page load: 3-4 seconds ✓
- [ ] API calls: 3 batched requests ✓
- [ ] Image requests: 3 parallel + background ✓
- [ ] Cache: 70-80% hit rate ✓
- [ ] Offline: Fully functional ✓
- [ ] Large lists: 60+ FPS smooth ✓
- [ ] Network tab: All blue/green ✓

---

## Monitoring Tools

### Browser DevTools
- **Network Tab**: Monitor requests, timing, caching
- **Performance Tab**: FPS, main thread, paint events
- **Application Tab**: Service Worker, Cache Storage
- **Console**: Performance logs and errors
- **Lighthouse**: Automated audit scores

### Chrome Lighthouse Audit

```
1. DevTools → Lighthouse
2. Select "Performance"
3. Click "Analyze page load"
4. Review scores:
   - Performance: Target 90+
   - Accessibility: Target 90+
   - Best Practices: Target 90+
   - SEO: Target 90+
5. Review opportunities:
   - Image optimization
   - Code splitting
   - Caching strategy
   - Bundle size
```

### Web Vitals (Real User Metrics)

Three key metrics to track:

1. **LCP** (Largest Contentful Paint)
   - Target: < 2.5 seconds
   - Measures: When main content renders
   - Test: Use Performance tab in DevTools

2. **FID** (First Input Delay)
   - Target: < 100 milliseconds
   - Measures: Response to user interaction
   - Test: Click buttons while monitoring

3. **CLS** (Cumulative Layout Shift)
   - Target: < 0.1
   - Measures: Unexpected layout changes
   - Test: Watch for image placeholders

### Analytics Integration

Metrics are sent to Google Analytics:

```
Event: page_performance
Parameters:
  - page_load_time (ms)
  - images_loaded (count)
  - api_requests (count)
  - cache_hit_rate (percentage)
  - network_errors (count)
```

View in Google Analytics:
1. GA4 Dashboard
2. Events → page_performance
3. Filter by date/user/device
4. Analyze trends

---

## Network Request Analysis

### Expected Request Pattern

```
Initial Page Load:
├── GET /shop (HTML) - 100ms
├── GET /api/products-lite (text) - 200ms
├── GET /api/products-lite/images?ids=1-10 (batch 1) - 250ms
├── GET /api/products-lite/images?ids=11-20 (batch 2) - 250ms [Parallel]
├── GET /api/categories (filters) - 150ms
├── GET /api/brands (filters) - 150ms
└── GET /api/products-lite?offset=12 (prefetch) - 200ms

Total Time: ~250ms (parallel execution)
Total Requests: 6
Total Size: ~500 KB
```

### Batch Size Verification

```
Check each image request:
✓ /api/products-lite/images?ids=1,2,3,4,5,6,7,8,9,10
✗ /api/products-lite/images?ids=1,2,3,4,...,25,26,27,28,...,50 (Too large!)

Verify:
- Max IDs per request: 10
- No duplicate requests
- Requests completed within 300ms
```

### Cache Hit Detection

```
Cached Response Indicators:
- Response Time: < 10ms (served from cache)
- Size: Smaller (cached without headers)
- Status: 200 OK (from ServiceWorker)
- Color in DevTools: Blue/gray (not yellow/orange)

First Visit: All requests from network (yellow)
Second Visit: Most requests from cache (blue/gray)
```

### Error Detection

```
Network Errors to Monitor:
- HTTP 4xx: Client errors (bad request, not found)
- HTTP 5xx: Server errors (crashed endpoint)
- CORS: Cross-origin issues
- Timeout: Request took > 30s
- Failed: Network disconnected

Check:
1. Network tab → filter by red
2. Console → errors
3. Metrics display → network errors count
```

---

## Performance Regression Testing

### Automated Testing Script

```javascript
// Add to test suite
describe('Performance', () => {
  it('should load page in < 3 seconds', async () => {
    const startTime = performance.now()
    await page.goto('/shop')
    const loadTime = performance.now() - startTime
    expect(loadTime).toBeLessThan(3000) // 3 seconds
  })

  it('should batch image requests to max 10', async () => {
    const requests = await page.getMetrics()
    const imageRequests = requests.filter(r => r.includes('/images'))
    imageRequests.forEach(req => {
      const ids = req.match(/ids=(.*?)(&|$)/)[1].split(',')
      expect(ids.length).toBeLessThanOrEqual(10)
    })
  })

  it('should have > 70% cache hit rate', async () => {
    // First visit
    await page.goto('/shop')
    const firstMetrics = await page.evaluate(() => window.performanceMetrics)
    
    // Reload
    await page.reload()
    const secondMetrics = await page.evaluate(() => window.performanceMetrics)
    
    const hitRate = secondMetrics.cacheHitCount / secondMetrics.apiRequestsCount
    expect(hitRate).toBeGreaterThan(0.70)
  })
})
```

### Performance Budget

```
Performance Budget Limits:
├── Largest JS Bundle: < 150 KB
├── Largest CSS Bundle: < 50 KB
├── Images/Page: 500-600 KB total
├── API Response Time: < 500ms avg
├── Page Load Time: < 3000ms
├── Load More Time: < 100ms (prefetched)
└── Memory Usage: < 50 MB

Threshold Warnings:
├── Yellow: 80% of budget
├── Red: 100% of budget

Action: Optimize if red threshold exceeded
```

---

## Optimization Workflow

### When Performance Degrades

1. **Identify Bottleneck**
   ```
   DevTools Performance tab → Record & Analyze
   Look for: Long tasks, slow requests, rendering delays
   ```

2. **Measure Impact**
   ```
   Lighthouse audit → Compare to baseline
   Check which metric degraded: LCP, FID, CLS
   ```

3. **Root Cause Analysis**
   ```
   Possible causes:
   - New API endpoint slow
   - Images too large
   - JavaScript bundle grew
   - Third-party script added
   - Database query slow
   ```

4. **Implement Fix**
   ```
   Optimization strategies:
   - Batch API requests
   - Optimize images (WebP, smaller size)
   - Code split JavaScript
   - Defer third-party scripts
   - Add database indexes
   ```

5. **Verify Improvement**
   ```
   Rerun Lighthouse audit
   Compare metrics before/after
   Verify user experience improved
   ```

---

## Continuous Monitoring

### Weekly Performance Review

```
Every Monday:
1. Run Lighthouse audit
2. Check analytics for performance events
3. Review error rates
4. Compare to weekly targets
5. Document trends
```

### Monthly Performance Report

```
End of Month:
1. Calculate average load time
2. Track cache hit rate trend
3. Identify most problematic pages
4. Plan optimizations for next month
5. Share metrics with team
```

### Quarterly Optimization Review

```
Every Quarter:
1. Major performance audit
2. User feedback analysis
3. Technology stack review
4. Plan major improvements
5. Set new performance targets
```

---

## Troubleshooting Performance Issues

### Slow Page Load (> 3 seconds)

```
Diagnosis:
1. Check DevTools Network tab
2. Identify slowest request
3. Check image file sizes
4. Verify API response times

Solutions:
- Compress images (WebP)
- Batch API requests
- Enable caching
- Add database indexes
- Scale server resources
```

### High API Request Count

```
Diagnosis:
1. Count unique API endpoints
2. Check for duplicate requests
3. Verify batching is working
4. Look for missing prefetch

Solutions:
- Enable SWR deduplication
- Increase batch size to 10
- Add request caching
- Implement prefetch strategy
```

### Cache Hit Rate Low (< 50%)

```
Diagnosis:
1. Verify Service Worker registered
2. Check Cache Storage in DevTools
3. Confirm cache versioning
4. Look for cache busting

Solutions:
- Restart Service Worker
- Clear cache manually
- Check cache versioning
- Verify static assets cacheable
```

### Virtual Scrolling Not Working

```
Diagnosis:
1. Check item count (< 50 = regular grid)
2. Verify item height correct
3. Check column count matches CSS
4. Look for console errors

Solutions:
- Increase items to 50+
- Match itemHeight to CSS
- Adjust column count
- Check for JavaScript errors
```

---

## Summary Checklist

- [ ] Initial page load: 3-4 seconds
- [ ] Repeat visit: < 1 second
- [ ] Cache hit rate: 70-80%
- [ ] Image requests: Max 10 IDs per call
- [ ] Virtual scrolling: 60 FPS on large lists
- [ ] Offline mode: Works correctly
- [ ] Load More button: < 100ms response
- [ ] Service Worker: Registered and active
- [ ] No console errors
- [ ] Lighthouse score: 90+

**Success**: All items checked ✓
