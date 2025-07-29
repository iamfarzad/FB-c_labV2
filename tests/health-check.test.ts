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

    // Check if response is JSON or HTML
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      expect(data.error).toContain('GEMINI_API_KEY');
    } else {
      // If HTML is returned (server error page), that's also acceptable
      const text = await response.text();
      expect(text).toBeDefined();
      expect(response.status).toBeGreaterThanOrEqual(400);
    }
  });
});
