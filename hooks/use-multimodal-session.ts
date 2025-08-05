import { useState, useEffect, useCallback, useRef } from 'react'
import { GoogleGenAI } from '@google/genai'
import { Modality } from '@google/genai'

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

      // Decode base64 to raw bytes
      const rawBytes = decodeBase64(audioData)
      
      // Decode to AudioBuffer
      const audioBuffer = await decodeAudioData(rawBytes)
      
      // Create audio source and play
      const source = audioContextRef.current.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContextRef.current.destination)
      source.start(0)
      
      console.log('🎵 Audio playback started')
    } catch (error) {
      console.error('❌ Audio playback error:', error)
    }
  }, [decodeBase64, decodeAudioData])

  // Start multimodal session
  const startSession = useCallback(async (options: {
    leadId?: string
    voiceName?: string
    languageCode?: string
    audioEnabled?: boolean
    videoEnabled?: boolean
    screenShareEnabled?: boolean
  } = {}) => {
    try {
      console.log('🚀 Starting multimodal session...')
      setIsProcessing(true)
      setError(null)

      if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not configured')
      }

      const genAI = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY })
      
      // Create multimodal session with audio and video capabilities
      const session = await genAI.models.generateContentStream({
        model: 'gemini-2.0-flash-exp',
        contents: [{
          role: 'user',
          parts: [{
            text: `You are a helpful AI assistant. You can see, hear, and respond to users through voice, video, and screen sharing. 
            Please provide natural, conversational responses and analyze any visual content shared with you.
            
            User context: ${options.leadId ? `Lead ID: ${options.leadId}` : 'New conversation'}
            Voice: ${options.voiceName || 'Default'}
            Language: ${options.languageCode || 'en-US'}
            Audio enabled: ${options.audioEnabled !== false}
            Video enabled: ${options.videoEnabled !== false}
            Screen share enabled: ${options.screenShareEnabled !== false}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
        },
        tools: [{
          functionDeclarations: [{
            name: 'analyze_visual_content',
            description: 'Analyze visual content from webcam or screen share',
            parameters: {
              type: 'object',
              properties: {
                content_type: {
                  type: 'string',
                  enum: ['webcam', 'screen'],
                  description: 'Type of visual content'
                },
                analysis: {
                  type: 'string',
                  description: 'Analysis of the visual content'
                }
              },
              required: ['content_type', 'analysis']
            }
          }]
        }]
      })

      liveSessionRef.current = session

      const newSession: MultimodalSession = {
        sessionId: `multimodal-${Date.now()}`,
        leadId: options.leadId,
        isActive: true,
        messageCount: 0,
        audioEnabled: options.audioEnabled !== false,
        videoEnabled: options.videoEnabled !== false,
        screenShareEnabled: options.screenShareEnabled !== false,
        voiceName: options.voiceName || 'Default',
        languageCode: options.languageCode || 'en-US'
      }

      setSession(newSession)
      setIsConnected(true)
      console.log('✅ Multimodal session started successfully')

      // Listen for responses
      for await (const chunk of session.stream) {
        if (chunk.text) {
          console.log('📝 Response chunk:', chunk.text)
          
          // Handle audio response if present
          if (chunk.audio) {
            console.log('🎵 Audio response received')
            await playAudio(chunk.audio)
          }
          
          // Add message to history
          const message: MultimodalMessage = {
            id: Date.now().toString(),
            sessionId: newSession.sessionId,
            message: 'User input',
            response: chunk.text,
            audioData: chunk.audio,
            timestamp: new Date(),
            responseTime: Date.now()
          }
          
          setMessages(prev => [...prev, message])
        }
      }

    } catch (error) {
      console.error('❌ Session start error:', error)
      setError((error as Error).message)
      setIsConnected(false)
    } finally {
      setIsProcessing(false)
    }
  }, [playAudio])

  // Send video frame (webcam or screen)
  const sendVideoFrame = useCallback(async (imageData: string, type: VideoFrameType) => {
    try {
      if (!liveSessionRef.current || !isConnected) {
        throw new Error('Session not active')
      }

      console.log(`📸 Sending ${type} frame...`)

      // Send image as part of the multimodal session
      await liveSessionRef.current.send({
        role: 'user',
        parts: [{
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageData.split(',')[1] // Remove data:image/jpeg;base64, prefix
          }
        }, {
          text: `This is a ${type} frame. Please analyze what you see and provide insights.`
        }]
      })

      console.log(`✅ ${type} frame sent successfully`)

    } catch (error) {
      console.error(`❌ Error sending ${type} frame:`, error)
      setError((error as Error).message)
    }
  }, [isConnected])

  // Send audio chunk
  const sendAudioChunk = useCallback(async (audioData: string) => {
    try {
      if (!liveSessionRef.current || !isConnected) {
        throw new Error('Session not active')
      }

      console.log('🎤 Sending audio chunk...')

      // Send audio as part of the multimodal session
      await liveSessionRef.current.send({
        role: 'user',
        parts: [{
          inlineData: {
            mimeType: 'audio/wav',
            data: audioData
          }
        }]
      })

      console.log('✅ Audio chunk sent successfully')

    } catch (error) {
      console.error('❌ Error sending audio chunk:', error)
      setError((error as Error).message)
    }
  }, [isConnected])

  // Stop session
  const stopSession = useCallback(async () => {
    try {
      console.log('🛑 Stopping multimodal session...')
      
      if (liveSessionRef.current) {
        await liveSessionRef.current.close()
        liveSessionRef.current = null
      }

      setSession(prev => prev ? { ...prev, isActive: false } : null)
      setIsConnected(false)
      console.log('✅ Session stopped successfully')

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