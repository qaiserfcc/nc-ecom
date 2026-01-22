import { test as base, Page } from '@playwright/test'

// Test user credentials
const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@test.local'
const TEST_ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'Admin123!@#'

/**
 * Authenticate user via API and set cookies in browser context
 */
export async function authenticateAdmin(page: Page) {
  // Try to signup - will fail if user exists, which is fine
  // We just need a valid test admin user in the database
  try {
    await page.request.post('http://localhost:3000/api/auth/signup', {
      data: {
        email: TEST_ADMIN_EMAIL,
        password: TEST_ADMIN_PASSWORD,
        name: 'Admin Test User',
        role: 'admin'
      },
      failOnStatusCode: false
    })
  } catch (e) {
    // Ignore signup errors - user might already exist
  }

  // Always try to signin - this will work whether signup succeeded or user existed
  const response = await page.request.post('http://localhost:3000/api/auth/signin', {
    data: {
      email: TEST_ADMIN_EMAIL,
      password: TEST_ADMIN_PASSWORD
    }
  })

  if (!response.ok()) {
    throw new Error(`Authentication failed: ${response.status()} ${await response.text()}`)
  }

  // Get Set-Cookie headers from the response
  const setCookieHeaders = response.headersArray().filter(h => h.name.toLowerCase() === 'set-cookie')
  
  if (setCookieHeaders.length > 0) {
    // Parse cookies from Set-Cookie headers and add to browser context
    for (const header of setCookieHeaders) {
      // Parse cookie from "name=value; path=/; httpOnly; ..." format
      const cookieParts = header.value.split(';')
      const [nameValue] = cookieParts
      const [name, value] = nameValue.split('=')
      
      if (name && value) {
        await page.context().addCookies([{
          name: name.trim(),
          value: value.trim(),
          url: 'http://localhost:3000'
        }])
      }
    }
  }

  // Navigate to admin to verify authentication
  await page.goto('/admin')
  
  // Wait for the page to load
  await page.waitForTimeout(500)
  
  // Verify auth via /api/auth/me endpoint
  const meResponse = await page.request.get('http://localhost:3000/api/auth/me')
  const meData = await meResponse.json()
  
  // Check if we're authenticated
  if (page.url().includes('/signin')) {
    throw new Error('Authentication failed - redirected to signin after API auth')
  }
  
  if (!meData.user || meData.user.role !== 'admin') {
    throw new Error(`User is not admin, role is: ${meData.user?.role}`)
  }
}

/**
 * Extended test function with authentication
 */
export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Authenticate before each test
    await authenticateAdmin(page)
    await use(page)
  },
})

export { expect } from '@playwright/test'
