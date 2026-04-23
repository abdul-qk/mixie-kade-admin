import { test, expect, Page } from '@playwright/test'
import { login } from '../helpers/login'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

test.describe('Admin Panel', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()

    const context = await browser.newContext()
    page = await context.newPage()
    await login({ page, user: testUser })
  })

  test.afterAll(async () => {
    await cleanupTestUser()
  })

  test('can navigate to dashboard', async () => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin/)
    await expect(page.locator('span[title="Dashboard"]').first()).toBeVisible()
  })

  test('can navigate to users list view', async () => {
    await page.goto('/admin/collections/users')
    await expect(page).toHaveURL(/\/admin\/collections\/users/)
    await expect(page.locator('h1', { hasText: 'Users' }).first()).toBeVisible()
  })

  test('can navigate to user create view', async () => {
    await page.goto('/admin/collections/users/create')
    await expect(page).toHaveURL(/\/admin\/collections\/users\/[a-zA-Z0-9-_]+/)
    await expect(page.locator('input[name="email"]')).toBeVisible()
  })

  test('can navigate to products collection', async () => {
    await page.goto('/admin/collections/products')
    await expect(page).toHaveURL(/\/admin\/collections\/products/)
    await expect(page.locator('h1', { hasText: 'Products' }).first()).toBeVisible()
  })

  test('can navigate to orders collection', async () => {
    await page.goto('/admin/collections/orders')
    await expect(page).toHaveURL(/\/admin\/collections\/orders/)
  })

  test('regular user cannot access /admin', async ({ request, browser }) => {
    await request.post('/api/users', {
      data: { email: 'regular@test.com', password: 'regular123' },
    })

    const context = await browser.newContext()
    const userPage = await context.newPage()
    await userPage.goto('/admin/login')
    await userPage.fill('#field-email', 'regular@test.com')
    await userPage.fill('#field-password', 'regular123')
    await userPage.click('button[type="submit"]')

    await userPage.goto('/admin')
    const heading = userPage.locator('h1').first()
    await expect(heading).toContainText(/Unauthorized/i)
    await context.close()
  })
})
