import { describe, it, expect } from '@jest/globals';

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Simple Authentication Test', () => {
  it('should reject admin endpoint without auth', async () => {
    const response = await fetch(`${baseUrl}/api/admin/leads`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log(`Response status: ${response.status}`);
    const data = await response.json();
    console.log(`Response data:`, data);
    
    expect(response.status).toBe(401);
    expect(data.error).toBe('Authorization header required');
  });

  it('should reject admin endpoint with invalid token', async () => {
    const response = await fetch(`${baseUrl}/api/admin/leads`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token'
      }
    });
    
    console.log(`Response status: ${response.status}`);
    const data = await response.json();
    console.log(`Response data:`, data);
    
    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid or expired token');
  });
});
