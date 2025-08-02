"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ToolCardWrapper } from "@/components/chat/ToolCardWrapper"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Square, X, Volume2, Brain, Loader } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { VoiceInputProps } from "./VoiceInput.types"

interface ConversationTurn {
  id: string
  type: 'user' | 'ai'
  text: string
  timestamp: number
  audioData?: string
}

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
  const [conversation, setConversation] = useState<ConversationTurn[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [aiState, setAiState] = useState<"idle" | "listening" | "thinking" | "speaking">("idle")
  const [audioLevel, setAudioLevel] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  const recognitionRef = useRef<any>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const sessionIdRef = useRef<string>(`voice-session-${Date.now()}`)

  // Initialize audio context and analyzer
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Start real-time conversation session
  const startConversationSession = useCallback(async () => {
    try {
      const response = await fetch('/api/gemini-live-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start',
          sessionId: sessionIdRef.current,
          leadContext,
          enableAudio: true,
          voiceName: 'Aoede',
          languageCode: 'en-US'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to start conversation session')
      }

      const result = await response.json()
      setIsConnected(true)
      setAiState("listening")
      
      console.log('🎙️ Conversation session started:', result)
    } catch (error) {
      console.error('❌ Failed to start conversation session:', error)
      setError('Failed to start voice session')
    }
  }, [leadContext])

  // Send voice input to AI
  const sendVoiceInput = useCallback(async (audioData: string, transcript: string) => {
    try {
      setAiState("thinking")
      
      const response = await fetch('/api/gemini-live-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: transcript,
          audioData,
          sessionId: sessionIdRef.current,
          leadContext,
          enableAudio: true
        })
      })

      if (!response.ok) {
        throw new Error('Failed to process voice input')
      }

      const result = await response.json()
      
      // Add user turn
      const userTurn: ConversationTurn = {
        id: Date.now().toString(),
        type: 'user',
        text: transcript,
        timestamp: Date.now()
      }
      
      // Add AI turn
      const aiTurn: ConversationTurn = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: result.response || result.text || 'I understand. Please continue.',
        timestamp: Date.now()
      }
      
      setConversation(prev => [...prev, userTurn, aiTurn])
      setAiState("speaking")
      
      // Play audio response if available
      if (result.audioData) {
        await playAudioResponse(result.audioData)
      }
      
      setAiState("listening")
      
    } catch (error) {
      console.error('❌ Failed to send voice input:', error)
      setError('Failed to process voice input')
      setAiState("listening")
    }
  }, [leadContext])

  // Play audio response
  const playAudioResponse = useCallback(async (audioData: string) => {
    try {
      if (!audioContextRef.current) return

      // Remove data URL prefix
      const base64Data = audioData.replace('data:audio/wav;base64,', '')
      const binaryString = atob(base64Data)
      const bytes = new Uint8Array(binaryString.length)
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      // Decode and play audio
      const audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer)
      const source = audioContextRef.current.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContextRef.current.destination)
      source.start()
      
    } catch (error) {
      console.error('❌ Failed to play audio response:', error)
    }
  }, [])

  // Initialize speech recognition
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
          setError('Voice recognition error')
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

  const startRecording = async () => {
    try {
      // Start conversation session
      await startConversationSession()
      
      // Start speech recognition
      if (recognitionRef.current) {
        setTranscript("")
        setIsRecording(true)
        recognitionRef.current.start()
      } else {
        setError('Voice recognition not supported')
        toast({
          title: "Voice Recognition Not Supported",
          description: "Your browser doesn't support voice recognition.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('❌ Failed to start recording:', error)
      setError('Failed to start recording')
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
      // Get audio data from media recorder if available
      let audioData = ''
      if (mediaRecorderRef.current && streamRef.current) {
        audioData = await getAudioData()
      }
      
      // Send to AI for real-time processing
      await sendVoiceInput(audioData, text)
      
      if (mode === 'modal') {
        onTranscript(text)
        onClose?.()
      } else {
        // For card mode, just send the transcript
        onTranscript(text)
      }
    } catch (error) {
      console.error('❌ Failed to handle transcript:', error)
      setError('Failed to process transcript')
    } finally {
      setIsProcessing(false)
    }
  }

  const getAudioData = (): Promise<string> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve('')
        return
      }

      const chunks: Blob[] = []
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data)
      }
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.onloadend = () => {
          resolve(reader.result as string)
        }
        reader.readAsDataURL(blob)
      }
      
      mediaRecorderRef.current.stop()
    })
  }

  const handleCancel = () => {
    stopRecording()
    setTranscript("")
    setConversation([])
    setError(null)
    onCancel?.()
  }

  // Audio level monitoring
  useEffect(() => {
    if (!analyserRef.current || !isRecording) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    const updateAudioLevel = () => {
      if (analyserRef.current && isRecording) {
        analyserRef.current.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        setAudioLevel(average / 255)
        requestAnimationFrame(updateAudioLevel)
      }
    }
    
    updateAudioLevel()
  }, [isRecording])

  const VoiceInputUI = () => (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Connection Status */}
      <div className="flex items-center gap-2 text-sm">
        <div className={cn(
          "w-2 h-2 rounded-full",
          isConnected ? "bg-green-500" : "bg-gray-400"
        )} />
        <span className={isConnected ? "text-green-600" : "text-gray-500"}>
          {isConnected ? "Connected" : "Disconnected"}
        </span>
        {aiState !== "idle" && (
          <>
            <Badge variant="secondary" className="ml-2">
              {aiState === "listening" && "🎤 Listening"}
              {aiState === "thinking" && "🧠 Thinking"}
              {aiState === "speaking" && "🔊 Speaking"}
            </Badge>
          </>
        )}
      </div>

      {/* Audio Level Indicator */}
      {isRecording && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-red-500 rounded-full"
              style={{ width: `${audioLevel * 100}%` }}
              animate={{ width: `${audioLevel * 100}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <span className="text-xs text-gray-500">
            {Math.round(audioLevel * 100)}%
          </span>
        </div>
      )}

      {/* Recording Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={cn(
            "w-16 h-16 rounded-full",
            isRecording 
              ? "bg-red-500 hover:bg-red-600" 
              : "bg-blue-500 hover:bg-blue-600"
          )}
        >
          {isProcessing ? (
            <Loader className="w-6 h-6 animate-spin" />
          ) : isRecording ? (
            <Square className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </Button>
        
        {transcript && (
          <Button
            onClick={handleCancel}
            variant="outline"
            size="sm"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Transcript Display */}
      {transcript && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Transcript
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">{transcript}</p>
          </CardContent>
        </Card>
      )}

      {/* Conversation History */}
      {conversation.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Conversation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {conversation.map((turn) => (
              <div
                key={turn.id}
                className={cn(
                  "p-3 rounded-lg",
                  turn.type === 'user' 
                    ? "bg-blue-50 border-l-4 border-blue-500" 
                    : "bg-gray-50 border-l-4 border-gray-500"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={turn.type === 'user' ? 'default' : 'secondary'}>
                    {turn.type === 'user' ? 'You' : 'AI'}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {new Date(turn.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm">{turn.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="mt-4 border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )

  if (mode === 'modal') {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Voice Input</DialogTitle>
          </DialogHeader>
          <VoiceInputUI />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <ToolCardWrapper
      title="Voice Input"
      description="Real-time voice conversation with AI"
      icon={Mic}
      className={className}
    >
      <VoiceInputUI />
    </ToolCardWrapper>
  )
}
