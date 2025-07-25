import { createMocks } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import chatHandler from '@/app/api/chat/route';

// Mock the AI service
jest.mock('@/lib/ai', () => ({
  generateResponse: jest.fn(() => Promise.resolve('AI response')),
}));

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createRouteHandlerClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
      select: jest.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  })),
}));

describe('Chat API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handles POST request with valid message', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        message: 'Hello, how are you?',
        sessionId: 'test-session',
        leadContext: { engagementType: 'chat' },
      },
    });

    await chatHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = JSON.parse(res._getData());
    expect(responseData.response).toBe('AI response');
  });

  test('handles missing message in request body', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        sessionId: 'test-session',
      },
    });

    await chatHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const responseData = JSON.parse(res._getData());
    expect(responseData.error).toBe('Message is required');
  });

  test('handles empty message', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        message: '',
        sessionId: 'test-session',
      },
    });

    await chatHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const responseData = JSON.parse(res._getData());
    expect(responseData.error).toBe('Message cannot be empty');
  });

  test('handles whitespace-only message', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        message: '   ',
        sessionId: 'test-session',
      },
    });

    await chatHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const responseData = JSON.parse(res._getData());
    expect(responseData.error).toBe('Message cannot be empty');
  });

  test('handles missing sessionId', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        message: 'Hello',
      },
    });

    await chatHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const responseData = JSON.parse(res._getData());
    expect(responseData.error).toBe('Session ID is required');
  });

  test('handles AI service errors', async () => {
    const { generateResponse } = require('@/lib/ai');
    generateResponse.mockRejectedValue(new Error('AI service unavailable'));

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        message: 'Hello',
        sessionId: 'test-session',
      },
    });

    await chatHandler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const responseData = JSON.parse(res._getData());
    expect(responseData.error).toBe('AI service unavailable');
  });

  test('handles unsupported HTTP methods', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });

    await chatHandler(req, res);

    expect(res._getStatusCode()).toBe(405);
    const responseData = JSON.parse(res._getData());
    expect(responseData.error).toBe('Method not allowed');
  });

  test('handles malformed JSON in request body', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: 'invalid json',
    });

    // Mock the JSON parsing to throw an error
    jest.spyOn(JSON, 'parse').mockImplementation(() => {
      throw new Error('Invalid JSON');
    });

    await chatHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const responseData = JSON.parse(res._getData());
    expect(responseData.error).toBe('Invalid request body');
  });

  test('saves message to database', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        message: 'Test message',
        sessionId: 'test-session',
        leadContext: { engagementType: 'chat' },
      },
    });

    await chatHandler(req, res);

    // Check that the message was saved to the database
    const { createRouteHandlerClient } = require('@/lib/supabase/server');
    const mockClient = createRouteHandlerClient();
    expect(mockClient.from).toHaveBeenCalledWith('messages');
    expect(mockClient.from().insert).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'Test message',
        session_id: 'test-session',
        role: 'user',
      })
    );
  });

  test('saves AI response to database', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        message: 'Test message',
        sessionId: 'test-session',
      },
    });

    await chatHandler(req, res);

    // Check that the AI response was saved to the database
    const { createRouteHandlerClient } = require('@/lib/supabase/server');
    const mockClient = createRouteHandlerClient();
    expect(mockClient.from().insert).toHaveBeenCalledTimes(2); // User message + AI response
  });

  test('handles database errors gracefully', async () => {
    const { createRouteHandlerClient } = require('@/lib/supabase/server');
    createRouteHandlerClient.mockReturnValue({
      from: jest.fn(() => ({
        insert: jest.fn(() => Promise.resolve({ data: null, error: 'Database error' })),
      })),
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        message: 'Test message',
        sessionId: 'test-session',
      },
    });

    await chatHandler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const responseData = JSON.parse(res._getData());
    expect(responseData.error).toBe('Failed to save message');
  });

  test('includes lead context in database save', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        message: 'Test message',
        sessionId: 'test-session',
        leadContext: {
          engagementType: 'chat',
          source: 'website',
          campaign: 'test-campaign',
        },
      },
    });

    await chatHandler(req, res);

    const { createRouteHandlerClient } = require('@/lib/supabase/server');
    const mockClient = createRouteHandlerClient();
    expect(mockClient.from().insert).toHaveBeenCalledWith(
      expect.objectContaining({
        lead_context: {
          engagementType: 'chat',
          source: 'website',
          campaign: 'test-campaign',
        },
      })
    );
  });

  test('handles message with attachments', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        message: 'Message with file',
        sessionId: 'test-session',
        attachments: [
          { name: 'document.pdf', url: '/files/document.pdf' },
        ],
      },
    });

    await chatHandler(req, res);

    const { createRouteHandlerClient } = require('@/lib/supabase/server');
    const mockClient = createRouteHandlerClient();
    expect(mockClient.from().insert).toHaveBeenCalledWith(
      expect.objectContaining({
        attachments: [
          { name: 'document.pdf', url: '/files/document.pdf' },
        ],
      })
    );
  });

  test('handles message with metadata', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        message: 'Message with metadata',
        sessionId: 'test-session',
        metadata: {
          source: 'web',
          userAgent: 'test-agent',
          timestamp: new Date().toISOString(),
        },
      },
    });

    await chatHandler(req, res);

    const { createRouteHandlerClient } = require('@/lib/supabase/server');
    const mockClient = createRouteHandlerClient();
    expect(mockClient.from().insert).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: {
          source: 'web',
          userAgent: 'test-agent',
          timestamp: expect.any(String),
        },
      })
    );
  });

  test('validates message length', async () => {
    const longMessage = 'a'.repeat(10001); // Exceeds 10,000 character limit
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        message: longMessage,
        sessionId: 'test-session',
      },
    });

    await chatHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const responseData = JSON.parse(res._getData());
    expect(responseData.error).toBe('Message too long (max 10,000 characters)');
  });

  test('handles rate limiting', async () => {
    // Mock rate limiting logic
    const mockRateLimit = jest.fn(() => ({ success: false, message: 'Rate limit exceeded' }));
    jest.mock('@/lib/rate-limit', () => ({
      checkRateLimit: mockRateLimit,
    }));

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        message: 'Test message',
        sessionId: 'test-session',
      },
    });

    await chatHandler(req, res);

    expect(res._getStatusCode()).toBe(429);
    const responseData = JSON.parse(res._getData());
    expect(responseData.error).toBe('Rate limit exceeded');
  });

  test('handles authentication errors', async () => {
    // Mock authentication to fail
    const mockAuth = jest.fn(() => ({ user: null, error: 'Unauthorized' }));
    jest.mock('@/lib/auth', () => ({
      authenticateRequest: mockAuth,
    }));

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        message: 'Test message',
        sessionId: 'test-session',
      },
    });

    await chatHandler(req, res);

    expect(res._getStatusCode()).toBe(401);
    const responseData = JSON.parse(res._getData());
    expect(responseData.error).toBe('Unauthorized');
  });
});