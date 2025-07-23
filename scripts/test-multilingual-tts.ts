#!/usr/bin/env tsx

/**
 * Multilingual TTS Test
 * Tests language support with different languages and voices
 */

class MultilingualTTSTester {
  private baseUrl = 'http://localhost:3000'

  async testLanguageWithVoice(languageCode: string, text: string, voiceName: string) {
    console.log(`🌍 Testing ${languageCode} with ${voiceName} voice...`)
    
    const response = await fetch(`${this.baseUrl}/api/gemini-live`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: text,
        enableTTS: true,
        voiceName: voiceName,
        multiSpeakerMode: false,
        languageCode: languageCode
      })
    })

    if (!response.ok) {
      throw new Error(`${languageCode} TTS failed: ${response.status}`)
    }

    const data = await response.json()
    const audioData = data.audioData || data
    
    return {
      language: languageCode,
      voice: voiceName,
      success: true,
      audioDataLength: audioData.length,
      text: text
    }
  }

  async runMultilingualTests() {
    console.log('🌍 Starting Multilingual TTS Tests...\n')
    
    const testCases = [
      { code: 'en-US', text: 'Hello! This is English.', voice: 'Puck' },
      { code: 'es-US', text: '¡Hola! Esto es español.', voice: 'Kore' },
      { code: 'fr-FR', text: 'Bonjour! Ceci est français.', voice: 'Zephyr' },
      { code: 'de-DE', text: 'Hallo! Das ist Deutsch.', voice: 'Fenrir' },
      { code: 'it-IT', text: 'Ciao! Questo è italiano.', voice: 'Puck' },
      { code: 'pt-BR', text: 'Olá! Isto é português.', voice: 'Kore' },
      { code: 'ja-JP', text: 'こんにちは！これは日本語です。', voice: 'Zephyr' },
      { code: 'ko-KR', text: '안녕하세요! 이것은 한국어입니다.', voice: 'Fenrir' },
      { code: 'zh-CN', text: '你好！这是中文。', voice: 'Puck' },
      { code: 'ru-RU', text: 'Привет! Это русский язык.', voice: 'Kore' }
    ]

    const results = []

    for (const testCase of testCases) {
      try {
        const result = await this.testLanguageWithVoice(
          testCase.code, 
          testCase.text, 
          testCase.voice
        )
        results.push(result)
        console.log(`✅ ${testCase.code} with ${testCase.voice}: ${result.audioDataLength} bytes`)
      } catch (error: any) {
        console.log(`❌ ${testCase.code} failed: ${error.message}`)
        results.push({
          language: testCase.code,
          voice: testCase.voice,
          success: false,
          error: error.message,
          text: testCase.text
        })
      }
    }

    return results
  }

  async testLanguageDetection() {
    console.log('\n🔍 Testing Language Auto-Detection...')
    
    // Test with different languages without specifying languageCode
    const testCases = [
      { text: 'Hello! This is English.', expected: 'en-US' },
      { text: '¡Hola! Esto es español.', expected: 'es-US' },
      { text: 'Bonjour! Ceci est français.', expected: 'fr-FR' },
      { text: 'Hallo! Das ist Deutsch.', expected: 'de-DE' }
    ]

    const results = []

    for (const testCase of testCases) {
      try {
        const response = await fetch(`${this.baseUrl}/api/gemini-live`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: testCase.text,
            enableTTS: true,
            voiceName: 'Puck',
            multiSpeakerMode: false
            // No languageCode - should auto-detect
          })
        })

        if (response.ok) {
          const data = await response.json()
          const audioData = data.audioData || data
          results.push({
            text: testCase.text,
            expectedLanguage: testCase.expected,
            success: true,
            audioDataLength: audioData.length,
            autoDetected: true
          })
          console.log(`✅ Auto-detected ${testCase.expected}: ${audioData.length} bytes`)
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      } catch (error: any) {
        console.log(`❌ Auto-detection failed for ${testCase.expected}: ${error.message}`)
        results.push({
          text: testCase.text,
          expectedLanguage: testCase.expected,
          success: false,
          error: error.message
        })
      }
    }

    return results
  }

  printResults(multilingualResults: any[], autoDetectionResults: any[]) {
    console.log('\n🌍 Multilingual TTS Test Results:')
    console.log('==================================================')
    
    // Multilingual Results
    const successfulLanguages = multilingualResults.filter(r => r.success)
    const failedLanguages = multilingualResults.filter(r => !r.success)
    
    console.log(`✅ PASS Multilingual Support (${successfulLanguages.length}/${multilingualResults.length})`)
    successfulLanguages.forEach(result => {
      console.log(`   ${result.language} (${result.voice}): ${result.audioDataLength} bytes`)
    })
    
    if (failedLanguages.length > 0) {
      console.log(`❌ FAIL Languages:`)
      failedLanguages.forEach(result => {
        console.log(`   ${result.language}: ${result.error}`)
      })
    }

    // Auto-Detection Results
    const successfulAutoDetection = autoDetectionResults.filter(r => r.success)
    const failedAutoDetection = autoDetectionResults.filter(r => !r.success)
    
    console.log(`\n🔍 Auto-Detection Results (${successfulAutoDetection.length}/${autoDetectionResults.length})`)
    successfulAutoDetection.forEach(result => {
      console.log(`   ${result.expectedLanguage}: ${result.audioDataLength} bytes`)
    })
    
    if (failedAutoDetection.length > 0) {
      console.log(`❌ Auto-Detection Failures:`)
      failedAutoDetection.forEach(result => {
        console.log(`   ${result.expectedLanguage}: ${result.error}`)
      })
    }

    console.log('==================================================')
    
    const totalTests = multilingualResults.length + autoDetectionResults.length
    const passedTests = successfulLanguages.length + successfulAutoDetection.length
    
    console.log(`📊 Summary: ${passedTests}/${totalTests} language tests passed`)
    
    if (passedTests === totalTests) {
      console.log('🎉 All multilingual features working correctly!')
    } else {
      console.log('⚠️  Some language features need attention.')
    }
  }
}

// Run the tests
async function main() {
  const tester = new MultilingualTTSTester()
  
  const multilingualResults = await tester.runMultilingualTests()
  const autoDetectionResults = await tester.testLanguageDetection()
  
  tester.printResults(multilingualResults, autoDetectionResults)
}

main().catch(console.error)

export { MultilingualTTSTester } 