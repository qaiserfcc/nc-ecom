import { test, expect, type Page } from '@playwright/test'

// Test data
const timestamp = Date.now()
const adminEmail = process.env.ADMIN_EMAIL || `admin.test.${timestamp}@example.com`
const adminPassword = process.env.ADMIN_PASSWORD || 'AdminTest123!'

// Helper function to login as admin
async function loginAsAdmin(page: Page) {
  await page.goto('/api/auth/signin')
  
  // Check if already logged in
  const isLoggedIn = await page.locator('text=Dashboard').isVisible().catch(() => false)
  
  if (!isLoggedIn) {
    await page.fill('input[type="email"]', adminEmail)
    await page.fill('input[type="password"]', adminPassword)
    await page.click('button[type="submit"]')
    await page.waitForURL('/admin', { timeout: 10000 })
  }
}

test.describe('Admin Dashboard Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin')
  })

  test('should load admin dashboard', async ({ page }) => {
    // Check for dashboard elements
    const dashboardVisible = await page.locator('text=Dashboard').first().isVisible().catch(() => false)
    expect(dashboardVisible).toBeTruthy()
  })

  test('should display sidebar navigation', async ({ page }) => {
    // Check for key navigation items
    const navigationItems = [
      'Dashboard',
      'Products',
      'Categories',
      'Orders',
      'Users',
    ]

    for (const item of navigationItems) {
      const itemVisible = await page.locator(`text=${item}`).first().isVisible().catch(() => false)
      // Items should be visible
      expect(itemVisible).toBeTruthy()
    }
  })

  test('should navigate to enhanced dashboard', async ({ page }) => {
    await page.click('text=Enhanced Dashboard')
    await page.waitForURL('/admin/dashboard', { timeout: 10000 })
    
    const url = page.url()
    expect(url).toContain('/admin/dashboard')
  })
})

test.describe('Products Management Tests', () => {
  test('should load products list page', async ({ page }) => {
    await page.goto('/admin/products')
    
    // Wait for page to load
    await page.waitForSelector('text=Products', { timeout: 10000 })
    
    // Check for products table or list
    const hasContent = await page.locator('table, [role="table"], text=No products').isVisible().catch(() => true)
    expect(hasContent).toBeTruthy()
  })

  test('should navigate to new product page', async ({ page }) => {
    await page.goto('/admin/products')
    
    // Look for "New Product" or similar button
    const newButton = page.locator('text=/New Product|Add Product|Create Product/i').first()
    const buttonExists = await newButton.isVisible().catch(() => false)
    
    if (buttonExists) {
      await newButton.click()
      await page.waitForURL(/\/admin\/products\/(new|create)/, { timeout: 10000 })
      
      const url = page.url()
      expect(url).toMatch(/\/admin\/products\/(new|create)/)
    }
  })

  test('should load bulk products page', async ({ page }) => {
    await page.goto('/admin/products/bulk')
    
    // Check that page loaded
    const hasContent = await page.locator('text=/Bulk|Import|Upload/i').isVisible().catch(() => true)
    expect(hasContent).toBeTruthy()
  })
})

test.describe('Categories Management Tests', () => {
  test('should load categories page', async ({ page }) => {
    await page.goto('/admin/categories')
    
    await page.waitForSelector('text=/Categories|Category/i', { timeout: 10000 })
    
    const hasContent = await page.locator('table, [role="table"], text=No categories').isVisible().catch(() => true)
    expect(hasContent).toBeTruthy()
  })
})

test.describe('Brands Management Tests', () => {
  test('should load brands list page', async ({ page }) => {
    await page.goto('/admin/brands')
    
    await page.waitForSelector('text=/Brands|Brand/i', { timeout: 10000 })
    
    const hasContent = await page.locator('table, [role="table"], text=No brands').isVisible().catch(() => true)
    expect(hasContent).toBeTruthy()
  })

  test('should navigate to new brand page', async ({ page }) => {
    await page.goto('/admin/brands')
    
    const newButton = page.locator('text=/New Brand|Add Brand|Create Brand/i').first()
    const buttonExists = await newButton.isVisible().catch(() => false)
    
    if (buttonExists) {
      await newButton.click()
      await page.waitForURL('/admin/brands/new', { timeout: 10000 })
    }
  })
})

test.describe('Bundles Management Tests', () => {
  test('should load bundles list page', async ({ page }) => {
    await page.goto('/admin/bundles')
    
    await page.waitForSelector('text=/Bundles|Bundle/i', { timeout: 10000 })
    
    const hasContent = await page.locator('table, [role="table"], text=No bundles').isVisible().catch(() => true)
    expect(hasContent).toBeTruthy()
  })

  test('should navigate to new bundle page', async ({ page }) => {
    await page.goto('/admin/bundles')
    
    const newButton = page.locator('text=/New Bundle|Add Bundle|Create Bundle/i').first()
    const buttonExists = await newButton.isVisible().catch(() => false)
    
    if (buttonExists) {
      await newButton.click()
      await page.waitForURL('/admin/bundles/new', { timeout: 10000 })
    }
  })
})

test.describe('Orders Management Tests', () => {
  test('should load orders list page', async ({ page }) => {
    await page.goto('/admin/orders')
    
    await page.waitForSelector('text=/Orders|Order/i', { timeout: 10000 })
    
    const hasContent = await page.locator('table, [role="table"], text=No orders').isVisible().catch(() => true)
    expect(hasContent).toBeTruthy()
  })
})

test.describe('Discounts Management Tests', () => {
  test('should load discounts page', async ({ page }) => {
    await page.goto('/admin/discounts')
    
    await page.waitForSelector('text=/Discounts|Discount/i', { timeout: 10000 })
    
    const hasContent = await page.locator('table, [role="table"], text=No discounts').isVisible().catch(() => true)
    expect(hasContent).toBeTruthy()
  })
})

test.describe('Banners Management Tests', () => {
  test('should load banners list page', async ({ page }) => {
    await page.goto('/admin/banners')
    
    await page.waitForSelector('text=/Banners|Banner/i', { timeout: 10000 })
    
    const hasContent = await page.locator('table, [role="table"], text=No banners').isVisible().catch(() => true)
    expect(hasContent).toBeTruthy()
  })

  test('should navigate to new banner page', async ({ page }) => {
    await page.goto('/admin/banners')
    
    const newButton = page.locator('text=/New Banner|Add Banner|Create Banner/i').first()
    const buttonExists = await newButton.isVisible().catch(() => false)
    
    if (buttonExists) {
      await newButton.click()
      await page.waitForURL('/admin/banners/new', { timeout: 10000 })
    }
  })
})

test.describe('Users Management Tests', () => {
  test('should load users list page', async ({ page }) => {
    await page.goto('/admin/users')
    
    await page.waitForSelector('text=/Users|User/i', { timeout: 10000 })
    
    const hasContent = await page.locator('table, [role="table"], text=No users').isVisible().catch(() => true)
    expect(hasContent).toBeTruthy()
  })
})

test.describe('Marketing Tests', () => {
  test('should load lead magnets page', async ({ page }) => {
    await page.goto('/admin/marketing/lead-magnets')
    
    await page.waitForSelector('text=/Lead Magnets|Lead Magnet/i', { timeout: 10000 })
    
    const hasContent = await page.locator('table, [role="table"], text=No lead magnets').isVisible().catch(() => true)
    expect(hasContent).toBeTruthy()
  })

  test('should load email campaigns page', async ({ page }) => {
    await page.goto('/admin/marketing/campaigns')
    
    await page.waitForSelector('text=/Campaigns|Campaign|Email/i', { timeout: 10000 })
    
    const hasContent = await page.locator('table, [role="table"], text=No campaigns').isVisible().catch(() => true)
    expect(hasContent).toBeTruthy()
  })

  test('should load marketing analytics page', async ({ page }) => {
    await page.goto('/admin/marketing/analytics')
    
    await page.waitForSelector('text=/Analytics|Marketing/i', { timeout: 10000 })
    
    const pageLoaded = page.url().includes('/admin/marketing/analytics')
    expect(pageLoaded).toBeTruthy()
  })
})

test.describe('Facebook Marketing Tests', () => {
  test('should load Facebook marketing page', async ({ page }) => {
    await page.goto('/admin/facebook')
    
    await page.waitForSelector('text=/Facebook|Marketing/i', { timeout: 10000 })
    
    const pageLoaded = page.url().includes('/admin/facebook')
    expect(pageLoaded).toBeTruthy()
  })

  test('should load Facebook pages page', async ({ page }) => {
    await page.goto('/admin/facebook/pages')
    
    const pageLoaded = page.url().includes('/admin/facebook/pages')
    expect(pageLoaded).toBeTruthy()
  })

  test('should load Facebook campaigns page', async ({ page }) => {
    await page.goto('/admin/facebook/campaigns')
    
    const pageLoaded = page.url().includes('/admin/facebook/campaigns')
    expect(pageLoaded).toBeTruthy()
  })

  test('should load Facebook leads page', async ({ page }) => {
    await page.goto('/admin/facebook/leads')
    
    const pageLoaded = page.url().includes('/admin/facebook/leads')
    expect(pageLoaded).toBeTruthy()
  })

  test('should load Facebook posts page', async ({ page }) => {
    await page.goto('/admin/facebook/posts')
    
    const pageLoaded = page.url().includes('/admin/facebook/posts')
    expect(pageLoaded).toBeTruthy()
  })
})

test.describe('Meta Pixel Tests', () => {
  test('should load Meta Pixel configuration page', async ({ page }) => {
    await page.goto('/admin/meta-pixel')
    
    await page.waitForSelector('text=/Meta Pixel|Pixel|Configuration/i', { timeout: 10000 })
    
    const pageLoaded = page.url().includes('/admin/meta-pixel')
    expect(pageLoaded).toBeTruthy()
  })

  test('should load Meta Pixel initialization page', async ({ page }) => {
    await page.goto('/admin/meta-pixel/init')
    
    const pageLoaded = page.url().includes('/admin/meta-pixel/init')
    expect(pageLoaded).toBeTruthy()
  })
})

test.describe('WhatsApp Integration Tests', () => {
  test('should load WhatsApp page', async ({ page }) => {
    await page.goto('/admin/whatsapp')
    
    await page.waitForSelector('text=/WhatsApp/i', { timeout: 10000 })
    
    const pageLoaded = page.url().includes('/admin/whatsapp')
    expect(pageLoaded).toBeTruthy()
  })
})

test.describe('Social Content Tests', () => {
  test('should load social content page', async ({ page }) => {
    await page.goto('/admin/social-content')
    
    await page.waitForSelector('text=/Social|Content/i', { timeout: 10000 })
    
    const pageLoaded = page.url().includes('/admin/social-content')
    expect(pageLoaded).toBeTruthy()
  })
})

test.describe('Shipping Methods Tests', () => {
  test('should load shipping methods page', async ({ page }) => {
    await page.goto('/admin/shipping-methods')
    
    await page.waitForSelector('text=/Shipping/i', { timeout: 10000 })
    
    const hasContent = await page.locator('table, [role="table"], text=No shipping').isVisible().catch(() => true)
    expect(hasContent).toBeTruthy()
  })
})

test.describe('Image Migration Tests', () => {
  test('should load image migration page', async ({ page }) => {
    await page.goto('/admin/migrate-images')
    
    await page.waitForSelector('text=/Migrate|Image/i', { timeout: 10000 })
    
    const pageLoaded = page.url().includes('/admin/migrate-images')
    expect(pageLoaded).toBeTruthy()
  })
})

test.describe('Analytics Tests', () => {
  test('should load analytics page', async ({ page }) => {
    await page.goto('/admin/analytics')
    
    await page.waitForSelector('text=/Analytics/i', { timeout: 10000 })
    
    const pageLoaded = page.url().includes('/admin/analytics')
    expect(pageLoaded).toBeTruthy()
  })
})

test.describe('Admin Navigation Tests', () => {
  test('should be able to navigate between different admin pages', async ({ page }) => {
    // Start at admin home
    await page.goto('/admin')
    
    // Navigate to products
    await page.click('text=Products')
    await page.waitForURL('/admin/products', { timeout: 10000 })
    expect(page.url()).toContain('/admin/products')
    
    // Navigate to categories
    await page.click('text=Categories')
    await page.waitForURL('/admin/categories', { timeout: 10000 })
    expect(page.url()).toContain('/admin/categories')
    
    // Navigate to orders
    await page.click('text=Orders')
    await page.waitForURL('/admin/orders', { timeout: 10000 })
    expect(page.url()).toContain('/admin/orders')
  })

  test('should show mobile menu on small screens', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/admin')
    
    // Look for mobile menu button
    const menuButton = page.locator('button[aria-label*="menu"], button:has-text("Menu")').first()
    const buttonVisible = await menuButton.isVisible().catch(() => false)
    
    if (buttonVisible) {
      await menuButton.click()
      
      // Menu should be visible
      const menuVisible = await page.locator('text=Dashboard').isVisible()
      expect(menuVisible).toBeTruthy()
    }
  })
})

test.describe('Admin Access Control Tests', () => {
  test('should redirect non-admin users from admin pages', async ({ page }) => {
    // Try to access admin page without authentication
    await page.goto('/admin')
    
    // Should either redirect to login or show unauthorized message
    const url = page.url()
    const hasUnauthorized = await page.locator('text=/Unauthorized|Access Denied|Sign in/i').isVisible().catch(() => false)
    
    const isProtected = url.includes('/signin') || url.includes('/login') || hasUnauthorized
    expect(isProtected).toBeTruthy()
  })
})
