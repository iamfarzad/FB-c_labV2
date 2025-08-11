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
  type PcmChunk = ArrayBuffer
  const audioQueueRef = useRef<PcmChunk[]>([])
  const isPlayingRef = useRef(false)
  
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

  const int16ToFloat32 = (i16: Int16Array) => {
    const f32 = new Float32Array(i16.length)
    for (let i = 0; i < i16.length; i++) f32[i] = i16[i] / 32768
    return f32
  }

  const playQueuedAudio = useCallback(async () => {
    const ac = audioContextRef.current
    if (!ac || isPlayingRef.current) return
    isPlayingRef.current = true

    while (audioQueueRef.current.length > 0) {
      const chunk = audioQueueRef.current.shift() as ArrayBuffer
      const i16 = new Int16Array(chunk)
      const f32 = int16ToFloat32(i16)

      const buffer = ac.createBuffer(1, f32.length, 24000)
      buffer.copyToChannel(f32, 0, 0)

      const src = ac.createBufferSource()
      src.buffer = buffer
      src.connect(ac.destination)

      if (ac.state === 'suspended') await ac.resume()

      const done = new Promise<void>(res => (src.onended = () => res()))
      src.start()
      await done
    }
    isPlayingRef.current = false
  }, [])

  // Start direct Gemini Live session
  const startSession = useCallback(async (leadContext?: { leadId: string; leadName: string }) => {
    try {
      setError(null)
      setIsProcessing(true)

      // Get ephemeral token from server (prevents exposing API key)
      const res = await fetch('/api/live/token', { method: 'POST', cache: 'no-store' })
      if (!res.ok) throw new Error(`Token endpoint failed: ${res.status}`)
      const { token } = await res.json()
      if (!token) throw new Error('No token returned')

      const genAI = new GoogleGenAI({ apiKey: token })
      
      console.log('🎙️ Starting direct Gemini Live session...')

      // Create direct live connection
      const liveSession = await genAI.live.connect({
        model: 'gemini-live-2.5-flash-preview-native-audio',
        callbacks: {
          onopen: () => {
            console.log('✅ Gemini Live session opened')
            setIsConnected(true)
          },
          onmessage: async (event: any) => {
            // Binary audio frames (16-bit PCM)
            if (event?.data instanceof ArrayBuffer || event?.data?.byteLength) {
              audioQueueRef.current.push(event.data as ArrayBuffer)
              playQueuedAudio()
              return
            }

            // JSON control/text frames
            let msg: any = event?.data
            if (typeof event?.data === 'string') {
              try { msg = JSON.parse(event.data) } catch { /* ignore */ }
            }

            if (msg?.serverContent?.turnComplete === true) {
              setIsProcessing(false)
              return
            }

            const text = msg?.text
            if (typeof text === 'string' && text.length > 0) {
              const newMessage: VoiceMessage = {
                id: Math.random().toString(36).substring(7),
                sessionId: 'live-session',
                message: '',
                response: text,
                timestamp: new Date(),
                responseTime: 0,
              }
              setMessages(prev => [...prev, newMessage])
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
  }, [])

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
    playQueuedAudio,
    
    // Utilities
    clearError: () => setError(null)
  }
}
