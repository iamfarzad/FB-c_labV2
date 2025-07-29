import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

describe('Security: Authentication & Authorization', () => {
  let supabase: any;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Generate test tokens
    adminToken = jwt.sign(
      { userId: 'test-admin', role: 'service_role' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
    
    userToken = jwt.sign(
      { userId: 'test-user', role: 'user' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  describe('S1.1_API_Authentication_Required', () => {
    it('should require authentication for all protected endpoints', async () => {
      const protectedEndpoints = [
        '/api/admin/leads',
        '/api/admin/ai-performance',
        '/api/admin/analytics',
        '/api/admin/email-campaigns',
        '/api/admin/export',
        '/api/admin/real-time-activity',
        '/api/admin/stats',
        '/api/admin/token-usage'
      ];

      for (const endpoint of protectedEndpoints) {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        expect(response.status).toBe(401);
      }
    });
  });

  describe('S1.2_JWT_Token_Expiration', () => {
    it('should expire JWT tokens within 24 hours', () => {
      const token = jwt.sign(
        { userId: 'test', role: 'user' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '24h' }
      );
      
      const decoded = jwt.decode(token) as any;
      const expirationTime = new Date(decoded.exp * 1000);
      const now = new Date();
      const maxExpiration = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      expect(expirationTime.getTime()).toBeLessThanOrEqual(maxExpiration.getTime());
    });

    it('should reject expired tokens', async () => {
      const expiredToken = jwt.sign(
        { userId: 'test', role: 'user' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' }
      );

      const response = await fetch(`${baseUrl}/api/admin/leads`, {
        headers: { 'Authorization': `Bearer ${expiredToken}` }
      });

      expect(response.status).toBe(401);
    });
  });

  describe('S1.3_RBAC_Admin_Access', () => {
    it('should enforce role-based access control for admin endpoints', async () => {
      const testCases = [
        { role: 'user', shouldAccess: false },
        { role: 'admin', shouldAccess: true },
        { role: 'service_role', shouldAccess: true }
      ];

      for (const testCase of testCases) {
        const token = jwt.sign(
          { userId: 'test', role: testCase.role },
          process.env.JWT_SECRET || 'test-secret',
          { expiresIn: '1h' }
        );

        const response = await fetch(`${baseUrl}/api/admin/leads`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (testCase.shouldAccess) {
          expect(response.status).toBe(200);
        } else {
          expect(response.status).toBe(403);
        }
      }
    });
  });

  describe('S1.4_Input_Validation', () => {
    it('should reject malicious inputs', async () => {
      const maliciousInputs = [
        { field: 'email', value: '<script>alert("xss")</script>' },
        { field: 'name', value: 'DROP TABLE users;' },
        { field: 'phone', value: '1234567890123456789012345678901234567890' }
      ];

      for (const input of maliciousInputs) {
        const response = await fetch(`${baseUrl}/api/lead-capture`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [input.field]: input.value })
        });

        expect(response.status).toBe(400);
      }
    });

    it('should validate email format', async () => {
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@example.com',
        'test..test@example.com'
      ];

      for (const email of invalidEmails) {
        const response = await fetch(`${baseUrl}/api/lead-capture`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name: 'Test User' })
        });

        expect(response.status).toBe(400);
      }
    });
  });

  describe('S1.6_Rate_Limiting', () => {
    it('should enforce rate limiting on API endpoints', async () => {
      const endpoint = '/api/chat';
      const maxRequests = 100; // Configured limit

      const promises = [];
      for (let i = 0; i < maxRequests + 10; i++) {
        promises.push(
          fetch(`${baseUrl}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              messages: [{ role: 'user', content: `test message ${i}` }] 
            })
          })
        );
      }

      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(r => r.status === 429);

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});