#!/usr/bin/env pnpm tsx

/**
 * Test script to verify session persistence across page refreshes
 */

async function testSessionPersistence() {
  console.log('🧪 Testing Session Persistence...\n')

  // Step 1: Create initial session with capabilities
  console.log('1️⃣ Creating initial session...')
  
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
      const originalSessionId = data.sessionId
      console.log('✅ Initial session created:', originalSessionId)
      
      // Step 2: Check context has capabilities
      console.log('\n2️⃣ Checking initial context...')
      const contextResponse = await fetch(`http://localhost:3000/api/intelligence/context?sessionId=${originalSessionId}`)
      
      if (contextResponse.ok) {
        const context = await contextResponse.json()
        console.log('✅ Initial context:', {
          capabilities: context.capabilities,
          capabilitiesCount: context.capabilities?.length || 0
        })
        
        if (context.capabilities?.includes('search')) {
          console.log('✅ Search capability recorded in original session')
          
          // Step 3: Simulate page refresh by creating a new session ID
          console.log('\n3️⃣ Simulating page refresh...')
          const newSessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
          console.log('🔄 New session ID generated:', newSessionId)
          
          // Step 4: Check if new session has capabilities (it shouldn't)
          console.log('\n4️⃣ Checking new session context...')
          const newContextResponse = await fetch(`http://localhost:3000/api/intelligence/context?sessionId=${newSessionId}`)
          
          if (newContextResponse.status === 404) {
            console.log('✅ New session correctly has no context (404)')
          } else if (newContextResponse.ok) {
            const newContext = await newContextResponse.json()
            console.log('❌ New session has context (should not):', {
              capabilities: newContext.capabilities,
              capabilitiesCount: newContext.capabilities?.length || 0
            })
          }
          
          // Step 5: Verify original session still has capabilities
          console.log('\n5️⃣ Verifying original session still has capabilities...')
          const originalContextResponse = await fetch(`http://localhost:3000/api/intelligence/context?sessionId=${originalSessionId}`)
          
          if (originalContextResponse.ok) {
            const originalContext = await originalContextResponse.json()
            console.log('✅ Original session context:', {
              capabilities: originalContext.capabilities,
              capabilitiesCount: originalContext.capabilities?.length || 0
            })
            
            if (originalContext.capabilities?.includes('search')) {
              console.log('✅ Original session capabilities preserved!')
            } else {
              console.log('❌ Original session lost capabilities')
            }
          }
          
        } else {
          console.log('❌ Search capability not found in original session')
        }
      } else {
        console.log('❌ Failed to get initial context:', contextResponse.status)
      }
      
    } else {
      console.log('❌ Session init failed:', response.status)
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error)
  }
  
  console.log('\n🎯 Test Summary:')
  console.log('- Original session should have capabilities')
  console.log('- New session should have no context')
  console.log('- Original session capabilities should persist')
  console.log('- Browser should restore original session on refresh')
}

// Run the test
testSessionPersistence()
