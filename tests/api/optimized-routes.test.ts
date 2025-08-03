import { NextRequest, NextResponse } from 'next/server';
import { POST as chatHandler } from '@/app/api/chat/route';
import { POST as analyzeImageHandler } from '@/app/api/analyze-image/route';
import { POST as analyzeDocumentHandler } from '@/app/api/analyze-document/route';
import { POST as geminiLiveHandler } from '@/app/api/gemini-live/route';
import { GeminiConfigEnhanced } from '@/lib/gemini-config-enhanced';

// Mock dependencies
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContentStream: jest.fn().mockImplementation(async function* () {
        yield { text: 'Optimized response chunk 1' };
        yield { text: 'Optimized response chunk 2' };
      }),
      generateContent: jest.fn().mockResolvedValue({
        candidates: [{
          content: {
            parts: [{ text: 'Optimized response' }]
          }
        }],
        responseId: 'test-response-id'
      })
    }
  }))
}));

jest.mock('@/lib/supabase/server', () => ({
  getSupabase: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null })
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [], error: null })
    }))
  }))
}));

jest.mock('@/lib/validation', () => ({
  chatRequestSchema: { parse: (data: any) => data },
  validateRequest: jest.fn(() => ({ success: true, data: { messages: [], data: {} } })),
  sanitizeString: jest.fn((str: string) => str)
}));

jest.mock('@/lib/server-activity-logger', () => ({
  logServerActivity: jest.fn().mockResolvedValue('activity-id')
}));

jest.mock('@/lib/model-selector', () => ({
  selectModelForFeature: jest.fn(() => ({
    model: 'gemini-2.5-flash',
    reason: 'Optimal for this use case',
    estimatedCost: 0.001
  })),
  estimateTokens: jest.fn(() => 100),
  estimateTokensForMessages: jest.fn(() => 200)
}));

jest.mock('@/lib/token-usage-logger', () => ({
  enforceBudgetAndLog: jest.fn().mockResolvedValue({
    allowed: true,
    reason: 'Within budget'
  })
}));

// Mock environment variables
process.env.GEMINI_API_KEY = 'test-api-key';
process.env.NODE_ENV = 'test';

describe('Optimized API Routes', () => {
  let geminiConfig: GeminiConfigEnhanced;

  beforeEach(() => {
    jest.clearAllMocks();
    geminiConfig = GeminiConfigEnhanced.getInstance();
    geminiConfig.clearExpiredCache();
  });

  describe('Chat Route Optimization', () => {
    const createChatRequest = (body: any) => {
      return new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '127.0.0.1'
        },
        body: JSON.stringify(body)
      });
    };

    it('should apply maxOutputTokens limit', async () => {
      const request = createChatRequest({
        messages: [
          { role: 'user', content: 'Hello, how can AI help my business?' }
        ],
        data: { enableLeadGeneration: false }
      });

      const response = await chatHandler(request);
      
      expect(response).toBeInstanceOf(Response);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
      
      // Verify that optimized config was used
      const { GoogleGenAI } = require('@google/genai');
      const mockInstance = GoogleGenAI.mock.results[0].value;
      const generateContentStreamCalls = mockInstance.models.generateContentStream.mock.calls;
      
      expect(generateContentStreamCalls.length).toBeGreaterThan(0);
      const lastCall = generateContentStreamCalls[generateContentStreamCalls.length - 1];
      expect(lastCall[0].config.maxOutputTokens).toBe(2048);
    });

    it('should use conversation optimization with caching', async () => {
      const messages = [
        { role: 'user', content: 'What is AI?' },
        { role: 'assistant', content: 'AI is artificial intelligence...' },
        { role: 'user', content: 'How can it help businesses?' }
      ];

      // First request - should not use cache
      const request1 = createChatRequest({
        messages,
        data: { 
          enableLeadGeneration: false,
          conversationSessionId: 'test-session-123'
        }
      });

      await chatHandler(request1);

      // Second request with same session - should use cache
      const request2 = createChatRequest({
        messages,
        data: { 
          enableLeadGeneration: false,
          conversationSessionId: 'test-session-123'
        }
      });

      const consoleSpy = jest.spyOn(console, 'log');
      await chatHandler(request2);

      // Check if cache was used
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('💡 Chat optimization: Used cache')
      );

      consoleSpy.mockRestore();
    });

    it('should handle long conversations with summarization', async () => {
      // Create a very long conversation
      const messages = [];
      for (let i = 0; i < 100; i++) {
        messages.push({
          role: 'user',
          content: `Question ${i}: This is a long question about business process automation and AI implementation strategies.`
        });
        messages.push({
          role: 'assistant',
          content: `Answer ${i}: Here's a detailed response about implementing AI solutions for business optimization.`
        });
      }

      const request = createChatRequest({
        messages,
        data: { enableLeadGeneration: false }
      });

      const consoleSpy = jest.spyOn(console, 'log');
      await chatHandler(request);

      // Should log that summary was created
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('with summary')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Image Analysis Route Optimization', () => {
    const createImageRequest = (body: any) => {
      return new NextRequest('http://localhost:3000/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
    };

    it('should apply optimized config for image analysis', async () => {
      const request = createImageRequest({
        image: 'data:image/jpeg;base64,/9j/4AAQ...',
        type: 'webcam'
      });

      const response = await analyzeImageHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.analysis).toBe('Optimized response');

      // Verify optimized config was used
      const { GoogleGenAI } = require('@google/genai');
      const mockInstance = GoogleGenAI.mock.results[0].value;
      const generateContentCalls = mockInstance.models.generateContent.mock.calls;
      
      expect(generateContentCalls.length).toBeGreaterThan(0);
      const lastCall = generateContentCalls[generateContentCalls.length - 1];
      expect(lastCall[0].config.maxOutputTokens).toBe(512);
      expect(lastCall[0].config.temperature).toBe(0.3);
    });

    it('should use cost-efficient model for image analysis', async () => {
      const request = createImageRequest({
        image: 'data:image/jpeg;base64,/9j/4AAQ...',
        type: 'screen'
      });

      await analyzeImageHandler(request);

      const { GoogleGenAI } = require('@google/genai');
      const mockInstance = GoogleGenAI.mock.results[0].value;
      const generateContentCalls = mockInstance.models.generateContent.mock.calls;
      
      const lastCall = generateContentCalls[generateContentCalls.length - 1];
      expect(lastCall[0].model).toBe('gemini-2.5-flash-lite');
    });
  });

  describe('Document Analysis Route Optimization', () => {
    const createDocumentRequest = (body: any) => {
      return new NextRequest('http://localhost:3000/api/analyze-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
    };

    it('should apply document-specific optimization', async () => {
      const request = createDocumentRequest({
        data: 'This is a test document content for analysis.',
        mimeType: 'text/plain',
        fileName: 'test-document.txt'
      });

      const response = await analyzeDocumentHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.analysis).toBe('Optimized response');

      // Verify optimized config
      const { GoogleGenAI } = require('@google/genai');
      const mockInstance = GoogleGenAI.mock.results[0].value;
      const generateContentCalls = mockInstance.models.generateContent.mock.calls;
      
      const lastCall = generateContentCalls[generateContentCalls.length - 1];
      expect(lastCall[0].config.maxOutputTokens).toBe(1536);
      expect(lastCall[0].config.temperature).toBe(0.4);
    });
  });

  describe('Gemini Live Route Optimization', () => {
    const createLiveRequest = (body: any) => {
      return new NextRequest('http://localhost:3000/api/gemini-live', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
    };

    it('should apply live-specific optimization for TTS', async () => {
      const request = createLiveRequest({
        prompt: 'Hello, this is a test for live TTS',
        enableTTS: true,
        streamAudio: false
      });

      const response = await geminiLiveHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.audioData).toBeDefined();

      // Verify optimized config for live responses
      const { GoogleGenAI } = require('@google/genai');
      const mockInstance = GoogleGenAI.mock.results[0].value;
      const generateContentCalls = mockInstance.models.generateContent.mock.calls;
      
      expect(generateContentCalls.length).toBeGreaterThan(0);
      const lastCall = generateContentCalls[generateContentCalls.length - 1];
      expect(lastCall[0].config.maxOutputTokens).toBe(512);
      expect(lastCall[0].config.temperature).toBe(0.6);
    });

    it('should prevent duplicate calls within threshold', async () => {
      const request1 = createLiveRequest({
        prompt: 'Duplicate test prompt',
        enableTTS: false
      });

      const response1 = await geminiLiveHandler(request1);
      expect(response1.status).toBe(200);

      // Immediate duplicate request
      const request2 = createLiveRequest({
        prompt: 'Duplicate test prompt',
        enableTTS: false
      });

      const response2 = await geminiLiveHandler(request2);
      expect(response2.status).toBe(429);
      
      const data = await response2.json();
      expect(data.error).toBe('Duplicate call skipped');
      expect(data.retryAfter).toBeGreaterThan(0);
    });
  });

  describe('Cache Performance', () => {
    it('should show performance improvement with caching', async () => {
      const messages = [
        { role: 'user', content: 'Performance test question' },
        { role: 'assistant', content: 'Performance test response' }
      ];

      const sessionId = 'perf-test-session';

      // Measure time for first call (no cache)
      const start1 = Date.now();
      await geminiConfig.optimizeConversation(messages, 'System prompt', sessionId);
      const time1 = Date.now() - start1;

      // Measure time for second call (with cache)
      const start2 = Date.now();
      const result = await geminiConfig.optimizeConversation(messages, 'System prompt', sessionId);
      const time2 = Date.now() - start2;

      expect(result.usedCache).toBe(true);
      // Cache hit should be significantly faster
      expect(time2).toBeLessThan(time1);
    });
  });
});