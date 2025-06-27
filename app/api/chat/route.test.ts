import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest, NextResponse } from 'next/server';

// Mock fetch globally
global.fetch = vi.fn();

// Mock GoogleGenAI
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({
        text: 'Fallback AI response'
      })
    }
  }))
}));

describe('Chat API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    (global.fetch as any).mockReset();
  });

  it('should proxy request to main Gemini API successfully', async () => {
    // Mock successful response from Gemini API
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          text: 'Advanced AI response',
          audioData: 'base64-audio',
          sources: [{ title: 'Source', url: 'https://example.com' }]
        }
      })
    });

    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi! How can I help?' },
          { role: 'user', content: 'Tell me about AI' }
        ],
        includeAudio: true,
        leadCaptureState: { name: 'John', email: 'john@example.com' }
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.reply).toBe('Advanced AI response');
    expect(data.audioData).toBe('base64-audio');
    expect(data.sources).toHaveLength(1);

    // Verify fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/gemini?action=conversationalFlow'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('Tell me about AI')
      })
    );
  });

  it('should handle empty messages array', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { text: 'Response to empty prompt' }
      })
    });

    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: []
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.reply).toBe('Response to empty prompt');
  });

  it('should extract content from different message formats', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { text: 'Handled different format' }
      })
    });

    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [
          { role: 'user', parts: [{ text: 'Message in parts format' }] }
        ]
      })
    });

    const response = await POST(request);
    await response.json();

    const fetchCall = (global.fetch as any).mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    expect(body.prompt).toBe('Message in parts format');
  });

  it('should fallback to demo mode when no API key', async () => {
    // Mock failed Gemini API call
    (global.fetch as any).mockRejectedValueOnce(new Error('API failed'));

    // Temporarily remove API key
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }]
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.reply).toContain('demo mode');

    // Restore API key
    process.env.GEMINI_API_KEY = originalKey;
  });

  it('should use basic fallback when API key exists but advanced API fails', async () => {
    // Mock failed Gemini API call
    (global.fetch as any).mockRejectedValueOnce(new Error('API failed'));

    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'model', content: 'Hi there!' }
        ]
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.reply).toBe('Fallback AI response');
  });

  it('should handle errors gracefully', async () => {
    // Mock error in request parsing
    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: 'invalid-json'
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.reply).toContain('error');
  });

  it('should pass includeAudio flag correctly', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { text: 'Response with audio' }
      })
    });

    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        includeAudio: false
      })
    });

    await POST(request);

    const fetchCall = (global.fetch as any).mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    expect(body.includeAudio).toBe(false);
  });

  it('should include conversation state in proxy request', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { text: 'Response' }
      })
    });

    const leadCaptureState = {
      name: 'John Doe',
      email: 'john@company.com',
      stage: 'discovery'
    };

    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        leadCaptureState
      })
    });

    await POST(request);

    const fetchCall = (global.fetch as any).mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    expect(body.currentConversationState).toMatchObject({
      sessionId: expect.stringContaining('chat_'),
      messages: expect.any(Array),
      ...leadCaptureState,
      stage: 'conversation'
    });
  });

  it('should handle non-ok response from Gemini API', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Bad request' })
    });

    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }]
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.reply).toBe('Fallback AI response');
  });

  it('should handle unsuccessful result from Gemini API', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
        error: 'API error'
      })
    });

    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }]
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.reply).toBe('Fallback AI response');
  });
});