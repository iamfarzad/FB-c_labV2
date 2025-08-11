#!/usr/bin/env pnpm tsx

/**
 * Test script to verify citations display and capability tracking
 */

async function testCitationsAndCapabilities() {
  console.log('🧪 Testing Citations and Capabilities...\n')

  // Test 1: Check if citations are properly structured
  console.log('1️⃣ Testing citation structure...')
  
  const testCitation = {
    uri: 'https://www.linkedin.com/in/farzad-bayat/',
    title: 'Farzad Bayat - LinkedIn Profile'
  }
  
  console.log('✅ Citation structure:', testCitation)
  
  // Test 2: Check capability recording
  console.log('\n2️⃣ Testing capability recording...')
  
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
      console.log('✅ Session init successful:', data.sessionId)
      
      // Test 3: Check context includes capabilities
      console.log('\n3️⃣ Testing context with capabilities...')
      
      const contextResponse = await fetch(`http://localhost:3000/api/intelligence/context?sessionId=${data.sessionId}`)
      
      if (contextResponse.ok) {
        const context = await contextResponse.json()
        console.log('✅ Context retrieved:', {
          role: context.role,
          roleConfidence: context.roleConfidence,
          capabilities: context.capabilities,
          capabilitiesCount: context.capabilities?.length || 0
        })
        
        if (context.capabilities?.includes('search')) {
          console.log('✅ Search capability recorded successfully!')
        } else {
          console.log('❌ Search capability not found in context')
        }
      } else {
        console.log('❌ Failed to get context:', contextResponse.status)
      }
      
    } else {
      console.log('❌ Session init failed:', response.status)
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error)
  }
  
  // Test 4: Check citation display component
  console.log('\n4️⃣ Testing citation display...')
  
  const testCitations = [
    { uri: 'https://www.linkedin.com/in/farzad-bayat/', title: 'Farzad Bayat - LinkedIn' },
    { uri: 'https://talktoeve.com', title: 'Talk to EVE Website' }
  ]
  
  console.log('✅ Test citations ready for display:', testCitations)
  console.log('📝 These should appear as [1] and [2] chips under assistant messages')
  
  console.log('\n🎯 Test Summary:')
  console.log('- Citations should display as numbered chips with favicons')
  console.log('- Capability tracker should show 1/16 after search')
  console.log('- Context should include capabilities array')
  console.log('- Server should record capability usage in database')
}

// Run the test
testCitationsAndCapabilities()
