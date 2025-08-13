#!/usr/bin/env tsx

/**
 * Test script to detect infinite loops by monitoring API calls
 * This simulates the behavior without using React hooks
 */

async function testInfiniteLoopDetection() {
  console.info('🧪 Testing Infinite Loop Detection\n')

  // Set up test session
  const testSessionId = `test-session-${Date.now()}`
  
  console.info('📋 Test 1: Monitoring API calls for infinite loops')
  
  const apiCalls: Array<{ timestamp: number; sessionId: string }> = []
  
  // Simulate the problematic behavior
  let callCount = 0
  const maxCalls = 10 // Safety limit
  
  async function simulateFetchContext(sessionId: string) {
    callCount++
    const timestamp = Date.now()
    
    console.info(`📡 API Call ${callCount}: ${sessionId} at ${new Date(timestamp).toLocaleTimeString()}`)
    apiCalls.push({ timestamp, sessionId })
    
    try {
      const response = await fetch(`http://localhost:3000/api/intelligence/context?sessionId=${sessionId}`)
      if (response.ok) {
        console.info(`✅ Call ${callCount} successful`)
      } else {
        console.info(`❌ Call ${callCount} failed: ${response.status}`)
      }
    } catch (error) {
      console.info(`❌ Call ${callCount} error: ${error}`)
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
  console.info('🚀 Starting API call simulation...')
  await simulateFetchContext(testSessionId)
  
  console.info('\n📊 Results:')
  console.info(`- Total API calls: ${apiCalls.length}`)
  console.info(`- Expected calls: 1 (if no infinite loop)`)
  console.info(`- Actual calls: ${apiCalls.length}`)
  
  if (apiCalls.length > 3) {
    console.info('🚨 INFINITE LOOP DETECTED! Too many API calls.')
    console.info('   This indicates the useEffect is running repeatedly.')
  } else {
    console.info('✅ No infinite loop detected. API calls are reasonable.')
  }
  
  // Analyze call frequency
  if (apiCalls.length > 1) {
    const timeSpan = apiCalls[apiCalls.length - 1].timestamp - apiCalls[0].timestamp
    const callsPerSecond = (apiCalls.length / timeSpan) * 1000
    console.info(`- Time span: ${timeSpan}ms`)
    console.info(`- Calls per second: ${callsPerSecond.toFixed(2)}`)
    
    if (callsPerSecond > 5) {
      console.info('🚨 HIGH FREQUENCY DETECTED! Calls are happening too fast.')
    }
  }
  
  console.info('\n🎯 Test completed!')
}

// Run the test
testInfiniteLoopDetection()
