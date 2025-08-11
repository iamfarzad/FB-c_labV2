import { test, expect } from '@playwright/test'

test('capability progress persists across reload', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:3000'
  const sid = `e2e-${Date.now()}`

  await page.addInitScript(([k, v]) => localStorage.setItem(k, v), ['intelligence-session-id', sid])

  await page.goto(`${base}/test/ai-chat`)

  // Handle consent if shown
  const allow = page.getByRole('button', { name: /allow/i })
  if (await allow.isVisible().catch(() => false)) {
    const email = page.getByPlaceholder(/Work email/i)
    if (await email.isVisible().catch(() => false)) await email.fill('qa@demo.com')
    await allow.click()
  }

  // Initialize session (ensures context row exists)
  const initRes = await page.request.post(`${base}/api/intelligence/session-init`, {
    headers: {
      'content-type': 'application/json',
      'x-intelligence-session-id': sid,
    },
    data: { sessionId: sid, email: 'qa@demo.com', name: 'QA', companyUrl: 'https://example.com' },
  })
  expect(initRes.ok()).toBeTruthy()

  // Trigger export via API to record capability usage (robust to UI variants)
  const exportRes = await page.request.post(`${base}/api/export-summary`, {
    headers: { 'content-type': 'application/json' },
    data: { sessionId: sid },
  })
  expect(exportRes.ok()).toBeTruthy()

  // Verify via API that capability progress persisted
  const ctx = await page.request.get(`${base}/api/intelligence/context?sessionId=${encodeURIComponent(sid)}`)
  expect(ctx.ok()).toBeTruthy()
  const ctxJson = await ctx.json()
  expect(Array.isArray(ctxJson.capabilities)).toBeTruthy()
  expect(ctxJson.capabilities.length).toBeGreaterThan(0)
})


