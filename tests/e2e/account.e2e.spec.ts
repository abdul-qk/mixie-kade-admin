import { test as authTest, expect, TEST_STOREFRONT_USER } from '../fixtures/authenticated'
import { test, expect as baseExpect } from '@playwright/test'
import { createStorefrontUser, deleteUserByEmail } from '../helpers/seedData'

test.describe('Account page (unauthenticated guard)', () => {
  test('unauthenticated /account redirects to /login with warning', async ({ page }) => {
    await page.goto('/account')
    await expect(page).toHaveURL(/\/login/)
    await expect(page).toHaveURL(/warning=/)
  })

  test('unauthenticated /account/addresses redirects to /login', async ({ page }) => {
    await page.goto('/account/addresses')
    await expect(page).toHaveURL(/\/login/)
  })
})

authTest.describe('Account page (authenticated)', () => {
  authTest.beforeAll(async ({ request }) => {
    await createStorefrontUser(request, TEST_STOREFRONT_USER.email, TEST_STOREFRONT_USER.password)
  })

  authTest.afterAll(async () => {
    await deleteUserByEmail(TEST_STOREFRONT_USER.email)
  })

  authTest('shows profile settings section', async ({ storefrontPage: page }) => {
    await page.goto('/account')
    await expect(page.getByText('Profile settings')).toBeVisible()
  })

  authTest('shows recent orders section', async ({ storefrontPage: page }) => {
    await page.goto('/account')
    await expect(page.getByText('Recent orders')).toBeVisible()
  })

  authTest('shows empty orders state for new user', async ({ storefrontPage: page }) => {
    await page.goto('/account')
    await expect(page.getByText("You haven't placed any orders yet.")).toBeVisible()
  })

  authTest('submit button is disabled until a field is changed', async ({ storefrontPage: page }) => {
    await page.goto('/account')
    const submitBtn = page.getByRole('button', { name: 'Update Account' })
    await expect(submitBtn).toBeDisabled()
  })

  authTest('user can update their name', async ({ storefrontPage: page }) => {
    await page.goto('/account')
    await page.fill('input#name', 'Updated Name')
    const submitBtn = page.getByRole('button', { name: 'Update Account' })
    await expect(submitBtn).toBeEnabled()
    await submitBtn.click()
    await expect(page.getByText('Successfully updated account.')).toBeVisible()
  })

  authTest('user can save delivery city and it persists', async ({ storefrontPage: page }) => {
    await page.goto('/account')
    await page.fill('input#deliveryCity', 'Colombo')
    await page.getByRole('button', { name: 'Update Account' }).click()
    await expect(page.getByText('Successfully updated account.')).toBeVisible()
    await page.reload()
    await expect(page.locator('input#deliveryCity')).toHaveValue('Colombo')
  })

  authTest('user can save delivery address and it persists', async ({ storefrontPage: page }) => {
    await page.goto('/account')
    const address = '123 Test Street, Colombo 03'
    await page.fill('textarea#deliveryAddress', address)
    await page.getByRole('button', { name: 'Update Account' }).click()
    await expect(page.getByText('Successfully updated account.')).toBeVisible()
    await page.reload()
    await expect(page.locator('textarea#deliveryAddress')).toHaveValue(address)
  })

  authTest('switching to password tab shows password fields', async ({ storefrontPage: page }) => {
    await page.goto('/account')
    await page.getByRole('button', { name: 'change your password' }).click()
    await expect(page.locator('input#password')).toBeVisible()
    await expect(page.locator('input#passwordConfirm')).toBeVisible()
    // Profile fields should be hidden
    await expect(page.locator('input#name')).not.toBeVisible()
  })

  authTest('password change button is disabled until fields are dirty', async ({ storefrontPage: page }) => {
    await page.goto('/account')
    await page.getByRole('button', { name: 'change your password' }).click()
    await expect(page.getByRole('button', { name: 'Change Password' })).toBeDisabled()
  })

  authTest('mismatched passwords in change-password tab shows error', async ({ storefrontPage: page }) => {
    await page.goto('/account')
    await page.getByRole('button', { name: 'change your password' }).click()
    await page.fill('input#password', 'newpass123')
    await page.fill('input#passwordConfirm', 'different456')
    await page.getByRole('button', { name: 'Change Password' }).click()
    await expect(page.getByText('The passwords do not match')).toBeVisible()
  })
})

authTest.describe('Addresses page (authenticated)', () => {
  authTest.beforeAll(async ({ request }) => {
    await createStorefrontUser(request, TEST_STOREFRONT_USER.email, TEST_STOREFRONT_USER.password)
  })

  authTest.afterAll(async () => {
    await deleteUserByEmail(TEST_STOREFRONT_USER.email)
  })

  authTest('addresses page renders heading', async ({ storefrontPage: page }) => {
    await page.goto('/account/addresses')
    await expect(page.locator('h1, h2').filter({ hasText: /addresses/i }).first()).toBeVisible()
  })
})
