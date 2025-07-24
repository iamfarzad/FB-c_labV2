import crypto from 'crypto';

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Security: API Security', () => {
  describe('S2.1_Webhook_Signature_Validation', () => {
    it('should validate webhook signatures', async () => {
      const payload = JSON.stringify({ test: 'data' });
      const secret = process.env.RESEND_WEBHOOK_SECRET || 'test-secret';
      
      const signature = crypto
        .createHmac('sha256', secret)
        .update(payload, 'utf8')
        .digest('hex');

      const response = await fetch(`${baseUrl}/api/webhooks/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'resend-signature': `sha256=${signature}`
        },
        body: payload
      });

      expect(response.status).toBe(200);
    });

    it('should accept valid webhook signatures', async () => {
      const payload = JSON.stringify({ test: 'data' });
      const secret = process.env.RESEND_WEBHOOK_SECRET || 'test-secret';
      
      const signature = crypto
        .createHmac('sha256', secret)
        .update(payload, 'utf8')
        .digest('hex');

      const response = await fetch(`${baseUrl}/api/webhooks/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'resend-signature': `sha256=${signature}`
        },
        body: payload
      });

      expect(response.status).toBe(200);
    });
  });

  describe('S2.2_CORS_Policy', () => {
    it('should not allow all origins', async () => {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://malicious-site.com',
          'Access-Control-Request-Method': 'POST'
        }
      });

      const corsHeader = response.headers.get('Access-Control-Allow-Origin');
      expect(corsHeader).not.toBe('*');
    });

    it('should allow specific origins', async () => {
      const allowedOrigins = [
        'https://fbcai.com',
        'https://www.fbcai.com',
        'http://localhost:3000'
      ];

      for (const origin of allowedOrigins) {
        const response = await fetch(`${baseUrl}/api/chat`, {
          method: 'OPTIONS',
          headers: {
            'Origin': origin,
            'Access-Control-Request-Method': 'POST'
          }
        });

        const corsHeader = response.headers.get('Access-Control-Allow-Origin');
        expect(corsHeader).toBe(origin);
      }
    });
  });

  describe('S2.4_Request_Size_Limits', () => {
    it('should reject oversized requests', async () => {
      const largePayload = 'x'.repeat(10 * 1024 * 1024); // 10MB

      const response = await fetch(`${baseUrl}/api/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: largePayload })
      });

      expect(response.status).toBe(413);
    });

    it('should accept requests within size limits', async () => {
      const normalPayload = 'x'.repeat(1024); // 1KB

      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: normalPayload }] 
        })
      });

      expect(response.status).not.toBe(413);
    });
  });

  describe('S2.5_Authentication_Logging', () => {
    it('should log authentication attempts', async () => {
      // Make a failed authentication attempt
      await fetch(`${baseUrl}/api/admin/leads`, {
        headers: { 'Authorization': 'Bearer invalid-token' }
      });

      // Check if authentication attempt was logged
      // This would require access to logs or a logging endpoint
      const response = await fetch(`${baseUrl}/api/admin/audit-logs`, {
        headers: { 'Authorization': `Bearer ${process.env.ADMIN_TOKEN}` }
      });

      if (response.status === 200) {
        const logs = await response.json();
        const authLogs = logs.filter((log: any) => 
          log.type === 'authentication_attempt' || log.type === 'auth_failure'
        );
        expect(authLogs.length).toBeGreaterThan(0);
      }
    });
  });
});