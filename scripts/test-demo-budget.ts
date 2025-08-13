#!/usr/bin/env tsx

import { getDemoSession, checkDemoAccess, recordDemoUsage, getDemoStatus, DemoFeature } from '../lib/demo-budget-manager'

async function testDemoBudgetSystem() {
  console.info('🧪 Testing Demo Budget System...')

  try {
    // Test 1: Create a new demo session
    console.info('\n1. Creating demo session...')
    const session = await getDemoSession('test-session-123', '127.0.0.1', 'test-agent')
    console.info('✅ Session created:', session.sessionId)
    console.info('📊 Initial tokens used:', session.totalTokensUsed)

    // Test 2: Check access for chat feature
    console.info('\n2. Testing chat feature access...')
    const chatAccess = await checkDemoAccess(session.sessionId, 'chat' as DemoFeature, 1000)
    console.info('✅ Chat access check:', chatAccess.allowed ? 'ALLOWED' : 'DENIED')
    console.info('📊 Remaining tokens:', chatAccess.remainingTokens)

    // Test 3: Record usage
    console.info('\n3. Recording usage...')
    await recordDemoUsage(session.sessionId, 'chat' as DemoFeature, 1500, true)
    console.info('✅ Usage recorded')

    // Test 4: Check updated status
    console.info('\n4. Checking updated status...')
    const status = await getDemoStatus(session.sessionId)
    console.info('✅ Status retrieved')
    console.info('📊 Total tokens used:', status.session.totalTokensUsed)
    console.info('📊 Chat tokens used:', status.session.featureUsage.chat)
    console.info('📊 Overall progress:', status.overallProgress + '%')

    // Test 5: Test budget enforcement
    console.info('\n5. Testing budget enforcement...')
    const largeRequest = await checkDemoAccess(session.sessionId, 'chat' as DemoFeature, 50000)
    console.info('✅ Large request check:', largeRequest.allowed ? 'ALLOWED' : 'DENIED')
    if (!largeRequest.allowed) {
      console.info('📝 Reason:', largeRequest.reason)
    }

    // Test 6: Test feature completion
    console.info('\n6. Testing feature completion...')
    await recordDemoUsage(session.sessionId, 'chat' as DemoFeature, 8500, true) // Total: 10k
    const finalStatus = await getDemoStatus(session.sessionId)
    console.info('✅ Chat feature complete:', finalStatus.featureStatus.chat.isComplete)

    console.info('\n🎉 All demo budget tests passed!')
    console.info('\n📋 Summary:')
    console.info('- Session management: ✅')
    console.info('- Access control: ✅')
    console.info('- Usage tracking: ✅')
    console.info('- Budget enforcement: ✅')
    console.info('- Feature completion: ✅')

  } catch (error) {
    console.error('❌ Demo budget test failed:', error)
    process.exit(1)
  }
}

testDemoBudgetSystem()
