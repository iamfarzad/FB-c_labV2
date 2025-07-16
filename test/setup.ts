import { beforeAll, afterAll } from 'vitest'

beforeAll(async () => {
  // Setup test environment
  process.env.NODE_ENV = 'test'
  process.env.BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'
  
  // Set test environment variables
  process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.TEST_SUPABASE_URL || 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.TEST_SUPABASE_ANON_KEY || 'test-anon-key'
  process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key'
  
  // Set AI provider keys for testing
  process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.TEST_GEMINI_API_KEY || 'test-gemini-key'
  process.env.OPENAI_API_KEY = process.env.TEST_OPENAI_API_KEY || 'test-openai-key'
  process.env.ANTHROPIC_API_KEY = process.env.TEST_ANTHROPIC_API_KEY || 'test-anthropic-key'
  process.env.GROQ_API_KEY = process.env.TEST_GROQ_API_KEY || 'test-groq-key'
  process.env.XAI_API_KEY = process.env.TEST_XAI_API_KEY || 'test-xai-key'
  
  // Set email service keys
  process.env.RESEND_API_KEY = process.env.TEST_RESEND_API_KEY || 'test-resend-key'
  process.env.RESEND_WEBHOOK_SECRET = process.env.TEST_RESEND_WEBHOOK_SECRET || 'test-webhook-secret'
  
  // Set WebSocket URL
  process.env.WEBSOCKET_URL = process.env.TEST_WEBSOCKET_URL || 'ws://localhost:3001'
  
  // Set test tokens
  process.env.TEST_AUTH_TOKEN = process.env.TEST_AUTH_TOKEN || 'test-auth-token'
  process.env.ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'test-admin-token'
  
  // Set logging and metrics URLs
  process.env.LOG_API_URL = process.env.TEST_LOG_API_URL || 'http://localhost:8080'
  process.env.LOG_API_KEY = process.env.TEST_LOG_API_KEY || 'test-log-key'
  process.env.METRICS_API_URL = process.env.TEST_METRICS_API_URL || 'http://localhost:8081'
  process.env.METRICS_API_KEY = process.env.TEST_METRICS_API_KEY || 'test-metrics-key'
  
  console.log('Test environment configured')
})

afterAll(async () => {
  // Cleanup test environment
  console.log('Test environment cleanup completed')
})

// Global test utilities
export const testUtils = {
  // Generate test data
  generateTestLead: () => ({
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    company: 'Test Company',
    engagementType: 'chat' as const,
    tcAcceptance: {
      accepted: true,
      timestamp: Date.now()
    }
  }),
  
  // Generate test chat message
  generateTestChatMessage: () => ({
    role: 'user' as const,
    content: 'Hello, this is a test message'
  }),
  
  // Generate test meeting
  generateTestMeeting: (leadId: string) => ({
    lead_id: leadId,
    attendee_name: 'Test Attendee',
    attendee_email: 'attendee@example.com',
    start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    end_time: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // Tomorrow + 1 hour
    status: 'scheduled' as const,
    meeting_link: 'https://meet.google.com/test',
    notes: 'Test meeting notes'
  }),
  
  // Wait for a specified time
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Generate random string
  randomString: (length: number = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  },
  
  // Generate random email
  randomEmail: () => `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,
  
  // Mock fetch response
  mockFetchResponse: (data: any, status: number = 200) => {
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
      headers: new Map()
    })
  }
}

// Global test constants
export const TEST_CONSTANTS = {
  TIMEOUTS: {
    SHORT: 1000,
    MEDIUM: 5000,
    LONG: 10000
  },
  RATE_LIMITS: {
    LEAD_CAPTURE: 10,
    CHAT: 30,
    GEMINI_LIVE: 20,
    LEAD_RESEARCH: 5
  },
  PERFORMANCE: {
    API_RESPONSE_TIME: 200,
    AI_RESPONSE_TIME: 5000,
    DB_QUERY_TIME: 50
  }
}