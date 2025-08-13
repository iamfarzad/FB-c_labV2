import { useState, useEffect, useCallback, useRef } from 'react'
// Deprecated experimental hook. Prefer use-websocket-voice + use-voice-recorder.

interface MultimodalSession {
  sessionId: string
  leadId?: string
  isActive: boolean
  messageCount: number
  audioEnabled: boolean
  videoEnabled: boolean
  screenShareEnabled: boolean
  voiceName: string
  languageCode: string
}

interface MultimodalMessage {
  id: string
  sessionId: string
  message: string
  response: string
  audioData?: string
  videoFrame?: string
  screenFrame?: string
  timestamp: Date
  responseTime: number
}

type VideoFrameType = 'webcam' | 'screen'

export function useMultimodalSession() {
  const [session, setSession] = useState<MultimodalSession | null>(null)
  const [messages, setMessages] = useState<MultimodalMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Direct Gemini Live session
  const liveSessionRef = useRef<any>(null)
  
  // Web Audio API context for playing raw audio data
  const audioContextRef = useRef<AudioContext | null>(null)
  
  // Initialize Web Audio API context
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000 // Gemini TTS sample rate
      })
      console.info('🎵 Web Audio API context initialized')
    }
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Decode base64 to raw bytes
  const decodeBase64 = useCallback((base64: string): Uint8Array => {
    const binaryString = atob(base64)
    const len = binaryString.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
  }, [])

  // Decode raw audio bytes to AudioBuffer
  const decodeAudioData = useCallback(async (
    rawBytes: Uint8Array,
    sampleRate: number = 24000,
    channels: number = 1
  ): Promise<AudioBuffer> => {
    if (!audioContextRef.current) {
      throw new Error('AudioContext not initialized')
    }

    // Convert 8-bit PCM to 32-bit float for Web Audio API
    const audioBuffer = audioContextRef.current.createBuffer(channels, rawBytes.length, sampleRate)
    const channelData = audioBuffer.getChannelData(0)
    
    for (let i = 0; i < rawBytes.length; i++) {
      // Convert 8-bit unsigned to 32-bit float (-1 to 1)
      channelData[i] = (rawBytes[i] - 128) / 128
    }
    
    return audioBuffer
  }, [])

  // Play audio from base64 data using Web Audio API
  const playAudio = useCallback(async (audioData: string) => {
    try {
      console.info('🎵 Playing audio data with Web Audio API...')
      
      if (!audioContextRef.current) {
        throw new Error('AudioContext not initialized')
      }

      // Resume context if suspended (required for autoplay)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
      }

      // Decode base64 to raw bytes
      const rawBytes = decodeBase64(audioData)
      
      // Decode to AudioBuffer
      const audioBuffer = await decodeAudioData(rawBytes)
      
      // Create audio source and play
      const source = audioContextRef.current.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContextRef.current.destination)
      source.start(0)
      
      console.info('🎵 Audio playback started')
    } catch (error) {
      console.error('❌ Audio playback error:', error)
    }
  }, [decodeBase64, decodeAudioData])

  // Start multimodal session
  const startSession = useCallback(async () => {
    setError('Deprecated: use use-websocket-voice.ts')
  }, [])

  // Send video frame (webcam or screen)
  const sendVideoFrame = useCallback(async () => { setError('Deprecated hook') }, [])

  // Send audio chunk
  const sendAudioChunk = useCallback(async () => { setError('Deprecated hook') }, [])

  // Stop session
  const stopSession = useCallback(async () => {
    try {
      console.info('🛑 Stopping multimodal session...')
      
      if (liveSessionRef.current) {
        await liveSessionRef.current.close()
        liveSessionRef.current = null
      }

      setSession(prev => prev ? { ...prev, isActive: false } : null)
      setIsConnected(false)
      console.info('✅ Session stopped successfully')

    } catch (error) {
      console.error('❌ Error stopping session:', error)
      setError((error as Error).message)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSession()
    }
  }, [stopSession])

  return {
    session,
    messages,
    isConnected,
    isProcessing,
    error,
    startSession,
    stopSession,
    sendVideoFrame,
    sendAudioChunk,
    playAudio
  }
} 