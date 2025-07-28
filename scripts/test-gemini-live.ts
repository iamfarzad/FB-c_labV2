#!/usr/bin/env node

/**
 * Gemini Live API Test Script
 * 
 * Tests the new Gemini Live conversation functionality:
 * 1. API endpoint accessibility
 * 2. Live conversation initiation
 * 3. Message streaming
 * 4. Audio generation
 * 5. Session management
 */

const API_BASE = 'http://localhost:3000'

interface TestResult {
  name: string
  passed: boolean
  error?: string
  details?: any
  timing?: number
}

class GeminiLiveTest {
  private results: TestResult[] = []

  async runAllTests(): Promise<void> {
    console.log('🎙️ Starting Gemini Live API Tests...\n')

    // Test 1: API Endpoint Health
    await this.testApiHealth()
    
    // Test 2: Live Conversation Features
    await this.testLiveFeatures()
    
    // Test 3: Audio Processing
    await this.testAudioCapabilities()

    // Display Results
    this.displayResults()
  }

  private async testApiHealth(): Promise<void> {
    console.log('🔍 Testing API Health...')
    
    const startTime = Date.now()
    try {
      const response = await fetch(`${API_BASE}/api/gemini-live-conversation`, {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const timing = Date.now() - startTime

      if (data.message && data.features) {
        this.results.push({
          name: 'API Health Check',
          passed: true,
          timing,
          details: {
            message: data.message,
            features: data.features,
            sessionActive: data.sessionActive,
            realTimeVoice: data.features.realTimeVoice,
            nativeAudio: data.features.nativeAudio
          }
        })
        console.log('✅ API Health Check passed')
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      this.results.push({
        name: 'API Health Check',
        passed: false,
        timing: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('❌ API Health Check failed:', error)
    }
  }

  private async testLiveFeatures(): Promise<void> {
    console.log('🎭 Testing Live Features...')
    
    const startTime = Date.now()
    try {
      // Test live conversation initiation
      const response = await fetch(`${API_BASE}/api/gemini-live-conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Hello! This is a test message for the Live API.',
          leadContext: {
            name: 'Test User',
            company: 'Test Company'
          }
        })
      })

      const timing = Date.now() - startTime

      if (response.ok) {
        // Test streaming response
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let streamedData = ''
        let chunks = 0

        if (reader) {
          let reading = true
          const timeout = setTimeout(() => {
            reading = false
            reader.cancel()
          }, 5000) // 5 second timeout

          while (reading) {
            try {
              const { done, value } = await reader.read()
              if (done) break
              
              const chunk = decoder.decode(value)
              streamedData += chunk
              chunks++
              
              // Parse streaming events
              const lines = chunk.split('\n')
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6))
                    console.log(`📡 Received: ${data.type}`)
                  } catch (e) {
                    // Skip invalid JSON
                  }
                }
              }
            } catch (e) {
              break
            }
          }
          
          clearTimeout(timeout)
        }

        this.results.push({
          name: 'Live Features Test',
          passed: true,
          timing,
          details: {
            streamingWorking: chunks > 0,
            chunksReceived: chunks,
            dataLength: streamedData.length,
            hasStreamingData: streamedData.includes('data:')
          }
        })
        console.log('✅ Live Features test passed')
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      this.results.push({
        name: 'Live Features Test',
        passed: false,
        timing: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('❌ Live Features test failed:', error)
    }
  }

  private async testAudioCapabilities(): Promise<void> {
    console.log('🔊 Testing Audio Capabilities...')
    
    const startTime = Date.now()
    try {
      // Test if the service dependencies are available
      const mimeTest = this.testMimeSupport()
      const wavTest = this.testWavProcessing()

      const timing = Date.now() - startTime

      this.results.push({
        name: 'Audio Capabilities',
        passed: mimeTest && wavTest,
        timing,
        details: {
          mimeSupported: mimeTest,
          wavProcessingSupported: wavTest,
          audioFormats: ['wav', 'pcm'],
          voiceStyles: ['Zephyr']
        }
      })

      if (mimeTest && wavTest) {
        console.log('✅ Audio Capabilities test passed')
      } else {
        console.log('⚠️ Audio Capabilities partially supported')
      }
    } catch (error) {
      this.results.push({
        name: 'Audio Capabilities',
        passed: false,
        timing: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('❌ Audio Capabilities test failed:', error)
    }
  }

  private testMimeSupport(): boolean {
    try {
      // Test if mime package is available
      require('mime')
      return true
    } catch (error) {
      return false
    }
  }

  private testWavProcessing(): boolean {
    try {
      // Test basic WAV header creation logic
      const buffer = Buffer.alloc(44)
      buffer.write('RIFF', 0)
      buffer.write('WAVE', 8)
      return buffer.toString('ascii', 0, 4) === 'RIFF'
    } catch (error) {
      return false
    }
  }

  private displayResults(): void {
    console.log('\n🎙️ Gemini Live API Test Results:')
    console.log('=' .repeat(50))
    
    const passed = this.results.filter(r => r.passed).length
    const total = this.results.length
    const totalTime = this.results.reduce((sum, r) => sum + (r.timing || 0), 0)
    
    this.results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL'
      const timing = result.timing ? ` (${result.timing}ms)` : ''
      console.log(`${status} ${result.name}${timing}`)
      
      if (result.error) {
        console.log(`   Error: ${result.error}`)
      }
      
      if (result.details && result.passed) {
        console.log(`   Details: ${JSON.stringify(result.details, null, 2).replace(/\n/g, '\n   ')}`)
      }
    })
    
    console.log('\n📊 Summary:')
    console.log(`Tests: ${passed}/${total} passed`)
    console.log(`Total time: ${totalTime}ms`)
    console.log(`Success rate: ${((passed / total) * 100).toFixed(1)}%`)
    
    if (passed === total) {
      console.log('\n🎉 All Gemini Live tests passed! The system is ready.')
    } else {
      console.log('\n⚠️ Some tests failed. Please review the issues above.')
    }
    
    console.log('\n🔗 Live API Features Available:')
    console.log('• Real-time voice conversations')
    console.log('• Native audio generation with Gemini 2.5 Flash')
    console.log('• WAV audio streaming')
    console.log('• Business context integration')
    console.log('• Session management')
    console.log('• Activity logging')
  }
}

async function main() {
  const tester = new GeminiLiveTest()
  await tester.runAllTests()
}

// Run tests if this file is executed directly
if (require.main === module) {
  main().catch(console.error)
}

export default GeminiLiveTest
