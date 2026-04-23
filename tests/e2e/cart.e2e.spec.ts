import path from 'path'
import { fileURLToPath } from 'url'
import { test, expect } from '@playwright/test'
import { createAdminUser, deleteUserByEmail, seedProductsAndVariants } from '../helpers/seedData'
import { addToCart } from '../helpers/checkout'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const ADMIN_EMAIL = 'cart-admin@test.com'
const ADMIN_PASSWORD = 'cartadmin123'

test.describe('Cart', () => {
  test.beforeAll(async ({ browser, request }) => {
    await createAdminUser(request, ADMIN_EMAIL, ADMIN_PASSWORD)

    // Upload a test image via the admin UI
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto('/admin/login')
    await page.fill('#field-email', ADMIN_EMAIL)
    await page.fill('#field-password', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/admin/)

    await page.goto('/admin/collections/media/create')
    const filePath = path.resolve(dirname, '../../public/media/image-post1.webp')
    await page.locator('input[type="file"]').setInputFiles(filePath)
    await page.locator('input[name="alt"]').fill('Cart Test Image')
    await page.locator('#action-save').click()
    await expect(page.getByText('Media successfully created')).toBeVisible()
    await expect(page).toHaveURL(/\/admin\/collections\/media\/\d+/)
    const imageID = page.url().split('/').pop()!
    await context.close()

    await seedProductsAndVariants(request, imageID)
  })

  test.afterAll(async () => {
    await deleteUserByEmail(ADMIN_EMAIL)
  })

  test('can add a simple product to cart', async ({ page }) => {
    await addToCart(page, 'test-product')
    const cartCount = page.locator('button[data-slot="sheet-trigger"] span').last()
    await expect(cartCount).toHaveText('1')
  })

  test('can add a product with a variant to cart', async ({ page }) => {
    await addToCart(page, 'test-product-variants', 'Payload')
    const cartCount = page.locator('button[data-slot="sheet-trigger"] span').last()
    await expect(cartCount).toHaveText('1')
  })

  test('cart sheet shows product name after adding', async ({ page }) => {
    await addToCart(page, 'test-product')
    const cartCount = page.locator('button[data-slot="sheet-trigger"] span').last()
    await cartCount.click()
    const productInCart = page.getByRole('dialog').getByText('Test Product', { exact: false })
    await expect(productInCart).toBeVisible()
  })

  test('can remove a product from cart', async ({ page }) => {
    await addToCart(page, 'test-product')
    const cartCount = page.locator('button[data-slot="sheet-trigger"] span').last()
    await cartCount.click()

    const reduceBtn = page.getByRole('button', { name: 'Reduce item quantity' })
    await expect(reduceBtn).toBeVisible()
    await reduceBtn.click()
    await expect(page.getByText('Your cart is empty.')).toBeVisible()
  })

  test('cart persists after hard refresh', async ({ page }) => {
    await addToCart(page, 'test-product')
    await page.reload()

    const cartCount = page.locator('button[data-slot="sheet-trigger"] span').last()
    await cartCount.click()
    const productInCart = page.getByRole('dialog').getByText('Test Product', { exact: false })
    await expect(productInCart).toBeVisible()
  })

  test('add to cart button is disabled for zero-inventory product', async ({ page }) => {
    await page.goto('/products/no-inventory-product')
    const addToCartBtn = page.getByRole('button', { name: 'Add to Cart' })
    await expect(addToCartBtn).toBeDisabled()
  })
})
