"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Loader2, X, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"

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
  theme = "light",
}: VoiceInputModalProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [aiResponse, setAIResponse] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [animationSize, setAnimationSize] = useState(100)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Animation effect for the orb
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setAnimationSize((prev) => (prev === 100 ? 120 : 100))
      }, 500)
      return () => clearInterval(interval)
    }
  }, [isRecording])

  // Clean up when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopRecording()
      setTranscript("")
      setAIResponse("")
      setError(null)
    }
  }, [isOpen])

  const startRecording = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        await processAudio(audioBlob)

        // Stop all tracks in the stream
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error("Error accessing microphone:", err)
      setError("Could not access microphone. Please check permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsProcessing(true)
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Simulate audio processing with a timeout
      // In a real app, you would send the audio to a speech-to-text service
      setTimeout(() => {
        const mockTranscript =
          "This is a simulated voice transcript. In a real application, this would be the result of processing your audio through a speech-to-text service."
        setTranscript(mockTranscript)
        setIsProcessing(false)

        // Simulate AI processing the transcript
        setTimeout(() => {
          const mockResponse = "I've received your voice input. How can I help you with this request?"
          setAIResponse(mockResponse)
          if (onAIResponse) {
            onAIResponse(mockResponse)
          }
        }, 1000)
      }, 1500)
    } catch (err) {
      console.error("Error processing audio:", err)
      setError("Failed to process audio. Please try again.")
      setIsProcessing(false)
    }
  }

  const handleTransferToChat = () => {
    if (onTransferToChat && transcript) {
      onTransferToChat(transcript)
      onClose()
    }
  }

  const getOrbClassName = () => {
    if (isProcessing) return "voice-orb processing"
    if (isRecording) return "voice-orb listening"
    if (aiResponse) return "voice-orb speaking"
    return "voice-orb"
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Voice Input</DialogTitle>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6">
          {/* Voice visualization orb */}
          <div
            className={cn(
              getOrbClassName(),
              "rounded-full flex items-center justify-center mb-6 transition-all duration-300",
            )}
            style={{
              width: `${animationSize}px`,
              height: `${animationSize}px`,
            }}
          >
            {isRecording ? (
              <Mic className="h-8 w-8 text-white animate-pulse" />
            ) : isProcessing ? (
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            ) : aiResponse ? (
              <Volume2 className="h-8 w-8 text-white" />
            ) : (
              <Mic className="h-8 w-8 text-white" />
            )}
          </div>

          {/* Status text */}
          <div className="text-center mb-6">
            {isRecording ? (
              <p className="text-lg font-medium">Listening...</p>
            ) : isProcessing ? (
              <p className="text-lg font-medium">Processing audio...</p>
            ) : transcript ? (
              <div>
                <p className="text-lg font-medium mb-2">Transcript:</p>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md max-h-32 overflow-y-auto">
                  {transcript}
                </p>
              </div>
            ) : error ? (
              <p className="text-destructive">{error}</p>
            ) : (
              <p className="text-muted-foreground">Click the button below to start recording</p>
            )}
          </div>

          {/* AI response */}
          {aiResponse && (
            <div className="mb-6 w-full">
              <p className="text-lg font-medium mb-2">AI Response:</p>
              <div className="bg-primary/10 p-3 rounded-md">
                <p>{aiResponse}</p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            {!isRecording ? (
              <Button onClick={startRecording} disabled={isProcessing} className="gap-2">
                <Mic className="h-4 w-4" />
                Start Recording
              </Button>
            ) : (
              <Button onClick={stopRecording} variant="destructive" className="gap-2">
                <MicOff className="h-4 w-4" />
                Stop Recording
              </Button>
            )}

            {transcript && !isRecording && !isProcessing && (
              <Button onClick={handleTransferToChat} variant="outline">
                Transfer to Chat
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
