#!/usr/bin/env ts-node

/**
 * Test script for verifying UnifiedAIService integration
 * Run with: pnpm tsx scripts/test-unified-ai-service.ts
 */

const API_BASE_URL = 'http://localhost:3000/api';

interface TestResult {
  testName: string;
  success: boolean;
  message: string;
  data?: any;
}

const tests: TestResult[] = [];

async function testEndpoint(
  testName: string,
  action: string,
  body: any
): Promise<void> {
  console.log(`\n🧪 Testing: ${testName}...`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/gemini?action=${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (response.ok && data) {
      console.log(`✅ ${testName} - SUCCESS`);
      console.log(`   Response:`, JSON.stringify(data).substring(0, 100) + '...');
      tests.push({ testName, success: true, message: 'Passed', data });
    } else {
      console.log(`❌ ${testName} - FAILED`);
      console.log(`   Error:`, data.error || 'Unknown error');
      tests.push({ testName, success: false, message: data.error || 'Failed' });
    }
  } catch (error) {
    console.log(`❌ ${testName} - ERROR`);
    console.log(`   Error:`, error);
    tests.push({ testName, success: false, message: String(error) });
  }
}

async function runAllTests() {
  console.log('🚀 Starting UnifiedAIService Integration Tests\n');
  console.log('=' .repeat(50));

  // Test 1: Conversational Flow
  await testEndpoint(
    'Conversational Flow',
    'conversationalFlow',
    {
      prompt: 'Hello, I am interested in AI solutions',
      currentConversationState: {
        stage: 'greeting',
        messages: [],
        sessionId: 'test-session-001'
      },
      includeAudio: false
    }
  );

  // Test 2: Image Generation
  await testEndpoint(
    'Image Generation',
    'generateImage',
    {
      prompt: 'Create a futuristic AI dashboard visualization'
    }
  );

  // Test 3: Lead Capture
  await testEndpoint(
    'Lead Capture',
    'leadCapture',
    {
      currentConversationState: {
        name: 'Test User',
        email: 'test@example.com',
        messages: [
          { text: 'Hello', sender: 'user' },
          { text: 'Hi! How can I help?', sender: 'ai' }
        ],
        capabilitiesShown: ['Text Generation', 'Image Generation']
      }
    }
  );

  // Test 4: Video Analysis
  await testEndpoint(
    'Video Analysis',
    'analyzeVideo',
    {
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      prompt: 'Analyze this video for business insights'
    }
  );

  // Test 5: Code Execution
  await testEndpoint(
    'Code Execution',
    'executeCode',
    {
      prompt: 'Calculate ROI for implementing an AI chatbot that saves 20 hours per week'
    }
  );

  // Test 6: URL Analysis
  await testEndpoint(
    'URL Analysis',
    'analyzeURL',
    {
      url: 'https://example.com',
      prompt: 'Analyze this website for AI opportunities'
    }
  );

  // Test 7: Enhanced Personalization
  await testEndpoint(
    'Enhanced Personalization',
    'enhancedPersonalization',
    {
      name: 'John Doe',
      email: 'john@techcorp.com',
      userMessage: 'I want to improve our customer service',
      conversationHistory: []
    }
  );

  // Test 8: Real-time Conversation
  await testEndpoint(
    'Real-time Conversation',
    'realTimeConversation',
    {
      message: 'Tell me more about AI automation',
      conversationHistory: [],
      includeAudio: false
    }
  );

  // Print Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 TEST SUMMARY\n');
  
  const passed = tests.filter(t => t.success).length;
  const failed = tests.filter(t => !t.success).length;
  
  console.log(`Total Tests: ${tests.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    tests.filter(t => !t.success).forEach(t => {
      console.log(`   - ${t.testName}: ${t.message}`);
    });
  }
  
  console.log('\n✨ UnifiedAIService Integration Test Complete!\n');
}

// Run tests
runAllTests().catch(console.error); 