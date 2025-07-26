"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { X, Send, Mic, MicOff, Pause, Play, RotateCcw, Volume2, Radio, Bot, Type, Wifi, WifiOff } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useChatContext } from "@/app/chat/context/ChatProvider"
import { useToast } from "@/components/ui/use-toast"
import { useDemoSession } from '@/components/demo-session-manager'
import { WebRTCAudioProcessor, WebRTCAudioConfig } from "@/lib/webrtc-audio-processor"

interface WebRTCVoiceInputModalProps {
  isOpen: boolean
  onClose: () => void
  onTransferToChat: (fullTranscript: string) => void
  onVoiceResponse?: (responseData: { textContent: string; voiceStyle: string }) => void
  leadContext?: {
    name?: string
    company?: string
    role?: string
    interests?: string
  }
}

type RecordingState = "idle" | "connecting" | "listening" | "paused" | "processing" | "error" | "permission-denied"

export const WebRTCVoiceInputModal: React.FC<WebRTCVoiceInputModalProps> = ({ 
  isOpen, 
  onClose, 
  onTransferToChat,
  onVoiceResponse,
  leadContext 
}) => {
  const { addActivity } = useChatContext()
  const { sessionId: demoSessionId } = useDemoSession()
  
  const sessionId = demoSessionId || `session-${Date.now()}`
  const userId = useRef('anonymous').current
  const { toast } = useToast()
  
  const [recordingState, setRecordingState] = useState<RecordingState>("idle")
  const [currentTranscription, setCurrentTranscription] = useState("")
  const [finalTranscript, setFinalTranscript] = useState("")
  const [recordingTime, setRecordingTime] = useState(0)
  const [isSupported, setIsSupported] = useState(true)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'disconnected'>('disconnected')
  const [latency, setLatency] = useState<number>(0)
  
  const webrtcProcessorRef = useRef<WebRTCAudioProcessor | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioChunksRef = useRef<ArrayBuffer[]>([])

  // Check WebRTC support on mount
  useEffect(() => {
    if (!isOpen) return

    const checkWebRTCSupport = async () => {
      try {
        if (!WebRTCAudioProcessor.isSupported()) {
          setIsSupported(false)
          setRecordingState("error")
          toast({
            title: "WebRTC Not Supported",
            description: "Your browser doesn't support WebRTC for low-latency audio.",
            variant: "destructive"
          })
          return
        }

        // Initialize WebRTC processor
        const config = WebRTCAudioProcessor.getOptimalConfig('conversation')
        webrtcProcessorRef.current = new WebRTCAudioProcessor(config)
        
        // Set up event handlers
        webrtcProcessorRef.current.onConnectionStateChanged((state) => {
          console.log('WebRTC connection state changed:', state)
          if (state === 'connected') {
            setConnectionQuality('excellent')
            setRecordingState("idle")
          } else if (state === 'connecting') {
            setConnectionQuality('good')
            setRecordingState("connecting")
          } else {
            setConnectionQuality('disconnected')
            setRecordingState("error")
          }
        })

        webrtcProcessorRef.current.onAudioDataReceived((data) => {
          // Handle incoming audio data
          audioChunksRef.current.push(data)
          processAudioChunks()
        })

        await webrtcProcessorRef.current.initialize()
        setIsSupported(true)
        setRecordingState("idle")
        
        console.log("✅ WebRTC voice input initialized")
      } catch (error) {
        console.error("❌ Failed to initialize WebRTC:", error)
        setIsSupported(false)
        setRecordingState("error")
        toast({
          title: "Initialization Failed",
          description: "Failed to initialize WebRTC audio processor.",
          variant: "destructive"
        })
      }
    }

    checkWebRTCSupport()

    return () => {
      cleanupWebRTC()
    }
  }, [isOpen, toast])

  const cleanupWebRTC = async () => {
    try {
      if (webrtcProcessorRef.current) {
        await webrtcProcessorRef.current.cleanup()
        webrtcProcessorRef.current = null
      }
    } catch (error) {
      console.error("Error during WebRTC cleanup:", error)
    }
  }

  const processAudioChunks = useCallback(async () => {
    if (audioChunksRef.current.length === 0) return

    try {
      // Combine audio chunks
      const totalLength = audioChunksRef.current.reduce((acc, chunk) => acc + chunk.byteLength, 0)
      const combinedBuffer = new ArrayBuffer(totalLength)
      const combinedView = new Uint8Array(combinedBuffer)
      
      let offset = 0
      for (const chunk of audioChunksRef.current) {
        combinedView.set(new Uint8Array(chunk), offset)
        offset += chunk.byteLength
      }

      // Send to server for processing
      const response = await fetch('/api/gemini-live', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-correlation-id': `webrtc-${Date.now()}`,
          'x-demo-session-id': sessionId,
          'x-user-id': userId
        },
        body: JSON.stringify({
          prompt: "Process this audio input",
          enableTTS: false,
          streamAudio: false,
          audioData: btoa(String.fromCharCode(...new Uint8Array(combinedBuffer))),
          useWebRTC: true
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.text) {
          setCurrentTranscription(result.text)
        }
      }

      // Clear processed chunks
      audioChunksRef.current = []
    } catch (error) {
      console.error("Error processing audio chunks:", error)
    }
  }, [sessionId, userId])

  const startRecording = async () => {
    try {
      if (!webrtcProcessorRef.current) {
        throw new Error("WebRTC processor not initialized")
      }

      setRecordingState("connecting")
      
      // Start audio capture
      const stream = await webrtcProcessorRef.current.startAudioCapture()
      setPermissionGranted(true)
      
      // Create WebRTC offer
      const offer = await webrtcProcessorRef.current.createOffer()
      
      // Send offer to server (you'll need to implement this endpoint)
      const response = await fetch('/api/webrtc-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
          'x-user-id': userId
        },
        body: JSON.stringify({
          offer,
          sessionId,
          userId,
          leadContext
        })
      })

      if (response.ok) {
        const { answer, iceCandidates } = await response.json()
        
        // Set remote description
        await webrtcProcessorRef.current.setRemoteDescription(answer)
        
        // Add ICE candidates
        for (const candidate of iceCandidates) {
          await webrtcProcessorRef.current.addIceCandidate(candidate)
        }
        
        setRecordingState("listening")
        startTimer()
        
        toast({
          title: "WebRTC Connected",
          description: "Ultra-low latency audio connection established.",
        })
      } else {
        throw new Error("Failed to establish WebRTC connection")
      }
    } catch (error) {
      console.error("Failed to start recording:", error)
      setRecordingState("error")
      toast({
        title: "Recording Failed",
        description: "Failed to start WebRTC audio recording.",
        variant: "destructive"
      })
    }
  }

  const stopRecording = async () => {
    try {
      setRecordingState("processing")
      stopTimer()
      
      // Process final audio chunks
      await processAudioChunks()
      
      // Finalize transcript
      const finalText = currentTranscription || "No speech detected"
      setFinalTranscript(finalText)
      
      // Log activity
      addActivity({
        type: 'voice_input',
        title: 'WebRTC Voice Input',
        description: `Voice input via WebRTC: ${finalText.substring(0, 100)}...`,
        metadata: {
          sessionId,
          userId,
          latency,
          connectionQuality,
          recordingTime,
          leadContext
        }
      })
      
      setRecordingState("idle")
      setCurrentTranscription("")
      setRecordingTime(0)
      
    } catch (error) {
      console.error("Error stopping recording:", error)
      setRecordingState("error")
    }
  }

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1)
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getConnectionQualityColor = () => {
    switch (connectionQuality) {
      case 'excellent': return 'text-green-500'
      case 'good': return 'text-yellow-500'
      case 'poor': return 'text-orange-500'
      case 'disconnected': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getConnectionQualityIcon = () => {
    switch (connectionQuality) {
      case 'excellent':
      case 'good':
        return <Wifi className="w-4 h-4" />
      case 'poor':
      case 'disconnected':
        return <WifiOff className="w-4 h-4" />
      default:
        return <WifiOff className="w-4 h-4" />
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-2xl mx-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-blue-500" />
                  WebRTC Voice Input
                  <Badge variant="outline" className={cn("ml-2", getConnectionQualityColor())}>
                    {getConnectionQualityIcon()}
                    {connectionQuality}
                  </Badge>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {latency > 0 && (
                <div className="text-sm text-muted-foreground">
                  Latency: {latency}ms • Quality: {connectionQuality}
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Voice Input Area */}
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <motion.div
                    className={cn(
                      "relative w-32 h-32 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300",
                      recordingState === "listening" && "bg-green-500 shadow-lg shadow-green-500/50",
                      recordingState === "connecting" && "bg-yellow-500 shadow-lg shadow-yellow-500/50",
                      recordingState === "processing" && "bg-blue-500 shadow-lg shadow-blue-500/50",
                      recordingState === "error" && "bg-red-500 shadow-lg shadow-red-500/50",
                      recordingState === "idle" && "bg-gray-100 hover:bg-gray-200"
                    )}
                    animate={{
                      scale: recordingState === "listening" ? [1, 1.05, 1] : 1,
                      rotate: recordingState === "processing" ? 360 : 0
                    }}
                    transition={{
                      scale: { duration: 1, repeat: recordingState === "listening" ? Infinity : 0 },
                      rotate: { duration: 2, repeat: recordingState === "processing" ? Infinity : 0, ease: "linear" }
                    }}
                    onClick={recordingState === "idle" ? startRecording : stopRecording}
                  >
                    {recordingState === "listening" && (
                      <motion.div className="flex items-center gap-1">
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-2 bg-white rounded-full"
                            animate={{ height: [8, 20, 8] }}
                            transition={{
                              duration: 0.6 + Math.random() * 0.4,
                              repeat: Infinity,
                              repeatType: "reverse",
                              delay: i * 0.1,
                            }}
                          />
                        ))}
                      </motion.div>
                    )}
                    
                    {recordingState === "connecting" && (
                      <motion.div
                        className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                    
                    {recordingState === "processing" && (
                      <Bot className="w-8 h-8 text-white" />
                    )}
                    
                    {recordingState === "error" && (
                      <MicOff className="w-8 h-8 text-white" />
                    )}
                    
                    {recordingState === "idle" && (
                      <Mic className="w-8 h-8 text-gray-600" />
                    )}
                  </motion.div>
                </div>

                <div className="text-center space-y-2">
                  <div className="text-lg font-medium">
                    {recordingState === "idle" && "Click to start WebRTC recording"}
                    {recordingState === "connecting" && "Establishing connection..."}
                    {recordingState === "listening" && "Listening with ultra-low latency"}
                    {recordingState === "processing" && "Processing audio..."}
                    {recordingState === "error" && "Connection error"}
                  </div>
                  
                  {recordingTime > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Recording time: {formatTime(recordingTime)}
                    </div>
                  )}
                </div>
              </div>

              {/* Live Transcription */}
              {currentTranscription && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Live Transcription</div>
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    {currentTranscription}
                  </div>
                </div>
              )}

              {/* Final Transcript */}
              {finalTranscript && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Final Transcript</div>
                  <Textarea
                    value={finalTranscript}
                    onChange={(e) => setFinalTranscript(e.target.value)}
                    placeholder="Your speech will appear here..."
                    className="min-h-[100px]"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentTranscription("")
                      setFinalTranscript("")
                      setRecordingTime(0)
                    }}
                    disabled={recordingState === "listening"}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRecordingState("idle")
                      setCurrentTranscription("")
                      setFinalTranscript("")
                    }}
                    disabled={recordingState === "listening"}
                  >
                    <Type className="w-4 h-4 mr-2" />
                    Text Input
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={recordingState === "listening"}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    onClick={() => {
                      onTransferToChat(finalTranscript || currentTranscription)
                      onClose()
                    }}
                    disabled={!finalTranscript && !currentTranscription}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send to Chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}