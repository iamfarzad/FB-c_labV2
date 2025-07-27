"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { X, Send, Mic, MicOff, Pause, Play, RotateCcw, Volume2, Radio, Bot, Type } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useChatContext } from "@/app/(chat)/chat/context/ChatProvider"
import { useToast } from "@/components/ui/use-toast"
import { useGeminiLiveAudio } from "@/hooks/useGeminiLiveAudio"
import { useDemoSession } from '@/components/demo-session-manager'

interface VoiceInputModalProps {
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

type RecordingState = "idle" | "listening" | "paused" | "processing" | "error" | "permission-denied"

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({ 
  isOpen, 
  onClose, 
  onTransferToChat,
  onVoiceResponse,
  leadContext 
}) => {
  const { addActivity } = useChatContext()
  const { sessionId: demoSessionId } = useDemoSession()
  
  // Use demo session ID or generate fallback
  const sessionId = demoSessionId || `session-${Date.now()}`
  const userId = useRef('anonymous').current
  const { toast } = useToast()
  
  const [recordingState, setRecordingState] = useState<RecordingState>("idle")
  const [currentTranscription, setCurrentTranscription] = useState("")
  const [finalTranscript, setFinalTranscript] = useState("")
  const [recordingTime, setRecordingTime] = useState(0)
  const [isSupported, setIsSupported] = useState(true)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [liveStatus, setLiveStatus] = useState<string>('disconnected')
  
  const recognitionRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Gemini Live Audio integration
  const { isConnected, isStreaming, error: liveError, connect, sendStream, cleanup: cleanupLive } = useGeminiLiveAudio({
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY!,
    onStatusChange: status => setLiveStatus(status),
    sessionId: sessionId || `session-${Date.now()}`,
    userId: userId || 'anonymous'
  })

  // Check microphone permissions on mount and auto-connect to Gemini Live
  useEffect(() => {
    if (!isOpen) return

    const checkMicrophonePermission = async () => {
      try {
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setIsSupported(false)
          setRecordingState("error")
          return
        }

        // Check if we're in a secure context
        if (!window.isSecureContext) {
          setIsSupported(false)
          setRecordingState("error")
          toast({
            title: "HTTPS Required",
            description: "Voice recognition requires a secure connection (HTTPS).",
            variant: "destructive"
          })
          return
        }

        // Request microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        setPermissionGranted(true)
        setRecordingState("idle")
        
        // Stop the stream immediately after permission check
        stream.getTracks().forEach(track => track.stop())
        
        // Initialize speech recognition
        initializeSpeechRecognition()
        
      } catch (error: any) {
        console.error("Microphone permission error:", error)
        setPermissionGranted(false)
        
        if (error.name === 'NotAllowedError') {
          setRecordingState("permission-denied")
          toast({
            title: "Microphone Access Denied",
            description: "Please allow microphone access in your browser settings and refresh the page.",
            variant: "destructive"
          })
        } else if (error.name === 'NotFoundError') {
          setRecordingState("error")
          toast({
            title: "No Microphone Found",
            description: "Please connect a microphone and try again.",
            variant: "destructive"
          })
        } else {
          setRecordingState("error")
          toast({
            title: "Microphone Error",
            description: "Unable to access microphone. Please check your settings.",
            variant: "destructive"
          })
        }
      }
    }

    checkMicrophonePermission()
    
    // Auto-connect to Gemini Live when modal opens
    connect().catch(err => {
      console.error("Failed to auto-connect Gemini Live:", err)
    })
  }, [isOpen, toast, connect])

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setIsSupported(false)
      setRecordingState("error")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setRecordingState("listening")
      addActivity({
        type: "voice_input",
        title: "Voice Recording Started",
        description: "Started listening for voice input",
        status: "in_progress"
      })
    }

    recognition.onresult = (event: any) => {
      let interimTranscript = ""
      let finalText = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalText += transcript + " "
        } else {
          interimTranscript += transcript
        }
      }

      if (finalText) {
        setFinalTranscript(prev => prev + finalText)
      }
      setCurrentTranscription(interimTranscript)
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      
      let errorMessage = "Voice recognition error occurred"
      
      if (event.error === "not-allowed") {
        setRecordingState("permission-denied")
        errorMessage = "Microphone access denied. Please allow microphone access in your browser settings."
      } else if (event.error === "no-speech") {
        setRecordingState("idle")
        errorMessage = "No speech detected. Please try speaking again."
      } else if (event.error === "audio-capture") {
        setRecordingState("error")
        errorMessage = "No microphone found. Please connect a microphone and try again."
      } else {
        setRecordingState("error")
        errorMessage = "Voice recognition error occurred. Please try again."
      }
      
      toast({
        title: "Voice Recognition Error",
        description: errorMessage,
        variant: "destructive"
      })
      
      addActivity({
        type: "error",
        title: "Voice Recognition Failed",
        description: errorMessage,
        status: "failed"
      })
    }

    recognition.onend = () => {
      if (recordingState === "listening") {
        setRecordingState("idle")
      }
    }

    recognitionRef.current = recognition
  }

  // Timer for recording time
  useEffect(() => {
    if (recordingState === "listening") {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [recordingState])

  // Audio streaming for Gemini Live
  const startAudioStreaming = useCallback(async () => {
    if (!isConnected || !sendStream) return
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const chunks: Blob[] = []
      
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
          // Convert blob to ArrayBuffer and send to Gemini Live
          try {
            const buffer = await event.data.arrayBuffer()
            if (sendStream) {
              await sendStream(buffer)
            }
          } catch (error) {
            console.error('Failed to send audio chunk:', error)
          }
        }
      }
      
      mediaRecorder.start(100) // Send chunks every 100ms
      
      // Store for cleanup
      (window as any).currentMediaRecorder = mediaRecorder
      (window as any).currentAudioStream = stream
      
    } catch (error) {
      console.error('Failed to start audio streaming:', error)
    }
  }, [isConnected, sendStream])

  const stopAudioStreaming = useCallback(() => {
    const mediaRecorder = (window as any).currentMediaRecorder as MediaRecorder | null
    const stream = (window as any).currentAudioStream as MediaStream | null
    
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
    }
    
    if (stream) {
      stream.getTracks().forEach((track: MediaStreamTrack) => track.stop())
    }
    
    (window as any).currentMediaRecorder = null
    (window as any).currentAudioStream = null
  }, [])

  const startRecording = useCallback(() => {
    if (recognitionRef.current && isSupported && permissionGranted) {
      setFinalTranscript("")
      setCurrentTranscription("")
      setRecordingTime(0)
      recognitionRef.current.start()
      
      // Ensure we're connected before streaming
      if (!isConnected) {
        connect()
          .then(() => startAudioStreaming())
          .catch(err => console.error("Live connect failed:", err))
      } else {
        startAudioStreaming()
      }
    }
  }, [isSupported, permissionGranted, isConnected, connect, startAudioStreaming])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setRecordingState("processing")
      
      // Stop audio streaming if connected to Gemini Live
      if (isConnected) {
        stopAudioStreaming()
      }
      
      setTimeout(() => {
        setRecordingState("idle")
      }, 1000)
    }
  }, [isConnected, stopAudioStreaming])

  const handleOrbClick = useCallback(() => {
    if (!isSupported || !permissionGranted) return

    switch (recordingState) {
      case "idle":
        startRecording()
        break
      case "listening":
        stopRecording()
        break
      default:
        break
    }
  }, [recordingState, isSupported, permissionGranted, startRecording, stopRecording])

  const clearTranscript = useCallback(() => {
    setFinalTranscript("")
    setCurrentTranscription("")
    setRecordingTime(0)
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setRecordingState("idle")
  }, [])

  const handleSendToChat = useCallback(() => {
    const messageContent = (finalTranscript + currentTranscription).trim()
    
    if (messageContent) {
      // Handle as regular voice input
      onTransferToChat(messageContent)
      addActivity({
        type: "voice_input",
        title: "Message Sent",
        description: `Sent message: "${messageContent.slice(0, 50)}${messageContent.length > 50 ? '...' : ''}"`,
        status: "completed"
      })
      
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the chat."
      })
      handleClose()
    }
  }, [finalTranscript, currentTranscription, onTransferToChat, addActivity, toast])



  const playGeminiTTS = async (text: string) => {
    try {
      const res = await fetch('/api/gemini-live', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(sessionId && { 'x-demo-session-id': sessionId })
        },
        body: JSON.stringify({
          prompt: text,
          enableTTS: true,
          voiceName: 'Puck',
          streamAudio: false
        })
      })
      
      if (!res.ok) {
        throw new Error(`TTS fetch failed: ${res.status}`)
      }
      
      const contentType = res.headers.get('content-type')
      
      if (contentType?.includes('audio/wav')) {
        const audioBlob = await res.blob()
        const url = URL.createObjectURL(audioBlob)
        const audio = new Audio(url)
        
        await audio.play()
        
        audio.onended = () => {
          URL.revokeObjectURL(url)
        }
      } else {
        const ttsData = await res.json()
        
        if (ttsData.success && ttsData.audioData) {
          const base64Data = ttsData.audioData.replace('data:audio/wav;base64,', '')
          const binaryString = atob(base64Data)
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }
          const blob = new Blob([bytes], { type: 'audio/wav' })
          
          const url = URL.createObjectURL(blob)
          const audio = new Audio(url)
          
          await audio.play()
          
          audio.onended = () => {
            URL.revokeObjectURL(url)
          }
        }
      }
    } catch (error) {
      console.error('TTS Error:', error)
      throw error
    }
  }

  const handleClose = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setRecordingState("idle")
    setFinalTranscript("")
    setCurrentTranscription("")
    setRecordingTime(0)
    stopAudioStreaming() // Stop audio streaming
    cleanupLive() // Cleanup Gemini Live session
    onClose()
  }, [onClose, cleanupLive, stopAudioStreaming])

  const getStateMessage = () => {
    switch (recordingState) {
      case "listening":
        return "Listening... Tap to stop"
      case "paused":
        return "Paused. Tap to resume"
      case "processing":
        return "Processing your voice..."
      case "permission-denied":
        return "Microphone access denied. Please allow access."
      case "error":
        return "Voice recognition error. Please try again."
      default:
        return "Ready to record. Tap the microphone to start"
    }
  }

  const fullTranscript = finalTranscript + currentTranscription
  const hasContent = fullTranscript.trim()

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-md"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full h-full flex flex-col items-center justify-center p-6 relative max-w-4xl mx-auto"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute top-6 right-6 rounded-full bg-white/10 hover:bg-white/20 text-white border-0"
          >
            <X className="w-5 h-5" />
          </Button>



          {/* Live AI Voice Controls */}
          <div className="absolute top-6 right-20 flex gap-2">
            <Button
              variant={isConnected ? "default" : "outline"}
              size="sm"
              onClick={() => isConnected ? cleanupLive() : connect()}
              disabled={!isSupported || !permissionGranted}
              className={cn(
                "bg-white/10 border-white/20 text-white hover:bg-white/20",
                isConnected && "bg-green-600/20 text-green-200 border-green-500/30",
                (!isSupported || !permissionGranted) && "opacity-50 cursor-not-allowed"
              )}
            >
              <Radio className="w-4 h-4 mr-2" />
              {isConnected ? "Stop Live AI" : "Start Live AI Voice"}
            </Button>
          </div>

          {/* Live AI Status Display */}
          {isConnected && (
            <div className="absolute top-16 right-6 flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={cn(
                  "border-white/20",
                  isStreaming && "bg-blue-500/20 text-blue-200 border-blue-500/30",
                  liveStatus === "playing" && "bg-green-500/20 text-green-200 border-green-500/30",
                  liveStatus === "error" && "bg-red-500/20 text-red-200 border-red-500/30",
                  !isStreaming && liveStatus === "connected" && "bg-white/10 text-white"
                )}
              >
                {isStreaming ? "Streaming" : liveStatus === "playing" ? "AI Speaking" : liveStatus === "error" ? "Error" : "Connected"}
              </Badge>
            </div>
          )}

          {/* Live AI Error Display */}
          {liveError && (
            <div className="absolute top-24 right-6 max-w-xs">
              <Card className="bg-red-500/20 border-red-500/30">
                <CardContent className="p-2 text-center">
                  <p className="text-red-200 text-xs">
                    {liveError}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main content */}
          <div className="flex flex-col items-center space-y-8 w-full">
            {/* Voice Recording Orb */}
            <motion.div
              className={cn(
                "relative w-40 h-40 rounded-full bg-gradient-to-br shadow-2xl backdrop-blur-sm border border-white/20 cursor-pointer",
                recordingState === "listening" ? "from-red-400 via-red-500 to-red-600" : "from-slate-400 via-slate-500 to-slate-600",
                (!isSupported || !permissionGranted) && "opacity-50 cursor-not-allowed"
              )}
              animate={{ 
                scale: recordingState === "listening" ? [1, 1.05, 1] : 1,
              }}
              transition={{ 
                scale: { duration: 1, repeat: recordingState === "listening" ? Infinity : 0, ease: "easeInOut" }
              }}
              whileHover={{ scale: (isSupported && permissionGranted) ? 1.05 : 1 }}
              whileTap={{ scale: (isSupported && permissionGranted) ? 0.95 : 1 }}
              onClick={handleOrbClick}
            >
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Mic className="w-12 h-12 text-white" />
              </div>
              {recordingTime > 0 && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                  <span className="text-sm text-muted-foreground font-mono">
                    {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Status and Info */}
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-white">
                Voice Input
              </h2>
              
              <div className="flex items-center justify-center gap-4 text-white/70">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "border-white/20",
                    recordingState === "listening" && "bg-red-500/20 text-red-200 border-red-500/30",
                    recordingState === "processing" && "bg-blue-500/20 text-blue-200 border-blue-500/30",
                    recordingState === "error" && "bg-red-600/20 text-red-200 border-red-600/30",
                    recordingState === "permission-denied" && "bg-orange-600/20 text-orange-200 border-orange-600/30",
                    recordingState === "idle" && "bg-white/10 text-white"
                  )}
                >
                  {recordingState === "listening" && "Recording"}
                  {recordingState === "processing" && "Processing"}
                  {recordingState === "error" && "Error"}
                  {recordingState === "permission-denied" && "Access Denied"}
                  {recordingState === "idle" && "Ready"}
                </Badge>
                
                {recordingTime > 0 && (
                  <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                    {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                  </Badge>
                )}
              </div>
              
              <p className="text-white/80 text-lg">
                {getStateMessage()}
              </p>
            </div>

            {/* Input/Transcript Display */}
            <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg flex items-center justify-between">
                  Transcript
                  {hasContent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearTranscript}
                      className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="min-h-[120px] max-h-[300px] overflow-y-auto space-y-2">
                  {fullTranscript ? (
                    <div className="space-y-2">
                      {finalTranscript && (
                        <p className="text-white/90 leading-relaxed">
                          {finalTranscript}
                        </p>
                      )}
                      {currentTranscription && (
                        <p className="text-white/60 leading-relaxed italic">
                          {currentTranscription}
                          {recordingState === "listening" && (
                            <motion.span
                              animate={{ opacity: [1, 0] }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="ml-1"
                            >
                              |
                            </motion.span>
                          )}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-white/50">
                      {recordingState === "error" || recordingState === "permission-denied" ? (
                        "Microphone access required"
                      ) : (
                        "Your speech will appear here..."
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Control Buttons */}
            <div className="flex items-center gap-4">
              {hasContent && (
                <Button
                  onClick={handleSendToChat}
                  disabled={recordingState === "processing"}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send to Chat
                </Button>
              )}

              {recordingState === "permission-denied" && (
                <Button
                  onClick={() => {
                    setRecordingState("idle")
                    startRecording()
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}

              {recordingState === "error" && (
                <Button
                  onClick={() => {
                    setRecordingState("idle")
                    startRecording()
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
            </div>

            {/* Error Message */}
            {(!isSupported || recordingState === "error" || recordingState === "permission-denied") && (
              <Card className="bg-red-500/20 border-red-500/30 max-w-md">
                <CardContent className="p-4 text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MicOff className="w-5 h-5 text-red-400" />
                    <h3 className="text-red-200 font-semibold">
                      {!isSupported ? "Voice Input Not Supported" : 
                       recordingState === "permission-denied" ? "Microphone Access Denied" : 
                       "Voice Recognition Error"}
                    </h3>
                  </div>
                  
                  <p className="text-red-200 text-sm">
                    {!isSupported 
                      ? "Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari for voice input."
                      : recordingState === "permission-denied"
                      ? "We couldn't access your microphone. Please allow microphone access in your browser settings."
                      : "We couldn't access your microphone. This might be due to browser permissions or security settings."
                    }
                  </p>
                  
                  <div className="text-xs text-red-300/80 space-y-1 pt-2 border-t border-red-500/30">
                    <p>• Check browser microphone permissions</p>
                    <p>• Ensure you're using HTTPS</p>
                    <p>• Try refreshing the page</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default VoiceInputModal
