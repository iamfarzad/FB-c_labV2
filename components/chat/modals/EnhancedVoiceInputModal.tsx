"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { X, Send, Mic, MicOff, Pause, Play, RotateCcw, Volume2, Radio, Bot } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useChatContext } from "@/app/(chat)/chat/context/ChatProvider"
import { useToast } from "@/components/ui/use-toast"
import { useMediaCapture, useMediaPlayer } from "@/hooks"

interface EnhancedVoiceInputModalProps {
  isOpen: boolean
  onClose: () => void
  onTransferToChat: (fullTranscript: string) => void
  leadContext?: {
    name?: string
    company?: string
    role?: string
    interests?: string
  }
}

type VoiceMode = "input" | "conversation"
type RecordingState = "idle" | "listening" | "paused" | "processing" | "error"

// Enhanced Voice Recording Orb using MediaService
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
          stroke="hsl(0 0% 100% / 0.1)"
          strokeWidth="1"
          fill="none"
        />
        {state === "listening" && recordingTime > 0 && (
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="hsl(0 84% 60% / 0.8)"
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
          "w-40 h-40 rounded-full bg-gradient-to-br cursor-pointer flex items-center justify-center shadow-2xl",
          getOrbColor()
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
      >
        <div className="text-white text-center">
          {state === "listening" ? (
            <MicOff className="w-8 h-8 mx-auto mb-2" />
          ) : state === "paused" ? (
            <Play className="w-8 h-8 mx-auto mb-2" />
          ) : state === "processing" ? (
            <motion.div
              className="w-8 h-8 mx-auto mb-2"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Bot className="w-8 h-8" />
            </motion.div>
          ) : (
            <Mic className="w-8 h-8 mx-auto mb-2" />
          )}
          <div className="text-sm font-medium">
            {state === "listening" ? "Stop" : state === "paused" ? "Resume" : "Start"}
          </div>
          {state === "listening" && (
            <div className="text-xs opacity-80">{formatTime(recordingTime)}</div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export const EnhancedVoiceInputModal: React.FC<EnhancedVoiceInputModalProps> = ({ 
  isOpen, 
  onClose, 
  onTransferToChat,
  leadContext 
}) => {
  const [mode, setMode] = useState<VoiceMode>("input")
  const [state, setState] = useState<RecordingState>("idle")
  const [transcript, setTranscript] = useState("")
  const [fullTranscript, setFullTranscript] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()
  const { addActivity } = useChatContext()

  // Use the new unified media hooks
  const {
    isCapturing,
    isPaused,
    elapsedTime,
    startCapture,
    stopCapture,
    pauseCapture,
    resumeCapture,
    mediaItem,
    error: captureError
  } = useMediaCapture({
    constraints: { audio: true },
    onStart: () => {
      setState("listening")
      addActivity({
        type: "voice_input",
        title: "Voice Recording Started",
        description: "Started recording voice input",
        status: "in_progress"
      })
    },
    onStop: (blob) => {
      setState("processing")
      handleAudioProcessing(blob)
    },
    onPause: () => {
      setState("paused")
    },
    onResume: () => {
      setState("listening")
    },
    onError: (error) => {
      setState("error")
      toast({
        title: "Recording Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  // Media player for playback
  const {
    mediaElementRef,
    setupMediaElement,
    isPlaying,
    play,
    pause,
    currentTime,
    duration
  } = useMediaPlayer({
    onPlay: () => {
      addActivity({
        type: "voice_input",
        title: "Voice Playback Started",
        description: "Playing recorded audio",
        status: "in_progress"
      })
    },
    onPause: () => {
      addActivity({
        type: "voice_input",
        title: "Voice Playback Paused",
        description: "Paused recorded audio",
        status: "completed"
      })
    }
  })

  const handleAudioProcessing = async (blob: Blob) => {
    setIsProcessing(true)
    try {
      // Convert blob to base64 for API
      const reader = new FileReader()
      reader.onload = async () => {
        const base64Audio = reader.result as string
        const audioData = base64Audio.split(',')[1] // Remove data URL prefix

        // Send to transcription API
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'user',
                content: `Please transcribe this audio: ${audioData}`,
                audioData: audioData
              }
            ],
            leadContext: leadContext
          })
        })

        if (!response.ok) {
          throw new Error('Transcription failed')
        }

        const data = await response.json()
        const transcribedText = data.content || "Audio transcribed successfully"
        
        setTranscript(transcribedText)
        setFullTranscript(prev => prev + (prev ? " " : "") + transcribedText)
        setState("idle")
        setIsProcessing(false)

        addActivity({
          type: "voice_input",
          title: "Voice Transcribed",
          description: transcribedText.slice(0, 100) + "...",
          status: "completed"
        })

        toast({
          title: "Transcription Complete",
          description: "Your voice has been transcribed successfully"
        })
      }
      reader.readAsDataURL(blob)
    } catch (error) {
      console.error('Audio processing error:', error)
      setState("error")
      setIsProcessing(false)
      toast({
        title: "Transcription Failed",
        description: "Failed to transcribe audio. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleStartRecording = async () => {
    try {
      await startCapture()
    } catch (error) {
      console.error('Failed to start recording:', error)
      setState("error")
    }
  }

  const handleStopRecording = () => {
    stopCapture()
  }

  const handlePauseResume = () => {
    if (isPaused) {
      resumeCapture()
    } else {
      pauseCapture()
    }
  }

  const handleSendToChat = () => {
    if (fullTranscript.trim()) {
      onTransferToChat(fullTranscript)
      setFullTranscript("")
      setTranscript("")
      onClose()
    }
  }

  const handleReset = () => {
    setFullTranscript("")
    setTranscript("")
    setState("idle")
  }

  // Update state based on media capture status
  useEffect(() => {
    if (captureError) {
      setState("error")
    }
  }, [captureError])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-2xl mx-4"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-xl font-semibold">
                  Voice Input
                  <Badge variant="secondary" className="ml-2">
                    {mode === "input" ? "Single Input" : "Conversation"}
                  </Badge>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Mode Toggle */}
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant={mode === "input" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMode("input")}
                  >
                    Single Input
                  </Button>
                  <Button
                    variant={mode === "conversation" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMode("conversation")}
                  >
                    Conversation
                  </Button>
                </div>

                {/* Voice Recording Orb */}
                <div className="flex justify-center py-8">
                  <VoiceRecordingOrb
                    state={state}
                    onClick={isCapturing ? handleStopRecording : handleStartRecording}
                    recordingTime={elapsedTime}
                  />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center space-x-4">
                  {isCapturing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePauseResume}
                      disabled={state === "processing"}
                    >
                      {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      {isPaused ? "Resume" : "Pause"}
                    </Button>
                  )}
                  
                  {fullTranscript && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                      </Button>
                      
                      <Button
                        onClick={handleSendToChat}
                        disabled={!fullTranscript.trim()}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send to Chat
                      </Button>
                    </>
                  )}
                </div>

                {/* Transcript Display */}
                {transcript && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Latest Transcription:
                    </h4>
                    <div className="p-3 bg-muted/50 rounded-lg text-sm">
                      {transcript}
                    </div>
                  </div>
                )}

                {/* Full Transcript */}
                {fullTranscript && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Full Transcript:
                    </h4>
                    <div className="p-3 bg-muted/50 rounded-lg text-sm max-h-32 overflow-y-auto">
                      {fullTranscript}
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {captureError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">
                      Error: {captureError.message}
                    </p>
                  </div>
                )}

                {/* Audio Playback */}
                {mediaItem && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Recorded Audio:
                    </h4>
                    <audio
                      ref={(el) => {
                        if (el) {
                          mediaElementRef.current = el
                          setupMediaElement(el)
                        }
                      }}
                      controls
                      className="w-full"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 