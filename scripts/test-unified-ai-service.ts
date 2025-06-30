#!/usr/bin/env ts-node

/**
 * Test script for verifying the refactored UnifiedAIService
 * Run with: pnpm ts-node scripts/test-unified-ai-service.ts
 */
import {
  Message,
  ConversationState,
  ProxyRequestBody,
} from '../lib/ai/types';

const API_BASE_URL = 'http://localhost:3000/api';

interface TestResult {
  testName: string;
  success: boolean;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

const tests: TestResult[] = [];

async function testEndpoint(
  testName: string,
  body: ProxyRequestBody
): Promise<void> {
  console.log(`\n🧪 Testing: ${testName}...`);

  try {
    const response = await fetch(`${API_BASE_URL}/ai-service`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log(`✅ ${testName} - SUCCESS`);
      console.log(
        `   Response:`,
        JSON.stringify(data.data).substring(0, 150) + '...'
      );
      tests.push({ testName, success: true, message: 'Passed', data: data.data });
    } else {
      console.log(`❌ ${testName} - FAILED`);
      console.log(`   Error:`, data.error || 'Unknown error');
      tests.push({
        testName,
        success: false,
        message: data.error || 'Failed',
      });
    }
  } catch (error) {
    console.log(`❌ ${testName} - ERROR`);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`   Error:`, errorMessage);
    tests.push({ testName, success: false, message: errorMessage });
  }
}

async function runAllTests() {
  console.log('🚀 Starting UnifiedAIService Integration Tests\n');
  console.log('='.repeat(50));

  // Test 1: Conversational Flow - Greeting
  const initialConversationState: Partial<ConversationState> = {
    sessionId: `test-session-${Date.now()}`,
    stage: 'greeting',
    messages: [],
    messagesInStage: 0,
    capabilitiesShown: [],
  };

  await testEndpoint('Greeting and Name Capture', {
    action: 'conversationalFlow',
    prompt: 'Farzad',
    conversationState: initialConversationState as ConversationState,
    includeAudio: false,
  });

  // Test 2: Conversational Flow - Email Capture & Company Analysis
  const afterGreetingState: Partial<ConversationState> = {
    ...initialConversationState,
    name: 'Farzad',
    stage: 'email_request',
  };

  await testEndpoint('Email Capture & Company Analysis', {
    action: 'conversationalFlow',
    prompt: 'farzad@fbc.com',
    conversationState: afterGreetingState as ConversationState,
    includeAudio: false,
  });

  // Test 3: Image Generation
  await testEndpoint('Image Generation', {
    action: 'handleImageGeneration',
    prompt: 'A futuristic AI dashboard for a financial services company',
  });

  // Test 4: Lead Capture
  const leadCaptureMessages: Message[] = [
    {
      id: '1',
      role: 'user',
      content: 'Hello',
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      role: 'assistant',
      content: 'Hi there! What is your name?',
      timestamp: new Date().toISOString(),
    },
    {
      id: '3',
      role: 'user',
      content: 'Jane Doe',
      timestamp: new Date().toISOString(),
    },
     {
      id: '4',
      role: 'assistant',
      content: 'Great to meet you, Jane! What is your email?',
      timestamp: new Date().toISOString(),
    },
    {
      id: '5',
      role: 'user',
      content: 'jane.doe@acme.com',
      timestamp: new Date().toISOString(),
    },
  ];

  const leadCaptureState: Partial<ConversationState> = {
    sessionId: `test-session-${Date.now()}`,
    name: 'Jane Doe',
    email: 'jane.doe@acme.com',
    stage: 'finalizing',
    messages: leadCaptureMessages,
    companyInfo: { name: 'acme', domain: 'acme.com' },
    capabilitiesShown: ['Text Generation', 'Image Generation'],
  };

  await testEndpoint('Lead Capture', {
    action: 'handleLeadCapture',
    conversationState: leadCaptureState as ConversationState,
  });


  // Print Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY\n');

  const passed = tests.filter(t => t.success).length;
  const failed = tests.filter(t => !t.success).length;

  console.log(`Total Tests: ${tests.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  if (tests.length > 0) {
    console.log(`Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
  }

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    tests
      .filter(t => !t.success)
      .forEach(t => {
        console.log(`   - ${t.testName}: ${t.message}`);
      });
  }

  console.log('\n✨ UnifiedAIService Integration Test Complete!\n');
}

// Run tests
runAllTests().catch(console.error); 