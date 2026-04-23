import { test, expect } from '@playwright/test'
import { test as authTest, TEST_STOREFRONT_USER } from '../fixtures/authenticated'
import { createStorefrontUser, deleteUserByEmail } from '../helpers/seedData'
import { addToCart, completeCheckout } from '../helpers/checkout'

test.describe('Checkout — empty cart', () => {
  test('visiting /checkout with empty cart shows empty state', async ({ page }) => {
    await page.goto('/checkout')
    await expect(page.getByText('Your cart is empty.')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Browse products' })).toBeVisible()
  })
})

test.describe('Checkout form', () => {
  test('defaults to Cash on Delivery radio selected', async ({ page }) => {
    // Need at least one item in cart to see the form
    await page.goto('/products/test-product')
    const addBtn = page.getByRole('button', { name: 'Add to Cart' })
    if (await addBtn.isVisible()) {
      await addBtn.click()
    }
    await page.goto('/checkout')

    const codRadio = page.locator('input[name="paymentMethod"][value="cod"]')
    await expect(codRadio).toBeChecked()
  })

  test('selecting bank transfer shows account details panel', async ({ page }) => {
    await page.goto('/products/test-product')
    const addBtn = page.getByRole('button', { name: 'Add to Cart' })
    if (await addBtn.isVisible()) {
      await addBtn.click()
    }
    await page.goto('/checkout')

    await page.check('input[name="paymentMethod"][value="bank_transfer"]')
    await expect(page.getByText('Account Number:')).toBeVisible()
    await expect(page.getByText('111000285346')).toBeVisible()
  })

  test('COD info panel is visible when cash on delivery is selected', async ({ page }) => {
    await page.goto('/products/test-product')
    const addBtn = page.getByRole('button', { name: 'Add to Cart' })
    if (await addBtn.isVisible()) {
      await addBtn.click()
    }
    await page.goto('/checkout')

    const codRadio = page.locator('input[name="paymentMethod"][value="cod"]')
    await expect(codRadio).toBeChecked()
    await expect(page.getByText('No online payment needed.')).toBeVisible()
  })
})

test.describe('Confirm order page', () => {
  test('shows "Order Placed!" heading', async ({ page }) => {
    await page.goto('/checkout/confirm-order?id=123&paymentMethod=cod')
    await expect(page.locator('h1')).toContainText('Order Placed!')
  })

  test('shows COD panel for cod payment method', async ({ page }) => {
    await page.goto('/checkout/confirm-order?id=123&paymentMethod=cod')
    await expect(page.getByText('Cash on Delivery')).toBeVisible()
    await expect(
      page.getByText('Payment will be collected when your order is delivered.'),
    ).toBeVisible()
  })

  test('shows bank transfer panel for bank_transfer payment method', async ({ page }) => {
    await page.goto('/checkout/confirm-order?id=123&paymentMethod=bank_transfer')
    await expect(page.getByText('Online Bank Transfer')).toBeVisible()
    await expect(
      page.getByText('Please send your payment screenshot via WhatsApp'),
    ).toBeVisible()
  })

  test('shows order reference number when id is provided', async ({ page }) => {
    await page.goto('/checkout/confirm-order?id=ABC123&paymentMethod=cod')
    await expect(page.getByText('#ABC123')).toBeVisible()
  })
})

authTest.describe('Checkout — authenticated user flow', () => {
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

  authTest('authenticated user can complete a COD order', async ({ storefrontPage: page }) => {
    await addToCart(page, 'test-product')

    const orderId = await completeCheckout(page, {
      fullName: 'Test Customer',
      phone: '0771234567',
      address: '123 Test Street, Colombo',
      city: 'Colombo',
      paymentMethod: 'cod',
    })

    await expect(page).toHaveURL(/\/checkout\/confirm-order/)
    await expect(page.locator('h1')).toContainText('Order Placed!')
    expect(orderId).toBeTruthy()
  })
})
