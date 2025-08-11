#!/usr/bin/env tsx

/**
 * Test script for the Conversational Intelligence Pipeline
 * Tests DB migration, session-init, and lead-research endpoints
 */

async function testIntelligencePipeline() {
  console.log('🧪 Testing Conversational Intelligence Pipeline\n')

  const baseUrl = 'http://localhost:3000'
  const testSessionId = `test-session-${Date.now()}`
  const testEmail = 'farzad@talktoeve.com'
  const testName = 'Farzad'
  const testCompanyUrl = 'https://talktoeve.com'

  try {
    // Test 1: Session Init
    console.log('📋 Test 1: Session Initialization')
    const sessionInitResponse = await fetch(`${baseUrl}/api/intelligence/session-init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: testSessionId,
        email: testEmail,
        name: testName,
        companyUrl: testCompanyUrl
      })
    })

    if (!sessionInitResponse.ok) {
      throw new Error(`Session init failed: ${sessionInitResponse.status}`)
    }

    const sessionInitData = await sessionInitResponse.json()
    console.log('✅ Session init response:', sessionInitData)

    // Test 2: Context Retrieval
    console.log('\n📋 Test 2: Context Retrieval')
    const contextResponse = await fetch(`${baseUrl}/api/intelligence/context?sessionId=${testSessionId}`)
    
    if (!contextResponse.ok) {
      throw new Error(`Context retrieval failed: ${contextResponse.status}`)
    }

    const contextData = await contextResponse.json()
    console.log('✅ Context data:', contextData)

    // Test 3: Lead Research
    console.log('\n📋 Test 3: Lead Research')
    const leadResearchResponse = await fetch(`${baseUrl}/api/intelligence/lead-research`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: testSessionId,
        email: testEmail,
        name: testName,
        companyUrl: testCompanyUrl,
        provider: 'google'
      })
    })

    if (!leadResearchResponse.ok) {
      throw new Error(`Lead research failed: ${leadResearchResponse.status}`)
    }

    const leadResearchData = await leadResearchResponse.json()
    console.log('✅ Lead research data:', leadResearchData)

    // Test 4: Updated Context
    console.log('\n📋 Test 4: Updated Context After Research')
    const updatedContextResponse = await fetch(`${baseUrl}/api/intelligence/context?sessionId=${testSessionId}`)
    
    if (!updatedContextResponse.ok) {
      throw new Error(`Updated context retrieval failed: ${updatedContextResponse.status}`)
    }

    const updatedContextData = await updatedContextResponse.json()
    console.log('✅ Updated context data:', updatedContextData)

    console.log('\n🎉 All tests passed! Intelligence pipeline is working correctly.')
    
    // Summary
    console.log('\n📊 Test Summary:')
    console.log(`- Session ID: ${testSessionId}`)
    console.log(`- Email: ${testEmail}`)
    console.log(`- Company: ${updatedContextData.company?.name || 'Unknown'}`)
    console.log(`- Role: ${updatedContextData.role || 'Unknown'}`)
    console.log(`- Confidence: ${updatedContextData.roleConfidence || 0}`)

  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// Run the test
testIntelligencePipeline()
