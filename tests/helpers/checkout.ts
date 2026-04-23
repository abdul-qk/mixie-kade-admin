import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export interface CheckoutFormData {
  fullName: string
  phone: string
  address: string
  city?: string
  paymentMethod?: 'cod' | 'bank_transfer'
  notes?: string
}

export async function addToCart(page: Page, productSlug: string, variant?: string): Promise<void> {
  await page.goto('/shop')
  await expect(page).toHaveURL(/\/shop/)

  const productCard = page.locator(`a[href="/products/${productSlug}"]`).first()
  await productCard.waitFor({ state: 'visible' })
  await productCard.click()

  if (variant) {
    const variantButton = page.getByRole('button', { name: variant })
    await variantButton.waitFor({ state: 'visible' })
    await variantButton.click()
  }

  const addToCartButton = page.getByRole('button', { name: 'Add to Cart' })
  await expect(addToCartButton).toBeVisible()
  await addToCartButton.click()

  const cartCount = page.locator('button[data-slot="sheet-trigger"] span').last()
  await expect(cartCount).toHaveText('1')
}

export async function completeCheckout(page: Page, form: CheckoutFormData): Promise<string> {
  await page.goto('/checkout')

  await page.fill('#field-customerName', form.fullName)
  await page.fill('#field-phone', form.phone)
  await page.fill('#field-address', form.address)

  if (form.city) {
    await page.fill('#field-city', form.city)
  }

  if (form.paymentMethod === 'bank_transfer') {
    await page.check('input[name="paymentMethod"][value="bank_transfer"]')
  }

  if (form.notes) {
    await page.fill('#field-notes', form.notes)
  }

  await page.click('button[type="submit"]')
  await page.waitForURL(/\/checkout\/confirm-order/)

  const url = new URL(page.url())
  return url.searchParams.get('id') ?? ''
}
