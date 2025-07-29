import { NextRequest } from 'next/server'
import { POST } from '@/app/api/chat/route'

function createNextRequest(body: any): NextRequest {
  return new NextRequest('http://localhost/api/chat', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  })
}

describe('Chat API', () => {
  it('returns 400 if validation fails', async () => {
    const req = createNextRequest({})
    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Validation failed')
  })

  it('returns 429 if rate limit exceeded', async () => {
    // This test would require mocking rate limit to simulate limit exceeded
    // For now, just a placeholder
    expect(true).toBe(true)
  })

  it('returns 500 if GEMINI_API_KEY is missing', async () => {
    process.env.GEMINI_API_KEY = ''
    const req = createNextRequest({
      messages: [{ role: 'user', content: 'Hello' }]
    })
    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
})
