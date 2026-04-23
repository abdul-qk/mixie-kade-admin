import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export async function storefrontLogin(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login')
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/account/)
}

export async function storefrontLogout(page: Page): Promise<void> {
  await page.goto('/logout')
  const heading = page.locator('h1').first()
  await expect(heading).toContainText(/logged out/i)
}
