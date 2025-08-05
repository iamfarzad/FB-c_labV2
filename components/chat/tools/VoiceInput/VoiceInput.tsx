"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ToolCardWrapper } from "@/components/chat/ToolCardWrapper"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Square, X } from "@/lib/icon-mapping"
import { useToast } from "@/hooks/use-toast"
import { useWebSocketVoice } from "@/hooks/use-websocket-voice"
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
  // MediaRecorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([]) // Will temporarily hold webm blobs before processing
  const audioStreamRef = useRef<MediaStream | null>(null)
  // Web Audio API refs for transcoding
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null)
  const pcmAudioBufferRef = useRef<ArrayBuffer[]>([]) // New ref to store transcoded PCM audio buffers

  // Initialize WebSocket voice system for real Gemini Live API
  const voiceSystem = useWebSocketVoice()
  
  // Don't auto-start the session - let user trigger it
  // This prevents connection errors on component mount
  useEffect(() => {
    // Only connect when user actually starts recording
    // This gives the WebSocket server time to be ready
    console.log('VoiceInput mounted, WebSocket ready for manual connection')

    // Initialize AudioContext
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 })
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume()
    }

    return () => {
      // Ensure AudioContext is closed on unmount
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Removed useEffect for Web Speech API
  // Removed `recognitionRef.current.onresult`, `onend`, `onerror`
  
  const startRecording = async () => {
    if (isRecording) return // Prevent double-start

    // Start WebSocket session if not already connected
    if (!voiceSystem.session?.isActive && !voiceSystem.isConnected) {
      console.log('🔌 Starting WebSocket session...')
      try {
        await voiceSystem.startSession(leadContext)
        console.log('✅ WebSocket session started')
      } catch (error) {
        console.error('❌ Failed to start WebSocket session:', error)
        toast({
          title: "Connection Failed",
          description: "Could not connect to voice server. Please try again.",
          variant: "destructive"
        })
        return
      }
    }

    try {
      audioStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Check if MediaRecorder is supported
      if (!MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        toast({
          title: "Browser Not Supported",
          description: "Your browser does not support audio/webm;codecs=opus for recording.",
          variant: "destructive"
        })
        console.error('MediaRecorder type not supported: audio/webm;codecs=opus')
        return
      }

      mediaRecorderRef.current = new MediaRecorder(audioStreamRef.current, { mimeType: 'audio/webm;codecs=opus' })
      audioChunksRef.current = [] // Clear previous webm chunks
      pcmAudioBufferRef.current = [] // Clear previous PCM buffers

      mediaRecorderRef.current.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          console.log(`[VoiceInput] Captured raw audio chunk: ${event.data.size} bytes, type: ${event.data.type}`)
          
          // Convert Blob to ArrayBuffer
          const arrayBuffer = await event.data.arrayBuffer()
          
          if (!audioContextRef.current) {
            console.error('AudioContext not initialized.')
            return
          }

          try {
            // Decode audio data (from webm/opus to PCM Float32Array)
            const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer)
            
            // Get raw PCM data (Float32Array) from the first channel
            const rawPCM = audioBuffer.getChannelData(0)

            // Convert Float32Array to 16-bit signed integer PCM (Int16Array)
            // Scale to 16-bit range: [-32768, 32767]
            const pcm16 = new Int16Array(rawPCM.length)
            for (let i = 0; i < rawPCM.length; i++) {
              // Clamp values to [-1, 1] then scale
              pcm16[i] = Math.max(-1, Math.min(1, rawPCM[i])) * 0x7FFF 
            }
            
            // Store transcoded raw 16-bit PCM buffer
            pcmAudioBufferRef.current.push(pcm16.buffer)
            console.log(`[VoiceInput] Buffered ${pcm16.buffer.byteLength} bytes of raw 24kHz 16-bit PCM audio. Total buffered: ${pcmAudioBufferRef.current.reduce((sum, buf) => sum + buf.byteLength, 0)} bytes`)

            // Removed immediate send - will send on stopRecording

          } catch (error) {
            console.error('Error processing audio chunk:', error)
            toast({
              title: "Audio Processing Error",
              description: "Could not process audio for sending. Please try again.",
              variant: "destructive"
            })
          }
        }
      }

      mediaRecorderRef.current.onstop = () => {
        setIsRecording(false)
        console.log('🎤 Recording stopped.')
      }

      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event.error)
        setIsRecording(false)
        toast({
          title: "Microphone Error",
          description: `Recording failed: ${event.error.name || 'Unknown error'}`,
          variant: "destructive"
        })
      }

      mediaRecorderRef.current.start(100) // Start recording, collect data every 100ms
      setIsRecording(true)
      setTranscript("") // Clear previous transcript
      console.log('🎤 Recording started. Buffering raw 24kHz PCM audio chunks...')

    } catch (error) {
      console.error('Error accessing microphone:', error)
      let errorMessage = "Could not access your microphone. Please check permissions."
      if (error instanceof Error) {
        errorMessage = `Microphone error: ${error.message}`
      }
      toast({
        title: "Microphone Access Denied",
        description: errorMessage,
        variant: "destructive"
      })
      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop())
      audioStreamRef.current = null
    }

    // Send the accumulated PCM audio as a single message
    if (pcmAudioBufferRef.current.length > 0 && voiceSystem.isConnected) {
      console.log(`[VoiceInput] Sending final accumulated PCM audio (${pcmAudioBufferRef.current.length} chunks) to WebSocket...`)
      
      // Concatenate all ArrayBuffers into one
      const totalLength = pcmAudioBufferRef.current.reduce((acc, val) => acc + val.byteLength, 0)
      const mergedBuffer = new Uint8Array(totalLength)
      let offset = 0
      for (const buffer of pcmAudioBufferRef.current) {
        mergedBuffer.set(new Uint8Array(buffer), offset)
        offset += buffer.byteLength
      }
      
      voiceSystem.sendAudioChunk(mergedBuffer.buffer, 'audio/pcm') // Send the merged ArrayBuffer
      pcmAudioBufferRef.current = [] // Clear the buffer after sending
      
      // Signal turn complete to Gemini after sending audio
      voiceSystem.sendMessage('TURN_COMPLETE') // Send a special message to indicate turn is complete
    }

    voiceSystem.stopSession(); // Explicitly stop the WebSocket session when recording stops
    setIsRecording(false); // Update local state
    setTranscript("") // Clear transcript
  }

  const handleTranscript = async (text: string) => {
    setIsProcessing(true)
    try {
      // For now, if user clicks "Use This Text", we'll send it as a regular message
      // In a pure voice flow, this button might change functionality or be removed
      if (voiceSystem.session?.isActive) {
        console.log('📝 Sending transcribed text to Gemini:', text)
        await voiceSystem.sendMessage(text) // This sends text, Gemini will respond based on this
        
        toast({
          title: "🎵 Voice Response",
          description: "Playing Puck's voice response...",
        })
      } else {
        toast({
          title: "Session Not Active",
          description: "Please start recording to initiate a voice session.",
          variant: "destructive"
        })
      }
      
      // Also send to regular chat system
      if (mode === 'modal') {
        onTranscript(text)
        onClose?.()
      } else {
        onTranscript(text)
      }
    } catch (error) {
      console.error('❌ Text message sending failed:', error)
      
      toast({
        title: "Voice Response Failed",
        description: voiceSystem.error || "Could not send text to voice server. Is the WebSocket server running?",
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
      {/* WebSocket connection status */}
      {voiceSystem.isConnected && (
        <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
          🌐 Connected to Gemini Live - Puck ready to respond
        </div>
      )}
      
      {!voiceSystem.isConnected && !voiceSystem.error && (
        <div className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
          ⏳ Connecting to voice server...
        </div>
      )}
      
      {voiceSystem.error && (
        <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
          ❌ {voiceSystem.error}
        </div>
      )}
      
      {!isRecording && !transcript && (
        <div className="flex flex-col items-center gap-4">
          <Mic className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground text-center">
            {voiceSystem.isConnected 
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
