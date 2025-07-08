"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Send, Volume2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import SpeechRecognition from "speech-recognition"

interface VoiceInputModalProps {
  isOpen: boolean
  onClose: () => void
  onTranscript: (transcript: string) => void
}

export function VoiceInputModal({ isOpen, onClose, onTranscript }: VoiceInputModalProps) {
  const { toast } = useToast()
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const recognitionRef = useRef<any | null>(null)

  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      })
      return
    }

    const recognition = new SpeechRecognition()

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event) => {
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

      setTranscript((prev) => prev + finalTranscript)
      setInterimTranscript(interimTranscript)
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error)
      toast({
        title: "Speech Recognition Error",
        description: "There was an error with speech recognition. Please try again.",
        variant: "destructive",
      })
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimTranscript("")
    }

    recognition.start()
    recognitionRef.current = recognition
  }, [toast])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
    setInterimTranscript("")
  }, [])

  const sendTranscript = useCallback(() => {
    if (transcript.trim()) {
      onTranscript(transcript.trim())
      toast({
        title: "Voice Input Sent",
        description: "Your voice message has been processed.",
      })
      onClose()
    }
  }, [transcript, onTranscript, onClose, toast])

  const clearTranscript = useCallback(() => {
    setTranscript("")
    setInterimTranscript("")
  }, [])

  const handleClose = useCallback(() => {
    stopListening()
    setTranscript("")
    setInterimTranscript("")
    onClose()
  }, [stopListening, onClose])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Voice Input
              </CardTitle>
              <CardDescription>Speak your message and it will be converted to text</CardDescription>
            </div>
            <Badge variant="secondary">Speech Recognition</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="min-h-[120px] p-4 border rounded-lg bg-gray-50">
            <div className="text-sm text-gray-700">
              {transcript && <span className="text-black">{transcript}</span>}
              {interimTranscript && <span className="text-gray-500 italic">{interimTranscript}</span>}
              {!transcript && !interimTranscript && (
                <span className="text-gray-400">
                  {isListening ? "Listening... Speak now" : "Click the microphone to start speaking"}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            {!isListening ? (
              <Button onClick={startListening} className="flex items-center gap-2" size="lg">
                <Mic className="h-5 w-5" />
                Start Recording
              </Button>
            ) : (
              <Button onClick={stopListening} variant="destructive" className="flex items-center gap-2" size="lg">
                <MicOff className="h-5 w-5" />
                Stop Recording
              </Button>
            )}

            {transcript && (
              <Button onClick={clearTranscript} variant="outline" className="flex items-center gap-2 bg-transparent">
                Clear
              </Button>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={sendTranscript} disabled={!transcript.trim()} className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Send Message
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Tip: Speak clearly and pause between sentences for better accuracy</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
