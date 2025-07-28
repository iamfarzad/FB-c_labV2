import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'

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
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioQueueRef = useRef<AudioBuffer[]>([])
  const isPlayingRef = useRef(false)

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Start conversation session
  const startSession = useCallback(async (leadContext?: { leadId: string; leadName: string }) => {
    try {
      setError(null)
      setIsProcessing(true)

      const response = await fetch('/api/gemini-live-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          leadContext,
          enableAudio: true,
          voiceName: 'Puck',
          languageCode: 'en-US'
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to start session: ${response.statusText}`)
      }

      const data = await response.json()
      
      setSession({
        sessionId: data.sessionId,
        leadId: leadContext?.leadId,
        isActive: true,
        messageCount: 0,
        audioEnabled: true,
        voiceName: 'Puck',
        languageCode: 'en-US'
      })

      setIsConnected(true)
      console.log('🎙️ Voice session started:', data.sessionId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session')
      console.error('❌ Failed to start voice session:', err)
    } finally {
      setIsProcessing(false)
    }
  }, [])

  // Send message with voice processing
  const sendMessage = useCallback(async (message: string) => {
    if (!session?.sessionId) {
      setError('No active session')
      return
    }

    try {
      setError(null)
      setIsProcessing(true)

      const response = await fetch('/api/gemini-live-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'message',
          sessionId: session.sessionId,
          message,
          enableAudio: true,
          voiceName: session.voiceName,
          languageCode: session.languageCode
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`)
      }

      const data = await response.json()
      
      const newMessage: VoiceMessage = {
        id: Math.random().toString(36).substring(7),
        sessionId: session.sessionId,
        message,
        response: data.message,
        audioData: data.audioData,
        timestamp: new Date(),
        responseTime: data.responseTime
      }

      setMessages(prev => [...prev, newMessage])
      
      // Update session message count
      setSession(prev => prev ? { ...prev, messageCount: data.messageCount } : null)

      // Play audio if available
      if (data.audioData && session.audioEnabled) {
        await playAudio(data.audioData)
      }

      console.log('💬 Voice message sent:', newMessage)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
      console.error('❌ Failed to send voice message:', err)
    } finally {
      setIsProcessing(false)
    }
  }, [session])

  // End conversation session
  const endSession = useCallback(async () => {
    if (!session?.sessionId) return

    try {
      setError(null)
      setIsProcessing(true)

      await fetch('/api/gemini-live-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end',
          sessionId: session.sessionId
        })
      })

      setSession(null)
      setMessages([])
      setIsConnected(false)
      console.log('🔚 Voice session ended')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end session')
      console.error('❌ Failed to end voice session:', err)
    } finally {
      setIsProcessing(false)
    }
  }, [session])

  // Play audio from base64 data
  const playAudio = useCallback(async (audioData: string) => {
    if (!audioContextRef.current) return

    try {
      // Remove data URL prefix
      const base64Data = audioData.replace('data:audio/wav;base64,', '')
      const binaryString = atob(base64Data)
      const bytes = new Uint8Array(binaryString.length)
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      // Decode audio data
      const audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer)
      audioQueueRef.current.push(audioBuffer)

      // Play if not currently playing
      if (!isPlayingRef.current) {
        playNextAudio()
      }
    } catch (err) {
      console.error('❌ Failed to play audio:', err)
    }
  }, [])

  // Play next audio in queue
  const playNextAudio = useCallback(async () => {
    if (!audioContextRef.current || audioQueueRef.current.length === 0) {
      isPlayingRef.current = false
      return
    }

    isPlayingRef.current = true
    const audioBuffer = audioQueueRef.current.shift()!
    
    const source = audioContextRef.current.createBufferSource()
    source.buffer = audioBuffer
    source.connect(audioContextRef.current.destination)
    
    source.onended = () => {
      playNextAudio()
    }
    
    source.start()
  }, [])

  // Update voice settings
  const updateVoiceSettings = useCallback((settings: Partial<Pick<VoiceSession, 'voiceName' | 'languageCode' | 'audioEnabled'>>) => {
    setSession(prev => prev ? { ...prev, ...settings } : null)
  }, [])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!session?.sessionId) return

    const channel = supabase
      .channel(`voice-session-${session.sessionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'activities',
        filter: `metadata->>'sessionId'=eq.${session.sessionId}`
      }, (payload) => {
        console.log('📡 Real-time voice activity:', payload)
        // Handle real-time updates if needed
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session?.sessionId])

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
