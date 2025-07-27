"use client"

import React, { useState, useEffect, useRef } from "react"
import { Mic, Square } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface CleanVoiceUIProps {
  onTranscript?: (text: string) => void
  onCancel?: () => void
  className?: string
}

export function CleanVoiceUI({ 
  onTranscript = (text) => console.log('Transcript:', text), 
  onCancel = () => console.log('Cancelled'),
  className = ""
}: CleanVoiceUIProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [duration, setDuration] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const { toast } = useToast()
  
  const recognitionRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  // Initialize speech recognition
  const initializeRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive"
      })
      return null
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' '
        }
      }
      setTranscript(prev => prev + finalTranscript)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error)
      setIsRecording(false)
      toast({
        title: "Speech Recognition Error",
        description: event.error,
        variant: "destructive"
      })
    }

    return recognition
  }

  // Handle recording state
  useEffect(() => {
    if (isRecording) {
      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)

      // Start audio visualization
      const updateAudioLevel = () => {
        if (!isRecording) return
        setAudioLevel(Math.random() * 100) // Simulated audio level
        requestAnimationFrame(updateAudioLevel)
      }
      updateAudioLevel()

      // Initialize and start recognition
      recognitionRef.current = initializeRecognition()
      if (recognitionRef.current) {
        recognitionRef.current.start()
      }

      return () => {
        if (timerRef.current) clearInterval(timerRef.current)
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop()
          } catch (e) {
            console.error('Error stopping recognition:', e)
          }
        }
      }
    } else {
      setAudioLevel(0)
      if (timerRef.current) clearInterval(timerRef.current)
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          console.error('Error stopping recognition:', e)
        }
      }
    }
  }, [isRecording])

  // Auto-send transcript
  useEffect(() => {
    if (transcript.trim()) {
      onTranscript(transcript.trim())
    }
  }, [transcript, onTranscript])

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false)
      setDuration(0)
    } else {
      setTranscript("")
      setIsRecording(true)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`w-full max-w-md mx-auto card-minimal ${className}`}>
      {/* Status Bar */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-muted-foreground">
          {isRecording ? "Recording" : "Ready"}
        </span>
        {isRecording && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            {formatTime(duration)}
          </div>
        )}
      </div>

      {/* Audio Indicator */}
      {isRecording && (
        <div className="mb-8">
          <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${audioLevel}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={toggleRecording}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-colors duration-200 ${
            isRecording 
              ? "bg-red-500 hover:bg-red-600" 
              : "bg-primary hover:bg-primary/90"
          }`}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          {isRecording ? (
            <Square className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Live Transcript */}
      {transcript && (
        <div className="mb-4">
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-muted-foreground">Live transcript</span>
            </div>
            <p className="text-foreground text-sm leading-relaxed">
              {transcript}
            </p>
          </div>
        </div>
      )}

      {/* Cancel Button */}
      <div className="flex justify-center mt-4">
        <button
          onClick={onCancel}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
