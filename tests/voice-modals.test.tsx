import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { VoiceInputModal } from '@/components/chat/modals/VoiceInputModal'
import { VoiceOutputModal } from '@/components/chat/modals/VoiceOutputModal'

// Mock fetch for TTS API calls
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock audio API
const mockAudio = {
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  onended: null as any,
  onplay: null as any,
  onerror: null as any,
  src: '',
}
global.Audio = jest.fn(() => mockAudio) as any

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-blob-url')
global.URL.revokeObjectURL = jest.fn()

describe('VoiceInputModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onTransferToChat: jest.fn(),
    onVoiceResponse: jest.fn(),
    leadContext: {
      name: 'Test User',
      company: 'Test Corp'
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  describe('Live Conversation Mode', () => {
    it('should not make duplicate TTS calls in live conversation mode', async () => {
      // Mock successful chat response
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn().mockResolvedValue({ done: true })
            })
          }
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: { get: () => 'audio/wav' },
          blob: jest.fn().mockResolvedValue(new Blob(['audio data'], { type: 'audio/wav' }))
        })

      render(<VoiceInputModal {...defaultProps} />)

      // Switch to conversation mode
      const conversationButton = screen.getByText('Live Chat')
      fireEvent.click(conversationButton)

      // Start recording (simulate voice input)
      const micButton = screen.getByRole('button', { name: /microphone/i })
      fireEvent.click(micButton)

      // Simulate sending message
      const sendButton = screen.getByRole('button', { name: /send/i })
      fireEvent.click(sendButton)

      await waitFor(() => {
        // Should only make one TTS call
        expect(mockFetch).toHaveBeenCalledTimes(2) // 1 chat + 1 TTS
        expect(mockFetch).toHaveBeenCalledWith('/api/gemini-live', expect.any(Object))
      })

      // Verify onVoiceResponse was NOT called (to prevent duplicate TTS)
      expect(defaultProps.onVoiceResponse).not.toHaveBeenCalled()
    })

    it('should handle 429 errors gracefully', async () => {
      // Mock successful chat response
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn().mockResolvedValue({ done: true })
            })
          }
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          json: jest.fn().mockResolvedValue({ error: 'Rate limit exceeded' })
        })

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      render(<VoiceInputModal {...defaultProps} />)

      // Switch to conversation mode
      const conversationButton = screen.getByText('Live Chat')
      fireEvent.click(conversationButton)

      // Start recording and send message
      const micButton = screen.getByRole('button', { name: /microphone/i })
      fireEvent.click(micButton)

      const sendButton = screen.getByRole('button', { name: /send/i })
      fireEvent.click(sendButton)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('🎤 TTS rate limited, skipping duplicate call')
      })

      consoleSpy.mockRestore()
    })

    it('should play audio only once per response', async () => {
      // Mock successful responses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn().mockResolvedValue({ done: true })
            })
          }
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: { get: () => 'audio/wav' },
          blob: jest.fn().mockResolvedValue(new Blob(['audio data'], { type: 'audio/wav' }))
        })

      render(<VoiceInputModal {...defaultProps} />)

      // Switch to conversation mode
      const conversationButton = screen.getByText('Live Chat')
      fireEvent.click(conversationButton)

      // Start recording and send message
      const micButton = screen.getByRole('button', { name: /microphone/i })
      fireEvent.click(micButton)

      const sendButton = screen.getByRole('button', { name: /send/i })
      fireEvent.click(sendButton)

      await waitFor(() => {
        // Should create only one audio instance
        expect(global.Audio).toHaveBeenCalledTimes(1)
        expect(mockAudio.play).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Voice Input Mode', () => {
    it('should call onVoiceResponse in input mode', async () => {
      render(<VoiceInputModal {...defaultProps} />)

      // Ensure we're in input mode
      const inputButton = screen.getByText('Voice Input')
      fireEvent.click(inputButton)

      // Simulate voice input
      const micButton = screen.getByRole('button', { name: /microphone/i })
      fireEvent.click(micButton)

      const sendButton = screen.getByRole('button', { name: /send/i })
      fireEvent.click(sendButton)

      await waitFor(() => {
        expect(defaultProps.onTransferToChat).toHaveBeenCalled()
      })
    })
  })
})

describe('VoiceOutputModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    textContent: 'Hello, this is a test response from the AI.',
    voiceStyle: 'puck',
    autoPlay: true
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  it('should handle 429 errors gracefully', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 429,
      json: jest.fn().mockResolvedValue({ error: 'Rate limit exceeded' })
    })

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

    render(<VoiceOutputModal {...defaultProps} />)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('🎤 TTS rate limited, skipping duplicate call')
    })

    consoleSpy.mockRestore()
  })

  it('should play audio when TTS succeeds', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'audio/wav' },
      blob: jest.fn().mockResolvedValue(new Blob(['audio data'], { type: 'audio/wav' }))
    })

    render(<VoiceOutputModal {...defaultProps} />)

    await waitFor(() => {
      expect(global.Audio).toHaveBeenCalled()
      expect(mockAudio.play).toHaveBeenCalled()
    })
  })

  it('should handle JSON fallback response', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: jest.fn().mockResolvedValue({
        success: true,
        audioData: 'data:audio/wav;base64,dGVzdA==' // base64 encoded "test"
      })
    })

    render(<VoiceOutputModal {...defaultProps} />)

    await waitFor(() => {
      expect(global.Audio).toHaveBeenCalled()
      expect(mockAudio.play).toHaveBeenCalled()
    })
  })
}) 