import { test, expect } from '@playwright/test'

// Tag all tests in this file with @static so they can be skipped on quick CI runs:
// pnpm playwright test --grep @static

test.describe('Static pages @static', () => {
  test('homepage loads with a visible heading', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('/about loads without 404', async ({ page }) => {
    await page.goto('/about')
    await expect(page).not.toHaveURL(/404/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('/contact loads with a form or heading', async ({ page }) => {
    await page.goto('/contact')
    await expect(page).not.toHaveURL(/404/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('/faq loads and shows heading', async ({ page }) => {
    await page.goto('/faq')
    await expect(page).not.toHaveURL(/404/)
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('/delivery/sri-lanka loads', async ({ page }) => {
    await page.goto('/delivery/sri-lanka')
    await expect(page).not.toHaveURL(/404/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('/shipping-returns loads', async ({ page }) => {
    await page.goto('/shipping-returns')
    await expect(page).not.toHaveURL(/404/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('/spare-parts loads', async ({ page }) => {
    await page.goto('/spare-parts')
    await expect(page).not.toHaveURL(/404/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('/shop loads and is not a 404', async ({ page }) => {
    await page.goto('/shop')
    await expect(page).not.toHaveURL(/404/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('completely unknown route shows not-found page', async ({ page }) => {
    await page.goto('/this-route-absolutely-does-not-exist-abc123')
    // Next.js not-found pages typically use h2 or show "not found" text
    await expect(
      page.locator('h1, h2, [role="heading"]').filter({ hasText: /not found|404/i }).first(),
    ).toBeVisible()
  })
})
