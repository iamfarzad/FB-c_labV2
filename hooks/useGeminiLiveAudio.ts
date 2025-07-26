import { useState, useEffect, useRef, useCallback } from 'react'
import { GoogleGenAI, Modality } from '@google/genai'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { logTokenUsage } from '@/lib/token-usage-logger'
import { TokenCostCalculator } from '@/lib/token-cost-calculator'
import { supabase } from '@/lib/supabase/client'

// Helper function to estimate tokens (fallback implementation)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

// Helper function to estimate cost
function estimateCost(inputTokens: number, outputTokens: number): number {
  return TokenCostCalculator.estimateCost('gemini', 'gemini-2.5-flash', inputTokens, outputTokens)
}

interface UseGeminiLiveAudioOptions {
  apiKey: string
  modelName?: string
  onStatusChange?: (status: string) => void
  sessionId?: string
  userId?: string
}

interface AudioValidationResult {
  isValid: boolean
  error?: string
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
}

export function useGeminiLiveAudio({ 
  apiKey, 
  modelName = 'gemini-2.5-flash-preview-native-audio-dialog', 
  onStatusChange,
  sessionId,
  userId 
}: UseGeminiLiveAudioOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [correlationId, setCorrelationId] = useState<string>('')
  const sessionRef = useRef<any>(null)
  const audioPlayer = useAudioPlayer()
  const rateLimitRef = useRef<{ count: number; resetTime: number }>({ count: 0, resetTime: Date.now() })

  // Generate correlation ID for structured logging
  const generateCorrelationId = useCallback(() => {
    return `live-audio-${Date.now()}-${Math.random().toString(36).substring(7)}`
  }, [])

  // Validate audio chunk format and size
  const validateAudioChunk = useCallback((audioChunk: ArrayBuffer): AudioValidationResult => {
    try {
      // Check size limits (max 1MB per chunk)
      if (audioChunk.byteLength > 1024 * 1024) {
        return { isValid: false, error: 'Audio chunk too large (max 1MB)' }
      }

      // Check minimum size (at least 100 bytes)
      if (audioChunk.byteLength < 100) {
        return { isValid: false, error: 'Audio chunk too small' }
      }

      // Basic format validation (should be PCM-like data)
      const view = new Uint8Array(audioChunk)
      if (view.length === 0) {
        return { isValid: false, error: 'Empty audio chunk' }
      }

      return { isValid: true }
    } catch (e) {
      return { isValid: false, error: 'Invalid audio format' }
    }
  }, [])

  // Rate limiting check
  const checkRateLimit = useCallback(async (): Promise<RateLimitResult> => {
    const now = Date.now()
    const windowMs = 60000 // 1 minute
    const maxRequests = 20

    // Reset counter if window has passed
    if (now > rateLimitRef.current.resetTime) {
      rateLimitRef.current = { count: 0, resetTime: now + windowMs }
    }

    // Check if limit exceeded
    if (rateLimitRef.current.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: rateLimitRef.current.resetTime
      }
    }

    // Increment counter
    rateLimitRef.current.count++

    return {
      allowed: true,
      remaining: maxRequests - rateLimitRef.current.count,
      resetTime: rateLimitRef.current.resetTime
    }
  }, [])

  // Authentication check
  const authenticateUser = useCallback(async (): Promise<{ success: boolean; userId?: string; error?: string }> => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        return { success: false, error: 'Authentication required' }
      }

      return { success: true, userId: user.id }
    } catch (e) {
      return { success: false, error: 'Authentication service unavailable' }
    }
  }, [])

  // Structured logging
  const logActivity = useCallback((level: 'info' | 'error' | 'warn', message: string, metadata: any = {}) => {
    const logData = {
      timestamp: new Date().toISOString(),
      level,
      message,
      correlationId,
      sessionId,
      userId,
      model: modelName,
      ...metadata
    }
    
    console.log(JSON.stringify(logData))
    
    // Also log to Supabase if available
    if (correlationId) {
      logTokenUsage({
        model: modelName,
        input_tokens: metadata.inputTokens || 0,
        output_tokens: metadata.outputTokens || 0,
        total_tokens: (metadata.inputTokens || 0) + (metadata.outputTokens || 0),
        estimated_cost: metadata.estimatedCost || 0,
        feature: 'voice-live',
        success: level !== 'error',
        error_message: level === 'error' ? metadata.error : undefined,
        usage_metadata: metadata
      })
    }
  }, [correlationId, sessionId, userId, modelName])

  // Initialize Gemini Live session with proper error handling
  const connect = useCallback(async () => {
    const newCorrelationId = generateCorrelationId()
    setCorrelationId(newCorrelationId)
    
    try {
      onStatusChange?.('connecting')
      logActivity('info', 'Starting Gemini Live session')

      // Secure context check
      if (typeof window !== 'undefined' && !window.isSecureContext) {
        throw new Error('HTTPS required for live audio streaming')
      }

      // Authentication check (optional for demo sessions)
      const auth = await authenticateUser()
      const isAuthenticated = auth.success
      
      // For demo sessions, we don't require authentication
      if (!isAuthenticated && !sessionId) {
        throw new Error('Authentication required for voice features')
      }

      // Rate limiting check
      const rateLimit = await checkRateLimit()
      if (!rateLimit.allowed) {
        throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} seconds`)
      }

      // Initialize Gemini client with correct SDK
      const genAI = new GoogleGenAI({ apiKey })
      
      // Use the live.connect() method for real-time audio
      const session = await genAI.live.connect({
        model: modelName,
        callbacks: {
          onopen: () => {
            setIsConnected(true)
            setError(null)
            onStatusChange?.('connected')
            logActivity('info', 'Gemini Live session connected')
          },
          onmessage: handleMessage,
          onerror: handleError,
          onclose: handleClose
        },
        config: {
          responseModalities: [Modality.AUDIO, Modality.TEXT],
          speechConfig: {
            voiceConfig: { 
              prebuiltVoiceConfig: { 
                voiceName: 'Zephyr' 
              } 
            }
          }
        }
      })
      
      sessionRef.current = session
      
    } catch (e: any) {
      const errorMessage = e.message || 'Failed to connect to Gemini Live'
      setError(errorMessage)
      onStatusChange?.('error')
      logActivity('error', 'Gemini Live connection failed', { error: errorMessage })
      
      // Fallback to regular TTS endpoint
      logActivity('info', 'Falling back to regular TTS endpoint')
    }
  }, [apiKey, modelName, onStatusChange, authenticateUser, checkRateLimit, logActivity, generateCorrelationId, sessionId])

  // Handle incoming messages from Gemini
  const handleMessage = useCallback((event: any) => {
    try {
      const data = event.data
      if (data.audio) {
        // Convert Base64 to ArrayBuffer
        const binary = atob(data.audio)
        const len = binary.length
        const buffer = new ArrayBuffer(len)
        const view = new Uint8Array(buffer)
        for (let i = 0; i < len; i++) view[i] = binary.charCodeAt(i)
        
        // Play the audio using the audio player's playAudioData method
        audioPlayer.controls.playAudioData(data.audio)
        onStatusChange?.('playing')
        
        logActivity('info', 'Audio response received and playing', {
          audioSize: buffer.byteLength,
          outputTokens: estimateTokens(binary)
        })
      }
    } catch (e: any) {
      logActivity('error', 'Failed to handle audio message', { error: e.message })
      handleError(e)
    }
  }, [audioPlayer, onStatusChange, logActivity])

  // Handle errors with fallback
  const handleError = useCallback((e: any) => {
    const errorMessage = e.message || 'Unknown error occurred'
    setError(errorMessage)
    onStatusChange?.('error')
    logActivity('error', 'Gemini Live session error', { error: errorMessage })
    
    // Cleanup and fallback
    cleanup()
  }, [onStatusChange, logActivity])

  // Handle session close
  const handleClose = useCallback(() => {
    setIsConnected(false)
    setIsStreaming(false)
    onStatusChange?.('closed')
    logActivity('info', 'Gemini Live session closed')
  }, [onStatusChange, logActivity])

  // Send audio stream with validation and rate limiting
  const sendStream = useCallback(async (audioChunk: ArrayBuffer) => {
    if (!sessionRef.current) {
      logActivity('warn', 'Attempted to send audio without active session')
      return
    }

    try {
      // Validate audio chunk
      const validation = validateAudioChunk(audioChunk)
      if (!validation.isValid) {
        logActivity('error', 'Audio validation failed', { error: validation.error })
        return
      }

      // Rate limiting check
      const rateLimit = await checkRateLimit()
      if (!rateLimit.allowed) {
        logActivity('warn', 'Rate limit exceeded during streaming')
        return
      }

      setIsStreaming(true)
      onStatusChange?.('streaming')
      
      // Convert ArrayBuffer to Base64
      const bytes = new Uint8Array(audioChunk)
      let binary = ''
      for (const b of bytes) binary += String.fromCharCode(b)
      const b64 = btoa(binary)
      
      // Send to Gemini using the live session
      sessionRef.current.sendRealtimeInput({ audio: b64 })
      
      // Log usage
      const tokens = estimateTokens(binary)
      const cost = estimateCost(tokens, 0)
      
      logActivity('info', 'Audio chunk sent successfully', {
        chunkSize: audioChunk.byteLength,
        inputTokens: tokens,
        estimatedCost: cost
      })
      
    } catch (e: any) {
      logActivity('error', 'Failed to send audio stream', { error: e.message })
      handleError(e)
    }
  }, [validateAudioChunk, checkRateLimit, onStatusChange, logActivity, handleError])

  // Cleanup function
  const cleanup = useCallback(() => {
    try {
      if (sessionRef.current) {
        sessionRef.current.close()
        sessionRef.current = null
      }
      
      audioPlayer.controls.stop()
      setIsConnected(false)
      setIsStreaming(false)
      setError(null)
      
      logActivity('info', 'Gemini Live session cleaned up')
    } catch (e: any) {
      logActivity('error', 'Error during cleanup', { error: e.message })
    }
  }, [audioPlayer, logActivity])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  return {
    isConnected,
    isStreaming,
    error,
    correlationId,
    hasLiveFallback: !isConnected && error?.includes('HTTPS required'),
    connect,
    sendStream,
    cleanup
  }
} 