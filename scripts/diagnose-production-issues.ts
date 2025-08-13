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
    console.info(`🔍 Diagnosing production issues for: ${this.baseUrl}`)
    console.info('=' .repeat(60))

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
    console.info('\n🎤 Testing Gemini Live (Voice/TTS)...')
    
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
        console.info('  ✅ Gemini Live API responding')
      } else {
        console.info(`  ❌ Gemini Live failed: ${result.error}`)
      }
    } catch (error) {
      this.results.push({
        endpoint: 'gemini-live',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.info(`  ❌ Gemini Live network error: ${error}`)
    }
  }

  private async testWebcamAnalysis() {
    console.info('\n📷 Testing Webcam Image Analysis...')
    
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
        console.info('  ✅ Image Analysis API responding')
      } else {
        console.info(`  ❌ Image Analysis failed: ${result.error}`)
      }
    } catch (error) {
      this.results.push({
        endpoint: 'analyze-image',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.info(`  ❌ Image Analysis network error: ${error}`)
    }
  }

  private async testScreenShareAnalysis() {
    console.info('\n🖥️ Testing Screen Share Analysis...')
    
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
        console.info('  ✅ Screenshot Analysis API responding')
      } else {
        console.info(`  ❌ Screenshot Analysis failed: ${result.error}`)
      }
    } catch (error) {
      this.results.push({
        endpoint: 'analyze-screenshot',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.info(`  ❌ Screenshot Analysis network error: ${error}`)
    }
  }

  private async testVideoToApp() {
    console.info('\n🎥 Testing Video-to-App Generator...')
    
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
        console.info('  ✅ Video-to-App API responding')
      } else {
        console.info(`  ❌ Video-to-App failed: ${result.error}`)
      }
    } catch (error) {
      this.results.push({
        endpoint: 'video-to-app',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.info(`  ❌ Video-to-App network error: ${error}`)
    }
  }

  private async testEnvironmentVariables() {
    console.info('\n🔐 Testing Environment Variables...')
    
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
        console.info('  ✅ Environment variables appear to be configured')
      } else {
        console.info(`  ❌ Environment issues detected: ${result.error}`)
        
        // Check for specific error patterns
        if (result.error?.includes('GEMINI_API_KEY')) {
          console.info('  🚨 GEMINI_API_KEY is missing or invalid in production')
        }
        if (result.error?.includes('Service configuration error')) {
          console.info('  🚨 Service configuration error - check Vercel environment variables')
        }
      }
    } catch (error) {
      this.results.push({
        endpoint: 'environment-test',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.info(`  ❌ Environment test network error: ${error}`)
    }
  }

  private async testAPIRouting() {
    console.info('\n🛣️ Testing API Routing...')
    
    try {
      // Test if mock endpoints are accidentally being used in production
      const response = await fetch(`${this.baseUrl}/api/mock/status`, {
        method: 'GET'
      })

      if (response.ok) {
        const data = await response.json()
        console.info('  ⚠️ Mock endpoints are accessible in production')
        console.info(`  📊 Mock status: ${JSON.stringify(data, null, 2)}`)
        
        this.results.push({
          endpoint: 'mock-routing',
          status: 'error',
          error: 'Mock endpoints should not be accessible in production'
        })
      } else {
        console.info('  ✅ Mock endpoints properly blocked in production')
      }
    } catch (error) {
      console.info('  ✅ Mock endpoints not accessible (expected in production)')
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
    console.info('\n' + '='.repeat(60))
    console.info('📊 DIAGNOSTIC SUMMARY')
    console.info('='.repeat(60))

    const successful = this.results.filter(r => r.status === 'success')
    const failed = this.results.filter(r => r.status === 'error')

    console.info(`✅ Successful: ${successful.length}`)
    console.info(`❌ Failed: ${failed.length}`)

    if (failed.length > 0) {
      console.info('\n🚨 FAILED ENDPOINTS:')
      failed.forEach(result => {
        console.info(`  • ${result.endpoint}: ${result.error}`)
      })

      console.info('\n💡 RECOMMENDED FIXES:')
      
      // Check for common issues
      const hasEnvErrors = failed.some(r => r.error?.includes('GEMINI_API_KEY') || r.error?.includes('configuration'))
      const hasTimeouts = failed.some(r => r.status === 'timeout')
      const hasMockIssues = failed.some(r => r.endpoint === 'mock-routing')

      if (hasEnvErrors) {
        console.info('  1. ✅ Check Vercel environment variables:')
        console.info('     - Go to Vercel Dashboard → Project → Settings → Environment Variables')
        console.info('     - Ensure GEMINI_API_KEY is set for Production, Preview, and Development')
        console.info('     - Redeploy after adding environment variables')
      }

      if (hasTimeouts) {
        console.info('  2. ✅ Check Vercel function timeouts:')
        console.info('     - Review vercel.json function configuration')
        console.info('     - Consider increasing maxDuration for complex operations')
      }

      if (hasMockIssues) {
        console.info('  3. ✅ Fix API routing:')
        console.info('     - Ensure mock endpoints are properly blocked in production')
        console.info('     - Check middleware.ts configuration')
      }

      console.info('\n  4. ✅ General troubleshooting:')
      console.info('     - Check Vercel function logs for detailed error messages')
      console.info('     - Verify all imports and dependencies are properly bundled')
      console.info('     - Test with curl commands to isolate frontend vs backend issues')
    }

    console.info('\n🔗 Useful Commands:')
    console.info(`  vercel logs --app=your-app-name`)
    console.info(`  vercel env ls`)
    console.info(`  curl -X POST ${this.baseUrl}/api/chat -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"test"}]}'`)
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