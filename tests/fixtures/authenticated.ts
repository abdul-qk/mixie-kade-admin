import { test as base, type Page } from '@playwright/test'
import { login } from '../helpers/login'
import { testUser } from '../helpers/seedUser'

type AuthFixtures = {
  adminPage: Page
  storefrontPage: Page
}

const BASE_URL = 'http://localhost:3000'

export const TEST_STOREFRONT_USER = {
  email: 'abdulsmart100@gmail.com',
  password: 'abdul12345',
}

export const test = base.extend<AuthFixtures>({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    await login({ page, user: testUser })
    await use(page)
    await context.close()
  },

  storefrontPage: async ({ browser, request }, use) => {
    // API-based login: POST /api/users/login and inject the session cookie
    const loginRes = await request.post(`${BASE_URL}/api/users/login`, {
      data: {
        email: TEST_STOREFRONT_USER.email,
        password: TEST_STOREFRONT_USER.password,
      },
    })

    const cookies = loginRes.headers()['set-cookie']
    const context = await browser.newContext()

    if (cookies) {
      const cookieStr = Array.isArray(cookies) ? cookies[0] : cookies
      const [nameValue] = cookieStr.split(';')
      const [name, value] = nameValue.trim().split('=')
      if (name && value) {
        await context.addCookies([
          {
            name,
            value,
            domain: 'localhost',
            path: '/',
            httpOnly: true,
            secure: false,
            sameSite: 'Lax',
          },
        ])
      }
    }

    const page = await context.newPage()
    await use(page)
    await context.close()
  },
})

export { expect } from '@playwright/test'
