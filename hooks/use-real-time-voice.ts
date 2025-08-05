import { useState, useEffect, useCallback, useRef } from 'react'
import { GoogleGenAI } from '@google/genai'
import { Modality } from '@google/genai'

interface VoiceSession {
  sessionId: string
  leadId?: string
  isActive: boolean
  messageCount: number
  audioEnabled: boolean
  voiceName: string
  languageCode: string
}

interface VoiceMessage {
  id: string
  sessionId: string
  message: string
  response: string
  audioData?: string
  timestamp: Date
  responseTime: number
}

export function useRealTimeVoice() {
  const [session, setSession] = useState<VoiceSession | null>(null)
  const [messages, setMessages] = useState<VoiceMessage[]>([])
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
      console.log('🎵 Web Audio API context initialized')
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
      console.log('🎵 Playing audio data with Web Audio API...')
      
      if (!audioContextRef.current) {
        throw new Error('AudioContext not initialized')
      }

      // Resume context if suspended (required for autoplay)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
      }

      // Remove data URL prefix if present
      const base64Data = audioData.replace('data:audio/wav;base64,', '')
      
      // Decode base64 to raw bytes
      const rawBytes = decodeBase64(base64Data)
      console.log('🎵 Decoded audio bytes:', rawBytes.length)
      
      // Convert to AudioBuffer
      const audioBuffer = await decodeAudioData(rawBytes)
      console.log('🎵 Created AudioBuffer:', audioBuffer.length, 'samples')
      
      // Create and play audio source
      const source = audioContextRef.current.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContextRef.current.destination)
      
      source.onended = () => console.log('🎵 Audio playback completed')
      
      source.start()
      console.log('🎵 Audio playback started')
      
    } catch (err) {
      console.error('❌ Failed to play audio:', err)
      throw err
    }
  }, [decodeBase64, decodeAudioData])

  // Start direct Gemini Live session
  const startSession = useCallback(async (leadContext?: { leadId: string; leadName: string }) => {
    try {
      setError(null)
      setIsProcessing(true)

      // Initialize Gemini client
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY not configured')
      }

      const genAI = new GoogleGenAI({ apiKey })
      
      console.log('🎙️ Starting direct Gemini Live session...')

      // Create direct live connection
      const liveSession = await genAI.live.connect({
        model: 'gemini-2.5-flash-preview-native-audio-dialog',
        callbacks: {
          onopen: () => {
            console.log('✅ Gemini Live session opened')
            setIsConnected(true)
          },
          onmessage: (event: any) => {
            console.log('📨 Received Gemini message:', event.data)
            
            // Handle text response
            if (event.data?.text) {
              const newMessage: VoiceMessage = {
                id: Math.random().toString(36).substring(7),
                sessionId: 'live-session',
                message: '', // Will be set by sendMessage
                response: event.data.text,
                timestamp: new Date(),
                responseTime: 0
              }
              setMessages(prev => [...prev, newMessage])
            }
            
            // Handle audio response
            if (event.data?.audio) {
              console.log('🎵 Received audio response')
              // Convert ArrayBuffer to base64 for playback
              const audioArray = new Uint8Array(event.data.audio)
              const base64Audio = btoa(String.fromCharCode(...audioArray))
              const audioData = `data:audio/wav;base64,${base64Audio}`
              
              // Play the audio
              playAudio(audioData)
            }
          },
          onerror: (error) => {
            console.error('❌ Gemini Live error:', error)
            setError(error.message || 'Live session error')
          },
          onclose: () => {
            console.log('🔒 Gemini Live session closed')
            setIsConnected(false)
            setSession(null)
          }
        },
        config: {
          responseModalities: [Modality.AUDIO, Modality.TEXT],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: 'Puck'
              }
            },
            languageCode: 'en-US'
          }
        }
      })

      liveSessionRef.current = liveSession
      
      setSession({
        sessionId: 'live-session',
        leadId: leadContext?.leadId,
        isActive: true,
        messageCount: 0,
        audioEnabled: true,
        voiceName: 'Puck',
        languageCode: 'en-US'
      })

      console.log('🎙️ Direct Gemini Live session started')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session')
      console.error('❌ Failed to start Gemini Live session:', err)
    } finally {
      setIsProcessing(false)
    }
  }, [playAudio])

  // Send message via direct Gemini Live connection
  const sendMessage = useCallback(async (message: string) => {
    if (!liveSessionRef.current) {
      setError('No active live session')
      return
    }

    try {
      setError(null)
      setIsProcessing(true)

      console.log('💬 Sending message via Gemini Live:', message)

      // Send text message to Gemini Live
      liveSessionRef.current.sendRealtimeInput({
        turns: [{ role: 'user', parts: [{ text: message }] }],
        turnComplete: true
      })

      console.log('💬 Message sent via Gemini Live')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
      console.error('❌ Failed to send message via Gemini Live:', err)
    } finally {
      setIsProcessing(false)
    }
  }, [])

  // End direct Gemini Live session
  const endSession = useCallback(async () => {
    if (!liveSessionRef.current) return

    try {
      setError(null)
      setIsProcessing(true)

      console.log('🔚 Closing Gemini Live session...')
      liveSessionRef.current.close()

      setSession(null)
      setMessages([])
      setIsConnected(false)
      liveSessionRef.current = null
      
      console.log('🔚 Gemini Live session ended')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end session')
      console.error('❌ Failed to end Gemini Live session:', err)
    } finally {
      setIsProcessing(false)
    }
  }, [])

  // Update voice settings
  const updateVoiceSettings = useCallback((settings: Partial<Pick<VoiceSession, 'voiceName' | 'languageCode' | 'audioEnabled'>>) => {
    setSession(prev => prev ? { ...prev, ...settings } : null)
  }, [])

  return {
    // State
    session,
    messages,
    isConnected,
    isProcessing,
    error,
    
    // Actions
    startSession,
    sendMessage,
    endSession,
    updateVoiceSettings,
    playAudio,
    
    // Utilities
    clearError: () => setError(null)
  }
}
