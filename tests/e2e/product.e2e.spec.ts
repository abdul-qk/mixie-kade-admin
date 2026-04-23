import { test, expect } from '@playwright/test'

test.describe('Product detail page', () => {
  test('renders product title in h1 area', async ({ page }) => {
    await page.goto('/products/test-product')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('shows Add to Cart button for in-stock product', async ({ page }) => {
    await page.goto('/products/test-product')
    await expect(page.getByRole('button', { name: 'Add to Cart' })).toBeVisible()
  })

  test('add to cart button is disabled for zero-inventory product', async ({ page }) => {
    await page.goto('/products/no-inventory-product')
    await expect(page.getByRole('button', { name: 'Add to Cart' })).toBeDisabled()
  })

  test('product with variants shows variant selection buttons', async ({ page }) => {
    await page.goto('/products/test-product-variants')
    await expect(page.getByRole('button', { name: 'Payload' })).toBeVisible()
  })

  test('unknown product slug shows 404 page', async ({ page }) => {
    await page.goto('/products/this-product-does-not-exist-zzz')
    await expect(
      page.locator('h1, [role="heading"]').filter({ hasText: /not found|404/i }).first(),
    ).toBeVisible()
  })
})

test.describe('Product reviews API', () => {
  test('missing displayName returns 400', async ({ request }) => {
    const res = await request.post('/api/reviews', {
      data: {
        productID: 1,
        rating: 4,
        title: 'Great product',
        content: 'Really enjoyed this product, very happy with the purchase.',
        email: 'reviewer@test.com',
      },
    })
    expect(res.status()).toBe(400)
  })

  test('invalid rating (out of range) returns 400', async ({ request }) => {
    const res = await request.post('/api/reviews', {
      data: {
        productID: 1,
        rating: 6,
        title: 'Test',
        content: 'Some review content that meets length requirement.',
        displayName: 'Reviewer',
        email: 'reviewer@test.com',
      },
    })
    expect(res.status()).toBe(400)
  })

  test('missing email returns 400', async ({ request }) => {
    const res = await request.post('/api/reviews', {
      data: {
        productID: 1,
        rating: 4,
        title: 'Test',
        content: 'Some review content that meets length requirement.',
        displayName: 'Reviewer',
      },
    })
    expect(res.status()).toBe(400)
  })
})
