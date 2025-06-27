"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Mic, X, Loader, Sparkles, Volume2, Brain, Pause, Play } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { GeminiLiveClient } from "@/lib/ai/gemini-live-client"

interface VoiceInputModalProps {
  isListening: boolean
  currentTranscription: string
  aiState: "listening" | "processing" | "idle" | "error" | "speaking"
  onClose: () => void
  onAIResponse?: (response: string) => void
  onConversationUpdate?: (conversation: ConversationTurn[]) => void
  theme: "light" | "dark"
  isRealTimeMode?: boolean
}

interface ConversationTurn {
  id: string
  type: 'user' | 'ai'
  text: string
  timestamp: number
  audioData?: string
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isListening,
  currentTranscription,
  aiState,
  onClose,
  onAIResponse,
  onConversationUpdate,
  theme,
  isRealTimeMode = false,
}) => {
  const [conversation, setConversation] = useState<ConversationTurn[]>([])
  const [isRealTimeActive, setIsRealTimeActive] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const conversationRef = useRef<HTMLDivElement>(null)
  const liveClientRef = useRef<GeminiLiveClient | null>(null)
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null)

  // Real-time audio analysis for voice level visualization
  const startAudioAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
      const audioContext = new AudioContext({ sampleRate: 16000 })
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)
      
      analyser.smoothingTimeConstant = 0.8
      analyser.fftSize = 1024
      
      // Create script processor for audio chunks
      const processor = audioContext.createScriptProcessor(4096, 1, 1)
      
              processor.onaudioprocess = (e) => {
          if (liveClientRef.current?.connected && isRealTimeActive) {
            const inputData = e.inputBuffer.getChannelData(0)
            // Convert Float32Array to Blob for sending
            const pcmData = new Int16Array(inputData.length)
            for (let i = 0; i < inputData.length; i++) {
              pcmData[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768))
            }
            const audioBlob = new Blob([pcmData.buffer], { type: 'audio/pcm;rate=16000' })
            liveClientRef.current.sendRealtimeInput([audioBlob])
          }
        }
      
      microphone.connect(analyser)
      microphone.connect(processor)
      processor.connect(audioContext.destination)
      
      audioContextRef.current = audioContext
      analyserRef.current = analyser
      audioProcessorRef.current = processor
      
      // Start audio level monitoring
      const updateAudioLevel = () => {
        if (analyserRef.current) {
          const bufferLength = analyserRef.current.frequencyBinCount
          const dataArray = new Uint8Array(bufferLength)
          analyserRef.current.getByteFrequencyData(dataArray)
          
          const average = dataArray.reduce((a, b) => a + b) / bufferLength
          setAudioLevel(average / 255) // Normalize to 0-1
        }
        
        if (isRealTimeActive) {
          requestAnimationFrame(updateAudioLevel)
        }
      }
      
      updateAudioLevel()
    } catch (error) {
      console.error('Audio analysis setup failed:', error)
      setConnectionStatus('error')
    }
  }, [isRealTimeActive])

  // Initialize Gemini Live client
  const initializeLiveClient = useCallback(async () => {
    try {
      setConnectionStatus('connecting')
      
      // Get WebSocket info from API
      const response = await fetch('/api/gemini-live')
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get WebSocket info')
      }
      
      // Create and configure client
      const client = new GeminiLiveClient(data.apiKey || '', {
        model: data.model || 'gemini-2.0-flash-exp',
        systemInstruction: `You are an AI assistant in a real-time voice conversation. 
        Be natural, conversational, and helpful. Keep responses concise and engaging.
        Listen carefully and respond appropriately to the user's speech.`,
        voiceName: 'Puck'
      })
      
      // Set up event handlers
      client.onConnectionChange = (connected: boolean) => {
        setConnectionStatus(connected ? 'connected' : 'disconnected')
        console.log('Connection status:', connected)
      }
      
      client.onError = (error: Error) => {
        console.error('Gemini Live error:', error)
        setConnectionStatus('error')
      }
      
      client.onTranscription = (text: string, type: 'input' | 'output') => {
        // Handle user speech transcript
        if (type === 'input' && text) {
          const userTurn: ConversationTurn = {
            id: Date.now().toString(),
            type: 'user',
            text: text,
            timestamp: Date.now()
          }
          setConversation(prev => [...prev, userTurn])
        }
      }
      
      client.onTextResponse = (text: string) => {
        // Handle AI text response
        if (text) {
          const aiTurn: ConversationTurn = {
            id: Date.now().toString(),
            type: 'ai',
            text: text,
            timestamp: Date.now()
          }
          setConversation(prev => [...prev, aiTurn])
          onAIResponse?.(text)
        }
      }
      
      client.onAudioResponse = (audioBlob: Blob) => {
        // Convert Blob to ArrayBuffer and play
        audioBlob.arrayBuffer().then(buffer => {
          playAudioResponse(buffer)
        })
      }
      
      // Connect to WebSocket
      await client.connect()
      liveClientRef.current = client
      
    } catch (error) {
      console.error('Failed to initialize Gemini Live:', error)
      setConnectionStatus('error')
    }
  }, [onAIResponse])

  // Start real-time conversation mode
  const startRealTimeMode = useCallback(async () => {
    setIsRealTimeActive(true)
    await initializeLiveClient()
    await startAudioAnalysis()
    
    // Add welcome message
    const welcomeTurn: ConversationTurn = {
      id: Date.now().toString(),
      type: 'ai',
      text: "Real-time conversation mode activated! I'm listening and ready to chat.",
      timestamp: Date.now()
    }
    
    setConversation([welcomeTurn])
    onConversationUpdate?.([welcomeTurn])
  }, [initializeLiveClient, startAudioAnalysis, onConversationUpdate])

  // Stop real-time mode
  const stopRealTimeMode = useCallback(() => {
    setIsRealTimeActive(false)
    
    // Stop audio processing
    if (audioProcessorRef.current) {
      audioProcessorRef.current.disconnect()
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    
    // Disconnect WebSocket
    if (liveClientRef.current) {
      liveClientRef.current.disconnect()
      liveClientRef.current = null
    }
    
    setConnectionStatus('disconnected')
  }, [])

  // Play AI audio response
  const playAudioResponse = useCallback((audioData: ArrayBuffer) => {
    try {
      setIsAudioPlaying(true)
      
      // Convert PCM audio to playable format
      const audioContext = new AudioContext()
      const audioBuffer = audioContext.createBuffer(1, audioData.byteLength / 2, 24000)
      const channelData = audioBuffer.getChannelData(0)
      const dataView = new DataView(audioData)
      
      for (let i = 0; i < channelData.length; i++) {
        channelData[i] = dataView.getInt16(i * 2, true) / 32768
      }
      
      const source = audioContext.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContext.destination)
      source.onended = () => setIsAudioPlaying(false)
      source.start()
      
    } catch (error) {
      console.error('Audio playback error:', error)
      setIsAudioPlaying(false)
    }
  }, [])

  // Auto-scroll conversation
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight
    }
  }, [conversation])

  // Update conversation when prop changes
  useEffect(() => {
    if (onConversationUpdate && conversation.length > 0) {
      onConversationUpdate(conversation)
    }
  }, [conversation, onConversationUpdate])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRealTimeMode()
    }
  }, [stopRealTimeMode])

  const getStateConfig = () => {
    if (isRealTimeActive) {
      return {
        title: isListening ? "Listening..." : "Real-time Chat Active",
        subtitle: isListening ? "Speak naturally" : "AI is ready to respond",
        icon: isListening ? Mic : Brain,
        iconColor: isListening ? "text-orange-500" : "text-blue-500",
        bgGlow: isListening ? "bg-orange-500/10" : "bg-blue-500/10",
        animate: isListening || isAudioPlaying
      }
    }

    switch (aiState) {
      case "listening":
        return {
          title: "Listening...",
          subtitle: "Speak clearly into your microphone",
          icon: Mic,
          iconColor: "text-orange-500",
          bgGlow: "bg-orange-500/10",
          animate: true
        }
      case "processing":
        return {
          title: "Processing...",
          subtitle: "AI is analyzing your voice input",
          icon: Sparkles,
          iconColor: "text-blue-500",
          bgGlow: "bg-blue-500/10",
          animate: true
        }
      case "speaking":
        return {
          title: "AI Speaking...",
          subtitle: "Listen to the AI response",
          icon: Volume2,
          iconColor: "text-green-500",
          bgGlow: "bg-green-500/10",
          animate: true
        }
      case "error":
        return {
          title: "Error",
          subtitle: "Voice input failed. Please try again.",
          icon: X,
          iconColor: "text-red-500",
          bgGlow: "bg-red-500/10",
          animate: false
        }
      default:
        return {
          title: "Ready",
          subtitle: "Click the microphone to start",
          icon: Mic,
          iconColor: "text-muted-foreground",
          bgGlow: "bg-muted/10",
          animate: false
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
          {/* Main Modal Card - Liquid Glass Design */}
          <div className={`glassmorphism border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl bg-white/10 dark:bg-black/20 overflow-hidden relative h-full ${config.animate ? 'shadow-orange-500/20 shadow-2xl' : ''}`}>
            {/* Glass Reflection Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none rounded-2xl" />
            <div className="relative z-10 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.bgGlow}`}>
                    <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white dark:text-white">{config.title}</h3>
                    <p className="text-sm text-white/70 dark:text-white/70">{config.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Real-time Mode Toggle */}
                  <button
                    onClick={isRealTimeActive ? stopRealTimeMode : startRealTimeMode}
                    className={`p-2 rounded-lg transition-colors ${
                      isRealTimeActive 
                        ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30' 
                        : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                    }`}
                    title={isRealTimeActive ? "Stop Real-time Mode" : "Start Real-time Mode"}
                  >
                    {isRealTimeActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
                  >
                    <X className="w-4 h-4 text-white/70 dark:text-white/70 hover:text-white" />
                  </button>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex">
                {/* Voice Visualization */}
                <div className="w-1/2 p-6 flex flex-col items-center justify-center border-r border-white/20 dark:border-white/10">
                  {/* Voice Trebles/Waveform */}
                  <div className="flex items-center justify-center gap-1 h-24 mb-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className={`w-2 rounded-full ${config.animate ? 'bg-orange-500' : 'bg-white/30 dark:bg-white/20'}`}
                        initial={{ height: 4 }}
                        animate={config.animate ? {
                          height: [4, (audioLevel * 60) + (Math.random() * 40) + 20, 4],
                          opacity: [0.3, 1, 0.3]
                        } : { height: 4 }}
                        transition={{
                          duration: 0.3 + Math.random() * 0.3,
                          repeat: config.animate ? Infinity : 0,
                          ease: "easeInOut",
                          delay: i * 0.05
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* State Icon */}
                  <div className={`p-4 rounded-full ${config.bgGlow} mb-4`}>
                    <IconComponent className={`w-8 h-8 ${config.iconColor}`} />
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
                        <div className="p-3 bg-white/10 dark:bg-white/5 rounded-lg border border-white/20 dark:border-white/10 backdrop-blur-sm">
                          <p className="text-xs text-white/70 dark:text-white/70 mb-1">Current:</p>
                          <p className="text-white dark:text-white text-sm">
                            {currentTranscription || "Start speaking..."}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Audio Level Indicator */}
                  {isRealTimeActive && (
                    <div className="mt-4 w-full">
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full transition-all duration-100"
                          style={{ width: `${audioLevel * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-white/70 text-center mt-1">Voice Level</p>
                    </div>
                  )}
                </div>

                {/* Conversation History */}
                <div className="w-1/2 flex flex-col">
                  <div className="p-4 border-b border-white/20 dark:border-white/10">
                    <h4 className="text-white font-medium flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Conversation
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
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-white/5 dark:bg-white/5 border-t border-white/20 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-white/60 dark:text-white/60">
                    {isRealTimeActive 
                      ? "Real-time conversation active - speak naturally" 
                      : "Click play button to start real-time mode"
                    }
                  </p>
                  {isAudioPlaying && (
                    <div className="flex items-center gap-2 text-green-400">
                      <Volume2 className="w-4 h-4 animate-pulse" />
                      <span className="text-xs">AI Speaking</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
