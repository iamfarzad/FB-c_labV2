/** @jest-environment node */
beforeAll(() => {
  // @ts-ignore
  global.window = {} as any
})
afterAll(() => {
  // @ts-ignore
  delete (global as any).window
})

const recordCapabilityUsed = jest.fn(async () => {})
jest.mock('@/lib/context/capabilities', () => ({
  recordCapabilityUsed: (...args: any[]) => recordCapabilityUsed(...args),
}))

describe('meeting capability recording', () => {
  test('POST /api/meetings/book records meeting capability', async () => {
    // Mock Supabase server client before importing route
    jest.doMock('@/lib/supabase/server', () => ({
      getSupabase: () => ({
        from: () => ({
          select: () => ({ eq: () => ({ eq: () => ({ eq: () => ({ single: () => ({ data: null }) }) }) }) }),
          insert: () => ({ select: () => ({ single: () => ({ data: { id: 'm1' }, error: null }) }) }),
        }),
      }),
    }))
    const { POST } = await import('@/app/api/meetings/book/route')
    const sessionId = 'session-meeting-1'
    const booking = {
      leadId: 'lead1',
      name: 'Alice',
      email: 'a@b.c',
      company: 'Acme',
      preferredDate: '2025-01-01',
      preferredTime: '10:00',
      timeZone: 'UTC',
      message: 'Discuss project'
    }
    // Mock EmailService
    jest.doMock('@/lib/email-service', () => ({
      EmailService: { sendMeetingConfirmationEmail: jest.fn().mockResolvedValue(true) }
    }))

    const req = new Request('http://localhost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-intelligence-session-id': sessionId },
      body: JSON.stringify(booking)
    }) as any

    // environment for route
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://local'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service'

    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(recordCapabilityUsed).toHaveBeenCalledWith(sessionId, 'meeting', expect.anything())
  })
})


