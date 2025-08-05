"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ToolCardWrapper } from "@/components/chat/ToolCardWrapper"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Square, X } from "@/lib/icon-mapping"
import { useToast } from "@/hooks/use-toast"
import { useRealTimeVoice } from "@/hooks/use-real-time-voice"
import type { VoiceInputProps } from "./VoiceInput.types"

export function VoiceInput({ 
  mode = 'card', 
  onTranscript, 
  onClose, 
  onCancel,
  leadContext,
  className 
}: VoiceInputProps) {
  const { toast } = useToast()
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState("")
  const recognitionRef = useRef<any>(null)

  // Initialize real-time voice system with proper session management
  const voiceSystem = useRealTimeVoice()
  
  // Start voice session when component mounts
  useEffect(() => {
    if (leadContext) {
      voiceSystem.startSession({ 
        leadId: leadContext.company || 'anonymous',
        leadName: leadContext.name || 'User' 
      })
    }
  }, [leadContext, voiceSystem])

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript
            }
          }
          if (finalTranscript) {
            setTranscript(finalTranscript)
          }
        }

        recognitionRef.current.onend = () => {
          setIsRecording(false)
          if (transcript) {
            handleTranscript(transcript)
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsRecording(false)
          toast({
            title: "Voice Recognition Error",
            description: "Could not process voice input. Please try again.",
            variant: "destructive"
          })
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [transcript, toast])

  const startRecording = () => {
    if (recognitionRef.current) {
      setTranscript("")
      setIsRecording(true)
      recognitionRef.current.start()
    } else {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive"
      })
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsRecording(false)
  }

  const handleTranscript = async (text: string) => {
    setIsProcessing(true)
    try {
      // Send to voice system for complete voice conversation
      if (voiceSystem.session?.isActive) {
        console.log('🎤 Sending to voice system:', text)
        await voiceSystem.sendMessage(text)
        
        toast({
          title: "🎵 Voice Conversation",
          description: "AI is responding with Puck's voice!",
        })
      } else {
        console.warn('Voice session not active, starting session...')
        await voiceSystem.startSession()
        await voiceSystem.sendMessage(text)
      }
      
      // Also send to regular chat system
      if (mode === 'modal') {
        onTranscript(text)
        onClose?.()
      } else {
        onTranscript(text)
      }
    } catch (error) {
      console.error('❌ Voice conversation failed:', error)
      toast({
        title: "Voice Response Failed",
        description: "Could not get voice response from AI",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = () => {
    stopRecording()
    setTranscript("")
    if (mode === 'modal') {
      onClose?.()
    } else {
      onCancel?.()
    }
  }

  const VoiceInputUI = () => (
    <div className={`flex flex-col items-center gap-4 p-6 ${className || ''}`}>
      {/* Voice system status */}
      {voiceSystem.session?.isActive && (
        <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
          🎤 Voice session active - Puck ready to respond
        </div>
      )}
      
      {!isRecording && !transcript && (
        <div className="flex flex-col items-center gap-4">
          <Mic className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground text-center">
            {voiceSystem.session?.isActive 
              ? "Click to start voice conversation with Puck" 
              : "Click to start voice input"
            }
          </p>
          <Button 
            onClick={startRecording} 
            className="w-full"
            disabled={isProcessing || voiceSystem.isProcessing}
          >
            <Mic className="w-4 h-4 mr-2" />
            {(isProcessing || voiceSystem.isProcessing) ? 'Processing...' : 'Start Recording'}
          </Button>
        </div>
      )}
      
      {isRecording && (
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-red-500 rounded-full animate-ping" />
          </div>
          <p className="text-red-500 font-medium">Recording... Speak now</p>
          <Button variant="outline" onClick={stopRecording}>
            <Square className="w-4 h-4 mr-2" />
            Stop Recording
          </Button>
        </div>
      )}

      {transcript && !isRecording && (
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="w-full p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Transcript:</p>
            <p className="text-sm">{transcript}</p>
          </div>
          <div className="flex gap-2 w-full">
            <Button onClick={() => handleTranscript(transcript)} className="flex-1">
              Use This Text
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
          <p className="text-muted-foreground">Processing...</p>
        </div>
      )}
    </div>
  )

  // Modal variant
  if (mode === 'modal') {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <DialogTitle className="text-lg font-semibold">Voice Input</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          <VoiceInputUI />
        </DialogContent>
      </Dialog>
    )
  }

  // Card variant
  return (
    <ToolCardWrapper
      title="Voice Input"
      description="Use your voice to input text"
    >
      <VoiceInputUI />
    </ToolCardWrapper>
  )
}
