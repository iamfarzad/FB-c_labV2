import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { VoiceInput } from '@/components/chat/tools/VoiceInput/VoiceInput'
import { useToast } from '@/hooks/use-toast'

// Mock the toast hook
jest.mock('@/hooks/use-toast')
const mockToast = jest.fn()
;(useToast as jest.Mock).mockReturnValue({ toast: mockToast })

// Mock the real-time voice hook
jest.mock('@/hooks/use-real-time-voice', () => ({
  useRealTimeVoice: () => ({
    isProcessing: false,
    startSession: jest.fn(),
    sendMessage: jest.fn().mockResolvedValue(undefined),
  })
}))

// Mock the audio player hook
jest.mock('@/hooks/useAudioPlayer', () => ({
  useAudioPlayer: () => ({
    playAudioData: jest.fn(),
    isPlaying: false,
  })
}))

// Mock SpeechRecognition
const mockSpeechRecognition = {
  continuous: false,
  interimResults: false,
  lang: '',
  onresult: null,
  onend: null,
  onerror: null,
  start: jest.fn(),
  stop: jest.fn(),
}

Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: jest.fn().mockImplementation(() => mockSpeechRecognition),
})

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: jest.fn().mockImplementation(() => mockSpeechRecognition),
})

describe('VoiceInput Component - Infinite Loop Bug Fix', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSpeechRecognition.continuous = false
    mockSpeechRecognition.interimResults = false
    mockSpeechRecognition.lang = ''
    mockSpeechRecognition.onresult = null
    mockSpeechRecognition.onend = null
    mockSpeechRecognition.onerror = null
  })

  const defaultProps = {
    mode: 'modal' as const,
    onClose: jest.fn(),
    onTranscript: jest.fn(),
    leadContext: {
      name: 'Test User',
      company: 'Test Company',
      role: 'User'
    }
  }

  it('should not recreate SpeechRecognition when transcript changes', async () => {
    const SpeechRecognitionSpy = jest.spyOn(window, 'SpeechRecognition')
    
    render(<VoiceInput {...defaultProps} />)
    
    // Initial render should create SpeechRecognition once
    expect(SpeechRecognitionSpy).toHaveBeenCalledTimes(1)
    
    // Simulate transcript change by triggering onresult
    const mockEvent = {
      resultIndex: 0,
      results: [{
        isFinal: true,
        0: { transcript: 'test transcript' }
      }]
    }
    
    // Trigger result event to change transcript
    if (mockSpeechRecognition.onresult) {
      mockSpeechRecognition.onresult(mockEvent)
    }
    
    // Wait for any potential re-renders
    await waitFor(() => {
      // SpeechRecognition should still only be called once
      expect(SpeechRecognitionSpy).toHaveBeenCalledTimes(1)
    })
  })

  it('should not auto-trigger handleTranscript on recording end', async () => {
    const onTranscriptSpy = jest.fn()
    
    render(<VoiceInput {...defaultProps} onTranscript={onTranscriptSpy} />)
    
    // Set a transcript first
    const mockEvent = {
      resultIndex: 0,
      results: [{
        isFinal: true,
        0: { transcript: 'test transcript' }
      }]
    }
    
    if (mockSpeechRecognition.onresult) {
      mockSpeechRecognition.onresult(mockEvent)
    }
    
    // Trigger recording end
    if (mockSpeechRecognition.onend) {
      mockSpeechRecognition.onend()
    }
    
    // Wait for any potential async operations
    await waitFor(() => {
      // onTranscript should NOT be called automatically on end
      expect(onTranscriptSpy).not.toHaveBeenCalled()
    })
  })

  it('should only trigger handleTranscript when user clicks Use This Text button', async () => {
    const onTranscriptSpy = jest.fn()
    
    render(<VoiceInput {...defaultProps} onTranscript={onTranscriptSpy} />)
    
    // Set a transcript
    const mockEvent = {
      resultIndex: 0,
      results: [{
        isFinal: true,
        0: { transcript: 'test transcript' }
      }]
    }
    
    if (mockSpeechRecognition.onresult) {
      mockSpeechRecognition.onresult(mockEvent)
    }
    
    // Find and click the "Use This Text" button
    const useButton = screen.getByText('Use This Text')
    fireEvent.click(useButton)
    
    // Now onTranscript should be called
    await waitFor(() => {
      expect(onTranscriptSpy).toHaveBeenCalledWith('test transcript')
    })
  })

  it('should have stable useEffect dependencies', () => {
    // This test ensures the useEffect doesn't have transcript in dependencies
    // by checking that re-renders with same props don't cause recreation
    
    const { rerender } = render(<VoiceInput {...defaultProps} />)
    const initialCallCount = (window.SpeechRecognition as jest.Mock).mock.calls.length
    
    // Re-render with same props
    rerender(<VoiceInput {...defaultProps} />)
    
    // Should not create new SpeechRecognition instance
    expect((window.SpeechRecognition as jest.Mock).mock.calls.length).toBe(initialCallCount)
  })
})