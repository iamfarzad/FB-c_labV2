#!/usr/bin/env node

/**
 * Voice System Test Script
 * 
 * Tests all voice-related functionality:
 * 1. Voice Input (STT) - browser-based speech recognition
 * 2. Voice Output (TTS) - Gemini-powered text-to-speech
 * 3. Voice Streaming - real-time audio streaming
 * 4. Voice Integration - full voice conversation loop
 */

import { spawn } from 'child_process'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

const API_BASE = 'http://localhost:3001' // Dev server is running on 3001
const TEST_VOICE_MESSAGE = "Hello! This is a test of the voice system."

interface VoiceTestResult {
  name: string
  passed: boolean
  error?: string
  details?: any
}

class VoiceSystemTester {
  private results: VoiceTestResult[] = []

  async runAllTests(): Promise<void> {
    console.log('🎤 Starting Voice System Tests...\n')

    // Test 1: Gemini Live API - TTS Generation
    await this.testGeminiTTS()
    
    // Test 2: Gemini Live API - Streaming Audio
    await this.testGeminiStreamingAudio()
    
    // Test 3: Voice Components - Modal Structure  
    await this.testVoiceComponents()
    
    // Test 4: Audio Player Hook
    await this.testAudioPlayerHook()
    
    // Test 5: Voice Integration in Chat
    await this.testVoiceIntegration()

    // Display Results
    this.displayResults()
  }

  private async testGeminiTTS(): Promise<void> {
    try {
      console.log('Testing Gemini TTS API...')
      
      const response = await fetch(`${API_BASE}/api/gemini-live`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: TEST_VOICE_MESSAGE,
          enableTTS: true,
          voiceStyle: 'neutral',
          streamAudio: false
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success && data.textContent && data.audioData) {
        this.results.push({
          name: 'Gemini TTS API',
          passed: true,
          details: {
            textGenerated: data.textContent,
            audioDataLength: data.audioData.length,
            voiceStyle: data.voiceStyle,
            audioConfig: data.audioConfig
          }
        })
        console.log('✅ Gemini TTS API working')
      } else {
        throw new Error('Invalid response format or missing audio data')
      }
    } catch (error) {
      this.results.push({
        name: 'Gemini TTS API',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('❌ Gemini TTS API failed:', error)
    }
  }

  private async testGeminiStreamingAudio(): Promise<void> {
    try {
      console.log('Testing Gemini Streaming Audio...')
      
      const response = await fetch(`${API_BASE}/api/gemini-live`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: TEST_VOICE_MESSAGE,
          enableTTS: true,
          voiceStyle: 'neutral',
          streamAudio: true
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let chunks = []
      let textContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.type === 'text') {
                  textContent = data.content
                } else if (data.type === 'audio_chunk') {
                  chunks.push(data)
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      if (textContent && chunks.length > 0) {
        this.results.push({
          name: 'Gemini Streaming Audio',
          passed: true,
          details: {
            textContent,
            audioChunks: chunks.length,
            streamingWorking: true
          }
        })
        console.log('✅ Gemini Streaming Audio working')
      } else {
        throw new Error('No streaming data received')
      }
    } catch (error) {
      this.results.push({
        name: 'Gemini Streaming Audio',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('❌ Gemini Streaming Audio failed:', error)
    }
  }

  private async testVoiceComponents(): Promise<void> {
    try {
      console.log('Testing Voice Components...')
      
      // Check if voice components exist
      const voiceInputExists = await this.checkFileExists('components/chat/modals/VoiceInputModal.tsx')
      const voiceOutputExists = await this.checkFileExists('components/chat/modals/VoiceOutputModal.tsx')
      const audioHookExists = await this.checkFileExists('hooks/useAudioPlayer.ts')
      
      if (voiceInputExists && voiceOutputExists && audioHookExists) {
        // Check imports and basic structure
        const voiceInputContent = await readFile('components/chat/modals/VoiceInputModal.tsx', 'utf-8')
        const voiceOutputContent = await readFile('components/chat/modals/VoiceOutputModal.tsx', 'utf-8')
        const audioHookContent = await readFile('hooks/useAudioPlayer.ts', 'utf-8')
        
        const hasVoiceInputLogic = voiceInputContent.includes('SpeechRecognition') && voiceInputContent.includes('recognition')
        const hasVoiceOutputLogic = voiceOutputContent.includes('useAudioPlayer') && voiceOutputContent.includes('VoiceOrb')
        const hasAudioPlayerLogic = audioHookContent.includes('HTMLAudioElement') && audioHookContent.includes('playAudioData')
        
        if (hasVoiceInputLogic && hasVoiceOutputLogic && hasAudioPlayerLogic) {
          this.results.push({
            name: 'Voice Components',
            passed: true,
            details: {
              voiceInputModal: hasVoiceInputLogic,
              voiceOutputModal: hasVoiceOutputLogic,
              audioPlayerHook: hasAudioPlayerLogic
            }
          })
          console.log('✅ Voice Components properly implemented')
        } else {
          throw new Error('Voice components missing required functionality')
        }
      } else {
        throw new Error('Voice component files not found')
      }
    } catch (error) {
      this.results.push({
        name: 'Voice Components',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('❌ Voice Components failed:', error)
    }
  }

  private async testAudioPlayerHook(): Promise<void> {
    try {
      console.log('Testing Audio Player Hook...')
      
      // Check if audio player hook has all required methods
      const hookContent = await readFile('hooks/useAudioPlayer.ts', 'utf-8')
      
      const hasPlayMethod = hookContent.includes('play: () => Promise<void>')
      const hasPauseMethod = hookContent.includes('pause: () => void')
      const hasStopMethod = hookContent.includes('stop: () => void')
      const hasSeekMethod = hookContent.includes('seek: (time: number) => void')
      const hasVolumeMethod = hookContent.includes('setVolume: (volume: number) => void')
      const hasPlayAudioData = hookContent.includes('playAudioData: (audioData: string) => Promise<void>')
      const hasPlayStreaming = hookContent.includes('playStreamingAudio: (chunks: string[]) => Promise<void>')
      
      const hasAllMethods = hasPlayMethod && hasPauseMethod && hasStopMethod && 
                            hasSeekMethod && hasVolumeMethod && hasPlayAudioData && hasPlayStreaming
      
      if (hasAllMethods) {
        this.results.push({
          name: 'Audio Player Hook',
          passed: true,
          details: {
            playMethod: hasPlayMethod,
            pauseMethod: hasPauseMethod,
            stopMethod: hasStopMethod,
            seekMethod: hasSeekMethod,
            volumeMethod: hasVolumeMethod,
            playAudioDataMethod: hasPlayAudioData,
            playStreamingMethod: hasPlayStreaming
          }
        })
        console.log('✅ Audio Player Hook has all required methods')
      } else {
        throw new Error('Audio Player Hook missing required methods')
      }
    } catch (error) {
      this.results.push({
        name: 'Audio Player Hook',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('❌ Audio Player Hook failed:', error)
    }
  }

  private async testVoiceIntegration(): Promise<void> {
    try {
      console.log('Testing Voice Integration in Chat...')
      
      // Check if chat page has voice integration
      const chatPageContent = await readFile('app/chat/page.tsx', 'utf-8')
      
      const hasVoiceInputModal = chatPageContent.includes('VoiceInputModal')
      const hasVoiceOutputModal = chatPageContent.includes('VoiceOutputModal')
      const hasVoiceHandlers = chatPageContent.includes('handleVoiceTranscript') && 
                              chatPageContent.includes('handleVoiceResponse')
      const hasVoiceState = chatPageContent.includes('showVoiceModal') && 
                           chatPageContent.includes('showVoiceOutputModal')
      
      if (hasVoiceInputModal && hasVoiceOutputModal && hasVoiceHandlers && hasVoiceState) {
        this.results.push({
          name: 'Voice Integration',
          passed: true,
          details: {
            voiceInputModal: hasVoiceInputModal,
            voiceOutputModal: hasVoiceOutputModal,
            voiceHandlers: hasVoiceHandlers,
            voiceState: hasVoiceState
          }
        })
        console.log('✅ Voice Integration properly implemented')
      } else {
        throw new Error('Voice integration missing required components')
      }
    } catch (error) {
      this.results.push({
        name: 'Voice Integration',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('❌ Voice Integration failed:', error)
    }
  }

  private async checkFileExists(filePath: string): Promise<boolean> {
    try {
      await readFile(filePath, 'utf-8')
      return true
    } catch {
      return false
    }
  }

  private displayResults(): void {
    console.log('\n🎤 Voice System Test Results:')
    console.log('=' .repeat(50))
    
    const passed = this.results.filter(r => r.passed).length
    const total = this.results.length
    
    this.results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL'
      console.log(`${status} ${result.name}`)
      
      if (result.error) {
        console.log(`   Error: ${result.error}`)
      }
      
      if (result.details) {
        console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`)
      }
    })
    
    console.log('=' .repeat(50))
    console.log(`📊 Summary: ${passed}/${total} tests passed`)
    
    if (passed === total) {
      console.log('🎉 All voice system tests passed!')
    } else {
      console.log('⚠️  Some tests failed. Please review and fix the issues.')
    }
  }
}

// Run the tests
const tester = new VoiceSystemTester()
tester.runAllTests().catch(console.error)
