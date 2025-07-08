"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MicOff, Volume2, VolumeX, Send, X } from 'lucide-react'
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import SpeechRecognition from 'speech-recognition'

interface VoiceInputModalProps {
  isOpen: boolean
  onClose: () => void
  onAIResponse?: (response: string) => void
  onTransferToChat?: (transcript: string) => void
  theme?: "light" | "dark"
}

export default function VoiceInputModal({
  isOpen,
  onClose,
  onAIResponse,
  onTransferToChat,
  theme = "dark"
}: VoiceInputModalProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number>()
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      recognitionRef.current = new SpeechRecognition()
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "en-US"
        
        recognitionRef.current.onresult = (event) => {
          let finalTranscript = ""
          let interimTranscript = ""
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }
          
          setTranscript(finalTranscript + interimTranscript)
        }
        
        recognitionRef.current.onerror = (event) => {
          setError(`Speech recognition error: ${event.error}`)
          setIsRecording(false)
        }
        
        recognitionRef.current.onend = () => {
          setIsRecording(false)
        }
      }
    }
  }, [])

  // Audio level monitoring
  const startAudioMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      
      source.connect(analyserRef.current)
      analyserRef.current.fftSize = 256
      
      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      
      const updateAudioLevel = () => {
        if (analyserRef.current && isRecording) {
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / bufferLength
          setAudioLevel(average / 255)
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
        }
      }
      
      updateAudioLevel()
    } catch (err) {
      setError("Could not access microphone")
    }
  }

  const startRecording = async () => {
    setError(null)
    setTranscript("")
    setIsRecording(true)
    
    try {
      await startAudioMonitoring()
      recognitionRef.current?.start()
    } catch (err) {
      setError("Failed to start recording")
      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
    recognitionRef.current?.stop()
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    
    setAudioLevel(0)
  }

  const handleSendToChat = () => {
    if (transcript.trim()) {
      onTransferToChat?.(transcript)
      onClose()
    }
  }

  const handleAIProcess = async () => {
    if (!transcript.trim()) return
    
    setIsProcessing(true)
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      onAIResponse?.(`AI processed: ${transcript}`)
    } catch (err) {
      setError("Failed to process with AI")
    } finally {
      setIsProcessing(false)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      recognitionRef.current?.stop()
    }
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "modal-content max-w-md",
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      )}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Voice Input
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Voice Orb */}
          <div className="flex justify-center">
            <motion.div
              className={cn(
                "voice-orb flex items-center justify-center",
                isRecording && "recording"
              )}
              animate={{
                scale: isRecording ? 1 + (audioLevel * 0.3) : 1,
              }}
              transition={{ duration: 0.1 }}
            >
              <motion.div
                animate={{ rotate: isRecording ? 360 : 0 }}
                transition={{ duration: 2, repeat: isRecording ? Infinity : 0, ease: "linear" }}
              >
                {isRecording ? (
                  <MicOff className="w-8 h-8 text-white" />
                ) : (
                  <Mic className="w-8 h-8 text-white" />
                )}
              </motion.div>
            </motion.div>
          </div>

          {/* Status */}
          <div className="text-center">
            <p className={cn(
              "text-sm",
              isRecording ? "text-green-500" : "text-muted-foreground"
            )}>
              {isRecording ? "Listening..." : "Click to start recording"}
            </p>
            {audioLevel > 0 && (
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${audioLevel * 100}%` }}
                />
              </div>
            )}
          </div>

          {/* Transcript */}
          {transcript && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm">{transcript}</p>
              </CardContent>
            </Card>
          )}

          {/* Error */}
          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2 justify-center">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? "destructive" : "default"}
              size="lg"
              className="flex-1"
              disabled={isProcessing}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-4 h-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Start Recording
                </>
              )}
            </Button>
          </div>

          {/* Action Buttons */}
          {transcript && (
            <div className="flex gap-2">
              <Button
                onClick={handleSendToChat}
                variant="outline"
                className="flex-1"
                disabled={isProcessing}
              >
                <Send className="w-4 h-4 mr-2" />
                Send to Chat
              </Button>
              <Button
                onClick={handleAIProcess}
                className="flex-1"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" />
                    Process with AI
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
