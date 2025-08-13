require('@testing-library/jest-dom')

// Optional: configure or set up a testing framework before each test
// if you delete this file, remove `setupFilesAfterEnv` from `jest.config.mjs`

// Used for things like setting up mock servers or global mocks.
// CJS only for Jest setup

// Provide test env vars and mock external email service to reduce noisy warnings during API tests
if (process.env.NODE_ENV === 'test') {
  process.env.NEXT_PUBLIC_SUPABASE_URL ||= 'http://localhost'
  process.env.SUPABASE_ANON_KEY ||= 'test-anon'
  process.env.SUPABASE_SERVICE_ROLE_KEY ||= 'test-service-role'
  process.env.RESEND_API_KEY ||= 'test'
  jest.mock('resend', () => ({
    Resend: jest.fn().mockImplementation(() => ({
      emails: { send: jest.fn().mockResolvedValue({ data: { id: 'mock-email' }, error: null }) },
    })),
  }))
}

// Mock window.matchMedia for next-themes and other components that use it
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

// Mock Radix Tooltip to avoid provider requirement in tests
jest.mock('@radix-ui/react-tooltip', () => {
  const React = require('react')
  return {
    __esModule: true,
    Provider: ({ children }) => React.createElement(React.Fragment, null, children),
    Root: ({ children }) => React.createElement(React.Fragment, null, children),
    Trigger: ({ children, ...props }) => React.createElement('button', props, children),
    Content: ({ children, ...props }) => React.createElement('div', props, children),
  }
})

// Mock @google/genai to avoid ESM issues in Jest
jest.mock('@google/genai', () => {
  return {
    __esModule: true,
    GoogleGenAI: function GoogleGenAI() {
      return {
        models: {
          generateContent: jest.fn(async () => ({ text: () => '', candidates: [] })),
          generateContentStream: jest.fn(async () => ({ [Symbol.asyncIterator]: async function* () {} })),
        },
        live: {
          connect: jest.fn(async () => ({ close: jest.fn(), sendRealtimeInput: jest.fn() })),
        },
        authTokens: {
          create: jest.fn(async () => ({ name: 'test-ephemeral-token' })),
        },
      }
    },
    Modality: { TEXT: 'TEXT', AUDIO: 'AUDIO' },
  }
})

// Mock Supabase client to avoid importing ESM isows in unit tests
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signInWithPassword: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({ data: [], error: null })),
      insert: jest.fn(() => ({ data: null, error: null })),
      update: jest.fn(() => ({ data: null, error: null })),
      delete: jest.fn(() => ({ data: null, error: null })),
      eq: function () { return this },
      order: function () { return this },
      limit: function () { return this },
      single: function () { return Promise.resolve({ data: null, error: null }) },
    })),
    storage: { from: jest.fn(() => ({ upload: jest.fn(), download: jest.fn() })) },
  })),
}))

// Mock Next.js server Request for API tests
jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server')
  class MockRequest {
    constructor(url, init) {
      this.url = url
      this.method = init?.method || 'GET'
      this.headers = new Map(Object.entries(init?.headers || {}))
      this._body = init?.body
    }
    json() { try { return Promise.resolve(JSON.parse(this._body || '{}')) } catch { return Promise.resolve({}) } }
    headers = { get: (k) => this.headers.get(k) }
  }
  return { ...actual, NextRequest: MockRequest }
})

// Minimal global fetch for Node env tests
if (typeof fetch === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  global.fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args))
}

// Ensure keys used by providers exist during tests
process.env.GEMINI_API_KEY ||= 'test-key'
