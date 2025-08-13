import { test, expect } from '@playwright/test'

async function loginAndGetCookie(request: any, baseUrl: string, password: string) {
  const res = await request.post(, {
    data: { password },
    headers: { 'Content-Type': 'application/json' }
  })
  expect(res.ok()).toBeTruthy()
  const setCookie = res.headers()['set-cookie'] || ''
  const m = /adminToken=([^;]+)/.exec(setCookie)
  expect(m).not.toBeNull()
  return m?.[1]!
}

test('admin dashboard redirects unauthenticated and loads when authed', async ({ page, context, request }) => {
  const baseUrl = 'http://localhost:3000'
  await page.goto()
  await expect(page).toHaveURL(/\/admin\/login/)

  const password = process.env.ADMIN_PASSWORD || 'admin123'
  const token = await loginAndGetCookie(request, baseUrl, password)
  await context.addCookies([{ name: 'adminToken', value: token, url: baseUrl, httpOnly: true, sameSite: 'Strict', path: '/' }])

  await page.goto()
  await expect(page.getByText('F.B/c AI Admin Dashboard')).toBeVisible()
})
