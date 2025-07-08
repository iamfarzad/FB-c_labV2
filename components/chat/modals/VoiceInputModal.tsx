"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { X, Send } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useChatContext } from "@/app/chat/context/ChatProvider"

interface VoiceInputModalProps {
  isOpen: boolean
  onClose: () => void
  onTransferToChat: (fullTranscript: string) => void
}

type AIState = "idle" | "listening" | "processing" | "error"

function AIOrb({ state, onClick }: { state: AIState; onClick: () => void }) {
  const getOrbColor = () => {
    switch (state) {
      case "listening":
        return "from-blue-400 to-blue-600"
      case "processing":
        return "from-yellow-400 to-orange-500"
      case "error":
        return "from-red-400 to-red-600"
      default:
        return "from-purple-400 to-indigo-600"
    }
  }

  return (
    <motion.div
      className={cn("relative w-32 h-32 rounded-full bg-gradient-to-r shadow-2xl cursor-pointer", getOrbColor())}
      animate={{ scale: state === "listening" ? [1, 1.1, 1] : 1 }}
      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <AnimatePresence>
        {state === "listening" && (
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
                  animate={{ height: [8, Math.random() * 20 + 10, 8] }}
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
    </motion.div>
  )
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({ isOpen, onClose, onTransferToChat }) => {
  const { addActivity } = useChatContext()
  const [aiState, setAIState] = useState<AIState>("idle")
  const [isRecording, setIsRecording] = useState(false)
  const [currentTranscription, setCurrentTranscription] = useState("")
  const recognitionRef = useRef<any>(null)

  const processAndClose = useCallback(() => {
    if (currentTranscription.trim()) {
      onTransferToChat(currentTranscription.trim())
      addActivity({
        type: "voice_input",
        title: "Voice Transcript Sent",
        description: "Voice conversation transferred to chat.",
        status: "completed",
      })
    }
    setCurrentTranscription("")
    setAIState("idle")
    setIsRecording(false)
    onClose()
  }, [currentTranscription, onTransferToChat, addActivity, onClose])

  const startRecording = useCallback(() => {
    if (recognitionRef.current) {
      setCurrentTranscription("")
      recognitionRef.current.start()
      setIsRecording(true)
      setAIState("listening")
      addActivity({ type: "voice_input", title: "Voice Recording Started", status: "in_progress" })
    }
  }, [addActivity])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsRecording(false)
      setAIState("processing")
    }
  }, [])

  const handleOrbClick = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  useEffect(() => {
    if (!isOpen) return

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (!SpeechRecognition) {
      setAIState("error")
      return
    }
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onresult = (event: any) => {
      let finalTranscript = ""
      let interimTranscript = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " "
        } else {
          interimTranscript += transcript
        }
      }
      setCurrentTranscription(finalTranscript + interimTranscript)
    }
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      setAIState("error")
    }
    recognition.onend = () => {
      setIsRecording(false)
      setAIState("idle")
    }
    recognitionRef.current = recognition
    startRecording() // Start immediately on open

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [isOpen, startRecording])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={processAndClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full h-full flex flex-col items-center justify-center p-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={processAndClose}
            className="absolute top-8 right-8 rounded-full bg-background/50"
          >
            <X className="w-5 h-5" />
          </Button>
          <div className="relative z-10 flex flex-col items-center justify-center space-y-12 w-full max-w-4xl">
            <AIOrb state={aiState} onClick={handleOrbClick} />
            <div className="w-full max-w-2xl mx-auto space-y-4 text-center">
              <p className="text-lg text-white bg-black/20 backdrop-blur-sm rounded-lg p-4 min-h-[6rem]">
                {currentTranscription || "Listening..."}
                {isRecording && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
                    className="ml-1"
                  >
                    |
                  </motion.span>
                )}
              </p>
              <div className="text-sm text-white/70">
                {isRecording ? "Tap orb to stop" : "Tap orb to start speaking"}
              </div>
            </div>
            <Button onClick={processAndClose} disabled={!currentTranscription.trim()} className="gap-2">
              <Send className="w-4 h-4" />
              Send to Chat
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default VoiceInputModal
