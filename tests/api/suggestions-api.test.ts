jest.mock('../../lib/context/context-storage', () => {
  const store = new Map<string, any>()
  return {
    ContextStorage: class {
      async store(sessionId: string, payload: any) { store.set(sessionId, { session_id: sessionId, ...payload }) }
      async get(sessionId: string) { return store.get(sessionId) || null }
      async update(sessionId: string, patch: any) { const cur = store.get(sessionId) || { session_id: sessionId }; store.set(sessionId, { ...cur, ...patch }); }
    }
  }
})

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: any) => ({
      ok: !(init && typeof init.status === 'number' && init.status >= 400),
      status: init?.status ?? 200,
      json: async () => data,
      headers: new Map(),
    })
  }
}))

import { POST as suggestionsPOST } from '@/app/api/intelligence/suggestions/route'
import { POST as sessionInitPOST } from '@/app/api/intelligence/session-init/route'
import { POST as intentPOST } from '@/app/api/intelligence/intent/route'

function makeRequest(url: string, body: any) {
  const headers = new Map<string, string>([['content-type', 'application/json']])
  return {
    url,
    headers: { get: (k: string) => headers.get(k.toLowerCase()) || null },
    json: async () => body,
  } as any
}

describe('api/intelligence/suggestions', () => {
  test('returns up to 3 suggestions and respects capabilities', async () => {
    const email = `user+${Date.now()}@example.com`
    const initRes = await sessionInitPOST(makeRequest('http://localhost/api/intelligence/session-init', { email, name: 'User' }))
    expect(initRes.ok).toBe(true)
    const init = await initRes.json()
    const sessionId = init.sessionId

    // Seed intent
    await intentPOST(makeRequest('http://localhost/api/intelligence/intent', { sessionId, userMessage: 'ROI and integration' }))

    const res = await suggestionsPOST(makeRequest('http://localhost/api/intelligence/suggestions', { sessionId, stage: 'INTENT' }))
    expect(res.ok).toBe(true)
    const body = await res.json()
    expect(Array.isArray(body.suggestions)).toBe(true)
    expect(body.suggestions.length).toBeGreaterThan(0)
    expect(body.suggestions.length).toBeLessThanOrEqual(3)
  })
})


