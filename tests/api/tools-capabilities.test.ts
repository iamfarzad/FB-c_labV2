/** @jest-environment node */
// Override global setup that expects window
beforeAll(() => {
  // @ts-ignore
  global.window = {} as any
})
afterAll(() => {
  // @ts-ignore
  delete (global as any).window
})

// Mocks
const recordCapabilityUsed = jest.fn(async () => {})
jest.mock('@/lib/context/capabilities', () => ({
  recordCapabilityUsed: (...args: any[]) => recordCapabilityUsed(...args),
}))

jest.mock('@/lib/intelligence/providers/search/google-grounding', () => ({
  GoogleGroundingProvider: class {
    async groundedAnswer(query: string) {
      return { text: `answer for: ${query}`, citations: [{ uri: 'https://ex', title: 'ex' }] }
    }
  }
}))

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockResolvedValue({ candidates: [{ content: { parts: [{ text: 'mock analysis' }] } }] }),
      generateContentStream: jest.fn(async () => {
        async function* gen() { yield { text: 'mock stream' } }
        return gen()
      }),
    },
  })),
}))

// Helpers
function makeReq(body: any, headers: Record<string, string> = {}) {
  return new Request('http://localhost', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  }) as any
}

describe('Tool capability recording', () => {
  const sessionId = 'session-test-123'
  const sidHeaders = { 'x-intelligence-session-id': sessionId }

  beforeEach(() => { recordCapabilityUsed.mockClear() })

  test('urlContext → /api/tools/url', async () => {
    const { POST } = await import('@/app/api/tools/url/route')
    const res = await POST(makeReq({ url: 'https://example.com' }, sidHeaders))
    expect(res.status).toBe(200)
    expect(recordCapabilityUsed).toHaveBeenCalledWith(sessionId, 'urlContext', expect.anything())
  })

  test('calc → /api/tools/calc', async () => {
    const { POST } = await import('@/app/api/tools/calc/route')
    const res = await POST(makeReq({ values: [1, 2, 3], op: 'sum' }, sidHeaders))
    expect(res.status).toBe(200)
    expect(recordCapabilityUsed).toHaveBeenCalledWith(sessionId, 'calc', expect.anything())
  })

  test('code → /api/tools/code', async () => {
    const { POST } = await import('@/app/api/tools/code/route')
    const res = await POST(makeReq({ spec: 'feature spec' }, sidHeaders))
    expect(res.status).toBe(200)
    expect(recordCapabilityUsed).toHaveBeenCalledWith(sessionId, 'code', expect.anything())
  })

  test('search → /api/tools/search', async () => {
    const { POST } = await import('@/app/api/tools/search/route')
    const res = await POST(makeReq({ query: 'hello' }, sidHeaders))
    expect(res.status).toBe(200)
    expect(recordCapabilityUsed).toHaveBeenCalledWith(sessionId, 'search', expect.anything())
  })

  test('doc → /api/tools/screen', async () => {
    process.env.GEMINI_API_KEY = 'test'
    const { POST } = await import('@/app/api/tools/screen/route')
    const res = await POST(makeReq({ image: 'data:image/png;base64,AAA', type: 'document' }, sidHeaders))
    expect(res.status).toBe(200)
    expect(recordCapabilityUsed).toHaveBeenCalledWith(sessionId, 'doc', expect.anything())
  })

  test('image → /api/tools/webcam', async () => {
    process.env.GEMINI_API_KEY = 'test'
    const { POST } = await import('@/app/api/tools/webcam/route')
    const base64 = 'data:image/jpeg;base64,AAA'
    const res = await POST(makeReq({ image: base64, type: 'webcam' }, sidHeaders))
    expect(res.status).toBe(200)
    expect(recordCapabilityUsed).toHaveBeenCalledWith(sessionId, 'image', expect.anything())
  })

  test('screenshot → /api/tools/screen', async () => {
    process.env.GEMINI_API_KEY = 'test'
    const { POST } = await import('@/app/api/tools/screen/route')
    const res = await POST(makeReq({ image: 'data:image/jpeg;base64,AAA', type: 'screen' }, sidHeaders))
    expect(res.status).toBe(200)
    expect(recordCapabilityUsed).toHaveBeenCalledWith(sessionId, 'screenshot', expect.anything())
  })
})

describe('Context capabilities snapshot', () => {
  test('GET /api/intelligence/context returns server capabilities list', async () => {
    // Mock ContextStorage to return a fixed snapshot
    jest.doMock('@/lib/context/context-storage', () => ({
      ContextStorage: class {
        async get(sid: string) {
          return {
            email: 'a@b.c',
            name: 'A',
            ai_capabilities_shown: ['urlContext', 'calc', 'code'],
          }
        }
      }
    }))
    const mod = await import('@/app/api/intelligence/context/route')
    const req = new Request('http://localhost/api/intelligence/context?sessionId=abc', { method: 'GET' }) as any
    const res = await mod.GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.capabilities).toEqual(expect.arrayContaining(['urlContext', 'calc', 'code']))
  })
})


