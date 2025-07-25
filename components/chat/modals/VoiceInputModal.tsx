"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { X, Send, Mic, MicOff, Pause, Play, RotateCcw, Volume2, Radio, Bot, Type } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useChatContext } from "@/app/chat/context/ChatProvider"
import { useToast } from "@/components/ui/use-toast"

interface VoiceInputModalProps {
  isOpen: boolean
  onClose: () => void
  onTransferToChat: (fullTranscript: string) => void
  onVoiceResponse?: (responseData: { textContent: string; voiceStyle: string }) => void
  leadContext?: {
    name?: string
    company?: string
    role?: string
    interests?: string
  }
}

type VoiceMode = "input" | "conversation"
type InputMode = "voice" | "text"
type RecordingState = "idle" | "listening" | "paused" | "processing" | "error" | "permission-denied"

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({ 
  isOpen, 
  onClose, 
  onTransferToChat,
  onVoiceResponse,
  leadContext 
}) => {
  const { addActivity } = useChatContext()
  const { toast } = useToast()
  
  const [voiceMode, setVoiceMode] = useState<VoiceMode>("input")
  const [inputMode, setInputMode] = useState<InputMode>("voice")
  const [recordingState, setRecordingState] = useState<RecordingState>("idle")
  const [currentTranscription, setCurrentTranscription] = useState("")
  const [finalTranscript, setFinalTranscript] = useState("")
  const [recordingTime, setRecordingTime] = useState(0)
  const [isSupported, setIsSupported] = useState(true)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [textInput, setTextInput] = useState("")
  const [conversationMessages, setConversationMessages] = useState<Array<{id: string, role: 'user' | 'assistant', content: string, timestamp: Date}>>([])
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  
  const recognitionRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Check microphone permissions on mount
  useEffect(() => {
    if (!isOpen) return

    const checkMicrophonePermission = async () => {
      try {
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setIsSupported(false)
          setRecordingState("error")
          return
        }

        // Check if we're in a secure context
        if (!window.isSecureContext) {
          setIsSupported(false)
          setRecordingState("error")
          toast({
            title: "HTTPS Required",
            description: "Voice recognition requires a secure connection (HTTPS).",
            variant: "destructive"
          })
          return
        }

        // Request microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        setPermissionGranted(true)
        setRecordingState("idle")
        
        // Stop the stream immediately after permission check
        stream.getTracks().forEach(track => track.stop())
        
        // Initialize speech recognition
        initializeSpeechRecognition()
        
      } catch (error: any) {
        console.error("Microphone permission error:", error)
        setPermissionGranted(false)
        
        if (error.name === 'NotAllowedError') {
          setRecordingState("permission-denied")
          toast({
            title: "Microphone Access Denied",
            description: "Please allow microphone access in your browser settings and refresh the page.",
            variant: "destructive"
          })
        } else if (error.name === 'NotFoundError') {
          setRecordingState("error")
          toast({
            title: "No Microphone Found",
            description: "Please connect a microphone and try again.",
            variant: "destructive"
          })
        } else {
          setRecordingState("error")
          toast({
            title: "Microphone Error",
            description: "Unable to access microphone. Please check your settings.",
            variant: "destructive"
          })
        }
      }
    }

    checkMicrophonePermission()
  }, [isOpen, toast])

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setIsSupported(false)
      setRecordingState("error")
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
      
      let errorMessage = "Voice recognition error occurred"
      
      if (event.error === "not-allowed") {
        setRecordingState("permission-denied")
        errorMessage = "Microphone access denied. Please allow microphone access in your browser settings."
      } else if (event.error === "no-speech") {
        setRecordingState("idle")
        errorMessage = "No speech detected. Please try speaking again."
      } else if (event.error === "audio-capture") {
        setRecordingState("error")
        errorMessage = "No microphone found. Please connect a microphone and try again."
      } else {
        setRecordingState("error")
        errorMessage = "Voice recognition error occurred. Please try again."
      }
      
      toast({
        title: "Voice Recognition Error",
        description: errorMessage,
        variant: "destructive"
      })
      
      addActivity({
        type: "error",
        title: "Voice Recognition Failed",
        description: errorMessage,
        status: "failed"
      })
    }

    recognition.onend = () => {
      if (recordingState === "listening") {
        setRecordingState("idle")
      }
    }

    recognitionRef.current = recognition
  }

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

  const startRecording = useCallback(() => {
    if (recognitionRef.current && isSupported && permissionGranted) {
      setFinalTranscript("")
      setCurrentTranscription("")
      setRecordingTime(0)
      recognitionRef.current.start()
    }
  }, [isSupported, permissionGranted])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setRecordingState("processing")
      
      setTimeout(() => {
        setRecordingState("idle")
      }, 1000)
    }
  }, [])

  const handleOrbClick = useCallback(() => {
    if (!isSupported || !permissionGranted) return

    switch (recordingState) {
      case "idle":
        startRecording()
        break
      case "listening":
        stopRecording()
        break
      default:
        break
    }
  }, [recordingState, isSupported, permissionGranted, startRecording, stopRecording])

  const clearTranscript = useCallback(() => {
    setFinalTranscript("")
    setCurrentTranscription("")
    setTextInput("")
    setRecordingTime(0)
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setRecordingState("idle")
  }, [])

  const handleSendToChat = useCallback(() => {
    let messageContent = ""
    
    if (inputMode === "voice") {
      messageContent = (finalTranscript + currentTranscription).trim()
    } else {
      messageContent = textInput.trim()
    }
    
    if (messageContent) {
      if (voiceMode === "conversation") {
        // Handle as live conversation
        handleLiveConversation(messageContent)
        setFinalTranscript("")
        setCurrentTranscription("")
        setTextInput("")
      } else {
        // Handle as regular input
        onTransferToChat(messageContent)
        addActivity({
          type: "voice_input",
          title: "Message Sent",
          description: `Sent message: "${messageContent.slice(0, 50)}${messageContent.length > 50 ? '...' : ''}"`,
          status: "completed"
        })
        
        toast({
          title: "Message Sent",
          description: "Your message has been sent to the chat."
        })
        handleClose()
      }
    }
  }, [finalTranscript, currentTranscription, textInput, inputMode, voiceMode, onTransferToChat, addActivity, toast])

  const handleLiveConversation = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return

    const userMsg = {
      id: `user_${Date.now()}`,
      role: 'user' as const,
      content: userMessage.trim(),
      timestamp: new Date()
    }
    setConversationMessages(prev => [...prev, userMsg])

    try {
      const voiceSessionId = `voice_session_${leadContext?.name || 'user'}_${Date.now()}`
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: userMessage }
          ],
          data: {
            leadContext,
            sessionId: voiceSessionId
          }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let aiResponse = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.content) {
                  aiResponse += data.content
                }
                if (data.done) {
                  break
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      if (aiResponse) {
        const aiMsg = {
          id: `assistant_${Date.now()}`,
          role: 'assistant' as const,
          content: aiResponse,
          timestamp: new Date()
        }
        setConversationMessages(prev => [...prev, aiMsg])

        // Try to play TTS response
        try {
          await playGeminiTTS(aiResponse)
          addActivity({
            type: "voice_response",
            title: "AI Voice Response",
            description: "F.B/c AI is speaking back",
            status: "completed"
          })
        } catch (ttsError) {
          console.error('TTS Error:', ttsError)
        }
      }
    } catch (error) {
      console.error('Live conversation error:', error)
      toast({
        title: "Conversation Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      })
    }
  }, [leadContext, addActivity, toast])

  const playGeminiTTS = async (text: string) => {
    try {
      const res = await fetch('/api/gemini-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          enableTTS: true,
          voiceName: 'Puck',
          streamAudio: false
        })
      })
      
      if (!res.ok) {
        throw new Error(`TTS fetch failed: ${res.status}`)
      }
      
      const contentType = res.headers.get('content-type')
      
      if (contentType?.includes('audio/wav')) {
        const audioBlob = await res.blob()
        const url = URL.createObjectURL(audioBlob)
        const audio = new Audio(url)
        
        if (currentAudio) {
          currentAudio.pause()
          URL.revokeObjectURL(currentAudio.src)
        }
        
        setCurrentAudio(audio)
        await audio.play()
        
        audio.onended = () => {
          URL.revokeObjectURL(url)
          setCurrentAudio(null)
        }
      } else {
        const ttsData = await res.json()
        
        if (ttsData.success && ttsData.audioData) {
          const base64Data = ttsData.audioData.replace('data:audio/wav;base64,', '')
          const binaryString = atob(base64Data)
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }
          const blob = new Blob([bytes], { type: 'audio/wav' })
          
          const url = URL.createObjectURL(blob)
          const audio = new Audio(url)
          
          if (currentAudio) {
            currentAudio.pause()
            URL.revokeObjectURL(currentAudio.src)
          }
          
          setCurrentAudio(audio)
          await audio.play()
          
          audio.onended = () => {
            URL.revokeObjectURL(url)
            setCurrentAudio(null)
          }
        }
      }
    } catch (error) {
      console.error('TTS Error:', error)
      throw error
    }
  }

  const handleClose = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setRecordingState("idle")
    setFinalTranscript("")
    setCurrentTranscription("")
    setTextInput("")
    setRecordingTime(0)
    onClose()
  }, [onClose])

  const getStateMessage = () => {
    if (inputMode === "text") {
      return "Type your message below"
    }
    
    switch (recordingState) {
      case "listening":
        return "Listening... Tap to stop"
      case "paused":
        return "Paused. Tap to resume"
      case "processing":
        return "Processing your voice..."
      case "permission-denied":
        return "Microphone access denied. Use text input instead."
      case "error":
        return "Error occurred. Use text input instead."
      default:
        return "Ready to record. Tap the microphone to start"
    }
  }

  const fullTranscript = finalTranscript + currentTranscription
  const hasContent = inputMode === "voice" ? fullTranscript.trim() : textInput.trim()

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

          {/* Mode switcher */}
          <div className="absolute top-6 left-6 flex gap-2">
            <Button
              variant={voiceMode === "input" ? "default" : "outline"}
              size="sm"
              onClick={() => setVoiceMode("input")}
              className={cn(
                "bg-white/10 border-white/20 text-white hover:bg-white/20",
                voiceMode === "input" && "bg-white/20"
              )}
            >
              <Mic className="w-4 h-4 mr-2" />
              Voice Input
            </Button>
            <Button
              variant={voiceMode === "conversation" ? "default" : "outline"}
              size="sm"
              onClick={() => setVoiceMode("conversation")}
              className={cn(
                "bg-white/10 border-white/20 text-white hover:bg-white/20",
                voiceMode === "conversation" && "bg-white/20"
              )}
            >
              <Radio className="w-4 h-4 mr-2" />
              Live Chat
            </Button>
          </div>

          {/* Input mode switcher */}
          <div className="absolute top-16 left-6 flex gap-2">
            <Button
              variant={inputMode === "voice" ? "default" : "outline"}
              size="sm"
              onClick={() => setInputMode("voice")}
              disabled={!isSupported || !permissionGranted}
              className={cn(
                "bg-white/10 border-white/20 text-white hover:bg-white/20",
                inputMode === "voice" && "bg-white/20",
                (!isSupported || !permissionGranted) && "opacity-50 cursor-not-allowed"
              )}
            >
              <Mic className="w-4 h-4 mr-2" />
              Voice
            </Button>
            <Button
              variant={inputMode === "text" ? "default" : "outline"}
              size="sm"
              onClick={() => setInputMode("text")}
              className={cn(
                "bg-white/10 border-white/20 text-white hover:bg-white/20",
                inputMode === "text" && "bg-white/20"
              )}
            >
              <Type className="w-4 h-4 mr-2" />
              Text
            </Button>
          </div>

          {/* Main content */}
          <div className="flex flex-col items-center space-y-8 w-full">
            {/* Voice Recording Orb (only show for voice mode) */}
            {inputMode === "voice" && (
              <motion.div
                className={cn(
                  "relative w-40 h-40 rounded-full bg-gradient-to-br shadow-2xl backdrop-blur-sm border border-white/20 cursor-pointer",
                  recordingState === "listening" ? "from-red-400 via-red-500 to-red-600" : "from-slate-400 via-slate-500 to-slate-600",
                  (!isSupported || !permissionGranted) && "opacity-50 cursor-not-allowed"
                )}
                animate={{ 
                  scale: recordingState === "listening" ? [1, 1.05, 1] : 1,
                }}
                transition={{ 
                  scale: { duration: 1, repeat: recordingState === "listening" ? Infinity : 0, ease: "easeInOut" }
                }}
                whileHover={{ scale: (isSupported && permissionGranted) ? 1.05 : 1 }}
                whileTap={{ scale: (isSupported && permissionGranted) ? 0.95 : 1 }}
                onClick={handleOrbClick}
              >
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Mic className="w-12 h-12 text-white" />
                </div>
                {recordingTime > 0 && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                    <span className="text-sm text-muted-foreground font-mono">
                      {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Status and Info */}
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-white">
                {voiceMode === "conversation" ? "Live Voice Chat" : "Voice Input"}
              </h2>
              
              <div className="flex items-center justify-center gap-4 text-white/70">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "border-white/20",
                    recordingState === "listening" && "bg-red-500/20 text-red-200 border-red-500/30",
                    recordingState === "processing" && "bg-blue-500/20 text-blue-200 border-blue-500/30",
                    recordingState === "error" && "bg-red-600/20 text-red-200 border-red-600/30",
                    recordingState === "permission-denied" && "bg-orange-600/20 text-orange-200 border-orange-600/30",
                    recordingState === "idle" && "bg-white/10 text-white"
                  )}
                >
                  {recordingState === "listening" && "Recording"}
                  {recordingState === "processing" && "Processing"}
                  {recordingState === "error" && "Error"}
                  {recordingState === "permission-denied" && "Access Denied"}
                  {recordingState === "idle" && "Ready"}
                </Badge>
                
                {inputMode === "voice" && recordingTime > 0 && (
                  <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                    {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                  </Badge>
                )}
              </div>
              
              <p className="text-white/80 text-lg">
                {getStateMessage()}
              </p>
            </div>

            {/* Input/Transcript Display */}
            <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg flex items-center justify-between">
                  {voiceMode === "conversation" ? "Conversation" : (inputMode === "voice" ? "Transcript" : "Text Input")}
                  {hasContent && (
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
                <div className="min-h-[120px] max-h-[300px] overflow-y-auto space-y-2">
                  {inputMode === "text" ? (
                    // Text input mode
                    <Textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Type your message here..."
                      className="bg-white/10 border-white/20 text-white placeholder-white/50 resize-none"
                      rows={4}
                    />
                  ) : voiceMode === "conversation" ? (
                    // Conversation mode
                    <div className="space-y-3">
                      {conversationMessages.map((msg) => (
                        <div key={msg.id} className={cn(
                          "flex items-start gap-3 p-3 rounded-lg",
                          msg.role === "user" ? "bg-blue-500/20 text-blue-100" : "bg-green-500/20 text-green-100"
                        )}>
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                            {msg.role === "user" ? (
                              <Mic className="w-3 h-3" />
                            ) : (
                              <Bot className="w-3 h-3" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white/90 mb-1">
                              {msg.role === "user" ? "You" : "AI Assistant"}
                            </div>
                            <div className="text-sm text-white/80 leading-relaxed">
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {fullTranscript && (
                        <div className="p-3 rounded-lg bg-blue-500/20 text-blue-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Mic className="w-4 h-4" />
                            <span className="text-sm font-medium">You (speaking...)</span>
                          </div>
                          <div className="text-sm text-white/80">
                            {finalTranscript && (
                              <span className="text-white/90">{finalTranscript}</span>
                            )}
                            {currentTranscription && (
                              <span className="text-white/60 italic">
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
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {conversationMessages.length === 0 && !fullTranscript && (
                        <div className="flex items-center justify-center h-full text-white/50">
                          Start a conversation by speaking...
                        </div>
                      )}
                    </div>
                  ) : (
                    // Voice input mode - show transcript
                    fullTranscript ? (
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
                        {recordingState === "error" || recordingState === "permission-denied" ? (
                          "Use text input instead"
                        ) : (
                          "Your speech will appear here..."
                        )}
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Control Buttons */}
            <div className="flex items-center gap-4">
              {hasContent && (
                <Button
                  onClick={handleSendToChat}
                  disabled={recordingState === "processing"}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {voiceMode === "conversation" ? "Send Message" : "Send to Chat"}
                </Button>
              )}

              {inputMode === "voice" && recordingState === "permission-denied" && (
                <Button
                  onClick={() => setInputMode("text")}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Type className="w-4 h-4 mr-2" />
                  Use Text Input
                </Button>
              )}

              {inputMode === "voice" && recordingState === "error" && (
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
            {(!isSupported || recordingState === "error" || recordingState === "permission-denied") && inputMode === "voice" && (
              <Card className="bg-red-500/20 border-red-500/30 max-w-md">
                <CardContent className="p-4 text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MicOff className="w-5 h-5 text-red-400" />
                    <h3 className="text-red-200 font-semibold">
                      {!isSupported ? "Voice Input Not Supported" : 
                       recordingState === "permission-denied" ? "Microphone Access Denied" : 
                       "Voice Recognition Error"}
                    </h3>
                  </div>
                  
                  <p className="text-red-200 text-sm">
                    {!isSupported 
                      ? "Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari for voice input."
                      : recordingState === "permission-denied"
                      ? "We couldn't access your microphone. Please allow microphone access in your browser settings."
                      : "We couldn't access your microphone. This might be due to browser permissions or security settings."
                    }
                  </p>
                  
                  <div className="text-xs text-red-300/80 space-y-1 pt-2 border-t border-red-500/30">
                    <p>• Check browser microphone permissions</p>
                    <p>• Ensure you're using HTTPS</p>
                    <p>• Try refreshing the page</p>
                    <p>• Use text input instead</p>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInputMode("text")}
                    className="mt-3 bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-500/50"
                  >
                    <Type className="w-4 h-4 mr-2" />
                    Switch to Text Input
                  </Button>
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
