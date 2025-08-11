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

import { POST as intentPOST } from '@/app/api/intelligence/intent/route'
import { POST as sessionInitPOST } from '@/app/api/intelligence/session-init/route'

function makeRequest(body: any) {
  const headers = new Map<string, string>([['content-type', 'application/json']])
  return {
    url: 'http://localhost/api/intelligence/intent',
    headers: { get: (k: string) => headers.get(k.toLowerCase()) || null },
    json: async () => body,
  } as any
}

function makeInitRequest(body: any) {
  const headers = new Map<string, string>([['content-type', 'application/json']])
  return {
    url: 'http://localhost/api/intelligence/session-init',
    headers: { get: (k: string) => headers.get(k.toLowerCase()) || null },
    json: async () => body,
  } as any
}

describe('api/intelligence/intent', () => {
  test('classifies and persists intent', async () => {
    const email = `user+${Date.now()}@example.com`
    const initReq = makeInitRequest({ email, name: 'User' })
    const initRes = await sessionInitPOST(initReq)
    expect(initRes.ok).toBe(true)
    const init = await initRes.json()
    const sessionId = init.sessionId

    const req = makeRequest({ sessionId, userMessage: 'We need an ROI estimate and integration plan' })
    const res = await intentPOST(req)
    expect(res.ok).toBe(true)
    const body = await res.json()
    expect(['consulting', 'workshop', 'other']).toContain(body.type)
  })
})


