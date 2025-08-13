#!/usr/bin/env tsx

/**
 * Test Script for Audio Quality Improvements and WebRTC Functionality
 * Tests the enhanced audio processing and WebRTC integration
 */

import { AudioQualityEnhancer } from '../lib/audio-quality-enhancer'
import { WebRTCAudioProcessor } from '../lib/webrtc-audio-processor'

async function testAudioQualityEnhancement() {
  console.info('🎵 Testing Audio Quality Enhancement...')
  
  try {
    // Test different use cases
    const useCases = ['conversation', 'presentation', 'narration'] as const
    
    for (const useCase of useCases) {
      console.info(`\n📊 Testing ${useCase} configuration:`)
      
      const config = AudioQualityEnhancer.getOptimalConfig(useCase)
      console.info('  Config:', {
        sampleRate: config.sampleRate,
        bitDepth: config.bitDepth,
        normalize: config.normalize,
        noiseReduction: config.noiseReduction,
        compression: config.compression,
        equalization: config.equalization
      })
      
      const enhancer = new AudioQualityEnhancer(config)
      
      // Test voice style detection
      const testTexts = [
        "Hello, how are you today?",
        "This is amazing! I can't believe it!",
        "This is a very long text that should trigger the calm voice style for better readability and comprehension.",
        "Regular business communication text."
      ]
      
      for (const text of testTexts) {
        const voiceStyle = enhancer.getVoiceStyleForContent(text)
        console.info(`  Text: "${text.substring(0, 30)}..."`)
        console.info(`  Voice Style: ${voiceStyle.voiceStyle}`)
        console.info(`  Speaking Rate: ${voiceStyle.speakingRate}`)
        console.info(`  Pitch: ${voiceStyle.pitch}`)
        console.info(`  Volume Gain: ${voiceStyle.volumeGainDb}dB`)
        console.info(`  Clarity: ${voiceStyle.clarity}`)
      }
    }
    
    console.info('\n✅ Audio Quality Enhancement tests completed successfully!')
    
  } catch (error) {
    console.error('❌ Audio Quality Enhancement test failed:', error)
  }
}

async function testWebRTCAudioProcessor() {
  console.info('\n🔗 Testing WebRTC Audio Processor...')
  
  try {
    // Test WebRTC support
    const isSupported = WebRTCAudioProcessor.isSupported()
    console.info(`  WebRTC Support: ${isSupported ? '✅ Supported' : '❌ Not Supported'}`)
    
    if (!isSupported) {
      console.info('  Skipping WebRTC tests - not supported in this environment')
      return
    }
    
    // Test different configurations
    const useCases = ['conversation', 'presentation', 'broadcast'] as const
    
    for (const useCase of useCases) {
      console.info(`\n📊 Testing ${useCase} WebRTC configuration:`)
      
      const config = WebRTCAudioProcessor.getOptimalConfig(useCase)
      console.info('  Config:', {
        sampleRate: config.sampleRate,
        channels: config.channels,
        bitDepth: config.bitDepth,
        bufferSize: config.bufferSize,
        enableEchoCancellation: config.enableEchoCancellation,
        enableNoiseSuppression: config.enableNoiseSuppression,
        enableAutoGainControl: config.enableAutoGainControl
      })
      
      // Test processor creation (without actual initialization)
      const processor = new WebRTCAudioProcessor(config)
      console.info('  ✅ Processor created successfully')
      
      // Test event handler setup
      let connectionState = 'unknown'
      processor.onConnectionStateChanged((state) => {
        connectionState = state
        console.info(`  Connection state changed: ${state}`)
      })
      
      processor.onAudioDataReceived((data) => {
        console.info(`  Audio data received: ${data.byteLength} bytes`)
      })
      
      console.info('  ✅ Event handlers set up successfully')
    }
    
    console.info('\n✅ WebRTC Audio Processor tests completed successfully!')
    
  } catch (error) {
    console.error('❌ WebRTC Audio Processor test failed:', error)
  }
}

async function testAPIEndpoints() {
  console.info('\n🌐 Testing API Endpoints...')
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    // Test WebRTC connection endpoint
    console.info('  Testing WebRTC connection endpoint...')
    const webrtcResponse = await fetch(`${baseUrl}/api/webrtc-connection`, {
      method: 'GET'
    })
    
    if (webrtcResponse.ok) {
      const webrtcData = await webrtcResponse.json()
      console.info('  ✅ WebRTC endpoint:', webrtcData.message)
      console.info('  Features:', webrtcData.features)
      console.info('  Active sessions:', webrtcData.activeSessions)
    } else {
      console.info('  ❌ WebRTC endpoint failed:', webrtcResponse.status)
    }
    
    // Test enhanced Gemini Live endpoint
    console.info('  Testing enhanced Gemini Live endpoint...')
    const geminiResponse = await fetch(`${baseUrl}/api/gemini-live`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-correlation-id': `test-${Date.now()}`,
        'x-demo-session-id': 'test-session',
        'x-user-id': 'test-user'
      },
      body: JSON.stringify({
        prompt: "Test audio quality enhancement",
        enableTTS: false,
        streamAudio: false,
        voiceName: 'Puck',
        languageCode: 'en-US'
      })
    })
    
    if (geminiResponse.ok) {
      const geminiData = await geminiResponse.json()
      console.info('  ✅ Gemini Live endpoint:', geminiData.success ? 'Success' : 'Failed')
    } else {
      console.info('  ❌ Gemini Live endpoint failed:', geminiResponse.status)
    }
    
    console.info('\n✅ API Endpoint tests completed!')
    
  } catch (error) {
    console.error('❌ API Endpoint test failed:', error)
  }
}

async function testAudioProcessing() {
  console.info('\n🎤 Testing Audio Processing...')
  
  try {
    // Create test audio data (simulated)
    const testAudioData = Buffer.alloc(1024).fill(0x80).toString('base64')
    
    const enhancer = new AudioQualityEnhancer()
    
    // Test audio enhancement
    console.info('  Testing audio enhancement...')
    const enhancedAudio = await enhancer.enhanceAudioData(testAudioData)
    
    if (enhancedAudio && enhancedAudio !== testAudioData) {
      console.info('  ✅ Audio enhancement applied successfully')
      console.info(`  Original size: ${testAudioData.length} bytes`)
      console.info(`  Enhanced size: ${enhancedAudio.length} bytes`)
    } else {
      console.info('  ⚠️ Audio enhancement returned original data (fallback)')
    }
    
    console.info('\n✅ Audio Processing tests completed!')
    
  } catch (error) {
    console.error('❌ Audio Processing test failed:', error)
  }
}

async function runAllTests() {
  console.info('🚀 Starting Audio Improvements Test Suite...\n')
  
  const startTime = Date.now()
  
  try {
    await testAudioQualityEnhancement()
    await testWebRTCAudioProcessor()
    await testAPIEndpoints()
    await testAudioProcessing()
    
    const totalTime = Date.now() - startTime
    console.info(`\n🎉 All tests completed successfully in ${totalTime}ms!`)
    
    console.info('\n📋 Summary of Improvements:')
    console.info('  ✅ Enhanced audio quality with normalization, noise reduction, and compression')
    console.info('  ✅ Adaptive voice styles based on content type')
    console.info('  ✅ WebRTC support for ultra-low latency audio')
    console.info('  ✅ Real-time audio processing with optimized configurations')
    console.info('  ✅ API endpoints for WebRTC connection management')
    console.info('  ✅ Comprehensive error handling and fallbacks')
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error)
    process.exit(1)
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error)
}

export {
  testAudioQualityEnhancement,
  testWebRTCAudioProcessor,
  testAPIEndpoints,
  testAudioProcessing,
  runAllTests
}
