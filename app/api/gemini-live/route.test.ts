import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, OPTIONS } from './route';
import { NextRequest } from 'next/server';

describe('Gemini Live API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET endpoint', () => {
    it('should return WebSocket connection info when API key exists', async () => {
      // Ensure API key is set
      process.env.GOOGLE_GEMINI_API_KEY = 'test-api-key';

      const request = new NextRequest('http://localhost:3000/api/gemini-live');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.wsUrl).toBe('wss://generativelanguage.googleapis.com/v1beta/models');
      expect(data.apiKey).toBe('test-api-key');
      expect(data.models).toContain('gemini-live-2.5-flash-preview');
      expect(data.defaultModel).toBe('gemini-live-2.5-flash-preview');
      expect(data.features).toEqual({
        voiceActivityDetection: true,
        sessionResumption: true,
        interruptions: true,
        nativeAudio: true,
        multimodal: true
      });
    });

    it('should return mock mode when API key is missing', async () => {
      // Save and remove API key
      const originalApiKey = process.env.GOOGLE_GEMINI_API_KEY;
      delete process.env.GOOGLE_GEMINI_API_KEY;

      const request = new NextRequest('http://localhost:3000/api/gemini-live');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(false);
      expect(data.error).toBe('API key not configured');
      expect(data.mockMode).toBe(true);
      expect(data.wsUrl).toBe('wss://mock.generativelanguage.googleapis.com/v1beta/models');
      expect(data.models).toEqual([
        'gemini-live-2.5-flash-preview',
        'gemini-2.0-flash-live-001',
        'gemini-2.5-flash-preview-native-audio-dialog',
        'gemini-2.5-flash-exp-native-audio-thinking-dialog'
      ]);

      // Restore API key
      process.env.GOOGLE_GEMINI_API_KEY = originalApiKey;
    });

    it('should include CORS headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/gemini-live');
      const response = await GET(request);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS');
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
    });

    it('should handle errors gracefully', async () => {
      // Mock an error by temporarily modifying the environment
      const originalEnv = process.env;
      
      // Create a getter that throws an error
      Object.defineProperty(process, 'env', {
        get: () => {
          throw new Error('Environment error');
        },
        configurable: true
      });

      const request = new NextRequest('http://localhost:3000/api/gemini-live');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Environment error');

      // Restore environment
      Object.defineProperty(process, 'env', {
        value: originalEnv,
        configurable: true
      });
    });
  });

  describe('OPTIONS endpoint', () => {
    it('should return CORS headers for preflight requests', async () => {
      const response = await OPTIONS();

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS');
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
    });
  });
});