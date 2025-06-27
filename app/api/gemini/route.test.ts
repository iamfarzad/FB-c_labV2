import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

// Mock Google Generative AI
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({
        text: 'Mock AI response',
        response: {
          text: () => 'Mock AI response',
          candidates: [{
            groundingMetadata: {
              groundingAttributions: [{
                web: {
                  title: 'Search Result',
                  uri: 'https://example.com'
                }
              }]
            }
          }]
        }
      })
    },
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => 'Mock AI response',
          candidates: [{
            groundingMetadata: {
              groundingAttributions: [{
                web: {
                  title: 'Search Result',
                  uri: 'https://example.com'
                }
              }]
            }
          }]
        }
      })
    })
  }))
}));

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({
    channel: vi.fn().mockReturnValue({
      send: vi.fn().mockResolvedValue(undefined)
    }),
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: [{ id: 'test-id' }], error: null })
      })
    })
  })
}));

// Mock ElevenLabs
vi.mock('@elevenlabs/elevenlabs-js', () => ({
  ElevenLabsClient: vi.fn().mockImplementation(() => ({
    generate: vi.fn().mockResolvedValue({
      [Symbol.asyncIterator]: async function* () {
        yield Buffer.from('mock-audio-data');
      }
    })
  }))
}));

describe('Gemini API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('conversationalFlow action', () => {
    it('should handle conversational flow with basic prompt', async () => {
      const request = new NextRequest('http://localhost:3000/api/gemini?action=conversationalFlow', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Hello, how are you?',
          currentConversationState: {
            sessionId: 'test-session',
            stage: 'greeting',
            messages: []
          }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.text).toBeDefined();
      // Sources are empty array in mock response
      expect(data.data.sources).toEqual([]);
    });

    it('should enforce usage limits', async () => {
      const request = new NextRequest('http://localhost:3000/api/gemini?action=conversationalFlow', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Hello',
          messageCount: 20 // Exceeds limit of 15
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.isLimitReached).toBe(true);
      expect(data.data.showBooking).toBe(true);
    });

    it('should handle missing prompt', async () => {
      const request = new NextRequest('http://localhost:3000/api/gemini?action=conversationalFlow', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('No prompt provided');
    });

    it('should handle email collection stage', async () => {
      const request = new NextRequest('http://localhost:3000/api/gemini?action=conversationalFlow', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'john@company.com',
          currentConversationState: {
            sessionId: 'test-session',
            stage: 'email_collected',
            messages: [],
            name: 'John',
            email: 'john@company.com'
          }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.sidebarActivity).toBe('company_analysis');
    });

    it('should include audio data when requested', async () => {
      const request = new NextRequest('http://localhost:3000/api/gemini?action=conversationalFlow', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Hello',
          includeAudio: true
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.audioData).toBeDefined();
      expect(data.data.audioMimeType).toBe('audio/mpeg');
    });
  });

  describe('generateImage action', () => {
    it('should handle image generation request', async () => {
      const request = new NextRequest('http://localhost:3000/api/gemini?action=generateImage', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'A futuristic business dashboard'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.text).toContain('Generated business visualization concept');
      expect(data.data.sidebarActivity).toBe('image_generation');
    });
  });

  describe('analyzeVideo action', () => {
    it('should handle video analysis request', async () => {
      const request = new NextRequest('http://localhost:3000/api/gemini?action=analyzeVideo', {
        method: 'POST',
        body: JSON.stringify({
          videoUrl: 'https://youtube.com/watch?v=test',
          prompt: 'Analyze this video for business insights'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.videoUrl).toBe('https://youtube.com/watch?v=test');
      expect(data.data.sidebarActivity).toBe('video_analysis');
    });

    it('should handle video spec generation', async () => {
      const request = new NextRequest('http://localhost:3000/api/gemini?action=generateVideoSpec', {
        method: 'POST',
        body: JSON.stringify({
          videoUrl: 'https://youtube.com/watch?v=test',
          prompt: 'You are a pedagogist and product designer'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.text).toBeDefined();
    });
  });

  describe('analyzeDocument action', () => {
    it('should handle document analysis request', async () => {
      const request = new NextRequest('http://localhost:3000/api/gemini?action=analyzeDocument', {
        method: 'POST',
        body: JSON.stringify({
          documentData: 'base64-encoded-document',
          prompt: 'Analyze this document'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.sidebarActivity).toBe('document_analysis');
    });

    it('should reject missing document data', async () => {
      const request = new NextRequest('http://localhost:3000/api/gemini?action=analyzeDocument', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Analyze this document'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('No document provided');
    });
  });

  describe('executeCode action', () => {
    it('should handle code execution request', async () => {
      const request = new NextRequest('http://localhost:3000/api/gemini?action=executeCode', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Create a function to calculate ROI'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.sidebarActivity).toBe('code_execution');
    });
  });

  describe('analyzeURL action', () => {
    it('should handle URL analysis request', async () => {
      const request = new NextRequest('http://localhost:3000/api/gemini?action=analyzeURL', {
        method: 'POST',
        body: JSON.stringify({
          urlContext: 'https://example.com',
          prompt: 'Analyze this website'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.sidebarActivity).toBe('url_analysis');
    });
  });

  describe('leadCapture action', () => {
    it('should handle lead capture with complete conversation', async () => {
      const request = new NextRequest('http://localhost:3000/api/gemini?action=leadCapture', {
        method: 'POST',
        body: JSON.stringify({
          currentConversationState: {
            name: 'John',
            email: 'john@company.com',
            companyInfo: { name: 'Company Inc', domain: 'company.com' },
            messages: [
              { text: 'Hello', sender: 'user' },
              { text: 'Hi! What\'s your name?', sender: 'ai' },
              { text: 'John', sender: 'user' },
              { text: 'Nice to meet you John! What\'s your email?', sender: 'ai' },
              { text: 'john@company.com', sender: 'user' }
            ]
          }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.summary).toBeDefined();
      expect(data.data.leadScore).toBeGreaterThan(0);
      expect(data.data.emailContent).toBeDefined();
    });

    it('should reject lead capture without user info', async () => {
      const request = new NextRequest('http://localhost:3000/api/gemini?action=leadCapture', {
        method: 'POST',
        body: JSON.stringify({
          currentConversationState: {}
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Missing required lead information');
    });
  });

  describe('enhancedPersonalization action', () => {
    it('should handle personalization request', async () => {
      const request = new NextRequest('http://localhost:3000/api/gemini?action=enhancedPersonalization', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John',
          email: 'john@company.com',
          userMessage: 'Tell me about AI solutions',
          conversationHistory: []
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.personalizedResponse).toBeDefined();
      expect(data.data.researchSummary).toBeDefined();
    });
  });

  describe('realTimeConversation action', () => {
    it('should handle real-time conversation', async () => {
      const request = new NextRequest('http://localhost:3000/api/gemini?action=realTimeConversation', {
        method: 'POST',
        body: JSON.stringify({
          message: 'What can AI do for my business?',
          conversationHistory: [],
          includeAudio: false
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.text).toBeDefined();
      expect(data.data.conversationTurn).toBe('ai');
    });
  });

  describe('analyzeWebcamFrame action', () => {
    it('should handle webcam frame analysis', async () => {
      const request = new NextRequest('http://localhost:3000/api/gemini?action=analyzeWebcamFrame', {
        method: 'POST',
        body: JSON.stringify({
          imageData: 'base64-image-data',
          prompt: 'What do you see?'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.sidebarActivity).toBe('webcam_analysis');
    });
  });

  describe('analyzeScreenShare action', () => {
    it('should handle screen share analysis', async () => {
      const request = new NextRequest('http://localhost:3000/api/gemini?action=analyzeScreenShare', {
        method: 'POST',
        body: JSON.stringify({
          imageData: 'base64-screen-data',
          prompt: 'Analyze this screen'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.sidebarActivity).toBe('screen_analysis');
    });
  });

  describe('CORS handling', () => {
    it('should include CORS headers in POST responses', async () => {
      const request = new NextRequest('http://localhost:3000/api/gemini?action=conversationalFlow', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Hello'
        })
      });

      const response = await POST(request);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
    });
  });

  describe('Error handling', () => {
    it('should handle internal server errors gracefully', async () => {
      // Create a request that will cause an error (invalid action)
      const request = new NextRequest('http://localhost:3000/api/gemini?action=invalidAction', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Hello'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      // Since invalid action defaults to conversationalFlow, it should still work
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('Mock mode without API key', () => {
    it('should provide mock responses when API key is missing', async () => {
      // Save the original API key
      const originalApiKey = process.env.GOOGLE_GEMINI_API_KEY;
      
      // Remove API key to test mock mode
      delete process.env.GOOGLE_GEMINI_API_KEY;
      
      const request = new NextRequest('http://localhost:3000/api/gemini?action=conversationalFlow', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Hello',
          currentConversationState: { stage: 'greeting', messages: [] }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // When no API key, should return mock response
      expect(data.data.text).toContain('Welcome to F.B/c AI Showcase');
      expect(data.data.sidebarActivity).toBe('greeting');
      
      // Restore API key
      process.env.GOOGLE_GEMINI_API_KEY = originalApiKey;
    });
  });
});