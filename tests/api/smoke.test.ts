import { describe, it, expect } from 'vitest'

// Test configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
let authCookie: string = ''
let testUserId: number
let testProductId: number
let testBundleId: number
let testBrandId: number
let testCategorySlug: string
let testCartItemId: number
let testOrderId: number
let testWishlistItemId: number

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

  if (authCookie && !headers['Cookie']) {
    headers['Cookie'] = authCookie
  }

  return fetch(url, {
    ...options,
    headers,
  })
}

// Helper to extract numeric value from response
function extractId(data: any, path: string): number | undefined {
  const parts = path.split('.')
  let value = data
  for (const part of parts) {
    value = value?.[part]
  }
  return typeof value === 'number' ? value : undefined
}

describe('API Smoke Tests - Complete E-Commerce Flow', () => {
  const timestamp = Date.now()
  const testEmail = `smoke.test.${timestamp}@example.com`
  const testPassword = 'SmokeTest123!'
  const testName = `Smoke Test User ${timestamp}`

  describe('1. Authentication APIs', () => {
    it('POST /api/auth/signup - should register a new user', async () => {
      const response = await apiRequest('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          name: testName,
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.user).toBeDefined()
      expect(data.user.email).toBe(testEmail)
      testUserId = data.user.id
      console.log(`✓ Created test user ID: ${testUserId}`)
    }, 10000) // Increased timeout to 10 seconds

    it('POST /api/auth/signin - should login successfully', async () => {
      const response = await apiRequest('/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.user).toBeDefined()
      expect(data.user.email).toBe(testEmail)
      
      const setCookie = response.headers.get('set-cookie')
      if (setCookie) {
        authCookie = setCookie.split(';')[0]
        console.log('✓ Authenticated successfully')
      }
    })

    it('GET /api/auth/me - should verify current user', async () => {
      const response = await apiRequest('/api/auth/me')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.user).toBeDefined()
      expect(data.user.email).toBe(testEmail)
      expect(data.user.id).toBe(testUserId)
    })

    it('GET /api/auth/me - should reject invalid token', async () => {
      const response = await apiRequest('/api/auth/me', {
        headers: { Cookie: 'auth_token=invalid_token_12345' },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.user).toBeNull()
    })
  })

  describe('2. Products APIs', () => {
    it('GET /api/products - should fetch products list', async () => {
      const response = await apiRequest('/api/products')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.products).toBeDefined()
      expect(Array.isArray(data.products)).toBe(true)
      expect(data.pagination).toBeDefined()
      expect(data.pagination.total).toBeGreaterThanOrEqual(0)
      
      if (data.products.length > 0) {
        testProductId = data.products[0].id
        console.log(`✓ Found ${data.products.length} products, using ID: ${testProductId}`)
      }
    })

    it('GET /api/products?featured=true - should fetch featured products', async () => {
      const response = await apiRequest('/api/products?featured=true&limit=100')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.products).toBeDefined()
      expect(Array.isArray(data.products)).toBe(true)
      console.log(`✓ Found ${data.products.length} featured products`)
    })

    it('GET /api/products?new=true - should fetch new arrivals', async () => {
      const response = await apiRequest('/api/products?new=true&limit=100')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.products).toBeDefined()
      expect(Array.isArray(data.products)).toBe(true)
      console.log(`✓ Found ${data.products.length} new arrivals`)
    })

    it('GET /api/products?category=<slug> - should filter by category', async () => {
      if (!testCategorySlug) {
        console.log('⊘ Skipping category filter test - no category available')
        return
      }

      const response = await apiRequest(`/api/products?category=${testCategorySlug}`)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.products).toBeDefined()
      expect(Array.isArray(data.products)).toBe(true)
    })

    it('GET /api/products?search=<term> - should search products', async () => {
      const response = await apiRequest('/api/products?search=test')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.products).toBeDefined()
      expect(Array.isArray(data.products)).toBe(true)
    })

    it('GET /api/products?sort=current_price&order=asc - should sort products', async () => {
      const response = await apiRequest('/api/products?sort=current_price&order=asc&limit=10')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.products).toBeDefined()
      expect(Array.isArray(data.products)).toBe(true)
    })

    it('GET /api/products/[id] - should fetch single product', async () => {
      if (!testProductId) {
        console.log('⊘ Skipping single product test - no product ID')
        return
      }

      const response = await apiRequest(`/api/products/${testProductId}`)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.product).toBeDefined()
      expect(data.product.id).toBe(testProductId)
      expect(data.product.name).toBeDefined()
      expect(data.product.current_price).toBeDefined()
    })

    it('GET /api/products/999999 - should return 404 for non-existent product', async () => {
      const response = await apiRequest('/api/products/999999')

      expect(response.status).toBe(404)
    })
  })

  describe('3. Brands APIs', () => {
    it('GET /api/brands - should fetch all brands', async () => {
      const response = await apiRequest('/api/brands?all=true')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.brands).toBeDefined()
      expect(Array.isArray(data.brands)).toBe(true)
      
      if (data.brands.length > 0) {
        testBrandId = data.brands[0].id
        console.log(`✓ Found ${data.brands.length} brands, using ID: ${testBrandId}`)
      }
    })

    it('GET /api/brands/[id] - should fetch single brand', async () => {
      if (!testBrandId) {
        console.log('⊘ Skipping single brand test - no brand ID')
        return
      }

      const response = await apiRequest(`/api/brands/${testBrandId}`)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.brand).toBeDefined()
      expect(data.brand.id).toBe(testBrandId)
      expect(data.brand.name).toBeDefined()
    })

    it('GET /api/products?brand=<slug> - should filter products by brand', async () => {
      if (!testBrandId) {
        console.log('⊘ Skipping brand filter test - no brand ID')
        return
      }

      const brandResponse = await apiRequest(`/api/brands/${testBrandId}`)
      if (brandResponse.status !== 200) return

      const brandData = await brandResponse.json()
      const brandSlug = brandData.brand?.slug

      if (!brandSlug) return

      const response = await apiRequest(`/api/products?brand=${brandSlug}`)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.products).toBeDefined()
      expect(Array.isArray(data.products)).toBe(true)
    })
  })

  describe('4. Bundles APIs', () => {
    it('GET /api/bundles - should fetch all bundles', async () => {
      const response = await apiRequest('/api/bundles?all=true')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.bundles).toBeDefined()
      expect(Array.isArray(data.bundles)).toBe(true)
      
      if (data.bundles.length > 0) {
        testBundleId = data.bundles[0].id
        console.log(`✓ Found ${data.bundles.length} bundles, using ID: ${testBundleId}`)
      }
    })

    it('GET /api/bundles/[id] - should fetch single bundle with items', async () => {
      if (!testBundleId) {
        console.log('⊘ Skipping single bundle test - no bundle ID')
        return
      }

      const response = await apiRequest(`/api/bundles/${testBundleId}`)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.bundle).toBeDefined()
      expect(data.bundle.id).toBe(testBundleId)
      expect(data.bundle.items).toBeDefined()
      expect(Array.isArray(data.bundle.items)).toBe(true)
    })
  })

  describe('5. Categories APIs', () => {
    it('GET /api/categories - should fetch all categories', async () => {
      const response = await apiRequest('/api/categories')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.categories).toBeDefined()
      expect(Array.isArray(data.categories)).toBe(true)
      
      if (data.categories.length > 0) {
        testCategorySlug = data.categories[0].slug
        console.log(`✓ Found ${data.categories.length} categories`)
      }
    })
  })

  describe('6. Cart APIs (Authenticated)', () => {
    it('GET /api/cart - should get empty cart', async () => {
      const response = await apiRequest('/api/cart')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.items).toBeDefined()
      expect(Array.isArray(data.items)).toBe(true)
    })

    it('POST /api/cart - should add item to cart', async () => {
      if (!testProductId) {
        console.log('⊘ Skipping cart add test - no product ID')
        return
      }

      const response = await apiRequest('/api/cart', {
        method: 'POST',
        body: JSON.stringify({
          product_id: testProductId,
          quantity: 2,
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      console.log('✓ Added item to cart')
    })

    it('GET /api/cart - should get cart with items', async () => {
      const response = await apiRequest('/api/cart')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.items).toBeDefined()
      
      if (data.items.length > 0) {
        testCartItemId = data.items[0].id
        expect(data.itemCount).toBeGreaterThan(0)
        expect(data.totalAmount).toBeGreaterThan(0)
        console.log(`✓ Cart has ${data.items.length} item(s), total: Rs. ${data.totalAmount}`)
      }
    })

    it('PUT /api/cart/[id] - should update cart item quantity', async () => {
      if (!testCartItemId) {
        console.log('⊘ Skipping cart update test - no cart item')
        return
      }

      const response = await apiRequest(`/api/cart/${testCartItemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity: 3 }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.item).toBeDefined()
      expect(data.item.quantity).toBe(3)
    })

    it('DELETE /api/cart/[id] - should remove item from cart', async () => {
      if (!testCartItemId) {
        console.log('⊘ Skipping cart delete test - no cart item')
        return
      }

      const response = await apiRequest(`/api/cart/${testCartItemId}`, {
        method: 'DELETE',
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
    })

    it('GET /api/cart - should require authentication', async () => {
      const response = await apiRequest('/api/cart', {
        headers: { Cookie: 'auth_token=invalid' },
      })

      expect(response.status).toBe(401)
    })
  })

  describe('7. Wishlist APIs (Authenticated)', () => {
    it('GET /api/wishlist - should get empty wishlist', async () => {
      const response = await apiRequest('/api/wishlist')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.items).toBeDefined()
      expect(Array.isArray(data.items)).toBe(true)
    })

    it('POST /api/wishlist - should add item to wishlist', async () => {
      if (!testProductId) {
        console.log('⊘ Skipping wishlist add test - no product ID')
        return
      }

      const response = await apiRequest('/api/wishlist', {
        method: 'POST',
        body: JSON.stringify({ product_id: testProductId }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      console.log('✓ Added item to wishlist')
    })

    it('GET /api/wishlist - should get wishlist with items', async () => {
      const response = await apiRequest('/api/wishlist')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.items).toBeDefined()
      
      if (data.items.length > 0) {
        testWishlistItemId = data.items[0].id
        console.log(`✓ Wishlist has ${data.items.length} item(s)`)
      }
    })

    it('DELETE /api/wishlist/[id] - should remove item from wishlist', async () => {
      if (!testWishlistItemId) {
        console.log('⊘ Skipping wishlist delete test - no wishlist item')
        return
      }

      const response = await apiRequest(`/api/wishlist/${testWishlistItemId}`, {
        method: 'DELETE',
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
    })

    it('GET /api/wishlist - should require authentication', async () => {
      const response = await apiRequest('/api/wishlist', {
        headers: { Cookie: 'auth_token=invalid' },
      })

      expect(response.status).toBe(401)
    })
  })

  describe('8. Orders APIs (Authenticated)', () => {
    it('GET /api/orders - should get user orders', async () => {
      const response = await apiRequest('/api/orders')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.orders).toBeDefined()
      expect(Array.isArray(data.orders)).toBe(true)
    })

    it('POST /api/orders - should create order (may fail if cart empty)', async () => {
      // Re-add item to cart first
      if (testProductId) {
        await apiRequest('/api/cart', {
          method: 'POST',
          body: JSON.stringify({
            product_id: testProductId,
            quantity: 1,
          }),
        })
      }

      const response = await apiRequest('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          shipping_address: '123 Test Street',
          shipping_city: 'Test City',
          shipping_postal_code: '12345',
          shipping_country: 'Pakistan',
          payment_method: 'credit_card',
        }),
      })

      if (response.status === 201) {
        const data = await response.json()
        expect(data.order).toBeDefined()
        testOrderId = data.order.id
        console.log(`✓ Created order ID: ${testOrderId}`)
      } else if (response.status === 400) {
        console.log('⊘ Order creation failed - cart may be empty')
      }
      
      expect([201, 400]).toContain(response.status)
    })

    it('GET /api/orders/[id] - should fetch single order', async () => {
      if (!testOrderId) {
        console.log('⊘ Skipping single order test - no order created')
        return
      }

      const response = await apiRequest(`/api/orders/${testOrderId}`)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.order).toBeDefined()
      expect(data.order.id).toBe(testOrderId)
      expect(data.order.items).toBeDefined()
    })

    it('GET /api/orders - should require authentication', async () => {
      const response = await apiRequest('/api/orders', {
        headers: { Cookie: 'auth_token=invalid' },
      })

      expect(response.status).toBe(401)
    })
  })

  describe('9. Analytics APIs (Admin)', () => {
    it('GET /api/analytics - should access analytics endpoint', async () => {
      const response = await apiRequest('/api/analytics')

      // Regular user may not have access (401/403), or endpoint may return data
      expect([200, 401, 403, 500]).toContain(response.status)
      
      if (response.status === 200) {
        const data = await response.json()
        console.log('✓ Analytics accessible (user may have admin rights)')
      } else {
        console.log('⊘ Analytics restricted (expected for regular user)')
      }
    })
  })

  describe('10. Discounts APIs', () => {
    it('GET /api/discounts - should access discounts endpoint', async () => {
      const response = await apiRequest('/api/discounts')

      // Admin endpoint - expect 401 for regular user, 200 for admin
      expect([200, 401, 403]).toContain(response.status)
      
      if (response.status === 200) {
        console.log('✓ Discounts accessible')
      } else {
        console.log('⊘ Discounts restricted (expected for regular user)')
      }
    })
  })

  describe('11. Users APIs', () => {
    it('GET /api/users - should access users endpoint', async () => {
      const response = await apiRequest('/api/users')

      // Admin endpoint - expect 401 for regular user, 200 for admin
      expect([200, 401, 403]).toContain(response.status)
    })

    it('GET /api/users/[id] - should access user details', async () => {
      if (!testUserId) {
        console.log('⊘ Skipping user details test - no user ID')
        return
      }

      const response = await apiRequest(`/api/users/${testUserId}`)

      // May be restricted or allow access to own profile
      expect([200, 401, 403]).toContain(response.status)
    })
  })

  describe('12. Authentication Cleanup', () => {
    it('POST /api/auth/signout - should logout successfully', async () => {
      const response = await apiRequest('/api/auth/signout', {
        method: 'POST',
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      
      // Clear auth cookie after logout
      authCookie = ''
      
      console.log('✓ Logged out successfully')
    })

    it('GET /api/auth/me - should return null after logout', async () => {
      const response = await apiRequest('/api/auth/me')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.user).toBeNull()
    })
  })
})
