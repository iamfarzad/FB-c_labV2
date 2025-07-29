import { describe, it, expect } from '@jest/globals';

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Health Check', () => {
  it('should have server running', async () => {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'test' }] })
    });

    // Should get a response (even if it's an error about missing API key)
    expect(response).toBeDefined();
    expect(response.status).toBe(500); // Expected due to missing GEMINI_API_KEY
  });

  it('should return proper error for missing API key', async () => {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'test' }] })
    });

    const data = await response.json();
    expect(data.error).toContain('GEMINI_API_KEY');
  });
});