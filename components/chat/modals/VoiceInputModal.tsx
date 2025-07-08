"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { X, Volume2, VolumeX, Send } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useChatContext } from "@/app/chat/context/ChatProvider"

interface VoiceInputModalProps {
  isOpen: boolean
  onClose: () => void
  onTranscript?: (transcript: string) => void
  onAIResponse?: (response: string) => void
  onConversationUpdate?: (conversation: ConversationTurn[]) => void
  onTransferToChat?: (fullTranscript: string) => void
  theme?: "light" | "dark"
}

interface ConversationTurn {
  id: string
  type: "user" | "ai"
  text: string
  timestamp: number
  isComplete: boolean
}

// AI States matching your design
type AIState = "idle" | "listening" | "processing" | "speaking" | "error"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  transcription?: string
}

// AI Orb Component with breathing animation
interface AIOrbProps {
  state: AIState
  isRecording: boolean
  className?: string
  onClick?: () => void
}

function AIOrb({ state, isRecording, className, onClick }: AIOrbProps) {
  const getOrbColor = () => {
    switch (state) {
      case "listening":
        return "from-blue-400 to-blue-600"
      case "processing":
        return "from-yellow-400 to-orange-500"
      case "speaking":
        return "from-green-400 to-emerald-600"
      case "error":
        return "from-red-400 to-red-600"
      default:
        return "from-purple-400 to-indigo-600"
    }
  }

  const getGlowColor = () => {
    switch (state) {
      case "listening":
        return "shadow-blue-500/50"
      case "processing":
        return "shadow-yellow-500/50"
      case "speaking":
        return "shadow-green-500/50"
      case "error":
        return "shadow-red-500/50"
      default:
        return "shadow-purple-500/50"
    }
  }

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Outer glow rings */}
      <motion.div
        className={cn("absolute inset-0 rounded-full bg-gradient-to-r opacity-20", getOrbColor())}
        animate={{
          scale: state === "listening" || isRecording ? [1, 1.3, 1] : [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: state === "listening" || isRecording ? 1.5 : 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className={cn("absolute inset-2 rounded-full bg-gradient-to-r opacity-30", getOrbColor())}
        animate={{
          scale: state === "listening" || isRecording ? [1, 1.2, 1] : [1, 1.05, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: state === "listening" || isRecording ? 1.2 : 2.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 0.2,
        }}
      />

      {/* Main orb */}
      <motion.div
        className={cn(
          "relative w-32 h-32 rounded-full bg-gradient-to-r shadow-2xl cursor-pointer",
          getOrbColor(),
          getGlowColor(),
        )}
        animate={{
          scale: state === "listening" || isRecording ? [1, 1.1, 1] : [1, 1.02, 1],
        }}
        transition={{
          duration: state === "listening" || isRecording ? 1 : 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
      >
        {/* Inner glow */}
        <div className="absolute inset-2 rounded-full bg-white/20 backdrop-blur-sm" />

        {/* Voice visualization bars */}
        <AnimatePresence>
          {(state === "listening" || state === "speaking" || isRecording) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-white/80 rounded-full"
                    animate={{
                      height: [8, Math.random() * 20 + 10, 8],
                    }}
                    transition={{
                      duration: 0.5 + Math.random() * 0.5,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Microphone icon when idle */}
        <AnimatePresence>
          {state === "idle" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <svg className="w-8 h-8 text-white/90" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
                <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                <path d="M12 18v4" />
                <path d="M8 22h8" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Processing spinner */}
        <AnimatePresence>
          {state === "processing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-8 h-8 border-2 border-white/30 border-t-white/90 rounded-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

// Transcription Display Component
interface TranscriptionDisplayProps {
  currentTranscription: string
  lastMessage?: Message
  state: AIState
}

function TranscriptionDisplay({ currentTranscription, lastMessage, state }: TranscriptionDisplayProps) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Live transcription */}
      <AnimatePresence>
        {currentTranscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <div className="text-sm text-muted-foreground mb-2">You're saying:</div>
            <div className="text-lg text-foreground bg-background/50 backdrop-blur-sm rounded-lg p-4 border">
              {currentTranscription}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
                className="ml-1"
              >
                |
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Last AI response */}
      <AnimatePresence>
        {lastMessage && lastMessage.sender === "ai" && !currentTranscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <div className="text-sm text-muted-foreground mb-2">AI Response:</div>
            <div className="text-lg text-foreground bg-background/50 backdrop-blur-sm rounded-lg p-4 border">
              {lastMessage.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* State indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        <div className="text-sm text-muted-foreground">
          {state === "idle" && "Tap the orb to start speaking"}
          {state === "listening" && "Listening... Speak now"}
          {state === "processing" && "Processing your request..."}
          {state === "speaking" && "AI is responding..."}
          {state === "error" && "Something went wrong. Try again."}
        </div>
      </motion.div>
    </div>
  )
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isOpen,
  onClose,
  onTranscript,
  onAIResponse,
  onConversationUpdate,
  onTransferToChat,
}) => {
  const { addActivity } = useChatContext()
  const [conversation, setConversation] = useState<ConversationTurn[]>([])
  const [isActive, setIsActive] = useState(false)
  const [aiState, setAIState] = useState<AIState>("idle")
  const [isRecording, setIsRecording] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTranscription, setCurrentTranscription] = useState("")
  const [messages, setMessages] = useState<Message[]>([])

  const recordingTimeout = useRef<NodeJS.Timeout>()
  const recognitionRef = useRef<any>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "en-US"

      recognition.onstart = () => {
        setAIState("listening")
        setIsRecording(true)
      }

      recognition.onresult = (event: any) => {
        let interimTranscript = ""
        let finalTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        setCurrentTranscription(finalTranscript + interimTranscript)

        if (finalTranscript) {
          processUserInput(finalTranscript.trim())
        }
      }

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setAIState("error")
      }

      recognition.onend = () => {
        if (isActive && aiState === "listening") {
          recognition.start() // Restart if still active
        }
      }

      recognitionRef.current = recognition
    }
  }, [isActive, aiState])

  const startRecording = useCallback(() => {
    setIsActive(true)
    setIsRecording(true)
    setAIState("listening")
    setCurrentTranscription("")

    addActivity({
      type: "voice_input",
      title: "Voice Recording Started",
      description: "Listening for voice input",
      status: "in_progress",
    })

    if (recognitionRef.current) {
      recognitionRef.current.start()
    }

    // Auto-stop recording after 10 seconds
    recordingTimeout.current = setTimeout(() => {
      stopRecording()
    }, 10000)
  }, [addActivity])

  const stopRecording = useCallback(() => {
    setIsRecording(false)
    setAIState("processing")
    if (recordingTimeout.current) {
      clearTimeout(recordingTimeout.current)
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }, [])

  const processUserInput = useCallback(
    async (userText: string) => {
      if (!userText.trim()) return

      addActivity({
        type: "voice_input",
        title: "Voice Input Received",
        description: `User said: "${userText.substring(0, 50)}..."`,
        status: "completed",
      })

      setIsRecording(false)
      setAIState("processing")

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content: userText,
        sender: "user",
        timestamp: new Date(),
        transcription: userText,
      }

      setMessages((prev) => [...prev, userMessage])

      // Add to conversation
      const userTurn: ConversationTurn = {
        id: Date.now().toString(),
        type: "user",
        text: userText,
        timestamp: Date.now(),
        isComplete: true,
      }

      setConversation((prev) => [...prev, userTurn])
      setCurrentTranscription("")

      try {
        // Simulate AI processing
        await new Promise((resolve) => setTimeout(resolve, 2000))

        setAIState("speaking")

        // Simulate AI response generation
        const aiResponse = `I understand you said: "${userText}". Here's my thoughtful response to continue our conversation.`

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          sender: "ai",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, aiMessage])

        // Add AI response to conversation
        const aiTurn: ConversationTurn = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          text: aiResponse,
          timestamp: Date.now(),
          isComplete: true,
        }

        setConversation((prev) => [...prev, aiTurn])

        // Simulate AI speech duration
        await new Promise((resolve) => setTimeout(resolve, 3000))

        // Return to idle
        setAIState("idle")
        setIsActive(false)

        onAIResponse?.(aiResponse)

        addActivity({
          type: "ai_thinking",
          title: "AI Voice Response",
          description: "AI responded with voice message",
          status: "completed",
        })
      } catch (error) {
        console.error("AI processing error:", error)
        setAIState("error")
      }
    },
    [onAIResponse, addActivity],
  )

  const handleOrbClick = useCallback(() => {
    if (aiState === "processing" || aiState === "speaking") return

    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [aiState, isRecording, startRecording, stopRecording])

  // Initialize speech recognition on mount
  useEffect(() => {
    if (isOpen) {
      initializeSpeechRecognition()
    }
  }, [isOpen, initializeSpeechRecognition])

  // Handle modal close
  const handleClose = useCallback(() => {
    if (conversation.length > 0) {
      const fullTranscript = `Voice Conversation Summary:
${conversation
  .map((turn, index) => {
    const speaker = turn.type === "user" ? "You" : "AI Assistant"
    const timestamp = new Date(turn.timestamp).toLocaleTimeString()
    return `${index + 1}. ${speaker} (${timestamp}): ${turn.text}`
  })
  .join("\n\n")}

---
Continue this conversation in text chat below:`

      addActivity({
        type: "chat_summary",
        title: "Voice Transcript Transferred",
        description: `${conversation.length} voice messages sent to chat`,
        status: "completed",
      })

      onTransferToChat?.(fullTranscript)
    }

    setIsActive(false)
    setIsRecording(false)
    setAIState("idle")
    setCurrentTranscription("")
    setMessages([])
    setConversation([])

    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    if (recordingTimeout.current) {
      clearTimeout(recordingTimeout.current)
    }

    onClose()
  }, [conversation, onTransferToChat, onClose, addActivity])

  const lastMessage = messages[messages.length - 1]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full h-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="min-h-screen w-full flex flex-col items-center justify-center p-8 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-foreground/10 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -100, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            {/* Close button */}
            <div className="absolute top-8 right-8 z-10 flex items-center gap-2">
              {conversation.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleClose} className="gap-2 bg-background/50">
                  <Send className="w-4 h-4" />
                  Send to Chat
                </Button>
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMuted(!isMuted)}
                className="p-3 rounded-full bg-background/50 backdrop-blur-sm border border-border hover:bg-background/70 transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </motion.button>
              <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full bg-background/50">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Main content */}
            <div className="relative z-10 flex flex-col items-center justify-center space-y-12 w-full max-w-4xl">
              {/* AI Orb */}
              <AIOrb state={aiState} isRecording={isRecording} className="w-48 h-48" onClick={handleOrbClick} />

              {/* Transcription Display */}
              <TranscriptionDisplay
                currentTranscription={currentTranscription}
                lastMessage={lastMessage}
                state={aiState}
              />

              {/* Recording indicator */}
              <AnimatePresence>
                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                      className="w-2 h-2 bg-red-500 rounded-full"
                    />
                    Recording... Tap orb to stop
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Conversation history indicator */}
            <AnimatePresence>
              {messages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-8 left-8 text-sm text-muted-foreground"
                >
                  {messages.length} message{messages.length !== 1 ? "s" : ""} exchanged
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default VoiceInputModal
