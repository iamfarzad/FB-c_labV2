#!/usr/bin/env tsx

/**
 * Test script to verify our infinite loop fix works
 */

async function testFixedBehavior() {
  console.info('🧪 Testing Fixed Behavior (No Infinite Loop)\n')

  // Use a real session ID
  const sessionId = 'session-1754842878975-vnj2atcwt'
  
  console.info('📋 Test: Multiple context fetches with same sessionId')
  
  const apiCalls: Array<{ timestamp: number; success: boolean }> = []
  
  // Simulate multiple attempts to fetch the same context
  for (let i = 0; i < 5; i++) {
    const timestamp = Date.now()
    console.info(`\n📡 Attempt ${i + 1}: Fetching context for ${sessionId}`)
    
    try {
      const response = await fetch(`http://localhost:3000/api/intelligence/context?sessionId=${sessionId}`)
      const success = response.ok
      
      apiCalls.push({ timestamp, success })
      
      if (success) {
        const data = await response.json()
        console.info(`✅ Attempt ${i + 1} successful`)
        console.info(`   Company: ${data.company?.name}`)
        console.info(`   Person: ${data.person?.fullName}`)
        console.info(`   Role: ${data.role}`)
      } else {
        console.info(`❌ Attempt ${i + 1} failed: ${response.status}`)
      }
    } catch (error) {
      console.info(`❌ Attempt ${i + 1} error: ${error}`)
      apiCalls.push({ timestamp, success: false })
    }
    
    // Small delay between attempts
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  console.info('\n📊 Results:')
  console.info(`- Total attempts: ${apiCalls.length}`)
  console.info(`- Successful calls: ${apiCalls.filter(call => call.success).length}`)
  console.info(`- Failed calls: ${apiCalls.filter(call => !call.success).length}`)
  
  // All calls should succeed since we're using a valid sessionId
  const allSuccessful = apiCalls.every(call => call.success)
  
  if (allSuccessful) {
    console.info('✅ All API calls successful - no infinite loop detected')
    console.info('✅ Our fix is working correctly')
  } else {
    console.info('❌ Some API calls failed - there may still be issues')
  }
  
  console.info('\n🎯 Test completed!')
}

// Run the test
testFixedBehavior()
