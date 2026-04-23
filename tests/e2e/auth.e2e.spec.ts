import { test, expect } from '@playwright/test'
import { deleteUserByEmail } from '../helpers/seedData'
import { storefrontLogout } from '../helpers/storefrontLogin'
import { test as authTest } from '../fixtures/authenticated'
import { TEST_STOREFRONT_USER } from '../fixtures/authenticated'

const TEST_EMAIL = 'auth-test@test.com'
const TEST_PASSWORD = 'testpass123'

test.describe('Authentication', () => {
  test.beforeAll(async ({ request }) => {
    // Ensure a known user exists for login tests
    await request.post('/api/users', {
      data: { email: TEST_EMAIL, password: TEST_PASSWORD },
    })
  })

  test.afterAll(async () => {
    await deleteUserByEmail(TEST_EMAIL)
  })

  test.describe('Login page', () => {
    test('renders with email, password inputs and sign-in heading', async ({ page }) => {
      await page.goto('/login')
      await expect(page.locator('h1')).toContainText('Sign in to your account')
      await expect(page.locator('input#email')).toBeVisible()
      await expect(page.locator('input#password')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('has link to create account', async ({ page }) => {
      await page.goto('/login')
      await expect(page.getByRole('link', { name: /create one/i })).toBeVisible()
    })

    test('has forgot password link', async ({ page }) => {
      await page.goto('/login')
      await expect(page.getByRole('link', { name: /reset it here/i })).toBeVisible()
    })

    test('valid credentials redirect to /account', async ({ page }) => {
      await page.goto('/login')
      await page.fill('input#email', TEST_EMAIL)
      await page.fill('input#password', TEST_PASSWORD)
      await page.click('button[type="submit"]')
      await page.waitForURL(/\/account/)
      await expect(page).toHaveURL(/\/account/)
    })

    test('invalid credentials show error message', async ({ page }) => {
      await page.goto('/login')
      await page.fill('input#email', TEST_EMAIL)
      await page.fill('input#password', 'wrong-password')
      await page.click('button[type="submit"]')
      await expect(
        page.getByText('There was an error with the credentials provided'),
      ).toBeVisible()
    })

    test('empty email shows required validation error', async ({ page }) => {
      await page.goto('/login')
      await page.fill('input#password', TEST_PASSWORD)
      await page.click('button[type="submit"]')
      await expect(page.getByText('Email is required.')).toBeVisible()
    })

    test('empty password shows required validation error', async ({ page }) => {
      await page.goto('/login')
      await page.fill('input#email', TEST_EMAIL)
      await page.click('button[type="submit"]')
      await expect(page.getByText('Please provide a password.')).toBeVisible()
    })

    test('warning query param is rendered on page', async ({ page }) => {
      await page.goto('/login?warning=Please+login+to+continue')
      await expect(page.getByText('Please login to continue')).toBeVisible()
    })
  })

  test.describe('Login page guard (already authenticated)', () => {
    authTest('already-logged-in user visiting /login is redirected to /account', async ({ storefrontPage: page }) => {
      await page.goto('/login')
      await expect(page).toHaveURL(/\/account/)
    })

    authTest('already-logged-in user visiting /create-account is redirected to /account', async ({ storefrontPage: page }) => {
      await page.goto('/create-account')
      await expect(page).toHaveURL(/\/account/)
    })
  })

  test.describe('Create account page', () => {
    test('renders with heading and form fields', async ({ page }) => {
      await page.goto('/create-account')
      await expect(page.locator('h1')).toContainText('Create your account')
      await expect(page.locator('input#email')).toBeVisible()
      await expect(page.locator('input#password')).toBeVisible()
      await expect(page.locator('input#passwordConfirm')).toBeVisible()
    })

    test('has link to sign in page', async ({ page }) => {
      await page.goto('/create-account')
      await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible()
    })

    test('empty email shows "Email is required."', async ({ page }) => {
      await page.goto('/create-account')
      await page.fill('input#password', 'abc123')
      await page.fill('input#passwordConfirm', 'abc123')
      await page.click('button[type="submit"]')
      await expect(page.getByText('Email is required.')).toBeVisible()
    })

    test('empty password shows "Password is required."', async ({ page }) => {
      await page.goto('/create-account')
      await page.fill('input#email', `new-${Date.now()}@test.com`)
      await page.fill('input#passwordConfirm', 'abc123')
      await page.click('button[type="submit"]')
      await expect(page.getByText('Password is required.')).toBeVisible()
    })

    test('mismatched passwords shows "The passwords do not match"', async ({ page }) => {
      await page.goto('/create-account')
      await page.fill('input#email', `new-${Date.now()}@test.com`)
      await page.fill('input#password', 'password1')
      await page.fill('input#passwordConfirm', 'password2')
      await page.click('button[type="submit"]')
      await expect(page.getByText('The passwords do not match')).toBeVisible()
    })

    test('successful account creation redirects to /account with success param', async ({
      page,
    }) => {
      const email = `signup-${Date.now()}@test.com`
      await page.goto('/create-account')
      await page.fill('input#email', email)
      await page.fill('input#password', 'securepass123')
      await page.fill('input#passwordConfirm', 'securepass123')
      await page.click('button[type="submit"]')
      await page.waitForURL(/\/account/)
      await expect(page).toHaveURL(/success=Account\+created\+successfully|success=Account%20created%20successfully/)
      // Cleanup
      await deleteUserByEmail(email)
    })
  })

  test.describe('Forgot password page', () => {
    test('loads with heading and email input', async ({ page }) => {
      await page.goto('/forgot-password')
      await expect(page.locator('h1')).toContainText('Forgot Password')
      await expect(page.locator('input#email')).toBeVisible()
    })

    test('empty email shows "Please provide your email."', async ({ page }) => {
      await page.goto('/forgot-password')
      await page.click('button[type="submit"]')
      await expect(page.getByText('Please provide your email.')).toBeVisible()
    })

    test('valid email submission shows success heading', async ({ page }) => {
      await page.goto('/forgot-password')
      await page.fill('input#email', TEST_EMAIL)
      await page.click('button[type="submit"]')
      await expect(page.locator('h1')).toContainText('Request submitted')
    })
  })

  test.describe('Logout page', () => {
    test('unauthenticated visit shows "already logged out" message', async ({ page }) => {
      await page.goto('/logout')
      await expect(page.locator('h1')).toContainText('You are already logged out.')
    })

    authTest('authenticated user logout shows success message', async ({ storefrontPage: page }) => {
      await storefrontLogout(page)
      await expect(page.locator('h1')).toContainText('Logged out successfully.')
    })
  })
})
