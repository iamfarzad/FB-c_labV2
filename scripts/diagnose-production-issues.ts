#!/usr/bin/env tsx

/**
 * Production Issues Diagnostic Script
 * Tests all AI functions that work locally but fail in production
 */

interface DiagnosticResult {
  endpoint: string
  status: 'success' | 'error' | 'timeout'
  error?: string
  responseTime?: number
  details?: any
}

class ProductionDiagnostic {
  private baseUrl: string
  private results: DiagnosticResult[] = []

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.VERCEL_URL || 'https://your-app.vercel.app'
  }

  async diagnoseAll(): Promise<DiagnosticResult[]> {
    console.log(`🔍 Diagnosing production issues for: ${this.baseUrl}`)
    console.log('=' .repeat(60))

    // Test each failing AI function
    await this.testGeminiLive()
    await this.testWebcamAnalysis()
    await this.testScreenShareAnalysis()
    await this.testVideoToApp()
    await this.testEnvironmentVariables()
    await this.testAPIRouting()

    this.printSummary()
    return this.results
  }

  private async testGeminiLive() {
    console.log('\n🎤 Testing Gemini Live (Voice/TTS)...')
    
    try {
      const response = await fetch(`${this.baseUrl}/api/gemini-live`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-correlation-id': 'diagnostic-test'
        },
        body: JSON.stringify({
          prompt: 'Say hello for diagnostic test',
          enableTTS: true,
          voiceName: 'Puck'
        })
      })

      const result = await this.handleResponse('gemini-live', response)
      
      if (result.status === 'success') {
        console.log('  ✅ Gemini Live API responding')
      } else {
        console.log(`  ❌ Gemini Live failed: ${result.error}`)
      }
    } catch (error) {
      this.results.push({
        endpoint: 'gemini-live',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log(`  ❌ Gemini Live network error: ${error}`)
    }
  }

  private async testWebcamAnalysis() {
    console.log('\n📷 Testing Webcam Image Analysis...')
    
    // Create a simple test image (1x1 pixel base64)
    const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    
    try {
      const response = await fetch(`${this.baseUrl}/api/analyze-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: testImage,
          type: 'webcam'
        })
      })

      const result = await this.handleResponse('analyze-image', response)
      
      if (result.status === 'success') {
        console.log('  ✅ Image Analysis API responding')
      } else {
        console.log(`  ❌ Image Analysis failed: ${result.error}`)
      }
    } catch (error) {
      this.results.push({
        endpoint: 'analyze-image',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log(`  ❌ Image Analysis network error: ${error}`)
    }
  }

  private async testScreenShareAnalysis() {
    console.log('\n🖥️ Testing Screen Share Analysis...')
    
    // Same test image for screen share
    const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    
    try {
      const response = await fetch(`${this.baseUrl}/api/analyze-screenshot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: testImage
        })
      })

      const result = await this.handleResponse('analyze-screenshot', response)
      
      if (result.status === 'success') {
        console.log('  ✅ Screenshot Analysis API responding')
      } else {
        console.log(`  ❌ Screenshot Analysis failed: ${result.error}`)
      }
    } catch (error) {
      this.results.push({
        endpoint: 'analyze-screenshot',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log(`  ❌ Screenshot Analysis network error: ${error}`)
    }
  }

  private async testVideoToApp() {
    console.log('\n🎥 Testing Video-to-App Generator...')
    
    try {
      const response = await fetch(`${this.baseUrl}/api/video-to-app`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Rick Roll for testing
          requirements: 'Create a simple test app'
        })
      })

      const result = await this.handleResponse('video-to-app', response)
      
      if (result.status === 'success') {
        console.log('  ✅ Video-to-App API responding')
      } else {
        console.log(`  ❌ Video-to-App failed: ${result.error}`)
      }
    } catch (error) {
      this.results.push({
        endpoint: 'video-to-app',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log(`  ❌ Video-to-App network error: ${error}`)
    }
  }

  private async testEnvironmentVariables() {
    console.log('\n🔐 Testing Environment Variables...')
    
    try {
      // Test a simple endpoint that should reveal env var issues
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Test environment variables' }]
        })
      })

      const result = await this.handleResponse('environment-test', response)
      
      if (result.status === 'success') {
        console.log('  ✅ Environment variables appear to be configured')
      } else {
        console.log(`  ❌ Environment issues detected: ${result.error}`)
        
        // Check for specific error patterns
        if (result.error?.includes('GEMINI_API_KEY')) {
          console.log('  🚨 GEMINI_API_KEY is missing or invalid in production')
        }
        if (result.error?.includes('Service configuration error')) {
          console.log('  🚨 Service configuration error - check Vercel environment variables')
        }
      }
    } catch (error) {
      this.results.push({
        endpoint: 'environment-test',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log(`  ❌ Environment test network error: ${error}`)
    }
  }

  private async testAPIRouting() {
    console.log('\n🛣️ Testing API Routing...')
    
    try {
      // Test if mock endpoints are accidentally being used in production
      const response = await fetch(`${this.baseUrl}/api/mock/status`, {
        method: 'GET'
      })

      if (response.ok) {
        const data = await response.json()
        console.log('  ⚠️ Mock endpoints are accessible in production')
        console.log(`  📊 Mock status: ${JSON.stringify(data, null, 2)}`)
        
        this.results.push({
          endpoint: 'mock-routing',
          status: 'error',
          error: 'Mock endpoints should not be accessible in production'
        })
      } else {
        console.log('  ✅ Mock endpoints properly blocked in production')
      }
    } catch (error) {
      console.log('  ✅ Mock endpoints not accessible (expected in production)')
    }
  }

  private async handleResponse(endpoint: string, response: Response): Promise<DiagnosticResult> {
    const startTime = Date.now()
    
    try {
      const responseTime = Date.now() - startTime
      
      if (!response.ok) {
        const errorText = await response.text()
        const result: DiagnosticResult = {
          endpoint,
          status: 'error',
          error: `HTTP ${response.status}: ${errorText}`,
          responseTime
        }
        this.results.push(result)
        return result
      }

      const data = await response.json()
      const result: DiagnosticResult = {
        endpoint,
        status: 'success',
        responseTime,
        details: data
      }
      this.results.push(result)
      return result
      
    } catch (error) {
      const result: DiagnosticResult = {
        endpoint,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown parsing error',
        responseTime: Date.now() - startTime
      }
      this.results.push(result)
      return result
    }
  }

  private printSummary() {
    console.log('\n' + '='.repeat(60))
    console.log('📊 DIAGNOSTIC SUMMARY')
    console.log('='.repeat(60))

    const successful = this.results.filter(r => r.status === 'success')
    const failed = this.results.filter(r => r.status === 'error')

    console.log(`✅ Successful: ${successful.length}`)
    console.log(`❌ Failed: ${failed.length}`)

    if (failed.length > 0) {
      console.log('\n🚨 FAILED ENDPOINTS:')
      failed.forEach(result => {
        console.log(`  • ${result.endpoint}: ${result.error}`)
      })

      console.log('\n💡 RECOMMENDED FIXES:')
      
      // Check for common issues
      const hasEnvErrors = failed.some(r => r.error?.includes('GEMINI_API_KEY') || r.error?.includes('configuration'))
      const hasTimeouts = failed.some(r => r.status === 'timeout')
      const hasMockIssues = failed.some(r => r.endpoint === 'mock-routing')

      if (hasEnvErrors) {
        console.log('  1. ✅ Check Vercel environment variables:')
        console.log('     - Go to Vercel Dashboard → Project → Settings → Environment Variables')
        console.log('     - Ensure GEMINI_API_KEY is set for Production, Preview, and Development')
        console.log('     - Redeploy after adding environment variables')
      }

      if (hasTimeouts) {
        console.log('  2. ✅ Check Vercel function timeouts:')
        console.log('     - Review vercel.json function configuration')
        console.log('     - Consider increasing maxDuration for complex operations')
      }

      if (hasMockIssues) {
        console.log('  3. ✅ Fix API routing:')
        console.log('     - Ensure mock endpoints are properly blocked in production')
        console.log('     - Check middleware.ts configuration')
      }

      console.log('\n  4. ✅ General troubleshooting:')
      console.log('     - Check Vercel function logs for detailed error messages')
      console.log('     - Verify all imports and dependencies are properly bundled')
      console.log('     - Test with curl commands to isolate frontend vs backend issues')
    }

    console.log('\n🔗 Useful Commands:')
    console.log(`  vercel logs --app=your-app-name`)
    console.log(`  vercel env ls`)
    console.log(`  curl -X POST ${this.baseUrl}/api/chat -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"test"}]}'`)
  }
}

// CLI execution
async function main() {
  const baseUrl = process.argv[2] || process.env.VERCEL_URL

  if (!baseUrl) {
    console.error('❌ Please provide the production URL:')
    console.error('   pnpm tsx scripts/diagnose-production-issues.ts https://your-app.vercel.app')
    console.error('   or set VERCEL_URL environment variable')
    process.exit(1)
  }

  const diagnostic = new ProductionDiagnostic(baseUrl)
  const results = await diagnostic.diagnoseAll()

  // Exit with error code if any tests failed
  const hasFailures = results.some(r => r.status === 'error')
  process.exit(hasFailures ? 1 : 0)
}

if (require.main === module) {
  main().catch(console.error)
}

export { ProductionDiagnostic }