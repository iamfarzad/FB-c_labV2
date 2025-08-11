import { test, expect } from '@playwright/test'

test('voice overlay connects and records capability', async ({ page }) => {
  // Prepare a stable session id and consent
  const sessionId = `session-${Date.now()}`
  await page.addInitScript((sid) => {
    localStorage.setItem('intelligence-session-id', sid as string)
    // consent cookie expected by chat route
    document.cookie = `fbc-consent=${JSON.stringify({ allow: true })}; path=/`;
  }, sessionId)

  // Initialize session server-side
  const init = await page.request.post('/api/intelligence/session-init', {
    data: { sessionId }
  })
  expect(init.ok()).toBeTruthy()

  await page.goto('/chat')

  // Open voice overlay (does not emit usage client-side; server records on token)
  await page.getByRole('button', { name: 'Voice' }).click()

  // Give it a moment to POST /api/live/token
  await page.waitForTimeout(400)

  // Verify capability via context API
  const ctx = await page.request.get(`/api/intelligence/context?sessionId=${sessionId}`)
  expect(ctx.ok()).toBeTruthy()
  const json = await ctx.json()
  expect(Array.isArray(json.capabilities)).toBeTruthy()
  expect(json.capabilities).toContain('voice')
})


