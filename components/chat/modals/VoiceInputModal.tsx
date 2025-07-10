"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { X, Send, Mic, MicOff, Pause, Play, RotateCcw, Volume2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useChatContext } from "@/app/chat/context/ChatProvider"
import { useToast } from "@/components/ui/use-toast"

interface VoiceInputModalProps {
  isOpen: boolean
  onClose: () => void
  onTransferToChat: (fullTranscript: string) => void
}

type RecordingState = "idle" | "listening" | "paused" | "processing" | "error"

// Enhanced Voice Recording Orb
function VoiceRecordingOrb({ 
  state, 
  onClick,
  recordingTime = 0
}: { 
  state: RecordingState
  onClick: () => void
  recordingTime?: number
}) {
  const getOrbColor = () => {
    switch (state) {
      case "listening":
        return "from-red-400 via-red-500 to-red-600"
      case "paused":
        return "from-amber-400 via-amber-500 to-amber-600"
      case "processing":
        return "from-blue-400 via-blue-500 to-blue-600"
      case "error":
        return "from-red-500 via-red-600 to-red-700"
      default:
        return "from-slate-400 via-slate-500 to-slate-600"
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="relative">
      {/* Pulse ring for recording */}
      {state === "listening" && (
        <motion.div
          className="absolute inset-0 w-40 h-40 rounded-full border-2 border-red-400/30"
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      
      {/* Recording time ring */}
      <svg className="absolute inset-0 w-40 h-40 -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
          fill="none"
        />
        {state === "listening" && recordingTime > 0 && (
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="rgba(239, 68, 68, 0.8)"
            strokeWidth="2"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - (recordingTime % 60) / 60)}`}
            className="transition-all duration-1000 ease-linear"
          />
        )}
      </svg>

      {/* Main orb */}
      <motion.div
        className={cn(
          "relative w-40 h-40 rounded-full bg-gradient-to-r shadow-2xl cursor-pointer backdrop-blur-sm border-2",
          getOrbColor(),
          state === "listening" ? "border-red-400/50" : "border-white/20"
        )}
        animate={{ 
          scale: state === "listening" ? [1, 1.02, 1] : 1,
          boxShadow: state === "listening" 
            ? ["0 0 0 0 rgba(239, 68, 68, 0.4)", "0 0 0 20px rgba(239, 68, 68, 0)", "0 0 0 0 rgba(239, 68, 68, 0.4)"]
            : "0 10px 25px rgba(0, 0, 0, 0.3)"
        }}
        transition={{ 
          scale: { duration: 1.5, repeat: state === "listening" ? Infinity : 0, ease: "easeInOut" },
          boxShadow: { duration: 2, repeat: state === "listening" ? Infinity : 0, ease: "easeOut" }
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
      >
        {/* Recording time display */}
        {state === "listening" && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <Badge variant="outline" className="bg-red-500/20 text-red-200 border-red-500/30">
              {formatTime(recordingTime)}
            </Badge>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center">
          {state === "listening" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              {[...Array(7)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-white/90 rounded-full"
                  animate={{ height: [10, Math.random() * 30 + 15, 10] }}
                  transition={{
                    duration: 0.5 + Math.random() * 0.4,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    delay: i * 0.1,
                  }}
                />
              ))}
            </motion.div>
          )}
          
          {state === "idle" && (
            <Mic className="w-12 h-12 text-white/90" />
          )}
          
          {state === "paused" && (
            <Play className="w-12 h-12 text-white/90" />
          )}
          
          {state === "processing" && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Volume2 className="w-12 h-12 text-white/90" />
            </motion.div>
          )}
          
          {state === "error" && (
            <MicOff className="w-12 h-12 text-white/90" />
          )}
        </div>
      </motion.div>
    </div>
  )
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({ 
  isOpen, 
  onClose, 
  onTransferToChat 
}) => {
  const { addActivity } = useChatContext()
  const { toast } = useToast()
  
  const [recordingState, setRecordingState] = useState<RecordingState>("idle")
  const [currentTranscription, setCurrentTranscription] = useState("")
  const [finalTranscript, setFinalTranscript] = useState("")
  const [recordingTime, setRecordingTime] = useState(0)
  const [isSupported, setIsSupported] = useState(true)
  
  const recognitionRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

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

  // Initialize speech recognition
  useEffect(() => {
    if (!isOpen) return

    // TypeScript declarations for Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setIsSupported(false)
      setRecordingState("error")
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support voice recognition. Please try Chrome or Edge.",
        variant: "destructive"
      })
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
      setRecordingState("error")
      
      const errorMessages: Record<string, string> = {
        'network': 'Network error. Please check your connection.',
        'not-allowed': 'Microphone access denied. Please allow microphone access.',
        'no-speech': 'No speech detected. Please try speaking closer to the microphone.',
        'audio-capture': 'Microphone not found. Please check your microphone.',
        'service-not-allowed': 'Speech service not allowed.',
      }
      
      toast({
        title: "Voice Recognition Error",
        description: errorMessages[event.error] || "An error occurred with voice recognition.",
        variant: "destructive"
      })
    }

    recognition.onend = () => {
      if (recordingState === "listening") {
        setRecordingState("idle")
      }
    }

    recognitionRef.current = recognition
    setIsSupported(true)

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
    }
  }, [isOpen, toast, addActivity, recordingState])

  const startRecording = useCallback(() => {
    if (recognitionRef.current && isSupported) {
      setFinalTranscript("")
      setCurrentTranscription("")
      setRecordingTime(0)
      recognitionRef.current.start()
    }
  }, [isSupported])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setRecordingState("processing")
      
      setTimeout(() => {
        setRecordingState("idle")
      }, 1000)
    }
  }, [])

  const pauseRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setRecordingState("paused")
    }
  }, [])

  const resumeRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.start()
    }
  }, [])

  const handleOrbClick = useCallback(() => {
    if (!isSupported) return

    switch (recordingState) {
      case "idle":
        startRecording()
        break
      case "listening":
        pauseRecording()
        break
      case "paused":
        resumeRecording()
        break
      default:
        break
    }
  }, [recordingState, isSupported, startRecording, pauseRecording, resumeRecording])

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
    const fullTranscript = (finalTranscript + currentTranscription).trim()
    if (fullTranscript) {
      onTransferToChat(fullTranscript)
      addActivity({
        type: "voice_input",
        title: "Voice Message Sent",
        description: `Sent voice message: "${fullTranscript.slice(0, 50)}${fullTranscript.length > 50 ? '...' : ''}"`,
        status: "completed"
      })
      
      toast({
        title: "Voice Message Sent",
        description: "Your voice message has been sent to the chat."
      })
    }
    handleClose()
  }, [finalTranscript, currentTranscription, onTransferToChat, addActivity, toast])

  const handleClose = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setRecordingState("idle")
    setFinalTranscript("")
    setCurrentTranscription("")
    setRecordingTime(0)
    onClose()
  }, [onClose])

  const getStateMessage = () => {
    switch (recordingState) {
      case "listening":
        return "Listening... Tap to pause"
      case "paused":
        return "Paused. Tap to resume"
      case "processing":
        return "Processing your voice..."
      case "error":
        return "Error occurred. Please try again"
      default:
        return "Ready to record. Tap the microphone to start"
    }
  }

  const fullTranscript = finalTranscript + currentTranscription

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

          {/* Main content */}
          <div className="flex flex-col items-center space-y-8 w-full">
            {/* Voice Recording Orb */}
            <VoiceRecordingOrb 
              state={recordingState} 
              onClick={handleOrbClick}
              recordingTime={recordingTime}
            />

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
                    recordingState === "paused" && "bg-amber-500/20 text-amber-200 border-amber-500/30",
                    recordingState === "processing" && "bg-blue-500/20 text-blue-200 border-blue-500/30",
                    recordingState === "error" && "bg-red-600/20 text-red-200 border-red-600/30",
                    recordingState === "idle" && "bg-white/10 text-white"
                  )}
                >
                  {recordingState === "listening" && "Recording"}
                  {recordingState === "paused" && "Paused"}
                  {recordingState === "processing" && "Processing"}
                  {recordingState === "error" && "Error"}
                  {recordingState === "idle" && "Ready"}
                </Badge>
                
                {isSupported && (
                  <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                    {recordingTime > 0 && `${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}`}
                    {recordingTime === 0 && "00:00"}
                  </Badge>
                )}
              </div>
              
              <p className="text-white/80 text-lg">
                {getStateMessage()}
              </p>
            </div>

            {/* Transcript Display */}
            <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg flex items-center justify-between">
                  Transcript
                  {fullTranscript && (
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
                <div className="min-h-[120px] max-h-[200px] overflow-y-auto">
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
                      {recordingState === "error" ? (
                        "Voice recognition error occurred"
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
              {recordingState !== "error" && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleOrbClick}
                    disabled={!isSupported}
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    {recordingState === "listening" && <Pause className="w-4 h-4 mr-2" />}
                    {recordingState === "paused" && <Play className="w-4 h-4 mr-2" />}
                    {recordingState === "idle" && <Mic className="w-4 h-4 mr-2" />}
                    {recordingState === "processing" && <Volume2 className="w-4 h-4 mr-2" />}
                    
                    {recordingState === "listening" && "Pause"}
                    {recordingState === "paused" && "Resume"}
                    {recordingState === "idle" && "Start Recording"}
                    {recordingState === "processing" && "Processing..."}
                  </Button>

                  <Button
                    onClick={handleSendToChat}
                    disabled={!fullTranscript.trim() || recordingState === "processing"}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send to Chat
                  </Button>
                </>
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
            {!isSupported && (
              <Card className="bg-red-500/20 border-red-500/30 max-w-md">
                <CardContent className="p-4 text-center">
                  <p className="text-red-200 text-sm">
                    Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari for voice input.
                  </p>
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
