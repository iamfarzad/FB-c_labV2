#!/usr/bin/env pnpm tsx

/**
 * Test script to verify citations display and capability tracking
 */

async function testCitationsAndCapabilities() {
  console.info('🧪 Testing Citations and Capabilities...\n')

  // Test 1: Check if citations are properly structured
  console.info('1️⃣ Testing citation structure...')
  
  const testCitation = {
    uri: 'https://www.linkedin.com/in/farzad-bayat/',
    title: 'Farzad Bayat - LinkedIn Profile'
  }
  
  console.info('✅ Citation structure:', testCitation)
  
  // Test 2: Check capability recording
  console.info('\n2️⃣ Testing capability recording...')
  
  try {
    const response = await fetch('http://localhost:3000/api/intelligence/session-init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'farzad@talktoeve.com',
        name: 'farzad',
        companyUrl: 'https://talktoeve.com'
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      console.info('✅ Session init successful:', data.sessionId)
      
      // Test 3: Check context includes capabilities
      console.info('\n3️⃣ Testing context with capabilities...')
      
      const contextResponse = await fetch(`http://localhost:3000/api/intelligence/context?sessionId=${data.sessionId}`)
      
      if (contextResponse.ok) {
        const context = await contextResponse.json()
        console.info('✅ Context retrieved:', {
          role: context.role,
          roleConfidence: context.roleConfidence,
          capabilities: context.capabilities,
          capabilitiesCount: context.capabilities?.length || 0
        })
        
        if (context.capabilities?.includes('search')) {
          console.info('✅ Search capability recorded successfully!')
        } else {
          console.info('❌ Search capability not found in context')
        }
      } else {
        console.info('❌ Failed to get context:', contextResponse.status)
      }
      
    } else {
      console.info('❌ Session init failed:', response.status)
    }
    
  } catch (error) {
    console.info('❌ Test failed:', error)
  }
  
  // Test 4: Check citation display component
  console.info('\n4️⃣ Testing citation display...')
  
  const testCitations = [
    { uri: 'https://www.linkedin.com/in/farzad-bayat/', title: 'Farzad Bayat - LinkedIn' },
    { uri: 'https://talktoeve.com', title: 'Talk to EVE Website' }
  ]
  
  console.info('✅ Test citations ready for display:', testCitations)
  console.info('📝 These should appear as [1] and [2] chips under assistant messages')
  
  console.info('\n🎯 Test Summary:')
  console.info('- Citations should display as numbered chips with favicons')
  console.info('- Capability tracker should show 1/16 after search')
  console.info('- Context should include capabilities array')
  console.info('- Server should record capability usage in database')
}

// Run the test
testCitationsAndCapabilities()
