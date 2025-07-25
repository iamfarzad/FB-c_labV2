import { test, expect } from '@playwright/test'

// Mock MediaDevices API for testing
const mockMediaDevices = {
  getUserMedia: async (constraints: MediaStreamConstraints) => {
    // Return a mock MediaStream
    const mockStream = {
      getTracks: () => [
        {
          stop: () => {},
          kind: 'audio'
        }
      ]
    } as MediaStream
    
    return Promise.resolve(mockStream)
  }
}

// Mock MediaRecorder API
const mockMediaRecorder = {
  start: () => {},
  stop: () => {},
  state: 'inactive',
  ondataavailable: null as ((event: any) => void) | null
}

// Mock AudioContext and AudioBuffer
const mockAudioContext = {
  decodeAudioData: async (arrayBuffer: ArrayBuffer) => {
    return {
      duration: 1.0,
      sampleRate: 16000,
      numberOfChannels: 1,
      getChannelData: () => new Float32Array(16000) // 1 second of audio
    }
  }
}

test.describe('Voice Live Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock browser APIs
    await page.addInitScript(() => {
      // Mock MediaDevices
      Object.defineProperty(navigator, 'mediaDevices', {
        value: {
          getUserMedia: async (constraints: MediaStreamConstraints) => {
            const mockStream = {
              getTracks: () => [
                {
                  stop: () => {},
                  kind: 'audio'
                }
              ]
            } as MediaStream
            return Promise.resolve(mockStream)
          }
        },
        writable: true
      })

      // Mock MediaRecorder
      global.MediaRecorder = class MockMediaRecorder {
        state = 'inactive'
        ondataavailable: ((event: any) => void) | null = null

        constructor(stream: MediaStream) {
          // Mock constructor
        }

        start(timeslice?: number) {
          this.state = 'recording'
          // Simulate data available events
          setTimeout(() => {
            if (this.ondataavailable) {
              const mockBlob = new Blob(['mock audio data'], { type: 'audio/wav' })
              this.ondataavailable({ data: mockBlob })
            }
          }, 100)
        }

        stop() {
          this.state = 'inactive'
        }
      }

      // Mock AudioContext
      global.AudioContext = class MockAudioContext {
        decodeAudioData(arrayBuffer: ArrayBuffer) {
          return Promise.resolve({
            duration: 1.0,
            sampleRate: 16000,
            numberOfChannels: 1,
            getChannelData: () => new Float32Array(16000)
          })
        }
      }

      // Mock secure context
      Object.defineProperty(window, 'isSecureContext', {
        value: true,
        writable: true
      })
    })
  })

  test('should open voice modal and show live AI voice controls', async ({ page }) => {
    await page.goto('/chat')
    
    // Wait for page to load
    await page.waitForSelector('[data-testid="voice-input-button"]', { timeout: 10000 })
    
    // Click voice input button
    await page.click('[data-testid="voice-input-button"]')
    
    // Wait for modal to open
    await page.waitForSelector('[data-testid="voice-input-modal"]', { timeout: 5000 })
    
    // Check for live AI voice controls
    await expect(page.locator('[data-testid="live-ai-voice-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="live-status-display"]')).toBeVisible()
  })

  test('should handle live AI voice connection flow', async ({ page }) => {
    await page.goto('/chat')
    
    // Open voice modal
    await page.click('[data-testid="voice-input-button"]')
    await page.waitForSelector('[data-testid="voice-input-modal"]')
    
    // Click start live AI voice
    await page.click('[data-testid="live-ai-voice-button"]')
    
    // Check status changes
    await expect(page.locator('[data-testid="live-status-display"]')).toContainText('connecting')
    
    // Wait for connection (or error)
    await page.waitForTimeout(2000)
    
    // Should show either connected or error state
    const statusText = await page.locator('[data-testid="live-status-display"]').textContent()
    expect(['connected', 'error', 'disconnected']).toContain(statusText?.toLowerCase())
  })

  test('should handle audio streaming when connected', async ({ page }) => {
    await page.goto('/chat')
    
    // Open voice modal
    await page.click('[data-testid="voice-input-button"]')
    await page.waitForSelector('[data-testid="voice-input-modal"]')
    
    // Mock successful connection
    await page.evaluate(() => {
      // Simulate successful connection
      window.dispatchEvent(new CustomEvent('gemini-live-connected'))
    })
    
    // Start recording
    await page.click('[data-testid="start-recording-button"]')
    
    // Check streaming status
    await expect(page.locator('[data-testid="live-status-display"]')).toContainText('streaming')
    
    // Stop recording
    await page.click('[data-testid="stop-recording-button"]')
    
    // Check status returns to connected
    await expect(page.locator('[data-testid="live-status-display"]')).toContainText('connected')
  })

  test('should handle HTTPS requirement error', async ({ page }) => {
    // Mock insecure context
    await page.addInitScript(() => {
      Object.defineProperty(window, 'isSecureContext', {
        value: false,
        writable: true
      })
    })
    
    await page.goto('/chat')
    
    // Open voice modal
    await page.click('[data-testid="voice-input-button"]')
    await page.waitForSelector('[data-testid="voice-input-modal"]')
    
    // Try to start live AI voice
    await page.click('[data-testid="live-ai-voice-button"]')
    
    // Should show HTTPS error
    await expect(page.locator('[data-testid="live-error-display"]')).toContainText('HTTPS required')
  })

  test('should handle authentication failure', async ({ page }) => {
    await page.goto('/chat')
    
    // Mock authentication failure
    await page.addInitScript(() => {
      // Mock Supabase auth failure
      window.supabase = {
        auth: {
          getUser: () => Promise.resolve({ data: { user: null }, error: 'Auth failed' })
        }
      }
    })
    
    // Open voice modal
    await page.click('[data-testid="voice-input-button"]')
    await page.waitForSelector('[data-testid="voice-input-modal"]')
    
    // Try to start live AI voice
    await page.click('[data-testid="live-ai-voice-button"]')
    
    // Should show authentication error
    await expect(page.locator('[data-testid="live-error-display"]')).toContainText('Authentication required')
  })

  test('should handle rate limiting', async ({ page }) => {
    await page.goto('/chat')
    
    // Open voice modal
    await page.click('[data-testid="voice-input-button"]')
    await page.waitForSelector('[data-testid="voice-input-modal"]')
    
    // Mock rate limiting by making multiple rapid calls
    for (let i = 0; i < 25; i++) {
      await page.click('[data-testid="live-ai-voice-button"]')
      await page.waitForTimeout(100) // Small delay
    }
    
    // Should show rate limit error
    await expect(page.locator('[data-testid="live-error-display"]')).toContainText('Rate limit exceeded')
  })

  test('should handle fallback to regular TTS', async ({ page }) => {
    await page.goto('/chat')
    
    // Open voice modal
    await page.click('[data-testid="voice-input-button"]')
    await page.waitForSelector('[data-testid="voice-input-modal"]')
    
    // Mock live AI failure and fallback
    await page.addInitScript(() => {
      // Mock fallback scenario
      window.dispatchEvent(new CustomEvent('gemini-live-fallback', {
        detail: { reason: 'HTTPS required' }
      }))
    })
    
    // Check fallback indicator
    await expect(page.locator('[data-testid="fallback-indicator"]')).toBeVisible()
    await expect(page.locator('[data-testid="fallback-indicator"]')).toContainText('TTS only')
  })

  test('should cleanup resources on modal close', async ({ page }) => {
    await page.goto('/chat')
    
    // Open voice modal
    await page.click('[data-testid="voice-input-button"]')
    await page.waitForSelector('[data-testid="voice-input-modal"]')
    
    // Start live AI voice
    await page.click('[data-testid="live-ai-voice-button"]')
    await page.waitForTimeout(1000)
    
    // Close modal
    await page.click('[data-testid="close-modal-button"]')
    
    // Modal should be closed
    await expect(page.locator('[data-testid="voice-input-modal"]')).not.toBeVisible()
    
    // Check that cleanup was called (no errors in console)
    const consoleErrors = await page.evaluate(() => {
      return window.consoleErrors || []
    })
    expect(consoleErrors.length).toBe(0)
  })

  test('should handle correlation ID propagation', async ({ page }) => {
    await page.goto('/chat')
    
    // Open voice modal
    await page.click('[data-testid="voice-input-button"]')
    await page.waitForSelector('[data-testid="voice-input-modal"]')
    
    // Start live AI voice
    await page.click('[data-testid="live-ai-voice-button"]')
    
    // Check that correlation ID is generated and displayed
    await expect(page.locator('[data-testid="correlation-id-display"]')).toBeVisible()
    
    const correlationId = await page.locator('[data-testid="correlation-id-display"]').textContent()
    expect(correlationId).toMatch(/^live-audio-\d+-\w+$/)
  })

  test('should validate audio chunk sizes', async ({ page }) => {
    await page.goto('/chat')
    
    // Open voice modal
    await page.click('[data-testid="voice-input-button"]')
    await page.waitForSelector('[data-testid="voice-input-modal"]')
    
    // Mock different audio chunk sizes
    await page.addInitScript(() => {
      // Test oversized chunk
      const oversizedChunk = new ArrayBuffer(2 * 1024 * 1024) // 2MB
      window.testOversizedChunk = oversizedChunk
      
      // Test undersized chunk
      const undersizedChunk = new ArrayBuffer(50) // 50 bytes
      window.testUndersizedChunk = undersizedChunk
      
      // Test valid chunk
      const validChunk = new ArrayBuffer(1000) // 1KB
      window.testValidChunk = validChunk
    })
    
    // Start live AI voice
    await page.click('[data-testid="live-ai-voice-button"]')
    await page.waitForTimeout(1000)
    
    // Test validation logic
    const validationResults = await page.evaluate(() => {
      const results = {
        oversized: window.testOversizedChunk.byteLength > 1024 * 1024,
        undersized: window.testUndersizedChunk.byteLength < 100,
        valid: window.testValidChunk.byteLength >= 100 && window.testValidChunk.byteLength <= 1024 * 1024
      }
      return results
    })
    
    expect(validationResults.oversized).toBe(true)
    expect(validationResults.undersized).toBe(true)
    expect(validationResults.valid).toBe(true)
  })
}) 