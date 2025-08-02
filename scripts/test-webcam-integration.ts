#!/usr/bin/env tsx

/**
 * Test Webcam Integration
 * Verifies that the webcam component works with real-time AI analysis
 */

interface TestResult {
  test: string
  success: boolean
  error?: string
  details?: any
}

class WebcamIntegrationTester {
  private results: TestResult[] = []

  async runAllTests(): Promise<void> {
    console.log('📹 Testing Webcam Integration')
    console.log('==============================')

    await this.testWebcamComponent()
    await this.testVideoAnalysisAPI()
    await this.testRealTimeAnalysis()
    await this.testAutoAnalysis()
    await this.testErrorHandling()

    this.printResults()
  }

  private async testWebcamComponent(): Promise<void> {
    try {
      console.log('📹 Testing Webcam Component...')
      
      // Test component import
      const { WebcamCapture } = await import('../components/chat/tools/WebcamCapture/WebcamCapture')
      
      this.results.push({
        test: 'Webcam Component',
        success: true,
        details: 'Component import successful'
      })

      console.log('✅ Webcam Component working')
    } catch (error) {
      this.results.push({
        test: 'Webcam Component',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('❌ Webcam Component failed:', error)
    }
  }

  private async testVideoAnalysisAPI(): Promise<void> {
    try {
      console.log('🎥 Testing Video Analysis API...')
      
      // Test video analysis endpoint
      const response = await fetch('http://localhost:3000/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
          type: 'video_frame'
        })
      })

      if (!response.ok) {
        throw new Error(`Video analysis failed: ${response.status}`)
      }

      const data = await response.json()
      
      this.results.push({
        test: 'Video Analysis API',
        success: true,
        details: data
      })

      console.log('✅ Video Analysis API working')
    } catch (error) {
      this.results.push({
        test: 'Video Analysis API',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('❌ Video Analysis API failed:', error)
    }
  }

  private async testRealTimeAnalysis(): Promise<void> {
    try {
      console.log('🔄 Testing Real-time Analysis...')
      
      // Test real-time video analysis session
      const response = await fetch('http://localhost:3000/api/gemini-live-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start',
          sessionId: 'test-webcam-session',
          enableAudio: false,
          analysisMode: 'video'
        })
      })

      if (!response.ok) {
        throw new Error(`Real-time analysis failed: ${response.status}`)
      }

      const data = await response.json()
      
      this.results.push({
        test: 'Real-time Analysis',
        success: true,
        details: data
      })

      console.log('✅ Real-time analysis working')
    } catch (error) {
      this.results.push({
        test: 'Real-time Analysis',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('❌ Real-time analysis failed:', error)
    }
  }

  private async testAutoAnalysis(): Promise<void> {
    try {
      console.log('🤖 Testing Auto Analysis...')
      
      // Test sending a video frame for analysis
      const response = await fetch('http://localhost:3000/api/gemini-live-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
          sessionId: 'test-webcam-session',
          type: 'video_frame',
          analysisMode: 'video'
        })
      })

      if (!response.ok) {
        throw new Error(`Auto analysis failed: ${response.status}`)
      }

      const data = await response.json()
      
      this.results.push({
        test: 'Auto Analysis',
        success: true,
        details: data
      })

      console.log('✅ Auto analysis working')
    } catch (error) {
      this.results.push({
        test: 'Auto Analysis',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('❌ Auto analysis failed:', error)
    }
  }

  private async testErrorHandling(): Promise<void> {
    try {
      console.log('⚠️ Testing Error Handling...')
      
      // Test with invalid image data
      const response = await fetch('http://localhost:3000/api/gemini-live-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: 'invalid-data',
          sessionId: 'test-webcam-session',
          type: 'video_frame'
        })
      })

      // Should handle gracefully even with invalid data
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
    console.log('\n📋 WEBCAM TEST RESULTS')
    console.log('======================')
    
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
      console.log('🎉 Webcam Integration is working perfectly!')
    } else {
      console.log('⚠️ Some webcam tests failed. Check the errors above.')
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new WebcamIntegrationTester()
  tester.runAllTests().catch(console.error)
} 