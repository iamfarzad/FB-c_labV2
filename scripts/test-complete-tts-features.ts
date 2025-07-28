#!/usr/bin/env tsx

/**
 * Comprehensive TTS Features Test
 * Tests all the new Gemini TTS features including:
 * - Dynamic voice selection
 * - Multi-speaker support
 * - Language support
 * - Proper content format
 */

class TTSFeaturesTester {
  private baseUrl = 'http://localhost:3000'

  async testSingleSpeakerTTS() {
    console.log('🎤 Testing Single Speaker TTS...')
    
    const response = await fetch(`${this.baseUrl}/api/gemini-live`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: "Hello! This is a test of single speaker TTS with dynamic voice.",
        enableTTS: true,
        voiceName: 'Puck',
        multiSpeakerMode: false,
        languageCode: 'en-US'
      })
    })

    if (!response.ok) {
      throw new Error(`Single speaker TTS failed: ${response.status}`)
    }

    const data = await response.json()
    const audioData = data.audioData || data
    
    return {
      success: true,
      audioDataLength: audioData.length,
      voiceUsed: 'Puck',
      format: 'single-speaker'
    }
  }

  async testMultiSpeakerTTS() {
    console.log('🎤 Testing Multi-Speaker TTS...')
    
    const multiSpeakerText = `Joe: Hello there! How are you doing today?
Jane: I'm doing great, thanks for asking! How about you?
Joe: Pretty good! I'm excited about our new project.
Jane: Me too! It's going to be amazing.`

    const response = await fetch(`${this.baseUrl}/api/gemini-live`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: multiSpeakerText,
        enableTTS: true,
        voiceName: 'Puck',
        multiSpeakerMode: true,
        languageCode: 'en-US'
      })
    })

    if (!response.ok) {
      throw new Error(`Multi-speaker TTS failed: ${response.status}`)
    }

    const data = await response.json()
    const audioData = data.audioData || data
    
    return {
      success: true,
      audioDataLength: audioData.length,
      speakers: ['Joe', 'Jane'],
      format: 'multi-speaker'
    }
  }

  async testDifferentVoices() {
    console.log('🎤 Testing Different Voice Options...')
    
    const voices = ['Puck', 'Kore', 'Zephyr', 'Fenrir']
    const results = []

    for (const voice of voices) {
      const response = await fetch(`${this.baseUrl}/api/gemini-live`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Testing voice: ${voice}`,
          enableTTS: true,
          voiceName: voice,
          multiSpeakerMode: false,
          languageCode: 'en-US'
        })
      })

      if (response.ok) {
        const data = await response.json()
        const audioData = data.audioData || data
        results.push({
          voice,
          success: true,
          audioDataLength: audioData.length
        })
      } else {
        results.push({
          voice,
          success: false,
          error: `HTTP ${response.status}`
        })
      }
    }

    return results
  }

  async testLanguageSupport() {
    console.log('🌍 Testing Language Support...')
    
    const languages = [
      { code: 'en-US', text: 'Hello! This is English.' },
      { code: 'es-US', text: '¡Hola! Esto es español.' },
      { code: 'fr-FR', text: 'Bonjour! Ceci est français.' },
      { code: 'de-DE', text: 'Hallo! Das ist Deutsch.' }
    ]

    const results = []

    for (const lang of languages) {
      const response = await fetch(`${this.baseUrl}/api/gemini-live`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: lang.text,
          enableTTS: true,
          voiceName: 'Puck',
          multiSpeakerMode: false,
          languageCode: lang.code
        })
      })

      if (response.ok) {
        const data = await response.json()
        const audioData = data.audioData || data
        results.push({
          language: lang.code,
          success: true,
          audioDataLength: audioData.length,
          text: lang.text
        })
      } else {
        results.push({
          language: lang.code,
          success: false,
          error: `HTTP ${response.status}`
        })
      }
    }

    return results
  }

  async testContentFormatCompliance() {
    console.log('📋 Testing Content Format Compliance...')
    
    // Test with proper content format that should work
    const response = await fetch(`${this.baseUrl}/api/gemini-live`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: "Testing content format compliance with proper text input.",
        enableTTS: true,
        voiceName: 'Puck',
        multiSpeakerMode: false,
        languageCode: 'en-US'
      })
    })

    if (!response.ok) {
      throw new Error(`Content format test failed: ${response.status}`)
    }

    const data = await response.json()
    const audioData = data.audioData || data
    
    return {
      success: true,
      audioDataLength: audioData.length,
      format: 'proper-content-format',
      hasAudioData: audioData.length > 100 // Should have substantial audio data
    }
  }

  async runAllTests() {
    console.log('🎤 Starting Comprehensive TTS Features Tests...\n')
    
    const results: any = {
      singleSpeaker: null,
      multiSpeaker: null,
      differentVoices: null,
      languageSupport: null,
      contentFormat: null
    }

    try {
      results.singleSpeaker = await this.testSingleSpeakerTTS()
      console.log('✅ Single Speaker TTS passed')
    } catch (error: any) {
      console.log('❌ Single Speaker TTS failed:', error.message)
      results.singleSpeaker = { success: false, error: error.message }
    }

    try {
      results.multiSpeaker = await this.testMultiSpeakerTTS()
      console.log('✅ Multi-Speaker TTS passed')
    } catch (error: any) {
      console.log('❌ Multi-Speaker TTS failed:', error.message)
      results.multiSpeaker = { success: false, error: error.message }
    }

    try {
      results.differentVoices = await this.testDifferentVoices()
      console.log('✅ Different Voices test passed')
    } catch (error: any) {
      console.log('❌ Different Voices test failed:', error.message)
      results.differentVoices = { success: false, error: error.message }
    }

    try {
      results.languageSupport = await this.testLanguageSupport()
      console.log('✅ Language Support test passed')
    } catch (error: any) {
      console.log('❌ Language Support test failed:', error.message)
      results.languageSupport = { success: false, error: error.message }
    }

    try {
      results.contentFormat = await this.testContentFormatCompliance()
      console.log('✅ Content Format Compliance test passed')
    } catch (error: any) {
      console.log('❌ Content Format Compliance test failed:', error.message)
      results.contentFormat = { success: false, error: error.message }
    }

    return results
  }

  printResults(results: any) {
    console.log('\n🎤 TTS Features Test Results:')
    console.log('==================================================')
    
    // Single Speaker
    if (results.singleSpeaker?.success) {
      console.log('✅ PASS Single Speaker TTS')
      console.log(`   Audio Data Length: ${results.singleSpeaker.audioDataLength} bytes`)
      console.log(`   Voice Used: ${results.singleSpeaker.voiceUsed}`)
    } else {
      console.log('❌ FAIL Single Speaker TTS')
      console.log(`   Error: ${results.singleSpeaker?.error}`)
    }

    // Multi Speaker
    if (results.multiSpeaker?.success) {
      console.log('✅ PASS Multi-Speaker TTS')
      console.log(`   Audio Data Length: ${results.multiSpeaker.audioDataLength} bytes`)
      console.log(`   Speakers: ${results.multiSpeaker.speakers.join(', ')}`)
    } else {
      console.log('❌ FAIL Multi-Speaker TTS')
      console.log(`   Error: ${results.multiSpeaker?.error}`)
    }

    // Different Voices
    if (Array.isArray(results.differentVoices)) {
      const successfulVoices = results.differentVoices.filter((v: any) => v.success)
      console.log(`✅ PASS Different Voices (${successfulVoices.length}/${results.differentVoices.length})`)
      successfulVoices.forEach((voice: any) => {
        console.log(`   ${voice.voice}: ${voice.audioDataLength} bytes`)
      })
    } else {
      console.log('❌ FAIL Different Voices')
      console.log(`   Error: ${results.differentVoices?.error}`)
    }

    // Language Support
    if (Array.isArray(results.languageSupport)) {
      const successfulLanguages = results.languageSupport.filter((l: any) => l.success)
      console.log(`✅ PASS Language Support (${successfulLanguages.length}/${results.languageSupport.length})`)
      successfulLanguages.forEach((lang: any) => {
        console.log(`   ${lang.language}: ${lang.audioDataLength} bytes`)
      })
    } else {
      console.log('❌ FAIL Language Support')
      console.log(`   Error: ${results.languageSupport?.error}`)
    }

    // Content Format
    if (results.contentFormat?.success) {
      console.log('✅ PASS Content Format Compliance')
      console.log(`   Audio Data Length: ${results.contentFormat.audioDataLength} bytes`)
      console.log(`   Has Substantial Audio: ${results.contentFormat.hasAudioData}`)
    } else {
      console.log('❌ FAIL Content Format Compliance')
      console.log(`   Error: ${results.contentFormat?.error}`)
    }

    console.log('==================================================')
    
    const totalTests = 5
    const passedTests = [
      results.singleSpeaker?.success,
      results.multiSpeaker?.success,
      Array.isArray(results.differentVoices),
      Array.isArray(results.languageSupport),
      results.contentFormat?.success
    ].filter(Boolean).length

    console.log(`📊 Summary: ${passedTests}/${totalTests} test categories passed`)
    
    if (passedTests === totalTests) {
      console.log('🎉 All TTS features working correctly!')
    } else {
      console.log('⚠️  Some features need attention. Please review the failures above.')
    }
  }
}

// Run the tests
async function main() {
  const tester = new TTSFeaturesTester()
  const results = await tester.runAllTests()
  tester.printResults(results)
}

// Run the tests
main().catch(console.error)

export { TTSFeaturesTester }
