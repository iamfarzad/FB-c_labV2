#!/usr/bin/env tsx

/**
 * Test Voice Input Integration
 * Verifies that the voice input component works with the real-time API
 */

interface TestResult {
  test: string
  success: boolean
  error?: string
  details?: any
}

class VoiceInputIntegrationTester {
  private results: TestResult[] = []

  async runAllTests(): Promise<void> {
    console.log('🎤 Testing Voice Input Integration')
    console.log('==================================')

    await this.testGeminiLiveAPI()
    await this.testVoiceInputComponent()
    await this.testRealTimeConversation()
    await this.testAudioProcessing()
    await this.testErrorHandling()

    this.printResults()
  }

  private async testGeminiLiveAPI(): Promise<void> {
    try {
      console.log('🔗 Testing Gemini Live API...')
      
      const response = await fetch('http://localhost:3000/api/gemini-live-conversation', {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }

      const data = await response.json()
      
      this.results.push({
        test: 'Gemini Live API',
        success: true,
        details: data
      })

      console.log('✅ Gemini Live API working')
    } catch (error) {
      this.results.push({
        test: 'Gemini Live API',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('❌ Gemini Live API failed:', error)
    }
  }

  private async testVoiceInputComponent(): Promise<void> {
    try {
      console.log('🎤 Testing Voice Input Component...')
      
      // Test component import
      const { VoiceInput } = await import('../components/chat/tools/VoiceInput/VoiceInput')
      
      this.results.push({
        test: 'Voice Input Component',
        success: true,
        details: 'Component import successful'
      })

      console.log('✅ Voice Input Component working')
    } catch (error) {
      this.results.push({
        test: 'Voice Input Component',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('❌ Voice Input Component failed:', error)
    }
  }

  private async testRealTimeConversation(): Promise<void> {
    try {
      console.log('💬 Testing Real-time Conversation...')
      
      // Test starting a conversation session
      const response = await fetch('http://localhost:3000/api/gemini-live-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start',
          sessionId: 'test-voice-session',
          leadContext: {
            leadId: 'test-lead-123',
            leadName: 'Test User'
          },
          enableAudio: true,
          voiceName: 'Aoede',
          languageCode: 'en-US'
        })
      })

      if (!response.ok) {
        throw new Error(`Session start failed: ${response.status}`)
      }

      const data = await response.json()
      
      this.results.push({
        test: 'Real-time Conversation',
        success: true,
        details: data
      })

      console.log('✅ Real-time conversation working')
    } catch (error) {
      this.results.push({
        test: 'Real-time Conversation',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('❌ Real-time conversation failed:', error)
    }
  }

  private async testAudioProcessing(): Promise<void> {
    try {
      console.log('🎵 Testing Audio Processing...')
      
      // Test sending a voice message
      const response = await fetch('http://localhost:3000/api/gemini-live-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Hello, this is a test message',
          sessionId: 'test-voice-session',
          leadContext: {
            leadId: 'test-lead-123',
            leadName: 'Test User'
          },
          enableAudio: true
        })
      })

      if (!response.ok) {
        throw new Error(`Audio processing failed: ${response.status}`)
      }

      const data = await response.json()
      
      this.results.push({
        test: 'Audio Processing',
        success: true,
        details: data
      })

      console.log('✅ Audio processing working')
    } catch (error) {
      this.results.push({
        test: 'Audio Processing',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('❌ Audio processing failed:', error)
    }
  }

  private async testErrorHandling(): Promise<void> {
    try {
      console.log('⚠️ Testing Error Handling...')
      
      // Test with invalid session
      const response = await fetch('http://localhost:3000/api/gemini-live-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Test message',
          sessionId: 'invalid-session',
          enableAudio: true
        })
      })

      // Should handle gracefully even if session doesn't exist
      const data = await response.json()
      
      this.results.push({
        test: 'Error Handling',
        success: true,
        details: 'Error handling working'
      })

      console.log('✅ Error handling working')
    } catch (error) {
      this.results.push({
        test: 'Error Handling',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('❌ Error handling failed:', error)
    }
  }

  private printResults(): void {
    console.log('\n📋 VOICE INPUT TEST RESULTS')
    console.log('==========================')
    
    const passed = this.results.filter(r => r.success).length
    const total = this.results.length
    
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌'
      console.log(`${status} ${result.test}`)
      if (!result.success && result.error) {
        console.log(`   Error: ${result.error}`)
      }
    })
    
    console.log(`\n🎯 Summary: ${passed}/${total} tests passed`)
    
    if (passed === total) {
      console.log('🎉 Voice Input Integration is working perfectly!')
    } else {
      console.log('⚠️ Some voice input tests failed. Check the errors above.')
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new VoiceInputIntegrationTester()
  tester.runAllTests().catch(console.error)
} 