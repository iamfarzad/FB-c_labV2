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

describe('useGeminiLiveAudio', () => {
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

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => 
        useGeminiLiveAudio({ 
          apiKey: mockApiKey,
          sessionId: mockSessionId,
          userId: mockUserId
        })
      )

      expect(result.current.isConnected).toBe(false)
      expect(result.current.isStreaming).toBe(false)
      expect(result.current.error).toBe(null)
      expect(result.current.correlationId).toBe('')
    })

    it('should accept custom model name', () => {
      const customModel = 'custom-model'
      const { result } = renderHook(() => 
        useGeminiLiveAudio({ 
          apiKey: mockApiKey,
          modelName: customModel,
          sessionId: mockSessionId,
          userId: mockUserId
        })
      )

      expect(result.current).toBeDefined()
    })
  })

  describe('connect', () => {
    it('should successfully connect to Gemini Live', async () => {
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

      expect(mockOnStatusChange).toHaveBeenCalledWith('connecting')
      expect(mockClient.getGenerativeModel).toHaveBeenCalledWith({ 
        model: 'gemini-2.5-flash-preview-native-audio-dialog' 
      })
      expect(mockModel.startChat).toHaveBeenCalledWith({
        stream: true,
        enableAudio: true,
        generationConfig: {
          responseMimeType: 'text/plain',
        }
      })
    })

    it('should handle authentication failure', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: 'Auth failed'
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

    it('should handle rate limiting', async () => {
      const { result } = renderHook(() => 
        useGeminiLiveAudio({ 
          apiKey: mockApiKey,
          onStatusChange: mockOnStatusChange,
          sessionId: mockSessionId,
          userId: mockUserId
        })
      )

      // Simulate rate limit by calling connect multiple times
      for (let i = 0; i < 25; i++) {
        await act(async () => {
          await result.current.connect()
        })
      }

      // Should eventually hit rate limit
      expect(result.current.error).toContain('Rate limit exceeded')
    })

    it('should handle connection errors', async () => {
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
    })
  })

  describe('sendStream', () => {
    it('should send valid audio chunks', async () => {
      const { result } = renderHook(() => 
        useGeminiLiveAudio({ 
          apiKey: mockApiKey,
          sessionId: mockSessionId,
          userId: mockUserId
        })
      )

      // Connect first
      await act(async () => {
        await result.current.connect()
      })

      // Simulate session connection
      act(() => {
        mockSession.onopen()
      })

      // Create a valid audio chunk
      const audioChunk = new ArrayBuffer(1000)
      
      await act(async () => {
        await result.current.sendStream(audioChunk)
      })

      expect(mockSession.sendRealtimeInput).toHaveBeenCalled()
      expect(mockLogTokenUsage).toHaveBeenCalled()
    })

    it('should reject oversized audio chunks', async () => {
      const { result } = renderHook(() => 
        useGeminiLiveAudio({ 
          apiKey: mockApiKey,
          sessionId: mockSessionId,
          userId: mockUserId
        })
      )

      // Connect first
      await act(async () => {
        await result.current.connect()
      })

      // Simulate session connection
      act(() => {
        mockSession.onopen()
      })

      // Create an oversized audio chunk (2MB)
      const audioChunk = new ArrayBuffer(2 * 1024 * 1024)
      
      await act(async () => {
        await result.current.sendStream(audioChunk)
      })

      expect(mockSession.sendRealtimeInput).not.toHaveBeenCalled()
    })

    it('should reject undersized audio chunks', async () => {
      const { result } = renderHook(() => 
        useGeminiLiveAudio({ 
          apiKey: mockApiKey,
          sessionId: mockSessionId,
          userId: mockUserId
        })
      )

      // Connect first
      await act(async () => {
        await result.current.connect()
      })

      // Simulate session connection
      act(() => {
        mockSession.onopen()
      })

      // Create an undersized audio chunk (50 bytes)
      const audioChunk = new ArrayBuffer(50)
      
      await act(async () => {
        await result.current.sendStream(audioChunk)
      })

      expect(mockSession.sendRealtimeInput).not.toHaveBeenCalled()
    })

    it('should handle send errors', async () => {
      const { result } = renderHook(() => 
        useGeminiLiveAudio({ 
          apiKey: mockApiKey,
          sessionId: mockSessionId,
          userId: mockUserId
        })
      )

      // Connect first
      await act(async () => {
        await result.current.connect()
      })

      // Simulate session connection
      act(() => {
        mockSession.onopen()
      })

      // Mock send error
      mockSession.sendRealtimeInput.mockRejectedValue(new Error('Send failed'))

      const audioChunk = new ArrayBuffer(1000)
      
      await act(async () => {
        await result.current.sendStream(audioChunk)
      })

      expect(result.current.error).toContain('Send failed')
    })
  })

  describe('message handling', () => {
    it('should handle incoming audio messages', async () => {
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

      // Simulate incoming audio message
      const audioData = 'base64-encoded-audio'
      const mockEvent = {
        data: { audio: audioData }
      }

      act(() => {
        mockSession.onmessage(mockEvent)
      })

      expect(mockAudioPlayer.playBuffer).toHaveBeenCalled()
      expect(mockOnStatusChange).toHaveBeenCalledWith('playing')
    })

    it('should handle message errors', async () => {
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

      // Mock audio player error
      mockAudioPlayer.playBuffer.mockImplementation(() => {
        throw new Error('Playback failed')
      })

      const audioData = 'base64-encoded-audio'
      const mockEvent = {
        data: { audio: audioData }
      }

      act(() => {
        mockSession.onmessage(mockEvent)
      })

      expect(result.current.error).toContain('Playback failed')
    })
  })

  describe('cleanup', () => {
    it('should cleanup resources on unmount', async () => {
      const { result, unmount } = renderHook(() => 
        useGeminiLiveAudio({ 
          apiKey: mockApiKey,
          sessionId: mockSessionId,
          userId: mockUserId
        })
      )

      // Connect first
      await act(async () => {
        await result.current.connect()
      })

      // Simulate session connection
      act(() => {
        mockSession.onopen()
      })

      // Cleanup
      act(() => {
        result.current.cleanup()
      })

      expect(mockSession.close).toHaveBeenCalled()
      expect(mockAudioPlayer.stop).toHaveBeenCalled()
      expect(result.current.isConnected).toBe(false)
      expect(result.current.isStreaming).toBe(false)
      expect(result.current.error).toBe(null)

      // Test unmount cleanup
      unmount()
      expect(mockSession.close).toHaveBeenCalledTimes(2) // Once from cleanup, once from unmount
    })

    it('should handle cleanup errors gracefully', async () => {
      const { result } = renderHook(() => 
        useGeminiLiveAudio({ 
          apiKey: mockApiKey,
          sessionId: mockSessionId,
          userId: mockUserId
        })
      )

      // Connect first
      await act(async () => {
        await result.current.connect()
      })

      // Mock cleanup error
      mockSession.close.mockImplementation(() => {
        throw new Error('Cleanup failed')
      })

      // Cleanup should not throw
      act(() => {
        expect(() => result.current.cleanup()).not.toThrow()
      })
    })
  })

  describe('error handling', () => {
    it('should handle session errors', async () => {
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

      // Simulate session error
      const mockError = new Error('Session error')
      act(() => {
        mockSession.onerror(mockError)
      })

      expect(result.current.error).toBe('Session error')
      expect(mockOnStatusChange).toHaveBeenCalledWith('error')
      expect(mockSession.close).toHaveBeenCalled()
    })

    it('should handle session close', async () => {
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

      // Simulate session close
      act(() => {
        mockSession.onclose()
      })

      expect(result.current.isConnected).toBe(false)
      expect(result.current.isStreaming).toBe(false)
      expect(mockOnStatusChange).toHaveBeenCalledWith('closed')
    })
  })

  describe('correlation ID', () => {
    it('should generate unique correlation IDs', async () => {
      const { result } = renderHook(() => 
        useGeminiLiveAudio({ 
          apiKey: mockApiKey,
          sessionId: mockSessionId,
          userId: mockUserId
        })
      )

      await act(async () => {
        await result.current.connect()
      })

      expect(result.current.correlationId).toMatch(/^live-audio-\d+-\w+$/)
    })

    it('should use correlation ID in logging', async () => {
      const { result } = renderHook(() => 
        useGeminiLiveAudio({ 
          apiKey: mockApiKey,
          sessionId: mockSessionId,
          userId: mockUserId
        })
      )

      await act(async () => {
        await result.current.connect()
      })

      expect(mockLogTokenUsage).toHaveBeenCalledWith(
        expect.objectContaining({
          correlationId: result.current.correlationId,
          sessionId: mockSessionId,
          userId: mockUserId
        })
      )
    })
  })
})
