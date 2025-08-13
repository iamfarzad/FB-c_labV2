#!/usr/bin/env ts-node

/**
 * Test script for the 7-stage conversation flow
 * Tests the complete lead generation system implementation
 */

import { ConversationStateManager } from '../lib/conversation-state-manager';
import { LeadManager, ConversationStage } from '../lib/lead-manager';

async function testConversationFlow() {
  console.info('🧪 Testing 7-Stage Conversation Flow\n');
  
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
  console.info(`📍 Session ID: ${sessionId}`);
  const initialState = await conversationManager.initializeConversation(sessionId);
  console.info(`✅ Conversation initialized at stage: ${initialState.currentStage}\n`);
  
  // Run through test scenarios
  let currentLeadId = null;
  
  for (const scenario of testScenarios) {
    console.info(`\n📋 Test: ${scenario.description}`);
    console.info(`   Input: "${scenario.input}"`);
    
    try {
      const result = await conversationManager.processMessage(
        sessionId,
        scenario.input,
        currentLeadId
      );
      
      console.info(`   Current Stage: ${result.newStage}`);
      console.info(`   Expected Stage: ${scenario.expectedStage}`);
      console.info(`   Research Trigger: ${result.shouldTriggerResearch}`);
      console.info(`   Follow-up Trigger: ${result.shouldSendFollowUp}`);
      
      // Extract lead data
      const leadData = result.updatedState.context.leadData;
      if (leadData) {
        console.info(`   Lead Data:`, {
          name: leadData.name || 'Not set',
          email: leadData.email || 'Not set',
          company: leadData.company || 'Not set',
          painPoints: leadData.painPoints || []
        });
      }
      
      // Validate stage progression
      if (result.newStage === scenario.expectedStage) {
        console.info(`   ✅ Stage progression correct`);
      } else {
        console.info(`   ❌ Stage progression incorrect`);
      }
      
      // Show response preview
      console.info(`   Response Preview: "${result.response.substring(0, 100)}..."`);
      
    } catch (error) {
      console.error(`   ❌ Error:`, error);
    }
  }
  
  // Complete conversation and get summary
  console.info('\n\n📊 Completing Conversation...');
  try {
    const completion = await conversationManager.completeConversation(sessionId);
    console.info('\n✅ Conversation Completed Successfully!');
    console.info('\nLead Summary:', {
      name: completion.leadData.name,
      email: completion.leadData.email,
      company: completion.leadData.company,
      leadScore: completion.leadData.leadScore,
      painPoints: completion.leadData.painPoints
    });
    console.info('\nConversation Summary:', completion.conversationSummary);
    console.info('\nNext Steps:', completion.nextSteps);
  } catch (error) {
    console.error('❌ Error completing conversation:', error);
  }
}

// Run the test
testConversationFlow().catch(console.error);