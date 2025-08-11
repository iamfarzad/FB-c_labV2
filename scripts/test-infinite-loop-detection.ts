#!/usr/bin/env tsx

/**
 * Test script to detect infinite loops by monitoring API calls
 * This simulates the behavior without using React hooks
 */

async function testInfiniteLoopDetection() {
  console.log('🧪 Testing Infinite Loop Detection\n')

  // Set up test session
  const testSessionId = `test-session-${Date.now()}`
  
  console.log('📋 Test 1: Monitoring API calls for infinite loops')
  
  const apiCalls: Array<{ timestamp: number; sessionId: string }> = []
  
  // Simulate the problematic behavior
  let callCount = 0
  const maxCalls = 10 // Safety limit
  
  async function simulateFetchContext(sessionId: string) {
    callCount++
    const timestamp = Date.now()
    
    console.log(`📡 API Call ${callCount}: ${sessionId} at ${new Date(timestamp).toLocaleTimeString()}`)
    apiCalls.push({ timestamp, sessionId })
    
    try {
      const response = await fetch(`http://localhost:3000/api/intelligence/context?sessionId=${sessionId}`)
      if (response.ok) {
        console.log(`✅ Call ${callCount} successful`)
      } else {
        console.log(`❌ Call ${callCount} failed: ${response.status}`)
      }
    } catch (error) {
      console.log(`❌ Call ${callCount} error: ${error}`)
    }
    
    // Simulate the problematic useEffect behavior
    // This would normally trigger another call in React
    if (callCount < maxCalls) {
      // Simulate a small delay like React would have
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // This simulates the infinite loop - calling again immediately
      // In the real React component, this would happen due to useEffect dependencies
      await simulateFetchContext(sessionId)
    }
  }
  
  // Start the simulation
  console.log('🚀 Starting API call simulation...')
  await simulateFetchContext(testSessionId)
  
  console.log('\n📊 Results:')
  console.log(`- Total API calls: ${apiCalls.length}`)
  console.log(`- Expected calls: 1 (if no infinite loop)`)
  console.log(`- Actual calls: ${apiCalls.length}`)
  
  if (apiCalls.length > 3) {
    console.log('🚨 INFINITE LOOP DETECTED! Too many API calls.')
    console.log('   This indicates the useEffect is running repeatedly.')
  } else {
    console.log('✅ No infinite loop detected. API calls are reasonable.')
  }
  
  // Analyze call frequency
  if (apiCalls.length > 1) {
    const timeSpan = apiCalls[apiCalls.length - 1].timestamp - apiCalls[0].timestamp
    const callsPerSecond = (apiCalls.length / timeSpan) * 1000
    console.log(`- Time span: ${timeSpan}ms`)
    console.log(`- Calls per second: ${callsPerSecond.toFixed(2)}`)
    
    if (callsPerSecond > 5) {
      console.log('🚨 HIGH FREQUENCY DETECTED! Calls are happening too fast.')
    }
  }
  
  console.log('\n🎯 Test completed!')
}

// Run the test
testInfiniteLoopDetection()
