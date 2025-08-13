#!/usr/bin/env tsx

/**
 * Comprehensive UI and Functionality Test Script
 * Tests all major features with mocking enabled
 */

const BASE_URL = 'http://localhost:3000'

interface TestResult {
  name: string
  status: 'PASS' | 'FAIL' | 'ERROR'
  message: string
  duration?: number
}

const results: TestResult[] = []

async function runTest(name: string, testFn: () => Promise<any>): Promise<void> {
  const startTime = Date.now()
  try {
    await testFn()
    const duration = Date.now() - startTime
    results.push({ name, status: 'PASS', message: 'Test completed successfully', duration })
    console.info(`✅ ${name} (${duration}ms)`)
  } catch (error) {
    const duration = Date.now() - startTime
    const message = error instanceof Error ? error.message : 'Unknown error'
    results.push({ name, status: 'FAIL', message, duration })
    console.info(`❌ ${name}: ${message}`)
  }
}

async function testMockStatus() {
  const response = await fetch(`${BASE_URL}/api/mock/status`)
  const data = await response.json()
  
  if (!data.mockEnabled) {
    throw new Error('Mocking is not enabled')
  }
  
  if (data.environment !== 'development') {
    throw new Error('Environment is not development')
  }
}

async function testChatAPI() {
  const response = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'Hello, this is a test' }],
      data: {
        leadContext: { name: 'Test User' },
        sessionId: 'test-session',
        userId: 'test-user'
      }
    })
  })
  
  if (!response.ok) {
    throw new Error(`Chat API returned ${response.status}`)
  }
  
  const text = await response.text()
  if (!text.includes('data: {"content":')) {
    throw new Error('Chat API did not return streaming data')
  }
}

async function testGeminiLiveAPI() {
  const response = await fetch(`${BASE_URL}/api/gemini-live`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: 'Test TTS prompt',
      enableAudio: true
    })
  })
  
  if (!response.ok) {
    throw new Error(`Gemini Live API returned ${response.status}`)
  }
  
  const data = await response.json()
  if (!data.success) {
    throw new Error('Gemini Live API did not return success')
  }
}

async function testLeadResearchAPI() {
  const response = await fetch(`${BASE_URL}/api/intelligence/lead-research`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'Test company research'
    })
  })
  
  if (!response.ok) {
    throw new Error(`Lead Research API returned ${response.status}`)
  }
  
  const text = await response.text()
  if (!text.includes('data: {"content":')) {
    throw new Error('Lead Research API did not return streaming data')
  }
}

async function testImageAnalysisAPI() {
  const response = await fetch(`${BASE_URL}/api/analyze-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageData: 'test-image-data',
      imageType: 'webcam'
    })
  })
  
  if (!response.ok) {
    throw new Error(`Image Analysis API returned ${response.status}`)
  }
  
  const data = await response.json()
  if (!data.analysis) {
    throw new Error('Image Analysis API did not return analysis')
  }
}

async function testDocumentAnalysisAPI() {
  const response = await fetch(`${BASE_URL}/api/analyze-document`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: 'test-document-content',
      mimeType: 'text/plain',
      fileName: 'test.txt'
    })
  })
  
  if (!response.ok) {
    throw new Error(`Document Analysis API returned ${response.status}`)
  }
  
  const data = await response.json()
  if (!data.summary) {
    throw new Error('Document Analysis API did not return summary')
  }
}

async function testVideoToAppAPI() {
  const response = await fetch(`${BASE_URL}/api/video-to-app`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      videoUrl: 'test-video-url',
      description: 'Test video description'
    })
  })
  
  if (!response.ok) {
    throw new Error(`Video to App API returned ${response.status}`)
  }
  
  const data = await response.json()
  if (!data.success) {
    throw new Error('Video to App API did not return success')
  }
}

async function testExportSummaryAPI() {
  const response = await fetch(`${BASE_URL}/api/export-summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'test-session',
      leadEmail: 'test@example.com'
    })
  })
  
  if (!response.ok) {
    throw new Error(`Export Summary API returned ${response.status}`)
  }
  
  const data = await response.json()
  if (!data.success) {
    throw new Error('Export Summary API did not return success')
  }
}

async function testEducationalContentAPI() {
  const response = await fetch(`${BASE_URL}/api/educational-content`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: 'AI automation',
      level: 'beginner'
    })
  })
  
  if (!response.ok) {
    throw new Error(`Educational Content API returned ${response.status}`)
  }
  
  const data = await response.json()
  if (!data.content) {
    throw new Error('Educational Content API did not return content')
  }
}

async function testAIStreamAPI() {
  const response = await fetch(`${BASE_URL}/api/ai-stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: 'Test AI stream prompt'
    })
  })
  
  if (!response.ok) {
    throw new Error(`AI Stream API returned ${response.status}`)
  }
  
  const text = await response.text()
  if (!text.includes('data: {"content":')) {
    throw new Error('AI Stream API did not return streaming data')
  }
}

async function testMainPage() {
  const response = await fetch(`${BASE_URL}/`)
  
  if (!response.ok) {
    throw new Error(`Main page returned ${response.status}`)
  }
  
  const text = await response.text()
  if (!text.includes('AI Automation') && !text.includes('Farzad Bayat')) {
    throw new Error('Main page does not contain expected content')
  }
}

async function testChatPage() {
  const response = await fetch(`${BASE_URL}/chat`)
  
  if (!response.ok) {
    throw new Error(`Chat page returned ${response.status}`)
  }
  
  const text = await response.text()
  if (!text.includes('Welcome to F.B/c AI')) {
    throw new Error('Chat page does not contain expected content')
  }
}

async function testMiddlewareRouting() {
  // Test that middleware correctly routes to mock endpoints
  const response = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'test' }]
    })
  })
  
  const mockHeader = response.headers.get('x-middleware-rewrite')
  if (!mockHeader || !mockHeader.includes('/api/mock/chat')) {
    throw new Error('Middleware did not correctly route to mock endpoint')
  }
}

async function main() {
  console.info('🧪 Starting Comprehensive UI and Functionality Tests...\n')
  
  // Test mock system
  await runTest('Mock Status Check', testMockStatus)
  await runTest('Middleware Routing', testMiddlewareRouting)
  
  // Test API endpoints
  await runTest('Chat API', testChatAPI)
  await runTest('Gemini Live API', testGeminiLiveAPI)
  await runTest('Lead Research API', testLeadResearchAPI)
  await runTest('Image Analysis API', testImageAnalysisAPI)
  await runTest('Document Analysis API', testDocumentAnalysisAPI)
  await runTest('Video to App API', testVideoToAppAPI)
  await runTest('Export Summary API', testExportSummaryAPI)
  await runTest('Educational Content API', testEducationalContentAPI)
  await runTest('AI Stream API', testAIStreamAPI)
  
  // Test pages
  await runTest('Main Page', testMainPage)
  await runTest('Chat Page', testChatPage)
  
  // Summary
  console.info('\n📊 Test Results Summary:')
  console.info('=' * 50)
  
  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const total = results.length
  
  console.info(`✅ Passed: ${passed}`)
  console.info(`❌ Failed: ${failed}`)
  console.info(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`)
  
  if (failed > 0) {
    console.info('\n🚨 Failed Tests:')
    results.filter(r => r.status === 'FAIL').forEach(result => {
      console.info(`  • ${result.name}: ${result.message}`)
    })
  }
  
  console.info('\n🎯 Next Steps:')
  if (failed === 0) {
    console.info('  ✅ All tests passed! The system is working correctly.')
  } else {
    console.info('  🔧 Fix the failed tests above before proceeding.')
    console.info('  🧪 Run browser tests to check UI interactions.')
    console.info('  📱 Test mobile responsiveness.')
  }
}

main().catch(console.error)
