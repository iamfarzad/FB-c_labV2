#!/usr/bin/env tsx

/**
 * Simple test to verify conversation flow is working
 */

import { ConversationStateManager } from '../lib/conversation-state-manager';
import { ConversationStage } from '../lib/lead-manager';

async function testConversationSimple() {
  console.info('🧪 Testing Conversation State Manager directly\n');
  
  try {
    const manager = new ConversationStateManager();
    const sessionId = `test-${Date.now()}`;
    
    // Initialize conversation
    console.info('1️⃣ Initializing conversation...');
    const state = await manager.initializeConversation(sessionId);
    console.info('   Initial stage:', state.stage);
    
    // Test greeting
    console.info('\n2️⃣ Processing greeting...');
    const result1 = await manager.processMessage(sessionId, 'Hello');
    console.info('   Response:', result1.response);
    console.info('   New stage:', result1.newStage);
    console.info('   Lead data:', result1.updatedState.context.leadData);
    
    // Test name
    console.info('\n3️⃣ Processing name...');
    const result2 = await manager.processMessage(sessionId, 'My name is John Smith');
    console.info('   Response:', result2.response);
    console.info('   New stage:', result2.newStage);
    console.info('   Lead data:', result2.updatedState.context.leadData);
    
    // Test email
    console.info('\n4️⃣ Processing email...');
    const result3 = await manager.processMessage(sessionId, 'john.smith@techcorp.com');
    console.info('   Response:', result3.response);
    console.info('   New stage:', result3.newStage);
    console.info('   Lead data:', result3.updatedState.context.leadData);
    console.info('   Should trigger research:', result3.shouldTriggerResearch);
    
    console.info('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
  }
}

testConversationSimple().catch(console.error);