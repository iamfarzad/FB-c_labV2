#!/usr/bin/env ts-node

/**
 * Test script for the 7-stage conversation flow
 * Tests the complete lead generation system implementation
 */

import { ConversationStateManager } from '../lib/conversation-state-manager';
import { LeadManager, ConversationStage } from '../lib/lead-manager';

async function testConversationFlow() {
  console.log('🧪 Testing 7-Stage Conversation Flow\n');
  
  const conversationManager = new ConversationStateManager();
  const sessionId = `test-session-${Date.now()}`;
  
  // Test scenarios
  const testScenarios = [
    {
      stage: 'GREETING',
      input: 'Hello',
      expectedStage: ConversationStage.NAME_COLLECTION,
      description: 'Initial greeting should ask for name'
    },
    {
      stage: 'NAME_COLLECTION',
      input: 'My name is John Smith',
      expectedStage: ConversationStage.EMAIL_CAPTURE,
      description: 'Name provided should move to email capture'
    },
    {
      stage: 'EMAIL_CAPTURE',
      input: 'john.smith@techcorp.com',
      expectedStage: ConversationStage.BACKGROUND_RESEARCH,
      description: 'Business email should trigger research'
    },
    {
      stage: 'BACKGROUND_RESEARCH',
      input: 'Yes, tell me more',
      expectedStage: ConversationStage.PROBLEM_DISCOVERY,
      description: 'Should move to problem discovery'
    },
    {
      stage: 'PROBLEM_DISCOVERY',
      input: 'We have manual processes that are time-consuming and error-prone',
      expectedStage: ConversationStage.SOLUTION_PRESENTATION,
      description: 'Pain points should trigger solution presentation'
    },
    {
      stage: 'SOLUTION_PRESENTATION',
      input: 'That sounds interesting, tell me more',
      expectedStage: ConversationStage.CALL_TO_ACTION,
      description: 'Interest should move to call to action'
    },
    {
      stage: 'CALL_TO_ACTION',
      input: 'Yes, I would like to schedule a consultation',
      expectedStage: ConversationStage.CALL_TO_ACTION,
      description: 'Should stay on CTA and trigger follow-up'
    }
  ];
  
  // Initialize conversation
  console.log(`📍 Session ID: ${sessionId}`);
  const initialState = await conversationManager.initializeConversation(sessionId);
  console.log(`✅ Conversation initialized at stage: ${initialState.currentStage}\n`);
  
  // Run through test scenarios
  let currentLeadId = null;
  
  for (const scenario of testScenarios) {
    console.log(`\n📋 Test: ${scenario.description}`);
    console.log(`   Input: "${scenario.input}"`);
    
    try {
      const result = await conversationManager.processMessage(
        sessionId,
        scenario.input,
        currentLeadId
      );
      
      console.log(`   Current Stage: ${result.newStage}`);
      console.log(`   Expected Stage: ${scenario.expectedStage}`);
      console.log(`   Research Trigger: ${result.shouldTriggerResearch}`);
      console.log(`   Follow-up Trigger: ${result.shouldSendFollowUp}`);
      
      // Extract lead data
      const leadData = result.updatedState.context.leadData;
      if (leadData) {
        console.log(`   Lead Data:`, {
          name: leadData.name || 'Not set',
          email: leadData.email || 'Not set',
          company: leadData.company || 'Not set',
          painPoints: leadData.painPoints || []
        });
      }
      
      // Validate stage progression
      if (result.newStage === scenario.expectedStage) {
        console.log(`   ✅ Stage progression correct`);
      } else {
        console.log(`   ❌ Stage progression incorrect`);
      }
      
      // Show response preview
      console.log(`   Response Preview: "${result.response.substring(0, 100)}..."`);
      
    } catch (error) {
      console.error(`   ❌ Error:`, error);
    }
  }
  
  // Complete conversation and get summary
  console.log('\n\n📊 Completing Conversation...');
  try {
    const completion = await conversationManager.completeConversation(sessionId);
    console.log('\n✅ Conversation Completed Successfully!');
    console.log('\nLead Summary:', {
      name: completion.leadData.name,
      email: completion.leadData.email,
      company: completion.leadData.company,
      leadScore: completion.leadData.leadScore,
      painPoints: completion.leadData.painPoints
    });
    console.log('\nConversation Summary:', completion.conversationSummary);
    console.log('\nNext Steps:', completion.nextSteps);
  } catch (error) {
    console.error('❌ Error completing conversation:', error);
  }
}

// Run the test
testConversationFlow().catch(console.error);