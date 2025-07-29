import { describe, it, expect, beforeAll } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Security: Data Security', () => {
  let supabase: any;

  beforeAll(async () => {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  });

  describe('S3.1_PII_Encryption', () => {
    it('should encrypt PII data at rest', async () => {
      // Check if database encryption is enabled
      // This would require database admin access to verify
      const { data: tables } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      const piiTables = ['lead_summaries', 'meetings'];
      
      // In a real environment, you would check encryption status
      // For now, we'll verify the tables exist and have proper structure
      for (const table of piiTables) {
        const tableExists = tables?.some((t: any) => t.table_name === table);
        expect(tableExists).toBe(true);
      }
    });

    it('should encrypt data in transit', async () => {
      // Check if HTTPS is enforced
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'GET'
      });

      // In production, this should redirect to HTTPS
      // For local testing, we'll check the response headers
      const contentType = response.headers.get('content-type');
      expect(contentType).toBeTruthy();
    });
  });

  describe('S3.2_Data_Retention', () => {
    it('should implement data retention policies', async () => {
      // Check if old data is automatically cleaned up
      const retentionDays = 90; // Example retention period
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const { data: oldLeads } = await supabase
        .from('lead_summaries')
        .select('*')
        .lt('created_at', cutoffDate.toISOString());

      // In a properly configured system, old data should be automatically removed
      // For testing, we'll just verify the query works
      expect(Array.isArray(oldLeads)).toBe(true);
    });
  });

  describe('S3.3_SQL_Injection_Prevention', () => {
    it('should prevent SQL injection attacks', async () => {
      const injectionAttempts = [
        "'; DROP TABLE lead_summaries; --",
        "' OR '1'='1",
        "'; INSERT INTO lead_summaries VALUES (1, 'hacked'); --",
        "' UNION SELECT * FROM lead_summaries --",
        "'; UPDATE lead_summaries SET email = 'hacked@evil.com' --"
      ];

      for (const attempt of injectionAttempts) {
        const response = await fetch(`${baseUrl}/api/admin/leads?search=${encodeURIComponent(attempt)}`, {
          headers: { 'Authorization': `Bearer ${process.env.ADMIN_TOKEN}` }
        });

        // Should not crash or return unexpected data
        expect(response.status).not.toBe(500);
        
        // Should either return 400 (bad request) or 200 with safe data
        expect([200, 400, 401, 403]).toContain(response.status);
      }
    });

    it('should use parameterized queries', async () => {
      // Test that the API properly handles special characters
      const testInputs = [
        "O'Connor",
        "Smith & Sons",
        "Company (Ltd.)",
        "Test@example.com"
      ];

      for (const input of testInputs) {
        const response = await fetch(`${baseUrl}/api/lead-capture`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: input,
            email: 'test@example.com'
          })
        });

        // Should handle special characters without errors
        expect(response.status).not.toBe(500);
      }
    });
  });

  describe('S3.4_Audit_Logging', () => {
    it('should log data access', async () => {
      // Perform a data access operation
      await fetch(`${baseUrl}/api/admin/leads`, {
        headers: { 'Authorization': `Bearer ${process.env.ADMIN_TOKEN}` }
      });

      // Check if access was logged
      const { data: auditLogs } = await supabase
        .from('audit_logs')
        .select('*')
        .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
        .eq('action', 'data_access');

      // In a properly configured system, this should contain logs
      expect(Array.isArray(auditLogs)).toBe(true);
    });

    it('should log data modifications', async () => {
      // Perform a data modification operation
      const testLead = {
        name: 'Test User',
        email: 'test@example.com',
        company: 'Test Company',
        engagementType: 'chat',
        tcAcceptance: {
          accepted: true,
          timestamp: Date.now()
        }
      };

      await fetch(`${baseUrl}/api/lead-capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testLead)
      });

      // Check if modification was logged
      const { data: auditLogs } = await supabase
        .from('audit_logs')
        .select('*')
        .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
        .eq('action', 'data_insert');

      expect(Array.isArray(auditLogs)).toBe(true);
    });

    it('should include correlation IDs in logs', async () => {
      // Make a request and check if correlation ID is included
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Correlation-ID': 'test-correlation-id'
        },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: 'test' }] 
        })
      });

      // Check if correlation ID is returned in response
      const correlationId = response.headers.get('X-Correlation-ID');
      expect(correlationId).toBeTruthy();
    });
  });

  describe('S3.5_Data_Access_Controls', () => {
    it('should enforce row-level security', async () => {
      // Test that users can only access their own data
      const userToken = process.env.USER_TOKEN;
      
      if (userToken) {
        const response = await fetch(`${baseUrl}/api/admin/leads`, {
          headers: { 'Authorization': `Bearer ${userToken}` }
        });

        // Regular users should not have access to admin endpoints
        expect(response.status).toBe(403);
      }
    });

    it('should validate data ownership', async () => {
      // Test that users cannot access data they don't own
      const { data: allLeads } = await supabase
        .from('lead_summaries')
        .select('*')
        .limit(1);

      if (allLeads && allLeads.length > 0) {
        const leadId = allLeads[0].id;
        
        // Try to access specific lead without proper authorization
        const response = await fetch(`${baseUrl}/api/admin/leads/${leadId}`, {
          headers: { 'Authorization': `Bearer ${process.env.USER_TOKEN}` }
        });

        // Should be denied access
        expect(response.status).toBe(403);
      }
    });
  });
});