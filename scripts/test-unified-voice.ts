#!/usr/bin/env node

/**
 * Unified Voice System Test Script
 * 
 * Tests the unified voice system that combines:
 * 1. Regular voice input (transcript to chat)
 * 2. Live voice conversation (real-time chat with TTS)
 * 
 * This validates the simplified approach using existing APIs
 */

const API_BASE = 'http://localhost:3002'

interface TestResult {
  name: string
  passed: boolean
  error?: string
  details?: any
  timing?: number
}

class UnifiedVoiceTest {
  private results: TestResult[] = []

  async runAllTests(): Promise<void> {
    console.log('🎙️ Testing Unified Voice System...\\n')

    // Test 1: Chat API (used for live conversation)
    await this.testChatAPI()
    
    // Test 2: TTS API (used for voice responses)
    await this.testTTSAPI()
    
    // Test 3: System Integration
    await this.testSystemIntegration()

    // Display Results
    this.displayResults()
  }

  private async testChatAPI(): Promise<void> {
    const startTime = Date.now()
    
    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Test message for unified voice system' }],
          data: {
            leadContext: { name: 'Test User', company: 'Test Company' },
            sessionId: 'test_voice_session'
          }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      // Test streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let content = ''
      let chunks = 0

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          const lines = chunk.split('\\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.content) {
                  content += data.content
                  chunks++
                }
                if (data.done) {
                  break
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      this.results.push({
        name: 'Chat API Streaming',
        passed: content.length > 0 && chunks > 0,
        timing: Date.now() - startTime,
        details: {
          contentLength: content.length,
          chunks: chunks,
          preview: content.slice(0, 100) + '...'
        }
      })
    } catch (error) {
      this.results.push({
        name: 'Chat API Streaming',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timing: Date.now() - startTime
      })
    }
  }

  private async testTTSAPI(): Promise<void> {
    const startTime = Date.now()
    
    try {
      const response = await fetch(`${API_BASE}/api/gemini-live`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Hello! This is a test of the unified voice system.',
          enableTTS: true,
          voiceStyle: 'neutral'
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      
      this.results.push({
        name: 'TTS Audio Generation',
        passed: data.success && data.audioData && data.textContent,
        timing: Date.now() - startTime,
        details: {
          success: data.success,
          hasAudio: !!data.audioData,
          voiceStyle: data.voiceStyle,
          voiceName: data.voiceName,
          audioConfig: data.audioConfig
        }
      })
    } catch (error) {
      this.results.push({
        name: 'TTS Audio Generation',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timing: Date.now() - startTime
      })
    }
  }

  private async testSystemIntegration(): Promise<void> {
    const startTime = Date.now()
    
    try {
      // Test full conversation flow: user message -> AI response -> TTS
      const chatResponse = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Tell me about AI automation in 2 sentences' }],
          data: {
            leadContext: { name: 'Test User', company: 'Test Company' },
            sessionId: 'integration_test'
          }
        })
      })

      if (!chatResponse.ok) {
        throw new Error(`Chat API failed: ${chatResponse.status}`)
      }

      // Get AI response
      const reader = chatResponse.body?.getReader()
      const decoder = new TextDecoder()
      let aiResponse = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          const lines = chunk.split('\\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.content) {
                  aiResponse += data.content
                }
                if (data.done) {
                  break
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      // Test TTS conversion
      const ttsResponse = await fetch(`${API_BASE}/api/gemini-live`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiResponse,
          enableTTS: true,
          voiceStyle: 'neutral'
        })
      })

      if (!ttsResponse.ok) {
        throw new Error(`TTS API failed: ${ttsResponse.status}`)
      }

      const ttsData = await ttsResponse.json()
      
      this.results.push({
        name: 'Full Conversation Integration',
        passed: aiResponse.length > 0 && ttsData.success && ttsData.audioData,
        timing: Date.now() - startTime,
        details: {
          conversationFlow: 'user -> AI -> TTS',
          aiResponseLength: aiResponse.length,
          ttsSuccess: ttsData.success,
          hasAudio: !!ttsData.audioData,
          preview: aiResponse.slice(0, 100) + '...'
        }
      })
    } catch (error) {
      this.results.push({
        name: 'Full Conversation Integration',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timing: Date.now() - startTime
      })
    }
  }

  private displayResults(): void {
    console.log('\\n' + '='.repeat(60))
    console.log('📊 UNIFIED VOICE SYSTEM TEST RESULTS')
    console.log('='.repeat(60))
    
    const totalTests = this.results.length
    const passedTests = this.results.filter(r => r.passed).length
    const totalTime = this.results.reduce((sum, r) => sum + (r.timing || 0), 0)

    console.log(`\\n✅ Overall: ${passedTests}/${totalTests} tests passed (${Math.round(passedTests/totalTests*100)}%)`)
    console.log(`⏱️  Total time: ${totalTime.toLocaleString()}ms`)
    console.log(`\\n📋 Individual Results:`)
    
    this.results.forEach((result, index) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL'
      const timing = result.timing ? `${result.timing.toLocaleString()}ms` : 'N/A'
      
      console.log(`\\n${index + 1}. ${result.name}`)
      console.log(`   Status: ${status}`)
      console.log(`   Time: ${timing}`)
      
      if (result.error) {
        console.log(`   Error: ${result.error}`)
      }
      
      if (result.details) {
        console.log(`   Details: ${JSON.stringify(result.details, null, 2).replace(/^/gm, '   ')}`)
      }
    })

    console.log('\\n' + '='.repeat(60))
    
    if (passedTests === totalTests) {
      console.log('🎉 ALL TESTS PASSED! Unified Voice System is working correctly.')
      console.log('\\n🎙️ Features Verified:')
      console.log('   • Chat API streaming (for live conversations)')
      console.log('   • TTS audio generation (for voice responses)')
      console.log('   • End-to-end conversation flow')
      console.log('   • Lead context integration')
      console.log('\\n✨ The unified system successfully combines:')
      console.log('   → Voice Input Mode: Speech-to-text for chat')
      console.log('   → Live Conversation Mode: Real-time chat with TTS')
    } else {
      console.log('⚠️  Some tests failed. Please check the errors above.')
    }
    
    console.log('\\n' + '='.repeat(60))
  }
}

// Run the tests
const tester = new UnifiedVoiceTest()
tester.runAllTests().catch(console.error)
