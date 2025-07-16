import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Set up global test configuration
beforeAll(async () => {
  // Ensure test environment is properly configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required for tests');
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required for tests');
  }
});

// Global test utilities
global.testUtils = {
  generateTestToken: (role: string = 'user') => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { userId: 'test-user', role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  },
  
  createTestLead: async (supabase: any) => {
    const testLead = {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      company_name: 'Test Company',
      lead_score: 75,
      conversation_summary: 'Test conversation',
      consultant_brief: 'Test brief',
      ai_capabilities_shown: ['chat']
    };
    
    const { data, error } = await supabase
      .from('lead_summaries')
      .insert(testLead)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  cleanupTestData: async (supabase: any) => {
    // Clean up test data after tests
    const cutoffTime = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    await supabase
      .from('lead_summaries')
      .delete()
      .gte('created_at', cutoffTime);
      
    await supabase
      .from('audit_logs')
      .delete()
      .gte('created_at', cutoffTime);
  }
};

// Don't mock fetch - use real fetch for integration tests
// global.fetch = jest.fn();

// Clean up after each test
afterEach(async () => {
  jest.clearAllMocks();
});

// Clean up after all tests
afterAll(async () => {
  // Global cleanup if needed
});