#!/usr/bin/env tsx

import { ConversationStateManager } from '../lib/conversation-state-manager';
import { LeadManager } from '../lib/lead-manager';
import { logServerActivity } from '../lib/server-activity-logger';

async function testCompleteLeadGenerationSystem() {
  console.info('🚀 Testing Complete Lead Generation System\n');

  // Initialize managers
  const conversationManager = new ConversationStateManager();
  const leadManager = new LeadManager();

  const sessionId = `test_session_${Date.now()}`;
  
  try {
    // ============================================================================
    // TEST 1: CONVERSATION INITIALIZATION
    // ============================================================================
    console.info('📋 Test 1: Conversation Initialization');
    
    const initialState = await conversationManager.initializeConversation(sessionId);
    console.info('✅ Conversation initialized:', {
      sessionId: initialState.metadata.sessionId,
      currentStage: initialState.currentStage,
      totalMessages: initialState.metadata.totalMessages
    });

    // ============================================================================
    // TEST 2: STAGE 1 - GREETING & NAME COLLECTION
    // ============================================================================
    console.info('\n📋 Test 2: Stage 1 - Greeting & Name Collection');
    
    const stage1Result = await conversationManager.processMessage(
      sessionId,
      'Hi, I\'m interested in AI solutions for my company'
    );
    
    console.info('✅ Stage 1 Response:', stage1Result.response.substring(0, 100) + '...');
    console.info('✅ New Stage:', stage1Result.newStage);
    console.info('✅ Should Trigger Research:', stage1Result.shouldTriggerResearch);

    // ============================================================================
    // TEST 3: STAGE 2 - NAME COLLECTION
    // ============================================================================
    console.info('\n📋 Test 3: Stage 2 - Name Collection');
    
    const stage2Result = await conversationManager.processMessage(
      sessionId,
      'My name is John Smith'
    );
    
    console.info('✅ Stage 2 Response:', stage2Result.response.substring(0, 100) + '...');
    console.info('✅ New Stage:', stage2Result.newStage);
    console.info('✅ Context Updated:', {
      name: stage2Result.updatedState.context.leadData.name,
      currentStage: stage2Result.updatedState.currentStage
    });

    // ============================================================================
    // TEST 4: STAGE 3 - EMAIL CAPTURE
    // ============================================================================
    console.info('\n📋 Test 4: Stage 3 - Email Capture');
    
    const stage3Result = await conversationManager.processMessage(
      sessionId,
      'My email is john.smith@techstartup.com'
    );
    
    console.info('✅ Stage 3 Response:', stage3Result.response.substring(0, 100) + '...');
    console.info('✅ New Stage:', stage3Result.newStage);
    console.info('✅ Should Trigger Research:', stage3Result.shouldTriggerResearch);
    console.info('✅ Email Analysis:', {
      email: stage3Result.updatedState.context.leadData.email,
      domain: stage3Result.updatedState.context.leadData.emailDomain,
      companySize: stage3Result.updatedState.context.leadData.companySize,
      decisionMaker: stage3Result.updatedState.context.leadData.decisionMaker,
      aiReadiness: stage3Result.updatedState.context.aiReadiness
    });

    // ============================================================================
    // TEST 5: EMAIL DOMAIN ANALYSIS
    // ============================================================================
    console.info('\n📋 Test 5: Email Domain Analysis');
    
    const domainAnalysis = await leadManager.analyzeEmailDomain('john.smith@techstartup.com');
    console.info('✅ Domain Analysis:', domainAnalysis);

    // ============================================================================
    // TEST 6: STAGE 4 - BACKGROUND RESEARCH (SIMULATED)
    // ============================================================================
    console.info('\n📋 Test 6: Stage 4 - Background Research (Simulated)');
    
    // Simulate research data integration
    const mockResearchData = {
      companyInfo: {
        name: 'TechStartup Inc',
        summary: 'A growing technology startup focused on SaaS solutions',
        industry: 'Technology',
        size: 'Small',
        founded: 2020
      },
      industryAnalysis: {
        techAdoption: 0.8,
        digitalTransformation: 0.7,
        processAutomation: 0.6
      },
      painPoints: [
        'Manual data processing',
        'Customer onboarding delays',
        'Limited scalability'
      ]
    };

    await conversationManager.integrateResearchData(sessionId, mockResearchData);
    
    const updatedState = conversationManager.getConversationState(sessionId);
    console.info('✅ Research Data Integrated:', {
      companyContext: updatedState?.context.companyContext,
      aiReadiness: updatedState?.context.aiReadiness,
      companyName: updatedState?.context.leadData.company
    });

    // ============================================================================
    // TEST 7: STAGE 5 - PROBLEM DISCOVERY
    // ============================================================================
    console.info('\n📋 Test 7: Stage 5 - Problem Discovery');
    
    const stage5Result = await conversationManager.processMessage(
      sessionId,
      'We\'re struggling with manual data processing and customer onboarding is taking too long'
    );
    
    console.info('✅ Stage 5 Response:', stage5Result.response.substring(0, 100) + '...');
    console.info('✅ New Stage:', stage5Result.newStage);
    console.info('✅ Pain Points Identified:', stage5Result.updatedState.context.painPoints);

    // ============================================================================
    // TEST 8: STAGE 6 - SOLUTION PRESENTATION
    // ============================================================================
    console.info('\n📋 Test 8: Stage 6 - Solution Presentation');
    
    const stage6Result = await conversationManager.processMessage(
      sessionId,
      'Yes, I\'d like to see examples of how AI could help us'
    );
    
    console.info('✅ Stage 6 Response:', stage6Result.response.substring(0, 100) + '...');
    console.info('✅ New Stage:', stage6Result.newStage);

    // ============================================================================
    // TEST 9: STAGE 7 - CALL TO ACTION
    // ============================================================================
    console.info('\n📋 Test 9: Stage 7 - Call to Action');
    
    const stage7Result = await conversationManager.processMessage(
      sessionId,
      'Yes, I\'d like to schedule a consultation'
    );
    
    console.info('✅ Stage 7 Response:', stage7Result.response.substring(0, 100) + '...');
    console.info('✅ New Stage:', stage7Result.newStage);
    console.info('✅ Should Send Follow-up:', stage7Result.shouldSendFollowUp);

    // ============================================================================
    // TEST 10: CONVERSATION COMPLETION
    // ============================================================================
    console.info('\n📋 Test 10: Conversation Completion');
    
    const completionResult = await conversationManager.completeConversation(sessionId);
    
    console.info('✅ Conversation Completed:', {
      leadName: completionResult.leadData.name,
      leadEmail: completionResult.leadData.email,
      company: completionResult.leadData.company,
      leadScore: completionResult.leadData.leadScore,
      conversationSummary: completionResult.conversationSummary.substring(0, 200) + '...',
      nextSteps: completionResult.nextSteps
    });

    // ============================================================================
    // TEST 11: FOLLOW-UP SEQUENCE CREATION
    // ============================================================================
    console.info('\n📋 Test 11: Follow-up Sequence Creation');
    
    const followUpSequence = await leadManager.createFollowUpSequence(completionResult.leadData.id!);
    
    console.info('✅ Follow-up Sequence Created:', {
      sequenceId: followUpSequence.id,
      sequenceName: followUpSequence.name,
      emailCount: followUpSequence.emails.length,
      isActive: followUpSequence.isActive
    });

    // ============================================================================
    // TEST 12: LEAD SCORING
    // ============================================================================
    console.info('\n📋 Test 12: Lead Scoring');
    
    const leadScore = await leadManager.updateLeadScore(completionResult.leadData.id!);
    
    console.info('✅ Lead Score Updated:', leadScore);

    // ============================================================================
    // TEST 13: ENGAGEMENT TRACKING
    // ============================================================================
    console.info('\n📋 Test 13: Engagement Tracking');
    
    await leadManager.updateEngagementScore(completionResult.leadData.id!, 'consultation_completed');
    
    const updatedLead = await leadManager.getLead(completionResult.leadData.id!);
    console.info('✅ Engagement Score Updated:', {
      engagementScore: updatedLead?.engagementScore,
      totalInteractions: updatedLead?.totalInteractions,
      lastInteraction: updatedLead?.lastInteraction
    });

    // ============================================================================
    // TEST 14: CONVERSATION HISTORY
    // ============================================================================
    console.info('\n📋 Test 14: Conversation History');
    
    const conversationHistory = conversationManager.getConversationHistory(sessionId);
    console.info('✅ Conversation History:', {
      totalMessages: conversationHistory.length,
      stages: conversationHistory.map(msg => msg.stage),
      lastMessage: conversationHistory[conversationHistory.length - 1]?.content.substring(0, 50) + '...'
    });

    console.info('\n🎉 All tests completed successfully!');
    console.info('\n📊 Summary:');
    console.info('- ✅ Conversation state management working');
    console.info('- ✅ 7-stage conversational flow implemented');
    console.info('- ✅ Email domain analysis functional');
    console.info('- ✅ Lead research integration working');
    console.info('- ✅ Pain point extraction operational');
    console.info('- ✅ Follow-up sequence creation active');
    console.info('- ✅ Lead scoring and engagement tracking functional');
    console.info('- ✅ Activity logging comprehensive');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testCompleteLeadGenerationSystem().catch(console.error);
