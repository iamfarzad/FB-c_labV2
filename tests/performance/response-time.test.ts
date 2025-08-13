import { describe, it, expect, beforeAll } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

describe('Performance: Response Time Tests', () => {
  let supabase: any;
  let adminToken: string;

  beforeAll(async () => {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Generate admin token for testing
    adminToken = process.env.ADMIN_TOKEN || 'test-admin-token';
  });

  describe('P1.1_API_Response_Time', () => {
    it('should respond within 2 seconds for all endpoints', async () => {
      const endpoints = [
        { path: '/api/chat', method: 'POST', body: { messages: [{ role: 'user', content: 'test' }] } },
        { path: '/api/lead-capture', method: 'POST', body: { name: 'Test', email: 'test@example.com' } },
        { path: '/api/admin/leads', method: 'GET' },
        { path: '/api/admin/analytics', method: 'GET' },
        { path: '/api/admin/ai-performance', method: 'GET' },
        { path: '/api/admin/stats', method: 'GET' }
      ];

      for (const endpoint of endpoints) {
        const startTime = Date.now();
        
        const response = await fetch(`${baseUrl}${endpoint.path}`, {
          method: endpoint.method,
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: endpoint.body ? JSON.stringify(endpoint.body) : undefined
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        console.info(`Endpoint ${endpoint.path}: ${responseTime}ms`);
        expect(responseTime).toBeLessThan(2000);
        expect(response.status).not.toBe(500);
      }
    });

    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 10;
      const promises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          fetch(`${baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              messages: [{ role: 'user', content: `concurrent test ${i}` }] 
            })
          })
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      const successfulResponses = responses.filter(r => r.status === 200).length;
      const averageTime = totalTime / concurrentRequests;

      console.info(`Concurrent requests: ${successfulResponses}/${concurrentRequests} successful, avg time: ${averageTime}ms`);
      
      expect(successfulResponses).toBeGreaterThan(concurrentRequests * 0.8); // 80% success rate
      expect(averageTime).toBeLessThan(3000); // 3 seconds average
    });
  });

  describe('P1.2_Database_Query_Performance', () => {
    it('should complete database queries within 500ms', async () => {
      const queries = [
        { name: 'lead_summaries_select', query: () => supabase.from('lead_summaries').select('*').limit(100) },
        { name: 'lead_summaries_count', query: () => supabase.from('lead_summaries').select('*', { count: 'exact' }) },
        { name: 'meetings_select', query: () => supabase.from('meetings').select('*').limit(50) },
        { name: 'token_usage_select', query: () => supabase.from('token_usage_logs').select('*').limit(100) }
      ];

      for (const queryTest of queries) {
        const startTime = Date.now();
        const { data, error } = await queryTest.query();
        const endTime = Date.now();
        const queryTime = endTime - startTime;

        console.info(`Query ${queryTest.name}: ${queryTime}ms`);
        expect(queryTime).toBeLessThan(500);
        expect(error).toBeNull();
      }
    });

    it('should use database indexes effectively', async () => {
      // Test queries that should use indexes
      const indexedQueries = [
        { name: 'email_lookup', query: () => supabase.from('lead_summaries').select('*').eq('email', 'test@example.com') },
        { name: 'date_range', query: () => supabase.from('lead_summaries').select('*').gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) },
        { name: 'lead_score_filter', query: () => supabase.from('lead_summaries').select('*').gte('lead_score', 70) }
      ];

      for (const queryTest of indexedQueries) {
        const startTime = Date.now();
        const { data, error } = await queryTest.query();
        const endTime = Date.now();
        const queryTime = endTime - startTime;

        console.info(`Indexed query ${queryTest.name}: ${queryTime}ms`);
        expect(queryTime).toBeLessThan(200); // Indexed queries should be faster
        expect(error).toBeNull();
      }
    });
  });

  describe('P1.3_File_Upload_Performance', () => {
    it('should complete file uploads within 30 seconds', async () => {
      const testFiles = [
        { name: 'small.txt', content: 'test content', size: 1024 },
        { name: 'medium.txt', content: 'x'.repeat(1024 * 1024), size: 1024 * 1024 }, // 1MB
        { name: 'large.txt', content: 'x'.repeat(5 * 1024 * 1024), size: 5 * 1024 * 1024 } // 5MB
      ];

      for (const file of testFiles) {
        const formData = new FormData();
        const blob = new Blob([file.content], { type: 'text/plain' });
        formData.append('file', blob, file.name);

        const startTime = Date.now();
        const response = await fetch(`${baseUrl}/api/upload`, {
          method: 'POST',
          body: formData
        });
        const endTime = Date.now();
        const uploadTime = endTime - startTime;

        console.info(`File upload ${file.name} (${file.size} bytes): ${uploadTime}ms`);
        expect(uploadTime).toBeLessThan(30000);
        expect(response.status).toBe(200);
      }
    });
  });

  describe('P1.4_Connection_Pooling', () => {
    it('should handle multiple database connections efficiently', async () => {
      const connectionCount = 10;
      const promises = [];

      for (let i = 0; i < connectionCount; i++) {
        promises.push(
          supabase.from('lead_summaries').select('count').limit(1)
        );
      }

      const startTime = Date.now();
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      const successfulQueries = results.filter(r => !r.error).length;
      const averageTime = totalTime / connectionCount;

      console.info(`Connection pooling test: ${successfulQueries}/${connectionCount} successful, avg time: ${averageTime}ms`);
      
      expect(successfulQueries).toBe(connectionCount);
      expect(averageTime).toBeLessThan(100); // Should be very fast with connection pooling
    });
  });
});