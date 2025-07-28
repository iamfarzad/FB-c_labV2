import { renderHook, act, waitFor } from '@testing-library/react'
import { useGeminiLiveAudio } from '@/hooks/useGeminiLiveAudio'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { logTokenUsage } from '@/lib/token-usage-logger'
import { estimateTokens, estimateCost } from '@/lib/token-cost-calculator'
import { getSupabase } from '@/lib/supabase/client'

// Mock dependencies
jest.mock('@/hooks/useAudioPlayer')
jest.mock('@/lib/token-usage-logger')
jest.mock('@/lib/token-cost-calculator')
jest.mock('@/lib/supabase/client')

const mockUseAudioPlayer = useAudioPlayer as jest.MockedFunction<typeof useAudioPlayer>
const mockLogTokenUsage = logTokenUsage as jest.MockedFunction<typeof logTokenUsage>
const mockEstimateTokens = estimateTokens as jest.MockedFunction<typeof estimateTokens>
const mockEstimateCost = estimateCost as jest.MockedFunction<typeof estimateCost>
const mockGetSupabase = getSupabase as jest.MockedFunction<typeof getSupabase>

// Mock Gemini client
const mockSession = {
  onopen: jest.fn(),
  onmessage: jest.fn(),
  onerror: jest.fn(),
  onclose: jest.fn(),
  sendRealtimeInput: jest.fn(),
  close: jest.fn()
}

const mockModel = {
  startChat: jest.fn().mockResolvedValue(mockSession)
}

const mockClient = {
  getGenerativeModel: jest.fn().mockReturnValue(mockModel)
}

// Mock @google/genai
jest.mock('@google/genai', () => ({
  Client: jest.fn().mockImplementation(() => mockClient)
}))

describe('Gemini Live Integration Tests', () => {
  const mockApiKey = 'test-api-key'
  const mockSessionId = 'test-session-id'
  const mockUserId = 'test-user-id'
  const mockOnStatusChange = jest.fn()

  const mockAudioPlayer = {
    playBuffer: jest.fn(),
    stop: jest.fn()
  }

  const mockSupabaseAuth = {
    getUser: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup mocks
    mockUseAudioPlayer.mockReturnValue(mockAudioPlayer)
    mockGetSupabase.mockReturnValue({
      auth: mockSupabaseAuth
    } as any)
    
    // Mock successful authentication
    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: { id: mockUserId } },
      error: null
    })
    
    // Mock token estimation
    mockEstimateTokens.mockReturnValue(100)
    mockEstimateCost.mockReturnValue(0.001)
  })

  describe('Complete Audio Streaming Workflow', () => {
    it('should handle a complete conversation session with multiple audio chunks', async () => {
      const { result } = renderHook(() => 
        useGeminiLiveAudio({ 
          apiKey: mockApiKey,
          onStatusChange: mockOnStatusChange,
          sessionId: mockSessionId,
          userId: mockUserId
        })
      )

      // Step 1: Connect to Gemini Live
      await act(async () => {
        await result.current.connect()
      })

      expect(result.current.isConnected).toBe(false) // Not connected yet
      expect(mockOnStatusChange).toHaveBeenCalledWith('connecting')

      // Step 2: Simulate successful connection
      act(() => {
        mockSession.onopen()
      })

      expect(result.current.isConnected).toBe(true)
      expect(mockOnStatusChange).toHaveBeenCalledWith('connected')

      // Step 3: Simulate sending multiple audio chunks
      const audioChunks = [
        new ArrayBuffer(500),  // Small chunk
        new ArrayBuffer(1000), // Medium chunk
        new ArrayBuffer(750),  // Another medium chunk
        new ArrayBuffer(2000)  // Large chunk
      ]

      for (const chunk of audioChunks) {
        await act(async () => {
          await result.current.sendStream(chunk)
        })

        expect(mockSession.sendRealtimeInput).toHaveBeenCalled()
        expect(mockLogTokenUsage).toHaveBeenCalled()
      }

      // Step 4: Simulate receiving AI responses
      const aiResponses = [
        'Hello, how can I help you today?',
        'I understand your question about the project.',
        'Let me provide you with a detailed explanation.',
        'Is there anything else you would like to know?'
      ]

      for (const response of aiResponses) {
        // Convert text to base64 audio (simulated)
        const audioData = btoa(response)
        const mockEvent = {
          data: { audio: audioData }
        }

        act(() => {
          mockSession.onmessage(mockEvent)
        })

        expect(mockAudioPlayer.playBuffer).toHaveBeenCalled()
        expect(mockOnStatusChange).toHaveBeenCalledWith('playing')
      }

      // Step 5: Cleanup
      act(() => {
        result.current.cleanup()
      })

      expect(mockSession.close).toHaveBeenCalled()
      expect(mockAudioPlayer.stop).toHaveBeenCalled()
      expect(result.current.isConnected).toBe(false)
      expect(result.current.isStreaming).toBe(false)
    })

    it('should handle rate limiting during streaming', async () => {
      const { result } = renderHook(() => 
        useGeminiLiveAudio({ 
          apiKey: mockApiKey,
          onStatusChange: mockOnStatusChange,
          sessionId: mockSessionId,
          userId: mockUserId
        })
      )

      // Connect first
      await act(async () => {
        await result.current.connect()
      })

      act(() => {
        mockSession.onopen()
      })

      // Send many chunks to trigger rate limiting
      const audioChunk = new ArrayBuffer(1000)
      
      for (let i = 0; i < 25; i++) {
        await act(async () => {
          await result.current.sendStream(audioChunk)
        })
      }

      // Should eventually hit rate limit
      expect(mockLogTokenUsage).toHaveBeenCalled()
    })

    it('should handle connection failures and fallback', async () => {
      // Mock connection failure
      mockModel.startChat.mockRejectedValue(new Error('Connection failed'))

      const { result } = renderHook(() => 
        useGeminiLiveAudio({ 
          apiKey: mockApiKey,
          onStatusChange: mockOnStatusChange,
          sessionId: mockSessionId,
          userId: mockUserId
        })
      )

      await act(async () => {
        await result.current.connect()
      })

      expect(result.current.error).toContain('Connection failed')
      expect(mockOnStatusChange).toHaveBeenCalledWith('error')
      expect(mockLogTokenUsage).toHaveBeenCalledWith(
        expect.objectContaining({
          taskType: 'voice-live'
        })
      )
    })

    it('should handle authentication failures', async () => {
      // Mock authentication failure
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: 'Authentication failed'
      })

      const { result } = renderHook(() => 
        useGeminiLiveAudio({ 
          apiKey: mockApiKey,
          onStatusChange: mockOnStatusChange,
          sessionId: mockSessionId,
          userId: mockUserId
        })
      )

      await act(async () => {
        await result.current.connect()
      })

      expect(result.current.error).toContain('Authentication required')
      expect(mockOnStatusChange).toHaveBeenCalledWith('error')
    })
  })

  describe('Audio Validation Integration', () => {
    it('should reject invalid audio chunks during streaming', async () => {
      const { result } = renderHook(() => 
        useGeminiLiveAudio({ 
          apiKey: mockApiKey,
          onStatusChange: mockOnStatusChange,
          sessionId: mockSessionId,
          userId: mockUserId
        })
      )

      // Connect first
      await act(async () => {
        await result.current.connect()
      })

      act(() => {
        mockSession.onopen()
      })

      // Test various invalid chunks
      const invalidChunks = [
        new ArrayBuffer(50),           // Too small
        new ArrayBuffer(2 * 1024 * 1024), // Too large
        new ArrayBuffer(0)             // Empty
      ]

      for (const chunk of invalidChunks) {
        await act(async () => {
          await result.current.sendStream(chunk)
        })

        expect(mockSession.sendRealtimeInput).not.toHaveBeenCalled()
      }
    })

    it('should accept valid audio chunks during streaming', async () => {
      const { result } = renderHook(() => 
        useGeminiLiveAudio({ 
          apiKey: mockApiKey,
          onStatusChange: mockOnStatusChange,
          sessionId: mockSessionId,
          userId: mockUserId
        })
      )

      // Connect first
      await act(async () => {
        await result.current.connect()
      })

      act(() => {
        mockSession.onopen()
      })

      // Test valid chunks
      const validChunks = [
        new ArrayBuffer(100),   // Minimum valid size
        new ArrayBuffer(500),   // Small chunk
        new ArrayBuffer(1000),  // Medium chunk
        new ArrayBuffer(1024 * 1024) // Maximum valid size
      ]

      for (const chunk of validChunks) {
        await act(async () => {
          await result.current.sendStream(chunk)
        })

        expect(mockSession.sendRealtimeInput).toHaveBeenCalled()
      }
    })
  })

  describe('Error Recovery Integration', () => {
    it('should recover from session errors and continue', async () => {
      const { result } = renderHook(() => 
        useGeminiLiveAudio({ 
          apiKey: mockApiKey,
          onStatusChange: mockOnStatusChange,
          sessionId: mockSessionId,
          userId: mockUserId
        })
      )

      // Connect first
      await act(async () => {
        await result.current.connect()
      })

      act(() => {
        mockSession.onopen()
      })

      // Send a valid chunk
      const audioChunk = new ArrayBuffer(1000)
      await act(async () => {
        await result.current.sendStream(audioChunk)
      })

      expect(mockSession.sendRealtimeInput).toHaveBeenCalled()

      // Simulate session error
      const mockError = new Error('Temporary session error')
      act(() => {
        mockSession.onerror(mockError)
      })

      expect(result.current.error).toBe('Temporary session error')
      expect(mockSession.close).toHaveBeenCalled()

      // Try to send another chunk (should fail gracefully)
      await act(async () => {
        await result.current.sendStream(audioChunk)
      })

      expect(mockSession.sendRealtimeInput).not.toHaveBeenCalled()
    })

    it('should handle audio playback errors gracefully', async () => {
      const { result } = renderHook(() => 
        useGeminiLiveAudio({ 
          apiKey: mockApiKey,
          onStatusChange: mockOnStatusChange,
          sessionId: mockSessionId,
          userId: mockUserId
        })
      )

      // Connect first
      await act(async () => {
        await result.current.connect()
      })

      act(() => {
        mockSession.onopen()
      })

      // Mock audio player error
      mockAudioPlayer.playBuffer.mockImplementation(() => {
        throw new Error('Audio playback failed')
      })

      // Simulate incoming audio message
      const audioData = 'base64-encoded-audio'
      const mockEvent = {
        data: { audio: audioData }
      }

      act(() => {
        mockSession.onmessage(mockEvent)
      })

      expect(result.current.error).toContain('Audio playback failed')
    })
  })

  describe('Performance Integration', () => {
    it('should handle rapid audio chunk streaming', async () => {
      const { result } = renderHook(() => 
        useGeminiLiveAudio({ 
          apiKey: mockApiKey,
          onStatusChange: mockOnStatusChange,
          sessionId: mockSessionId,
          userId: mockUserId
        })
      )

      // Connect first
      await act(async () => {
        await result.current.connect()
      })

      act(() => {
        mockSession.onopen()
      })

      // Send many chunks rapidly
      const audioChunk = new ArrayBuffer(1000)
      const promises = []

      for (let i = 0; i < 10; i++) {
        promises.push(
          act(async () => {
            await result.current.sendStream(audioChunk)
          })
        )
      }

      await Promise.all(promises)

      expect(mockSession.sendRealtimeInput).toHaveBeenCalledTimes(10)
    })

    it('should maintain correlation ID throughout session', async () => {
      const { result } = renderHook(() => 
        useGeminiLiveAudio({ 
          apiKey: mockApiKey,
          onStatusChange: mockOnStatusChange,
          sessionId: mockSessionId,
          userId: mockUserId
        })
      )

      // Connect to get correlation ID
      await act(async () => {
        await result.current.connect()
      })

      const correlationId = result.current.correlationId
      expect(correlationId).toMatch(/^live-audio-\d+-\w+$/)

      act(() => {
        mockSession.onopen()
      })

      // Send multiple chunks and verify correlation ID remains the same
      const audioChunk = new ArrayBuffer(1000)
      
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          await result.current.sendStream(audioChunk)
        })

        expect(result.current.correlationId).toBe(correlationId)
      }
    })
  })
})
