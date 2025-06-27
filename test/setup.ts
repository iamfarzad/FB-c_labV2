// Test setup file
import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

// Mock environment variables
process.env.GOOGLE_GEMINI_API_KEY = 'test-api-key';
process.env.ELEVENLABS_API_KEY = 'test-elevenlabs-key';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Mock Next.js modules
vi.mock('next/headers', () => ({
  headers: () => ({
    get: () => null,
  }),
  cookies: () => ({
    get: () => null,
    set: vi.fn(),
  }),
}));

// Mock external libraries
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => 'Mocked AI response',
        },
      }),
    }),
  })),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }),
        }),
      }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }),
      }),
    }),
    channel: vi.fn().mockReturnValue({
      send: vi.fn().mockResolvedValue({}),
    }),
  }),
}));

vi.mock('elevenlabs', () => ({
  ElevenLabsClient: vi.fn().mockImplementation(() => ({
    textToSpeech: {
      convert: vi.fn().mockImplementation(async () => {
        // Return a mock audio stream
        const mockAudioData = new Uint8Array([1, 2, 3, 4, 5]);
        return {
          [Symbol.asyncIterator]: async function* () {
            yield mockAudioData;
          }
        };
      }),
    },
  })),
}));

// Global fetch mock
global.fetch = vi.fn();

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});