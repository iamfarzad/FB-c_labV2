"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ToolCardWrapper } from "@/components/chat/ToolCardWrapper"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Square, X, Sparkles } from "@/lib/icon-mapping"
import { useToast } from "@/hooks/use-toast"
import { useWebSocketVoice } from "@/hooks/use-websocket-voice"
import { useVoiceRecorder } from "@/hooks/use-voice-recorder"
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
  const [isSessionActive, setIsSessionActive] = useState(false)

  // WebSocket voice system for connection and transcript
  const voiceSystem = useWebSocketVoice()
  
  // Voice recorder for audio capture and processing
  const voiceRecorder = useVoiceRecorder({
    onAudioChunk: voiceSystem.onAudioChunk,
    onTurnComplete: voiceSystem.onTurnComplete,
    vadSilenceThreshold: 700, // 700ms of silence before turn complete
    sampleRate: 16000, // 16kHz for Gemini
    chunkSize: 4096
  })

  // Start voice session
  const startVoiceSession = async () => {
    try {
      // Start WebSocket session first
      await voiceSystem.startSession(leadContext)
      
      // Initialize audio recorder
      if (!voiceRecorder.hasPermission) {
        await voiceRecorder.initializeAudioContext()
      }
      
      // Start recording
      const recordingStarted = await voiceRecorder.startRecording()
      
      if (recordingStarted) {
        setIsSessionActive(true)
        toast({
          title: "🎤 Voice Session Started",
          description: "Speak naturally. AI will respond when you pause.",
        })
      }
    } catch (error) {
      console.error('❌ Failed to start voice session:', error)
      toast({
        title: "Session Failed",
        description: "Could not start voice session. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Stop voice session
  const stopVoiceSession = () => {
    voiceRecorder.stopRecording()
    voiceSystem.stopSession()
    setIsSessionActive(false)
    
    toast({
      title: "🛑 Voice Session Ended",
      description: "Voice conversation has been stopped.",
    })
  }

  // Handle transcript for regular chat integration
  const handleUseTranscript = () => {
    if (voiceSystem.transcript) {
      onTranscript(voiceSystem.transcript)
      
      if (mode === 'modal') {
        onClose?.()
      }
      
      toast({
        title: "✅ Transcript Used",
        description: "Voice transcript has been added to chat.",
      })
    }
  }

  // Handle cancel
  const handleCancel = () => {
    if (isSessionActive) {
      stopVoiceSession()
    }
    
    if (mode === 'modal') {
      onClose?.()
    } else {
      onCancel?.()
    }
  }

  // Auto-cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSessionActive) {
        voiceRecorder.stopRecording()
        voiceSystem.stopSession()
      }
    }
  }, [isSessionActive])

  const VoiceInputUI = () => (
    <div className={`flex flex-col items-center gap-4 p-6 ${className || ''}`}>
      {/* Connection Status */}
      <div className="w-full">
        {voiceSystem.isConnected && (
          <div className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-md text-center">
            🌐 Connected to Gemini Live - Ready for conversation
          </div>
        )}
        
        {!voiceSystem.isConnected && !voiceSystem.error && voiceSystem.session && (
          <div className="text-xs text-yellow-600 bg-yellow-50 px-3 py-2 rounded-md text-center">
            ⏳ Connecting to voice server...
          </div>
        )}
        
        {voiceSystem.error && (
          <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-md text-center">
            ❌ {voiceSystem.error}
          </div>
        )}

        {voiceRecorder.error && (
          <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-md text-center">
            🎤 {voiceRecorder.error}
          </div>
        )}
      </div>

      {/* Voice Activity Indicator */}
      {voiceRecorder.isRecording && (
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-red-500 rounded-full animate-ping" />
          </div>
          
          {/* Volume Indicator */}
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-500 transition-all duration-100"
              style={{ width: `${voiceRecorder.volume * 100}%` }}
            />
          </div>
          
          <p className="text-red-500 font-medium text-center">
            🎤 Listening... Speak naturally
            <br />
            <span className="text-xs text-gray-500">AI will respond when you pause</span>
          </p>
        </div>
      )}

      {/* Transcript Display */}
      {voiceSystem.transcript && (
        <div className="w-full p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <p className="text-sm font-medium text-blue-800">AI Response:</p>
          </div>
          <p className="text-sm text-blue-700">{voiceSystem.transcript}</p>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex flex-col gap-3 w-full">
        {!isSessionActive && (
          <Button 
            onClick={startVoiceSession} 
            className="w-full"
            disabled={voiceRecorder.isInitializing || voiceSystem.isProcessing}
          >
            <Mic className="w-4 h-4 mr-2" />
            {voiceRecorder.isInitializing ? 'Initializing...' : 'Start Voice Conversation'}
          </Button>
        )}

        {isSessionActive && (
          <Button 
            variant="destructive" 
            onClick={stopVoiceSession}
            className="w-full"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop Voice Session
          </Button>
        )}

        {/* Transcript Actions */}
        {voiceSystem.transcript && !isSessionActive && (
          <div className="flex gap-2 w-full">
            <Button onClick={handleUseTranscript} className="flex-1">
              Use in Chat
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        )}

        {/* Cancel Button */}
        {!voiceSystem.transcript && (
          <Button variant="outline" onClick={handleCancel} className="w-full">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        )}
      </div>

      {/* Status Information */}
      {!isSessionActive && !voiceSystem.transcript && (
        <div className="text-center text-sm text-gray-500 space-y-1">
          <p>🎯 <strong>Real-time AI conversation</strong></p>
          <p>• Speak naturally, AI responds with voice</p>
          <p>• Automatic turn detection (700ms silence)</p>
          <p>• High-quality 16kHz audio processing</p>
        </div>
      )}

      {/* Processing Indicator */}
      {(voiceSystem.isProcessing || voiceRecorder.isInitializing) && (
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
          <p className="text-xs text-gray-500">
            {voiceRecorder.isInitializing ? 'Setting up audio...' : 'AI is thinking...'}
          </p>
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
            <DialogTitle className="text-lg font-semibold">Voice Conversation</DialogTitle>
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
      title="Voice Conversation"
      description="Real-time AI voice interaction with automatic turn detection"
    >
      <VoiceInputUI />
    </ToolCardWrapper>
  )
}
