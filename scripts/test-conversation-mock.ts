#!/usr/bin/env tsx

/**
 * Test conversation flow with mocked dependencies
 */

// Mock the server-activity-logger before importing anything else
import { jest } from '@jest/globals';

// Mock server-activity-logger
jest.mock('@/lib/server-activity-logger', () => ({
  logServerActivity: jest.fn().mockResolvedValue('mock-activity-id')
}));

// Now import the modules
import { ConversationStateManager } from '../lib/conversation-state-manager';
import { ConversationStage } from '../lib/lead-manager';

async function testConversationMock() {
  console.log('🧪 Testing Conversation State Manager with mocks\n');
  
  try {
    const manager = new ConversationStateManager();
    const sessionId = `test-${Date.now()}`;
    
    // Initialize conversation
    console.log('1️⃣ Initializing conversation...');
    const state = await manager.initializeConversation(sessionId);
    console.log('   Initial stage:', state.stage);
    
    // Test greeting
    console.log('\n2️⃣ Processing greeting...');
    const result1 = await manager.processMessage(sessionId, 'Hello');
    console.log('   Response:', result1.response.substring(0, 100) + '...');
    console.log('   New stage:', result1.newStage);
    console.log('   Lead data:', result1.updatedState.context.leadData);
    
    // Test name
    console.log('\n3️⃣ Processing name...');
    const result2 = await manager.processMessage(sessionId, 'My name is John Smith');
    console.log('   Response:', result2.response.substring(0, 100) + '...');
    console.log('   New stage:', result2.newStage);
    console.log('   Lead data:', result2.updatedState.context.leadData);
    
    // Test email
    console.log('\n4️⃣ Processing email...');
    const result3 = await manager.processMessage(sessionId, 'john.smith@techcorp.com');
    console.log('   Response:', result3.response.substring(0, 100) + '...');
    console.log('   New stage:', result3.newStage);
    console.log('   Lead data:', result3.updatedState.context.leadData);
    console.log('   Should trigger research:', result3.shouldTriggerResearch);
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
  }
}

testConversationMock().catch(console.error);