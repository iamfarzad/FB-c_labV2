"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Mic, X, Loader, Sparkles, Volume2, Brain, Pause, Play, Wifi, WifiOff } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { GeminiLiveClient, convertToPCM } from "@/lib/ai/gemini-live-client"

interface VoiceInputModalLiveProps {
  isListening: boolean
  onClose: () => void
  onAIResponse?: (response: string) => void
  onConversationUpdate?: (conversation: ConversationTurn[]) => void
  theme: "light" | "dark"
}

interface ConversationTurn {
  id: string
  type: 'user' | 'ai'
  text: string
  timestamp: number
  audioData?: string
}

export const VoiceInputModalLive: React.FC<VoiceInputModalLiveProps> = ({
  isListening,
  onClose,
  onAIResponse,
  onConversationUpdate,
  theme,
}) => {
  const [conversation, setConversation] = useState<ConversationTurn[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [currentTranscription, setCurrentTranscription] = useState("")
  const [aiState, setAiState] = useState<"idle" | "listening" | "thinking" | "speaking">("idle")
  const [audioLevel, setAudioLevel] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  const liveClientRef = useRef<GeminiLiveClient | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const conversationRef = useRef<HTMLDivElement>(null)

  // Initialize Live API connection
  const initializeLiveConnection = useCallback(async () => {
    setIsConnecting(true)
    setError(null)
    
    try {
      // Get connection info from API
      const response = await fetch('/api/gemini-live')
      const { success, wsUrl, apiKey, defaultModel, mockMode } = await response.json()
      
      if (!success || mockMode) {
        throw new Error('Live API not available - using mock mode')
      }
      
      // Create Live API client
      const client = new GeminiLiveClient(apiKey, {
        model: defaultModel,
        responseModalities: ['TEXT', 'AUDIO'],
        voiceName: 'Aoede',
        systemInstruction: 'You are a helpful AI assistant in a real-time voice conversation. Keep responses concise and natural.'
      })
      
      // Set up event handlers
      client.onSetupComplete = () => {
        console.log('Live API setup complete')
        setIsConnected(true)
        setIsConnecting(false)
        setAiState("listening")
      }
      
      client.onTextResponse = (text: string) => {
        const aiTurn: ConversationTurn = {
          id: Date.now().toString(),
          type: 'ai',
          text,
          timestamp: Date.now()
        }
        
        setConversation(prev => [...prev, aiTurn])
        onAIResponse?.(text)
        setAiState("speaking")
      }
      
      client.onAudioResponse = async (audioBlob: Blob) => {
        // Play audio response
        const audio = new Audio()
        audio.src = URL.createObjectURL(audioBlob)
        audio.onended = () => setAiState("listening")
        await audio.play()
      }
      
      client.onTurnComplete = () => {
        setAiState("listening")
        setCurrentTranscription("")
      }
      
      client.onInterrupted = () => {
        console.log('AI response interrupted')
        setAiState("listening")
      }
      
      client.onConnectionChange = (connected: boolean) => {
        setIsConnected(connected)
        if (!connected) {
          setError('Connection lost')
        }
      }
      
      client.onTranscription = (transcription: string, type: 'input' | 'output') => {
        if (type === 'input') {
          setCurrentTranscription(transcription)
          
          // Add user turn when transcription is complete
          if (transcription && !transcription.endsWith('...')) {
            const userTurn: ConversationTurn = {
              id: (Date.now() - 1).toString(),
              type: 'user',
              text: transcription,
              timestamp: Date.now()
            }
            setConversation(prev => [...prev, userTurn])
          }
        }
      }
      
      client.onError = (error: Error) => {
        console.error('Live API error:', error)
        setError(error.message)
        setAiState("idle")
      }
      
      // Connect to Live API
      await client.connect()
      liveClientRef.current = client
      
      // Start audio capture
      await startAudioCapture()
      
    } catch (error: any) {
      console.error('Failed to initialize Live API:', error)
      setError(error.message)
      setIsConnecting(false)
    }
  }, [onAIResponse])
  
  // Start audio capture and streaming
  const startAudioCapture = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      
      streamRef.current = stream
      
      // Set up audio analysis for visualization
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)
      
      analyser.smoothingTimeConstant = 0.8
      analyser.fftSize = 256
      
      microphone.connect(analyser)
      
      audioContextRef.current = audioContext
      analyserRef.current = analyser
      
      // Create MediaRecorder for streaming
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      })
      
      let audioChunks: Blob[] = []
      
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && liveClientRef.current?.connected) {
          audioChunks.push(event.data)
          
          // Convert and send when we have enough data
          if (audioChunks.length >= 5) { // Buffer 5 chunks
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
            audioChunks = []
            
            try {
              const pcmBlob = await convertToPCM(audioBlob)
              liveClientRef.current.sendRealtimeInput([pcmBlob])
            } catch (error) {
              console.error('Audio conversion error:', error)
            }
          }
        }
      }
      
      mediaRecorder.start(100) // Capture chunks every 100ms
      mediaRecorderRef.current = mediaRecorder
      
      // Start audio level monitoring
      updateAudioLevel()
      
    } catch (error) {
      console.error('Audio capture error:', error)
      setError('Failed to access microphone')
    }
  }, [])
  
  // Update audio level visualization
  const updateAudioLevel = useCallback(() => {
    if (analyserRef.current && isConnected) {
      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      analyserRef.current.getByteFrequencyData(dataArray)
      
      const average = dataArray.reduce((a, b) => a + b) / bufferLength
      setAudioLevel(average / 255)
      
      requestAnimationFrame(updateAudioLevel)
    }
  }, [isConnected])
  
  // Send text message
  const sendTextMessage = useCallback((text: string) => {
    if (liveClientRef.current?.connected && text.trim()) {
      liveClientRef.current.sendText(text)
      setCurrentTranscription("")
      
      const userTurn: ConversationTurn = {
        id: Date.now().toString(),
        type: 'user',
        text,
        timestamp: Date.now()
      }
      
      setConversation(prev => [...prev, userTurn])
      setAiState("thinking")
    }
  }, [])
  
  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    
    if (liveClientRef.current) {
      liveClientRef.current.disconnect()
    }
  }, [])
  
  // Initialize on mount
  useEffect(() => {
    initializeLiveConnection()
    
    return cleanup
  }, [initializeLiveConnection, cleanup])
  
  // Auto-scroll conversation
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight
    }
  }, [conversation])
  
  // Update parent with conversation
  useEffect(() => {
    onConversationUpdate?.(conversation)
  }, [conversation, onConversationUpdate])
  
  const getStateConfig = () => {
    switch (aiState) {
      case "listening":
        return {
          title: "Listening...",
          subtitle: "Speak naturally - I'm listening",
          icon: Mic,
          iconColor: "text-orange-500",
          bgGlow: "bg-orange-500/10",
          animate: true
        }
      case "thinking":
        return {
          title: "Thinking...",
          subtitle: "Processing your message",
          icon: Brain,
          iconColor: "text-blue-500",
          bgGlow: "bg-blue-500/10",
          animate: true
        }
      case "speaking":
        return {
          title: "Speaking...",
          subtitle: "Listen to my response",
          icon: Volume2,
          iconColor: "text-green-500",
          bgGlow: "bg-green-500/10",
          animate: true
        }
      default:
        return {
          title: "Connecting...",
          subtitle: "Setting up real-time connection",
          icon: Loader,
          iconColor: "text-gray-500",
          bgGlow: "bg-gray-500/10",
          animate: true
        }
    }
  }
  
  const config = getStateConfig()
  const IconComponent = config.icon
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-2xl mx-4 h-[80vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Main Modal - Live API Enabled */}
          <div className={`glassmorphism border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl bg-white/10 dark:bg-black/20 overflow-hidden relative h-full ${config.animate ? 'shadow-orange-500/20 shadow-2xl' : ''}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none rounded-2xl" />
            <div className="relative z-10 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.bgGlow}`}>
                    <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Live Conversation</h3>
                    <p className="text-sm text-white/70">{config.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Connection Status */}
                  <div className={`p-2 rounded-lg ${isConnected ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    {isConnected ? (
                      <Wifi className="w-4 h-4 text-green-400" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4 text-white/70 hover:text-white" />
                  </button>
                </div>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="mx-4 mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}
              
              {/* Main Content */}
              <div className="flex-1 flex">
                {/* Voice Visualization */}
                <div className="w-1/2 p-6 flex flex-col items-center justify-center border-r border-white/20 dark:border-white/10">
                  {/* Live Waveform */}
                  <div className="flex items-center justify-center gap-1 h-24 mb-6">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className={`w-1.5 rounded-full ${isConnected ? 'bg-orange-500' : 'bg-gray-500'}`}
                        initial={{ height: 4 }}
                        animate={{
                          height: isConnected ? [4, audioLevel * 80 + Math.random() * 20 + 10, 4] : 4,
                          opacity: isConnected ? [0.3, 1, 0.3] : 0.3
                        }}
                        transition={{
                          duration: 0.4,
                          repeat: isConnected ? Infinity : 0,
                          ease: "easeInOut",
                          delay: i * 0.03
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Status Icon */}
                  <div className={`p-4 rounded-full ${config.bgGlow} mb-4`}>
                    <IconComponent className={`w-8 h-8 ${config.iconColor} ${config.animate ? 'animate-pulse' : ''}`} />
                  </div>
                  
                  {/* Current Transcription */}
                  <AnimatePresence>
                    {currentTranscription && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full"
                      >
                        <div className="p-3 bg-white/10 rounded-lg border border-white/20 backdrop-blur-sm">
                          <p className="text-xs text-white/70 mb-1">You said:</p>
                          <p className="text-white text-sm">{currentTranscription}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Audio Level */}
                  {isConnected && (
                    <div className="mt-4 w-full">
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <motion.div 
                          className="bg-orange-500 h-2 rounded-full"
                          animate={{ width: `${audioLevel * 100}%` }}
                          transition={{ duration: 0.1 }}
                        />
                      </div>
                      <p className="text-xs text-white/70 text-center mt-1">Voice Level</p>
                    </div>
                  )}
                </div>
                
                {/* Conversation */}
                <div className="w-1/2 flex flex-col">
                  <div className="p-4 border-b border-white/20 dark:border-white/10">
                    <h4 className="text-white font-medium flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Live Conversation
                    </h4>
                  </div>
                  
                  <div 
                    ref={conversationRef}
                    className="flex-1 overflow-y-auto p-4 space-y-3"
                  >
                    {conversation.map((turn) => (
                      <motion.div
                        key={turn.id}
                        initial={{ opacity: 0, x: turn.type === 'user' ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex ${turn.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            turn.type === 'user'
                              ? 'bg-orange-500/20 text-white border border-orange-500/30'
                              : 'bg-blue-500/20 text-white border border-blue-500/30'
                          }`}
                        >
                          <p className="text-sm">{turn.text}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(turn.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    
                    {isConnecting && (
                      <div className="flex justify-center">
                        <div className="p-3 bg-gray-500/20 rounded-lg">
                          <Loader className="w-5 h-5 text-gray-400 animate-spin" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Text Input */}
                  <div className="p-4 border-t border-white/20 dark:border-white/10">
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault()
                        const input = e.currentTarget.querySelector('input') as HTMLInputElement
                        if (input?.value) {
                          sendTextMessage(input.value)
                          input.value = ''
                        }
                      }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-500/50"
                        disabled={!isConnected}
                      />
                      <button
                        type="submit"
                        disabled={!isConnected}
                        className="px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-400 hover:bg-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Send
                      </button>
                    </form>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="px-4 py-3 bg-white/5 border-t border-white/20 dark:border-white/10">
                <p className="text-xs text-white/60 text-center">
                  {isConnected 
                    ? "🎙️ Real-time conversation active - speak naturally or type a message" 
                    : "⏳ Connecting to Gemini Live API..."
                  }
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
