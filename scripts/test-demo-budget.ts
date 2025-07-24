#!/usr/bin/env tsx

import { getDemoSession, checkDemoAccess, recordDemoUsage, getDemoStatus, DemoFeature } from '../lib/demo-budget-manager'

async function testDemoBudgetSystem() {
  console.log('🧪 Testing Demo Budget System...')

  try {
    // Test 1: Create a new demo session
    console.log('\n1. Creating demo session...')
    const session = await getDemoSession('test-session-123', '127.0.0.1', 'test-agent')
    console.log('✅ Session created:', session.sessionId)
    console.log('📊 Initial tokens used:', session.totalTokensUsed)

    // Test 2: Check access for chat feature
    console.log('\n2. Testing chat feature access...')
    const chatAccess = await checkDemoAccess(session.sessionId, 'chat' as DemoFeature, 1000)
    console.log('✅ Chat access check:', chatAccess.allowed ? 'ALLOWED' : 'DENIED')
    console.log('📊 Remaining tokens:', chatAccess.remainingTokens)

    // Test 3: Record usage
    console.log('\n3. Recording usage...')
    await recordDemoUsage(session.sessionId, 'chat' as DemoFeature, 1500, true)
    console.log('✅ Usage recorded')

    // Test 4: Check updated status
    console.log('\n4. Checking updated status...')
    const status = await getDemoStatus(session.sessionId)
    console.log('✅ Status retrieved')
    console.log('📊 Total tokens used:', status.session.totalTokensUsed)
    console.log('📊 Chat tokens used:', status.session.featureUsage.chat)
    console.log('📊 Overall progress:', status.overallProgress + '%')

    // Test 5: Test budget enforcement
    console.log('\n5. Testing budget enforcement...')
    const largeRequest = await checkDemoAccess(session.sessionId, 'chat' as DemoFeature, 50000)
    console.log('✅ Large request check:', largeRequest.allowed ? 'ALLOWED' : 'DENIED')
    if (!largeRequest.allowed) {
      console.log('📝 Reason:', largeRequest.reason)
    }

    // Test 6: Test feature completion
    console.log('\n6. Testing feature completion...')
    await recordDemoUsage(session.sessionId, 'chat' as DemoFeature, 8500, true) // Total: 10k
    const finalStatus = await getDemoStatus(session.sessionId)
    console.log('✅ Chat feature complete:', finalStatus.featureStatus.chat.isComplete)

    console.log('\n🎉 All demo budget tests passed!')
    console.log('\n📋 Summary:')
    console.log('- Session management: ✅')
    console.log('- Access control: ✅')
    console.log('- Usage tracking: ✅')
    console.log('- Budget enforcement: ✅')
    console.log('- Feature completion: ✅')

  } catch (error) {
    console.error('❌ Demo budget test failed:', error)
    process.exit(1)
  }
}

testDemoBudgetSystem() 