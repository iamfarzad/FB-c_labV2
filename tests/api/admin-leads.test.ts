jest.mock('@/lib/auth', () => ({
  adminAuthMiddleware: async () => null,
  adminRateLimit: () => null,
}))

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

// Minimal supabaseService chainable mock
jest.mock('@/lib/supabase/client', () => {
  const leads = [
    { id: '1', name: 'A', email: 'a@x.com', company_name: 'X', lead_score: 80, conversation_summary: '', consultant_brief: '', ai_capabilities_shown: ['search'], intent_type: 'consulting', created_at: new Date().toISOString() },
    { id: '2', name: 'B', email: 'b@x.com', company_name: 'Y', lead_score: 65, conversation_summary: '', consultant_brief: '', ai_capabilities_shown: [], intent_type: 'workshop', created_at: new Date().toISOString() },
  ]
  return {
    supabaseService: {
      from() {
        const state: any = { filters: {} }
        const api: any = {
          select() { return api },
          gte() { return api },
          order() { return api },
          or() { return api },
          eq(col: string, val: any) { state.filters[col] = val; return api },
          async then() { /* allow await if misused */ },
          async finally() {},
        }
        Object.defineProperty(api, 'then', { value: undefined })
        api.exec = async () => {
          let data = leads
          if (state.filters.intent_type) data = data.filter(l => l.intent_type === state.filters.intent_type)
          return { data, error: null }
        }
        // Mimic supabase client pattern returning { data, error } on await query
        ;(api as any)[Symbol.asyncIterator] = undefined
        return {
          select: api.select,
          gte: api.gte,
          order: api.order,
          or: api.or,
          eq: api.eq,
          async then(onFulfilled: any) { const r = await api.exec(); return onFulfilled(r) },
        }
      }
    }
  }
})

import { GET } from '@/app/api/admin/leads/route'

describe('admin leads API', () => {
  it('filters by intent=consulting', async () => {
    const req: any = { url: 'http://localhost/api/admin/leads?intent=consulting&period=7d' }
    const res: any = await GET(req)
    expect(res.ok).toBe(true)
    const body = await res.json()
    expect(Array.isArray(body.leads)).toBe(true)
    expect(body.leads.length).toBeGreaterThan(0)
    for (const lead of body.leads) expect(lead.intent_type).toBe('consulting')
  })
})


