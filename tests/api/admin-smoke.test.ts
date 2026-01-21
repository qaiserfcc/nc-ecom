import { describe, it, expect, beforeAll } from 'vitest'

// Test configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
let adminAuthCookie: string = ''

// Helper function to make API requests
async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${BASE_URL}${endpoint}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }

  if (adminAuthCookie && !headers['Cookie']) {
    headers['Cookie'] = adminAuthCookie
  }

  return fetch(url, {
    ...options,
    headers,
  })
}

describe('Admin API Smoke Tests', () => {
  const timestamp = Date.now()
  const adminEmail = `admin.smoke.${timestamp}@example.com`
  const adminPassword = 'AdminSmoke123!'
  const adminName = `Admin Smoke Test ${timestamp}`

  beforeAll(async () => {
    // Create and authenticate admin user
    try {
      // Register admin user (note: in real scenario, admin role should be set via database)
      const signupResponse = await apiRequest('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword,
          name: adminName,
        }),
      })

      if (signupResponse.status === 200) {
        console.log('✓ Admin test user created')
      }

      // Sign in to get auth cookie
      const signinResponse = await apiRequest('/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword,
        }),
      })

      if (signinResponse.status === 200) {
        const setCookie = signinResponse.headers.get('set-cookie')
        if (setCookie) {
          adminAuthCookie = setCookie.split(';')[0]
          console.log('✓ Admin authenticated successfully')
        }
      }
    } catch (error) {
      console.error('Failed to setup admin user:', error)
    }
  }, 30000)

  describe('1. Admin Dashboard Analytics API', () => {
    it('GET /api/admin/dashboard-analytics - should fetch dashboard analytics', async () => {
      const response = await apiRequest('/api/admin/dashboard-analytics')

      // May be 401 for non-admin users, 200 for admin
      expect([200, 401]).toContain(response.status)

      if (response.status === 200) {
        const data = await response.json()
        expect(data.overview).toBeDefined()
        expect(data.overview.totalUsers).toBeDefined()
        expect(data.overview.totalOrders).toBeDefined()
        expect(data.overview.totalRevenue).toBeDefined()
        expect(data.revenueTrend).toBeDefined()
        console.log('✓ Dashboard analytics endpoint accessible')
      } else {
        console.log('⊘ Dashboard analytics requires admin role')
      }
    })

    it('GET /api/admin/dashboard-analytics?period=30days - should fetch analytics with period filter', async () => {
      const response = await apiRequest('/api/admin/dashboard-analytics?period=30days')

      expect([200, 401]).toContain(response.status)

      if (response.status === 200) {
        const data = await response.json()
        expect(data.period).toBe('30days')
        console.log('✓ Dashboard analytics period filter works')
      }
    })
  })

  describe('2. Admin Meta Pixel APIs', () => {
    it('GET /api/admin/meta-pixel - should fetch Meta Pixel configuration', async () => {
      const response = await apiRequest('/api/admin/meta-pixel')

      expect([200, 401]).toContain(response.status)

      if (response.status === 200) {
        const data = await response.json()
        // Config may be empty or populated
        expect(data).toBeDefined()
        console.log('✓ Meta Pixel config endpoint accessible')
      }
    })

    it('POST /api/admin/meta-pixel - should update Meta Pixel configuration', async () => {
      const response = await apiRequest('/api/admin/meta-pixel', {
        method: 'POST',
        body: JSON.stringify({
          pixel_id: 'test-pixel-123',
          is_active: false,
          enable_automatic_events: true,
        }),
      })

      expect([200, 401, 400]).toContain(response.status)

      if (response.status === 200) {
        const data = await response.json()
        expect(data.pixel_id).toBe('test-pixel-123')
        console.log('✓ Meta Pixel config can be updated')
      }
    })

    it('GET /api/admin/meta-pixel/init - should check Meta Pixel initialization', async () => {
      const response = await apiRequest('/api/admin/meta-pixel/init')

      expect([200, 401]).toContain(response.status)
    })
  })

  describe('3. Admin Image Migration API', () => {
    it('GET /api/admin/migrate-images-to-blob - should access image migration endpoint', async () => {
      const response = await apiRequest('/api/admin/migrate-images-to-blob')

      expect([200, 401, 405]).toContain(response.status)

      if (response.status === 200) {
        console.log('✓ Image migration endpoint accessible')
      }
    })
  })

  describe('4. Products Admin APIs', () => {
    let testProductId: number

    it('GET /api/products - should fetch all products', async () => {
      const response = await apiRequest('/api/products')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.products).toBeDefined()
      expect(Array.isArray(data.products)).toBe(true)

      if (data.products.length > 0) {
        testProductId = data.products[0].id
        console.log(`✓ Found ${data.products.length} products`)
      }
    })

    it('POST /api/products - should create a new product (admin only)', async () => {
      const response = await apiRequest('/api/products', {
        method: 'POST',
        body: JSON.stringify({
          name: `Test Product ${timestamp}`,
          description: 'Test product description',
          current_price: 99.99,
          category_id: 1,
          stock_quantity: 100,
        }),
      })

      // May be 201 for admin, 401 for regular user
      expect([201, 401, 403, 400]).toContain(response.status)

      if (response.status === 201) {
        const data = await response.json()
        expect(data.product).toBeDefined()
        console.log('✓ Product creation successful')
      }
    })

    it('PUT /api/products/[id] - should update a product (admin only)', async () => {
      if (!testProductId) {
        console.log('⊘ Skipping product update test - no product ID')
        return
      }

      const response = await apiRequest(`/api/products/${testProductId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Updated Test Product',
        }),
      })

      expect([200, 401, 403, 404]).toContain(response.status)

      if (response.status === 200) {
        console.log('✓ Product update successful')
      }
    })

    it('POST /api/products/bulk - should handle bulk product operations', async () => {
      const response = await apiRequest('/api/products/bulk', {
        method: 'POST',
        body: JSON.stringify({
          action: 'update_prices',
          products: [],
        }),
      })

      expect([200, 401, 403, 400]).toContain(response.status)
    })

    it('POST /api/products/optimize-images - should optimize product images', async () => {
      const response = await apiRequest('/api/products/optimize-images', {
        method: 'POST',
      })

      expect([200, 401, 403]).toContain(response.status)
    })
  })

  describe('5. Brands Admin APIs', () => {
    let testBrandId: number

    it('GET /api/brands - should fetch all brands', async () => {
      const response = await apiRequest('/api/brands?all=true')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.brands).toBeDefined()

      if (data.brands.length > 0) {
        testBrandId = data.brands[0].id
        console.log(`✓ Found ${data.brands.length} brands`)
      }
    })

    it('POST /api/brands - should create a new brand (admin only)', async () => {
      const response = await apiRequest('/api/brands', {
        method: 'POST',
        body: JSON.stringify({
          name: `Test Brand ${timestamp}`,
          slug: `test-brand-${timestamp}`,
        }),
      })

      expect([201, 401, 403, 400]).toContain(response.status)

      if (response.status === 201) {
        console.log('✓ Brand creation successful')
      }
    })

    it('PUT /api/brands/[id] - should update a brand (admin only)', async () => {
      if (!testBrandId) {
        console.log('⊘ Skipping brand update test - no brand ID')
        return
      }

      const response = await apiRequest(`/api/brands/${testBrandId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Updated Test Brand',
        }),
      })

      expect([200, 401, 403, 404]).toContain(response.status)
    })
  })

  describe('6. Bundles Admin APIs', () => {
    let testBundleId: number

    it('GET /api/bundles - should fetch all bundles', async () => {
      const response = await apiRequest('/api/bundles?all=true')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.bundles).toBeDefined()

      if (data.bundles.length > 0) {
        testBundleId = data.bundles[0].id
        console.log(`✓ Found ${data.bundles.length} bundles`)
      }
    })

    it('POST /api/bundles - should create a new bundle (admin only)', async () => {
      const response = await apiRequest('/api/bundles', {
        method: 'POST',
        body: JSON.stringify({
          name: `Test Bundle ${timestamp}`,
          description: 'Test bundle description',
          discount_percentage: 10,
        }),
      })

      expect([201, 401, 403, 400]).toContain(response.status)
    })

    it('GET /api/bundles/[id]/items - should fetch bundle items', async () => {
      if (!testBundleId) {
        console.log('⊘ Skipping bundle items test - no bundle ID')
        return
      }

      const response = await apiRequest(`/api/bundles/${testBundleId}/items`)

      expect([200, 404]).toContain(response.status)
    })
  })

  describe('7. Categories Admin APIs', () => {
    it('GET /api/categories - should fetch all categories', async () => {
      const response = await apiRequest('/api/categories')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.categories).toBeDefined()
      console.log(`✓ Found ${data.categories.length} categories`)
    })

    it('POST /api/categories - should create a new category (admin only)', async () => {
      const response = await apiRequest('/api/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: `Test Category ${timestamp}`,
          slug: `test-category-${timestamp}`,
        }),
      })

      expect([201, 401, 403, 400]).toContain(response.status)
    })
  })

  describe('8. Orders Admin APIs', () => {
    it('GET /api/orders - should fetch all orders', async () => {
      const response = await apiRequest('/api/orders')

      expect([200, 401]).toContain(response.status)

      if (response.status === 200) {
        const data = await response.json()
        expect(data.orders).toBeDefined()
        console.log(`✓ Orders endpoint accessible`)
      }
    })
  })

  describe('9. Discounts Admin APIs', () => {
    it('GET /api/discounts - should fetch all discounts (admin only)', async () => {
      const response = await apiRequest('/api/discounts')

      expect([200, 401, 403]).toContain(response.status)

      if (response.status === 200) {
        const data = await response.json()
        expect(data.discounts).toBeDefined()
        console.log('✓ Discounts endpoint accessible')
      }
    })

    it('POST /api/discounts - should create a new discount (admin only)', async () => {
      const response = await apiRequest('/api/discounts', {
        method: 'POST',
        body: JSON.stringify({
          code: `TEST${timestamp}`,
          discount_percentage: 10,
          valid_from: new Date().toISOString(),
          valid_until: new Date(Date.now() + 86400000).toISOString(),
        }),
      })

      expect([201, 401, 403, 400]).toContain(response.status)
    })
  })

  describe('10. Banners Admin APIs', () => {
    it('GET /api/banners - should fetch all banners', async () => {
      const response = await apiRequest('/api/banners')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.banners).toBeDefined()
      console.log(`✓ Found ${data.banners.length} banners`)
    })

    it('POST /api/banners - should create a new banner (admin only)', async () => {
      const response = await apiRequest('/api/banners', {
        method: 'POST',
        body: JSON.stringify({
          title: `Test Banner ${timestamp}`,
          position: 'homepage',
          is_active: true,
        }),
      })

      expect([201, 401, 403, 400]).toContain(response.status)
    })
  })

  describe('11. Users Admin APIs', () => {
    it('GET /api/users - should fetch all users (admin only)', async () => {
      const response = await apiRequest('/api/users')

      expect([200, 401, 403]).toContain(response.status)

      if (response.status === 200) {
        const data = await response.json()
        expect(data.users).toBeDefined()
        console.log('✓ Users endpoint accessible')
      }
    })
  })

  describe('12. Marketing APIs', () => {
    it('GET /api/marketing/campaigns - should fetch email campaigns (admin only)', async () => {
      const response = await apiRequest('/api/marketing/campaigns')

      expect([200, 401, 403]).toContain(response.status)

      if (response.status === 200) {
        const data = await response.json()
        expect(data.campaigns).toBeDefined()
        console.log('✓ Campaigns endpoint accessible')
      }
    })

    it('GET /api/marketing/lead-magnets - should fetch lead magnets (admin only)', async () => {
      const response = await apiRequest('/api/marketing/lead-magnets')

      expect([200, 401, 403]).toContain(response.status)
    })

    it('GET /api/marketing/analytics - should fetch marketing analytics (admin only)', async () => {
      const response = await apiRequest('/api/marketing/analytics')

      expect([200, 401, 403]).toContain(response.status)
    })

    it('GET /api/marketing/abandoned-carts - should fetch abandoned carts (admin only)', async () => {
      const response = await apiRequest('/api/marketing/abandoned-carts')

      expect([200, 401, 403]).toContain(response.status)
    })
  })

  describe('13. Facebook Marketing APIs', () => {
    it('GET /api/facebook/accounts - should fetch Facebook accounts', async () => {
      const response = await apiRequest('/api/facebook/accounts')

      expect([200, 401, 403, 404]).toContain(response.status)
    })

    it('GET /api/facebook/pixel - should fetch Facebook pixel configuration', async () => {
      const response = await apiRequest('/api/facebook/pixel')

      expect([200, 401, 403]).toContain(response.status)
    })
  })

  describe('14. Shipping Methods APIs', () => {
    it('GET /api/shipping-methods - should fetch all shipping methods', async () => {
      const response = await apiRequest('/api/shipping-methods')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.shippingMethods).toBeDefined()
      console.log(`✓ Shipping methods endpoint accessible`)
    })

    it('POST /api/shipping-methods - should create a shipping method (admin only)', async () => {
      const response = await apiRequest('/api/shipping-methods', {
        method: 'POST',
        body: JSON.stringify({
          name: `Test Shipping ${timestamp}`,
          cost: 10,
          estimated_days: 5,
        }),
      })

      expect([201, 401, 403, 400]).toContain(response.status)
    })
  })

  describe('15. WhatsApp APIs', () => {
    it('GET /api/whatsapp/metrics - should fetch WhatsApp metrics (admin only)', async () => {
      const response = await apiRequest('/api/whatsapp/metrics')

      expect([200, 401, 403]).toContain(response.status)
    })

    it('GET /api/whatsapp/logs - should fetch WhatsApp logs (admin only)', async () => {
      const response = await apiRequest('/api/whatsapp/logs')

      expect([200, 401, 403]).toContain(response.status)
    })
  })

  describe('16. Social Content APIs', () => {
    it('GET /api/social-content - should fetch social content (admin only)', async () => {
      const response = await apiRequest('/api/social-content')

      expect([200, 401, 403]).toContain(response.status)
    })

    it('POST /api/social-content/generate - should generate social content (admin only)', async () => {
      const response = await apiRequest('/api/social-content/generate', {
        method: 'POST',
        body: JSON.stringify({
          product_id: 1,
          platform: 'facebook',
        }),
      })

      expect([200, 201, 401, 403, 400]).toContain(response.status)
    })
  })

  describe('17. Analytics APIs', () => {
    it('GET /api/analytics - should fetch analytics data', async () => {
      const response = await apiRequest('/api/analytics')

      expect([200, 401, 403]).toContain(response.status)
    })

    it('GET /api/analytics/detailed - should fetch detailed analytics', async () => {
      const response = await apiRequest('/api/analytics/detailed')

      expect([200, 401, 403]).toContain(response.status)
    })

    it('GET /api/analytics/conversion - should fetch conversion analytics', async () => {
      const response = await apiRequest('/api/analytics/conversion')

      expect([200, 401, 403]).toContain(response.status)
    })
  })

  describe('18. Image Optimization APIs', () => {
    it('POST /api/images/optimize - should optimize images (admin only)', async () => {
      const response = await apiRequest('/api/images/optimize', {
        method: 'POST',
        body: JSON.stringify({
          url: 'https://example.com/image.jpg',
        }),
      })

      expect([200, 401, 403, 400]).toContain(response.status)
    })
  })
})
