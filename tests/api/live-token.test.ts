/** @jest-environment node */

const recordCapabilityUsed = jest.fn(async () => {})
jest.mock('@/lib/context/capabilities', () => ({
  recordCapabilityUsed: (...args: any[]) => recordCapabilityUsed(...args),
}))

describe('live token route', () => {
  test('POST /api/live/token returns token and records voice capability', async () => {
    const { POST } = await import('@/app/api/live/token/route')
    const sessionId = 'session-voice-1'
    const req = new Request('http://localhost', {
      method: 'POST',
      headers: { 'x-intelligence-session-id': sessionId },
    }) as any
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.token).toBeTruthy()
    expect(recordCapabilityUsed).toHaveBeenCalledWith(sessionId, 'voice', expect.anything())
  })
})


