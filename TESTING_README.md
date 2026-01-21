# Testing Documentation

This document describes the comprehensive testing suite for the NC E-Commerce application, including smoke tests for APIs and Playwright tests for admin frontend screens.

## Overview

The testing suite includes:
1. **API Smoke Tests** - Tests for all API endpoints (customer-facing and admin)
2. **Admin API Smoke Tests** - Dedicated tests for admin-specific APIs
3. **Playwright E2E Tests** - Frontend tests for all admin screens
4. **Playwright Action Tests** - Tests for CRUD operations and admin actions

## Test Structure

```
tests/
├── api/
│   ├── smoke.test.ts           # Customer-facing API smoke tests
│   └── admin-smoke.test.ts     # Admin API smoke tests
├── e2e/
│   ├── admin-screens.spec.ts   # Admin screen navigation tests
│   └── admin-actions.spec.ts   # Admin CRUD operation tests
└── setup.ts                     # Test environment setup
```

## Running Tests

### Smoke Tests (API)

Run all smoke tests:
```bash
npm test
```

Run customer API smoke tests only:
```bash
npm run test:smoke
```

Run admin API smoke tests only:
```bash
npm run test:admin-smoke
```

### Playwright Tests (E2E)

Install Playwright browsers (first time only):
```bash
npm run playwright:install
```

Run all Playwright tests:
```bash
npm run test:e2e
```

Run Playwright tests with UI mode (interactive):
```bash
npm run test:e2e:ui
```

Run Playwright tests in headed mode (see browser):
```bash
npm run test:e2e:headed
```

Run specific test file:
```bash
npx playwright test tests/e2e/admin-screens.spec.ts
```

Run tests in a specific browser:
```bash
npx playwright test --project=chromium
```

## Test Coverage

### Admin API Endpoints Tested

1. **Dashboard Analytics API** (`/api/admin/dashboard-analytics`)
   - GET with different time periods (7days, 30days, 90days, 1year)
   - Overview statistics, revenue trends, top products, etc.

2. **Meta Pixel APIs** (`/api/admin/meta-pixel`)
   - GET configuration
   - POST/PUT configuration updates
   - Initialization endpoint

3. **Image Migration API** (`/api/admin/migrate-images-to-blob`)
   - Image migration operations

4. **Products Admin APIs** (`/api/products`)
   - GET all products
   - POST create product
   - PUT update product
   - Bulk operations
   - Image optimization

5. **Brands Admin APIs** (`/api/brands`)
   - GET all brands
   - POST create brand
   - PUT update brand

6. **Bundles Admin APIs** (`/api/bundles`)
   - GET all bundles
   - POST create bundle
   - GET bundle items

7. **Categories Admin APIs** (`/api/categories`)
   - GET all categories
   - POST create category

8. **Orders Admin APIs** (`/api/orders`)
   - GET all orders
   - GET order details

9. **Discounts Admin APIs** (`/api/discounts`)
   - GET all discounts
   - POST create discount

10. **Banners Admin APIs** (`/api/banners`)
    - GET all banners
    - POST create banner

11. **Users Admin APIs** (`/api/users`)
    - GET all users
    - GET user details

12. **Marketing APIs**
    - Email campaigns (`/api/marketing/campaigns`)
    - Lead magnets (`/api/marketing/lead-magnets`)
    - Marketing analytics (`/api/marketing/analytics`)
    - Abandoned carts (`/api/marketing/abandoned-carts`)

13. **Facebook Marketing APIs**
    - Accounts (`/api/facebook/accounts`)
    - Pixel configuration (`/api/facebook/pixel`)
    - Campaigns, Leads, Posts

14. **Shipping Methods APIs** (`/api/shipping-methods`)
    - GET all methods
    - POST create method

15. **WhatsApp APIs**
    - Metrics (`/api/whatsapp/metrics`)
    - Logs (`/api/whatsapp/logs`)

16. **Social Content APIs**
    - GET content (`/api/social-content`)
    - Generate content (`/api/social-content/generate`)

17. **Analytics APIs**
    - General analytics (`/api/analytics`)
    - Detailed analytics (`/api/analytics/detailed`)
    - Conversion analytics (`/api/analytics/conversion`)

18. **Image Optimization APIs** (`/api/images/optimize`)

### Admin Frontend Screens Tested

1. **Dashboard**
   - Main dashboard (`/admin`)
   - Enhanced dashboard (`/admin/dashboard`)

2. **Products**
   - Product list (`/admin/products`)
   - Create product (`/admin/products/new`)
   - Edit product (`/admin/products/[id]`)
   - Bulk operations (`/admin/products/bulk`)

3. **Categories**
   - Category list (`/admin/categories`)
   - Category management

4. **Brands**
   - Brand list (`/admin/brands`)
   - Create brand (`/admin/brands/new`)
   - Edit brand (`/admin/brands/[id]`)

5. **Bundles**
   - Bundle list (`/admin/bundles`)
   - Create bundle (`/admin/bundles/new`)
   - Edit bundle (`/admin/bundles/[id]`)

6. **Orders**
   - Order list (`/admin/orders`)
   - Order details (`/admin/orders/[id]`)
   - Order status updates

7. **Discounts**
   - Discount management (`/admin/discounts`)

8. **Banners**
   - Banner list (`/admin/banners`)
   - Create banner (`/admin/banners/new`)
   - Edit banner (`/admin/banners/[id]`)

9. **Users**
   - User list (`/admin/users`)
   - User details (`/admin/users/[id]`)

10. **Marketing**
    - Lead magnets (`/admin/marketing/lead-magnets`)
    - Email campaigns (`/admin/marketing/campaigns`)
    - Marketing analytics (`/admin/marketing/analytics`)

11. **Facebook Marketing**
    - Facebook main (`/admin/facebook`)
    - Pages (`/admin/facebook/pages`)
    - Campaigns (`/admin/facebook/campaigns`)
    - Leads (`/admin/facebook/leads`)
    - Posts (`/admin/facebook/posts`)

12. **Meta Pixel**
    - Configuration (`/admin/meta-pixel`)
    - Initialization (`/admin/meta-pixel/init`)

13. **WhatsApp**
    - WhatsApp integration (`/admin/whatsapp`)

14. **Social Content**
    - Social media content (`/admin/social-content`)

15. **Shipping Methods**
    - Shipping configuration (`/admin/shipping-methods`)

16. **Image Migration**
    - Image migration tool (`/admin/migrate-images`)

17. **Analytics**
    - Analytics dashboard (`/admin/analytics`)

### Admin Actions Tested

1. **Product Actions**
   - Create new product
   - Edit existing product
   - Delete product
   - Bulk operations
   - Search products
   - Filter products

2. **Brand Actions**
   - Create new brand
   - List all brands

3. **Category Actions**
   - Create new category

4. **Bundle Actions**
   - Create new bundle

5. **Banner Actions**
   - Create new banner

6. **Discount Actions**
   - Create new discount code

7. **Shipping Method Actions**
   - Create new shipping method

8. **Order Management Actions**
   - View order details
   - Update order status
   - Filter orders by status

9. **User Management Actions**
   - View user details

10. **Marketing Campaign Actions**
    - Create email campaign
    - Create lead magnet

11. **Meta Pixel Actions**
    - Update pixel configuration

12. **Navigation Actions**
    - Navigate between admin pages
    - Mobile menu functionality
    - Access control validation

## Environment Variables

For running tests, you may need to set the following environment variables:

```bash
# App URL (default: http://localhost:3000)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database connection
DATABASE_URL=your_database_url

# Admin credentials (for E2E tests)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
```

## Test Configuration

### Vitest Configuration

Located in `vitest.config.ts`:
- Test environment: Node.js
- Setup file: `tests/setup.ts`
- Globals enabled for easier test writing

### Playwright Configuration

Located in `playwright.config.ts`:
- Test directory: `tests/e2e`
- Base URL: From `NEXT_PUBLIC_APP_URL` or `http://localhost:3000`
- Browser: Chromium (can be extended to Firefox, WebKit)
- Retries on CI: 2
- Screenshots: Only on failure
- Trace: On first retry
- Web server: Automatically starts dev server before tests

## Writing New Tests

### Adding API Smoke Tests

1. Open `tests/api/admin-smoke.test.ts`
2. Add a new describe block for your API group:

```typescript
describe('New API Group', () => {
  it('GET /api/new-endpoint - should test functionality', async () => {
    const response = await apiRequest('/api/new-endpoint')
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toBeDefined()
  })
})
```

### Adding Playwright Tests

1. Open `tests/e2e/admin-screens.spec.ts` for navigation tests
2. Or `tests/e2e/admin-actions.spec.ts` for action tests
3. Add a new test:

```typescript
test('should test new functionality', async ({ page }) => {
  await page.goto('/admin/new-page')
  await page.waitForSelector('text=Expected Text')
  
  // Perform actions
  await page.click('button:has-text("Click Me")')
  
  // Assert results
  expect(page.url()).toContain('/expected-url')
})
```

## CI/CD Integration

The tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run API Smoke Tests
  run: npm run test:smoke

- name: Run Admin Smoke Tests
  run: npm run test:admin-smoke

- name: Install Playwright
  run: npm run playwright:install

- name: Run E2E Tests
  run: npm run test:e2e
```

## Troubleshooting

### Smoke Tests Failing

1. Ensure the development server is running: `npm run dev`
2. Check that `DATABASE_URL` is set correctly
3. Verify test data exists in the database (products, categories, etc.)

### Playwright Tests Failing

1. Ensure browsers are installed: `npm run playwright:install`
2. Check that the dev server is accessible at the configured URL
3. Review screenshots in `test-results/` folder
4. Run with `--headed` flag to see browser actions
5. Use `--debug` flag for step-by-step debugging

### Authentication Issues

1. For admin tests, ensure admin user exists in database
2. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables
3. Check that authentication cookies are being set correctly

## Best Practices

1. **Keep tests independent** - Each test should be able to run in isolation
2. **Clean up test data** - Tests should not leave permanent data in the database
3. **Use descriptive test names** - Test names should clearly describe what is being tested
4. **Mock external services** - Don't make real API calls to third-party services in tests
5. **Test error cases** - Don't just test the happy path
6. **Keep tests fast** - Use appropriate timeouts and avoid unnecessary waits
7. **Update tests with code changes** - When adding new features, add corresponding tests

## Future Improvements

- [ ] Add visual regression testing
- [ ] Add performance testing
- [ ] Add accessibility testing
- [ ] Increase test coverage to 80%+
- [ ] Add integration tests for complex workflows
- [ ] Add load testing for API endpoints
- [ ] Add security testing (SQL injection, XSS, etc.)
- [ ] Add mobile-specific E2E tests
- [ ] Add API contract testing
- [ ] Add mutation testing

## Support

For issues or questions about the tests:
1. Check this documentation
2. Review test output and error messages
3. Check Playwright documentation: https://playwright.dev
4. Check Vitest documentation: https://vitest.dev
