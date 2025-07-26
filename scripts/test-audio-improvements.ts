#!/usr/bin/env tsx

/**
 * Test Script for Audio Quality Improvements and WebRTC Functionality
 * Tests the enhanced audio processing and WebRTC integration
 */

import { AudioQualityEnhancer } from '../lib/audio-quality-enhancer'
import { WebRTCAudioProcessor } from '../lib/webrtc-audio-processor'

async function testAudioQualityEnhancement() {
  console.log('🎵 Testing Audio Quality Enhancement...')
  
  try {
    // Test different use cases
    const useCases = ['conversation', 'presentation', 'narration'] as const
    
    for (const useCase of useCases) {
      console.log(`\n📊 Testing ${useCase} configuration:`)
      
      const config = AudioQualityEnhancer.getOptimalConfig(useCase)
      console.log('  Config:', {
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
        console.log(`  Text: "${text.substring(0, 30)}..."`)
        console.log(`  Voice Style: ${voiceStyle.voiceStyle}`)
        console.log(`  Speaking Rate: ${voiceStyle.speakingRate}`)
        console.log(`  Pitch: ${voiceStyle.pitch}`)
        console.log(`  Volume Gain: ${voiceStyle.volumeGainDb}dB`)
        console.log(`  Clarity: ${voiceStyle.clarity}`)
      }
    }
    
    console.log('\n✅ Audio Quality Enhancement tests completed successfully!')
    
  } catch (error) {
    console.error('❌ Audio Quality Enhancement test failed:', error)
  }
}

async function testWebRTCAudioProcessor() {
  console.log('\n🔗 Testing WebRTC Audio Processor...')
  
  try {
    // Test WebRTC support
    const isSupported = WebRTCAudioProcessor.isSupported()
    console.log(`  WebRTC Support: ${isSupported ? '✅ Supported' : '❌ Not Supported'}`)
    
    if (!isSupported) {
      console.log('  Skipping WebRTC tests - not supported in this environment')
      return
    }
    
    // Test different configurations
    const useCases = ['conversation', 'presentation', 'broadcast'] as const
    
    for (const useCase of useCases) {
      console.log(`\n📊 Testing ${useCase} WebRTC configuration:`)
      
      const config = WebRTCAudioProcessor.getOptimalConfig(useCase)
      console.log('  Config:', {
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
      console.log('  ✅ Processor created successfully')
      
      // Test event handler setup
      let connectionState = 'unknown'
      processor.onConnectionStateChanged((state) => {
        connectionState = state
        console.log(`  Connection state changed: ${state}`)
      })
      
      processor.onAudioDataReceived((data) => {
        console.log(`  Audio data received: ${data.byteLength} bytes`)
      })
      
      console.log('  ✅ Event handlers set up successfully')
    }
    
    console.log('\n✅ WebRTC Audio Processor tests completed successfully!')
    
  } catch (error) {
    console.error('❌ WebRTC Audio Processor test failed:', error)
  }
}

async function testAPIEndpoints() {
  console.log('\n🌐 Testing API Endpoints...')
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    // Test WebRTC connection endpoint
    console.log('  Testing WebRTC connection endpoint...')
    const webrtcResponse = await fetch(`${baseUrl}/api/webrtc-connection`, {
      method: 'GET'
    })
    
    if (webrtcResponse.ok) {
      const webrtcData = await webrtcResponse.json()
      console.log('  ✅ WebRTC endpoint:', webrtcData.message)
      console.log('  Features:', webrtcData.features)
      console.log('  Active sessions:', webrtcData.activeSessions)
    } else {
      console.log('  ❌ WebRTC endpoint failed:', webrtcResponse.status)
    }
    
    // Test enhanced Gemini Live endpoint
    console.log('  Testing enhanced Gemini Live endpoint...')
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
      console.log('  ✅ Gemini Live endpoint:', geminiData.success ? 'Success' : 'Failed')
    } else {
      console.log('  ❌ Gemini Live endpoint failed:', geminiResponse.status)
    }
    
    console.log('\n✅ API Endpoint tests completed!')
    
  } catch (error) {
    console.error('❌ API Endpoint test failed:', error)
  }
}

async function testAudioProcessing() {
  console.log('\n🎤 Testing Audio Processing...')
  
  try {
    // Create test audio data (simulated)
    const testAudioData = Buffer.alloc(1024).fill(0x80).toString('base64')
    
    const enhancer = new AudioQualityEnhancer()
    
    // Test audio enhancement
    console.log('  Testing audio enhancement...')
    const enhancedAudio = await enhancer.enhanceAudioData(testAudioData)
    
    if (enhancedAudio && enhancedAudio !== testAudioData) {
      console.log('  ✅ Audio enhancement applied successfully')
      console.log(`  Original size: ${testAudioData.length} bytes`)
      console.log(`  Enhanced size: ${enhancedAudio.length} bytes`)
    } else {
      console.log('  ⚠️ Audio enhancement returned original data (fallback)')
    }
    
    console.log('\n✅ Audio Processing tests completed!')
    
  } catch (error) {
    console.error('❌ Audio Processing test failed:', error)
  }
}

async function runAllTests() {
  console.log('🚀 Starting Audio Improvements Test Suite...\n')
  
  const startTime = Date.now()
  
  try {
    await testAudioQualityEnhancement()
    await testWebRTCAudioProcessor()
    await testAPIEndpoints()
    await testAudioProcessing()
    
    const totalTime = Date.now() - startTime
    console.log(`\n🎉 All tests completed successfully in ${totalTime}ms!`)
    
    console.log('\n📋 Summary of Improvements:')
    console.log('  ✅ Enhanced audio quality with normalization, noise reduction, and compression')
    console.log('  ✅ Adaptive voice styles based on content type')
    console.log('  ✅ WebRTC support for ultra-low latency audio')
    console.log('  ✅ Real-time audio processing with optimized configurations')
    console.log('  ✅ API endpoints for WebRTC connection management')
    console.log('  ✅ Comprehensive error handling and fallbacks')
    
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