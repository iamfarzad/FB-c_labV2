import { test, expect } from '@playwright/test'

test('session-id header fallback/unification', async ({ request }) => {
  const base = process.env.BASE_URL || 'http://localhost:3000'
  const sid = `test-${Date.now()}`

  const init = await request.post(`${base}/api/intelligence/session-init`, {
    headers: {
      'content-type': 'application/json',
      'x-intelligence-session-id': sid,
    },
    data: { sessionId: sid, email: 'qa@demo.com', name: 'QA', companyUrl: 'https://example.com' },
  })
  expect(init.ok()).toBeTruthy()
  const initJson = await init.json()
  expect(initJson.sessionId).toBe(sid)

  const ctx = await request.get(`${base}/api/intelligence/context?sessionId=${encodeURIComponent(sid)}`)
  expect(ctx.ok()).toBeTruthy()
  expect(ctx.headers()['etag']).toBeTruthy()
})


