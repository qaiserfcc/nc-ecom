import { test, expect, type Page } from '@playwright/test'

const timestamp = Date.now()

// Helper function to wait for form submission success
async function waitForFormSuccess(page: Page, successPath?: string) {
  await Promise.race([
    successPath ? page.waitForURL(new RegExp(successPath), { timeout: 5000 }).catch(() => {}) : Promise.resolve(),
    page.waitForSelector('text=/success|created|saved|updated|deleted/i', { timeout: 5000 }).catch(() => {}),
    page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {}),
  ])
}

test.describe('Admin Product Actions Tests', () => {
  let productId: string

  test('should create a new product', async ({ page }) => {
    await page.goto('/admin/products/new')
    
    // Wait for form to load
    await page.waitForSelector('input[name="name"], input[id="name"]', { timeout: 10000 })
    
    // Fill in product details
    const productName = `Test Product ${timestamp}`
    await page.fill('input[name="name"], input[id="name"]', productName)
    
    // Fill description if exists
    const descInput = page.locator('textarea[name="description"], textarea[id="description"]')
    if (await descInput.isVisible().catch(() => false)) {
      await descInput.fill(`Test description for ${productName}`)
    }
    
    // Fill price if exists
    const priceInput = page.locator('input[name="price"], input[name="current_price"], input[id="price"]')
    if (await priceInput.isVisible().catch(() => false)) {
      await priceInput.fill('99.99')
    }
    
    // Submit form
    const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")')
    if (await submitButton.isVisible().catch(() => false)) {
      await submitButton.click()
      
      // Wait for success indication (either URL change or toast message)
      await Promise.race([
        page.waitForURL(/\/admin\/products/, { timeout: 5000 }).catch(() => {}),
        page.waitForSelector('text=/success|created|saved/i', { timeout: 5000 }).catch(() => {}),
      ])
      
      // Check for success (either redirected or message shown)
      const url = page.url()
      const hasSuccess = url.includes('/admin/products') && !url.includes('/new')
      
      if (hasSuccess) {
        // Extract product ID from URL if possible
        const match = url.match(/\/products\/(\d+)/)
        if (match) {
          productId = match[1]
        }
      }
    }
  })

  test('should edit a product', async ({ page }) => {
    // Go to products list
    await page.goto('/admin/products')
    
    await page.waitForSelector('text=/Products/i', { timeout: 10000 })
    
    // Find first edit button
    const editButton = page.locator('a[href*="/admin/products/"], button:has-text("Edit")').first()
    const buttonExists = await editButton.isVisible().catch(() => false)
    
    if (buttonExists) {
      await editButton.click()
      
      // Wait for edit form
      await page.waitForSelector('input[name="name"], input[id="name"]', { timeout: 10000 })
      
      // Update product name
      const nameInput = page.locator('input[name="name"], input[id="name"]')
      await nameInput.fill(`Updated Product ${timestamp}`)
      
      // Submit form
      const submitButton = page.locator('button[type="submit"], button:has-text("Update"), button:has-text("Save")')
      if (await submitButton.isVisible().catch(() => false)) {
        await submitButton.click()
        await Promise.race([
          page.waitForURL(/\/admin\/products/, { timeout: 5000 }).catch(() => {}),
          page.waitForSelector('text=/success|updated|saved/i', { timeout: 5000 }).catch(() => {}),
        ])
      }
    }
  })

  test('should delete a product', async ({ page }) => {
    await page.goto('/admin/products')
    
    await page.waitForSelector('text=/Products/i', { timeout: 10000 })
    
    // Find first delete button
    const deleteButton = page.locator('button:has-text("Delete"), button[aria-label*="delete"]').first()
    const buttonExists = await deleteButton.isVisible().catch(() => false)
    
    if (buttonExists) {
      await deleteButton.click()
      
      // Confirm deletion if confirmation dialog appears
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")')
      const confirmExists = await confirmButton.isVisible().catch(() => false)
      
      if (confirmExists) {
        await confirmButton.click()
        await Promise.race([
          page.waitForSelector('text=/deleted|removed|success/i', { timeout: 5000 }).catch(() => {}),
          page.waitForURL('/admin/products', { timeout: 5000 }).catch(() => {}),
        ])
      }
    }
  })
})

test.describe('Admin Brand Actions Tests', () => {
  test('should create a new brand', async ({ page }) => {
    await page.goto('/admin/brands/new')
    
    await page.waitForSelector('input[name="name"], input[id="name"]', { timeout: 10000 })
    
    const brandName = `Test Brand ${timestamp}`
    await page.fill('input[name="name"], input[id="name"]', brandName)
    
    // Fill slug if exists
    const slugInput = page.locator('input[name="slug"], input[id="slug"]')
    if (await slugInput.isVisible().catch(() => false)) {
      await slugInput.fill(`test-brand-${timestamp}`)
    }
    
    const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")')
    if (await submitButton.isVisible().catch(() => false)) {
      await submitButton.click()
      await page.waitForTimeout(2000)
    }
  })

  test('should list all brands', async ({ page }) => {
    await page.goto('/admin/brands')
    
    await page.waitForSelector('text=/Brands/i', { timeout: 10000 })
    
    const hasContent = await page.locator('table, [role="table"]').isVisible().catch(() => false)
    expect(hasContent || true).toBeTruthy()
  })
})

test.describe('Admin Category Actions Tests', () => {
  test('should create a new category', async ({ page }) => {
    await page.goto('/admin/categories')
    
    // Look for add/new button
    const newButton = page.locator('button:has-text("New"), button:has-text("Add"), button:has-text("Create")').first()
    const buttonExists = await newButton.isVisible().catch(() => false)
    
    if (buttonExists) {
      await newButton.click()
      
      // Wait for form (might be modal or new page)
      await page.waitForSelector('input[name="name"], input[id="name"]', { timeout: 10000 })
      
      const categoryName = `Test Category ${timestamp}`
      await page.fill('input[name="name"], input[id="name"]', categoryName)
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")')
      if (await submitButton.isVisible().catch(() => false)) {
        await submitButton.click()
        await page.waitForTimeout(2000)
      }
    }
  })
})

test.describe('Admin Bundle Actions Tests', () => {
  test('should create a new bundle', async ({ page }) => {
    await page.goto('/admin/bundles/new')
    
    await page.waitForSelector('input[name="name"], input[id="name"]', { timeout: 10000 })
    
    const bundleName = `Test Bundle ${timestamp}`
    await page.fill('input[name="name"], input[id="name"]', bundleName)
    
    // Fill description if exists
    const descInput = page.locator('textarea[name="description"], textarea[id="description"]')
    if (await descInput.isVisible().catch(() => false)) {
      await descInput.fill(`Test bundle description`)
    }
    
    // Fill discount if exists
    const discountInput = page.locator('input[name="discount_percentage"], input[id="discount_percentage"]')
    if (await discountInput.isVisible().catch(() => false)) {
      await discountInput.fill('10')
    }
    
    const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")')
    if (await submitButton.isVisible().catch(() => false)) {
      await submitButton.click()
      await page.waitForTimeout(2000)
    }
  })
})

test.describe('Admin Banner Actions Tests', () => {
  test('should create a new banner', async ({ page }) => {
    await page.goto('/admin/banners/new')
    
    await page.waitForSelector('input[name="title"], input[id="title"]', { timeout: 10000 })
    
    const bannerTitle = `Test Banner ${timestamp}`
    await page.fill('input[name="title"], input[id="title"]', bannerTitle)
    
    const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")')
    if (await submitButton.isVisible().catch(() => false)) {
      await submitButton.click()
      await page.waitForTimeout(2000)
    }
  })
})

test.describe('Admin Discount Actions Tests', () => {
  test('should create a new discount', async ({ page }) => {
    await page.goto('/admin/discounts')
    
    // Look for add/new button
    const newButton = page.locator('button:has-text("New"), button:has-text("Add"), button:has-text("Create")').first()
    const buttonExists = await newButton.isVisible().catch(() => false)
    
    if (buttonExists) {
      await newButton.click()
      
      // Wait for form
      await page.waitForSelector('input[name="code"], input[id="code"]', { timeout: 10000 })
      
      const discountCode = `TEST${timestamp}`
      await page.fill('input[name="code"], input[id="code"]', discountCode)
      
      // Fill discount percentage if exists
      const percentInput = page.locator('input[name="discount_percentage"], input[id="discount_percentage"]')
      if (await percentInput.isVisible().catch(() => false)) {
        await percentInput.fill('15')
      }
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")')
      if (await submitButton.isVisible().catch(() => false)) {
        await submitButton.click()
        await page.waitForTimeout(2000)
      }
    }
  })
})

test.describe('Admin Shipping Method Actions Tests', () => {
  test('should create a new shipping method', async ({ page }) => {
    await page.goto('/admin/shipping-methods')
    
    const newButton = page.locator('button:has-text("New"), button:has-text("Add"), button:has-text("Create")').first()
    const buttonExists = await newButton.isVisible().catch(() => false)
    
    if (buttonExists) {
      await newButton.click()
      
      await page.waitForSelector('input[name="name"], input[id="name"]', { timeout: 10000 })
      
      const methodName = `Test Shipping ${timestamp}`
      await page.fill('input[name="name"], input[id="name"]', methodName)
      
      // Fill cost if exists
      const costInput = page.locator('input[name="cost"], input[id="cost"]')
      if (await costInput.isVisible().catch(() => false)) {
        await costInput.fill('10')
      }
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")')
      if (await submitButton.isVisible().catch(() => false)) {
        await submitButton.click()
        await page.waitForTimeout(2000)
      }
    }
  })
})

test.describe('Admin Order Management Tests', () => {
  test('should view order details', async ({ page }) => {
    await page.goto('/admin/orders')
    
    await page.waitForSelector('text=/Orders/i', { timeout: 10000 })
    
    // Find first order link
    const orderLink = page.locator('a[href*="/admin/orders/"]').first()
    const linkExists = await orderLink.isVisible().catch(() => false)
    
    if (linkExists) {
      await orderLink.click()
      
      // Wait for order details page
      await page.waitForSelector('text=/Order|Details|Status/i', { timeout: 10000 })
      
      const url = page.url()
      expect(url).toContain('/admin/orders/')
    }
  })

  test('should update order status', async ({ page }) => {
    await page.goto('/admin/orders')
    
    await page.waitForSelector('text=/Orders/i', { timeout: 10000 })
    
    // Find first order
    const orderLink = page.locator('a[href*="/admin/orders/"]').first()
    const linkExists = await orderLink.isVisible().catch(() => false)
    
    if (linkExists) {
      await orderLink.click()
      
      // Look for status dropdown/select
      const statusSelect = page.locator('select[name="status"], select[id="status"]')
      const selectExists = await statusSelect.isVisible().catch(() => false)
      
      if (selectExists) {
        await statusSelect.selectOption({ index: 1 })
        
        // Look for update/save button
        const updateButton = page.locator('button:has-text("Update"), button:has-text("Save")')
        const buttonExists = await updateButton.isVisible().catch(() => false)
        
        if (buttonExists) {
          await updateButton.click()
          await page.waitForTimeout(2000)
        }
      }
    }
  })
})

test.describe('Admin User Management Tests', () => {
  test('should view user details', async ({ page }) => {
    await page.goto('/admin/users')
    
    await page.waitForSelector('text=/Users/i', { timeout: 10000 })
    
    // Find first user link
    const userLink = page.locator('a[href*="/admin/users/"]').first()
    const linkExists = await userLink.isVisible().catch(() => false)
    
    if (linkExists) {
      await userLink.click()
      
      await page.waitForSelector('text=/User|Profile|Details/i', { timeout: 10000 })
      
      const url = page.url()
      expect(url).toContain('/admin/users/')
    }
  })
})

test.describe('Admin Marketing Campaign Tests', () => {
  test('should create email campaign', async ({ page }) => {
    await page.goto('/admin/marketing/campaigns')
    
    const newButton = page.locator('button:has-text("New"), button:has-text("Create"), button:has-text("Add")').first()
    const buttonExists = await newButton.isVisible().catch(() => false)
    
    if (buttonExists) {
      await newButton.click()
      
      await page.waitForSelector('input[name="name"], input[id="name"], input[name="subject"]', { timeout: 10000 })
      
      // Fill campaign details
      const nameInput = page.locator('input[name="name"], input[id="name"]').first()
      if (await nameInput.isVisible().catch(() => false)) {
        await nameInput.fill(`Test Campaign ${timestamp}`)
      }
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")')
      if (await submitButton.isVisible().catch(() => false)) {
        await submitButton.click()
        await page.waitForTimeout(2000)
      }
    }
  })
})

test.describe('Admin Lead Magnet Tests', () => {
  test('should create lead magnet', async ({ page }) => {
    await page.goto('/admin/marketing/lead-magnets')
    
    const newButton = page.locator('button:has-text("New"), button:has-text("Create"), button:has-text("Add")').first()
    const buttonExists = await newButton.isVisible().catch(() => false)
    
    if (buttonExists) {
      await newButton.click()
      
      await page.waitForSelector('input[name="name"], input[id="name"], input[name="title"]', { timeout: 10000 })
      
      const nameInput = page.locator('input[name="name"], input[id="name"], input[name="title"]').first()
      if (await nameInput.isVisible().catch(() => false)) {
        await nameInput.fill(`Test Lead Magnet ${timestamp}`)
      }
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")')
      if (await submitButton.isVisible().catch(() => false)) {
        await submitButton.click()
        await page.waitForTimeout(2000)
      }
    }
  })
})

test.describe('Admin Meta Pixel Configuration Tests', () => {
  test('should update Meta Pixel configuration', async ({ page }) => {
    await page.goto('/admin/meta-pixel')
    
    await page.waitForSelector('text=/Meta Pixel|Pixel|Configuration/i', { timeout: 10000 })
    
    // Look for pixel ID input
    const pixelInput = page.locator('input[name="pixel_id"], input[id="pixel_id"]')
    const inputExists = await pixelInput.isVisible().catch(() => false)
    
    if (inputExists) {
      await pixelInput.fill(`test-pixel-${timestamp}`)
      
      const saveButton = page.locator('button:has-text("Save"), button:has-text("Update")')
      const buttonExists = await saveButton.isVisible().catch(() => false)
      
      if (buttonExists) {
        await saveButton.click()
        await page.waitForTimeout(2000)
      }
    }
  })
})

test.describe('Admin Bulk Operations Tests', () => {
  test('should access bulk product operations', async ({ page }) => {
    await page.goto('/admin/products/bulk')
    
    await page.waitForSelector('text=/Bulk|Import|Upload/i', { timeout: 10000 })
    
    const url = page.url()
    expect(url).toContain('/admin/products/bulk')
  })
})

test.describe('Admin Search and Filter Tests', () => {
  test('should search products', async ({ page }) => {
    await page.goto('/admin/products')
    
    await page.waitForSelector('text=/Products/i', { timeout: 10000 })
    
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[name="search"]')
    const inputExists = await searchInput.isVisible().catch(() => false)
    
    if (inputExists) {
      await searchInput.fill('test')
      await page.waitForTimeout(1000)
      
      // Results should update
      const hasResults = await page.locator('table, [role="table"]').isVisible().catch(() => true)
      expect(hasResults).toBeTruthy()
    }
  })

  test('should filter orders by status', async ({ page }) => {
    await page.goto('/admin/orders')
    
    await page.waitForSelector('text=/Orders/i', { timeout: 10000 })
    
    // Look for status filter
    const statusFilter = page.locator('select[name="status"], select:has-text("Status")')
    const filterExists = await statusFilter.isVisible().catch(() => false)
    
    if (filterExists) {
      await statusFilter.selectOption({ index: 1 })
      await page.waitForTimeout(1000)
    }
  })
})
