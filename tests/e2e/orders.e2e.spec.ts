import { test, expect } from '@playwright/test'
import { test as authTest, TEST_STOREFRONT_USER } from '../fixtures/authenticated'
import { createStorefrontUser, deleteUserByEmail } from '../helpers/seedData'

test.describe('Orders — unauthenticated guards', () => {
  test('unauthenticated /orders redirects to /login', async ({ page }) => {
    await page.goto('/orders')
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('/find-order page', () => {
  test('loads with order ID and email inputs', async ({ page }) => {
    await page.goto('/find-order')
    await expect(page.locator('input[name="orderID"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
  })

  test('find order button is present', async ({ page }) => {
    await page.goto('/find-order')
    await expect(page.getByRole('button', { name: /find my order/i })).toBeVisible()
  })
})

authTest.describe('Orders — authenticated user', () => {
  authTest.beforeAll(async ({ request }) => {
    await createStorefrontUser(
      request,
      TEST_STOREFRONT_USER.email,
      TEST_STOREFRONT_USER.password,
    )
  })

  authTest.afterAll(async () => {
    await deleteUserByEmail(TEST_STOREFRONT_USER.email)
  })

  authTest('user with no orders sees empty state', async ({ storefrontPage: page }) => {
    await page.goto('/orders')
    await expect(page.getByText("You haven't placed any orders yet.")).toBeVisible()
  })

  authTest('/find-order pre-fills email for logged-in user', async ({ storefrontPage: page }) => {
    await page.goto('/find-order')
    const emailInput = page.locator('input[name="email"]')
    await expect(emailInput).toHaveValue(TEST_STOREFRONT_USER.email)
  })
})
