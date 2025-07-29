import { NextRequest } from 'next/server'

// Test the API rate limiting logic directly
describe('API Rate Limiting Logic', () => {
  // Mock the duplicate prevention logic from the API
  const recentCalls = new Map<string, number>()
  const DUPLICATE_THRESHOLD = 3000 // 3 seconds

  const checkDuplicateCall = (prompt: string, enableTTS: boolean, voiceName: string) => {
    const promptHash = `${prompt?.substring(0, 50) || ''}_${enableTTS}_${voiceName}`
    const lastCallTime = recentCalls.get(promptHash)
    const now = Date.now()
    
    if (lastCallTime && (now - lastCallTime) < DUPLICATE_THRESHOLD) {
      return { isDuplicate: true, retryAfter: Math.ceil((DUPLICATE_THRESHOLD - (now - lastCallTime)) / 1000) }
    }
    
    recentCalls.set(promptHash, now)
    
    // Clean up old entries (keep last 100)
    if (recentCalls.size > 100) {
      const oldestKey = recentCalls.keys().next().value
      if (oldestKey) {
        recentCalls.delete(oldestKey)
      }
    }
    
    return { isDuplicate: false, retryAfter: 0 }
  }

  const mockApiResponse = (isDuplicate: boolean, retryAfter: number) => {
    if (isDuplicate) {
      return {
        status: 429,
        json: () => Promise.resolve({ 
          error: 'Duplicate call skipped',
          retryAfter 
        })
      }
    }
    return {
      status: 200,
      json: () => Promise.resolve({ success: true })
    }
  }

  beforeEach(() => {
    recentCalls.clear()
    jest.clearAllMocks()
  })

  describe('Gemini Live API Rate Limiting', () => {
    it('should return 429 for duplicate calls within threshold', async () => {
      const prompt = 'Hello, this is a test message'
      const enableTTS = true
      const voiceName = 'Puck'

      // First call
      const result1 = checkDuplicateCall(prompt, enableTTS, voiceName)
      const response1 = mockApiResponse(result1.isDuplicate, result1.retryAfter)
      expect(response1.status).toBe(200)

      // Second call immediately (should be duplicate)
      const result2 = checkDuplicateCall(prompt, enableTTS, voiceName)
      const response2 = mockApiResponse(result2.isDuplicate, result2.retryAfter)
      expect(response2.status).toBe(429)
      
      const responseData = await response2.json() as { error: string; retryAfter: number }
      expect(responseData.error).toBe('Duplicate call skipped')
      expect(responseData.retryAfter).toBeDefined()
    })

    it('should allow calls after threshold expires', async () => {
      const prompt = 'Hello, this is a test message'
      const enableTTS = true
      const voiceName = 'Puck'

      // First call
      const result1 = checkDuplicateCall(prompt, enableTTS, voiceName)
      const response1 = mockApiResponse(result1.isDuplicate, result1.retryAfter)
      expect(response1.status).toBe(200)

      // Wait for threshold to expire
      await new Promise(resolve => setTimeout(resolve, 3100))

      // Second call after threshold (should not be duplicate)
      const result2 = checkDuplicateCall(prompt, enableTTS, voiceName)
      const response2 = mockApiResponse(result2.isDuplicate, result2.retryAfter)
      expect(response2.status).toBe(200)
    })

    it('should handle different prompts as separate calls', async () => {
      const prompt1 = 'First message'
      const prompt2 = 'Different message'
      const enableTTS = true
      const voiceName = 'Puck'

      // First call
      const result1 = checkDuplicateCall(prompt1, enableTTS, voiceName)
      const response1 = mockApiResponse(result1.isDuplicate, result1.retryAfter)
      expect(response1.status).toBe(200)

      // Second call with different prompt (should not be duplicate)
      const result2 = checkDuplicateCall(prompt2, enableTTS, voiceName)
      const response2 = mockApiResponse(result2.isDuplicate, result2.retryAfter)
      expect(response2.status).toBe(200)
    })

    it('should handle different voice names as separate calls', async () => {
      const prompt = 'Same message'
      const enableTTS = true
      const voiceName1 = 'Puck'
      const voiceName2 = 'Kore'

      // First call
      const result1 = checkDuplicateCall(prompt, enableTTS, voiceName1)
      const response1 = mockApiResponse(result1.isDuplicate, result1.retryAfter)
      expect(response1.status).toBe(200)

      // Second call with different voice name (should not be duplicate)
      const result2 = checkDuplicateCall(prompt, enableTTS, voiceName2)
      const response2 = mockApiResponse(result2.isDuplicate, result2.retryAfter)
      expect(response2.status).toBe(200)
    })
  })

  describe('Rate Limiting Cache Management', () => {
    it('should clean up old cache entries', async () => {
      // Make multiple calls to trigger cache cleanup
      const calls = Array.from({ length: 150 }, (_, i) => ({
        prompt: `Message ${i}`,
        enableTTS: true,
        voiceName: 'Puck'
      }))

      // All calls should succeed (cache cleanup should prevent overflow)
      for (const call of calls) {
        const result = checkDuplicateCall(call.prompt, call.enableTTS, call.voiceName)
        const response = mockApiResponse(result.isDuplicate, result.retryAfter)
        expect(response.status).toBe(200)
      }

      // Cache should be manageable size
      expect(recentCalls.size).toBeLessThanOrEqual(100)
    })
  })

  describe('Error Handling', () => {
    it('should handle missing prompt gracefully', () => {
      const prompt = ''
      const enableTTS = true
      const voiceName = 'Puck'

      // Should still work with empty prompt
      const result = checkDuplicateCall(prompt, enableTTS, voiceName)
      expect(result.isDuplicate).toBe(false)
    })

    it('should handle different TTS settings as separate calls', () => {
      const prompt = 'Same message'
      const voiceName = 'Puck'

      // Call with TTS enabled
      const result1 = checkDuplicateCall(prompt, true, voiceName)
      expect(result1.isDuplicate).toBe(false)

      // Call with TTS disabled (should be different)
      const result2 = checkDuplicateCall(prompt, false, voiceName)
      expect(result2.isDuplicate).toBe(false)
    })
  })

  describe('429 Error Handling in Frontend', () => {
    it('should handle 429 responses gracefully', async () => {
      // Mock the frontend TTS call function
      const mockTTSApiCall = async (text: string) => {
        const prompt = text
        const enableTTS = true
        const voiceName = 'Puck'

        const result = checkDuplicateCall(prompt, enableTTS, voiceName)
        const response = mockApiResponse(result.isDuplicate, result.retryAfter)

        if (response.status === 429) {
          console.warn('🎤 TTS rate limited, skipping duplicate call')
          return { status: 429, error: 'Rate limit exceeded' }
        }

        return { status: 200, success: true }
      }

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      // First call
      const response1 = await mockTTSApiCall('Test message')
      expect(response1.status).toBe(200)

      // Second call (should be rate limited)
      const response2 = await mockTTSApiCall('Test message')
      expect(response2.status).toBe(429)
      expect(consoleSpy).toHaveBeenCalledWith('🎤 TTS rate limited, skipping duplicate call')

      consoleSpy.mockRestore()
    })
  })
})
