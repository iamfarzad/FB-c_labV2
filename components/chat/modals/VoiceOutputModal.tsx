"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { X, Volume2, VolumeX, Play, Pause } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useChatContext } from "@/app/chat/context/ChatProvider"
import { useToast } from "@/components/ui/use-toast"

interface VoiceOutputModalProps {
  isOpen: boolean
  onClose: () => void
  textContent: string
  voiceStyle?: string
  autoPlay?: boolean
}

type VoiceState = "idle" | "generating" | "speaking" | "paused" | "error"

// Simplified Voice Orb - Just the essentials
function VoiceOrb({ 
  state, 
  onClick 
}: { 
  state: VoiceState
  onClick: () => void
}) {
  const getOrbColor = () => {
    switch (state) {
      case "speaking":
        return "from-green-400 to-green-600"
      case "generating":
        return "from-blue-400 to-blue-600"
      case "paused":
        return "from-yellow-400 to-yellow-600"
      case "error":
        return "from-red-400 to-red-600"
      default:
        return "from-purple-400 to-purple-600"
    }
  }

  const getIcon = () => {
    switch (state) {
      case "speaking":
        return <Pause className="w-8 h-8 text-white" />
      case "paused":
      case "idle":
        return <Play className="w-8 h-8 text-white" />
      case "error":
        return <VolumeX className="w-8 h-8 text-white" />
      case "generating":
        return <Volume2 className="w-8 h-8 text-white" />
    }
  }

  return (
    <motion.div
      className={cn(
        "relative w-24 h-24 rounded-full bg-gradient-to-r shadow-2xl cursor-pointer",
        getOrbColor()
      )}
      animate={{ 
        scale: state === "speaking" ? [1, 1.05, 1] : 1,
        rotate: state === "generating" ? 360 : 0
      }}
      transition={{ 
        scale: { 
          duration: 1, 
          repeat: state === "speaking" ? Infinity : 0, 
          ease: "easeInOut" 
        },
        rotate: { 
          duration: 2, 
          repeat: state === "generating" ? Infinity : 0, 
          ease: "linear" 
        }
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {state === "speaking" && (
          <motion.div
            className="flex items-center gap-1"
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-white rounded-full"
                animate={{ height: [6, Math.random() * 16 + 8, 6] }}
                transition={{
                  duration: 0.5 + Math.random() * 0.3,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  delay: i * 0.1,
                }}
              />
            ))}
          </motion.div>
        )}
        {state !== "speaking" && getIcon()}
      </div>
    </motion.div>
  )
}

export const VoiceOutputModal: React.FC<VoiceOutputModalProps> = ({ 
  isOpen, 
  onClose, 
  textContent,
  voiceStyle = "neutral",
  autoPlay = true
}) => {
  const { addActivity } = useChatContext()
  const { toast } = useToast()
  const [voiceState, setVoiceState] = useState<VoiceState>("idle")
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Simple TTS using browser's Speech Synthesis API
  const generateAndPlayTTS = useCallback(async () => {
    if (!('speechSynthesis' in window)) {
      setVoiceState("error")
      toast({
        title: "Speech Not Supported",
        description: "Your browser doesn't support text-to-speech.",
        variant: "destructive"
      })
      return
    }

    setVoiceState("generating")

    try {
      // Stop any existing speech
      speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(textContent)
      
      // Wait for voices to load if they haven't already
      const getVoices = () => {
        return new Promise<SpeechSynthesisVoice[]>((resolve) => {
          const voices = speechSynthesis.getVoices()
          if (voices.length > 0) {
            resolve(voices)
          } else {
            speechSynthesis.addEventListener('voiceschanged', () => {
              resolve(speechSynthesis.getVoices())
            }, { once: true })
          }
        })
      }

      const voices = await getVoices()
      
      // Select voice based on style
      let selectedVoice = voices.find(v => v.default) || voices[0]
      
      if (voiceStyle === "neutral") {
        selectedVoice = voices.find(v => 
          v.name.toLowerCase().includes('samantha') || 
          v.name.toLowerCase().includes('karen') ||
          v.name.toLowerCase().includes('daniel')
        ) || selectedVoice
      }
      
      utterance.voice = selectedVoice
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8

      utterance.onstart = () => {
        setVoiceState("speaking")
        addActivity({
          type: "voice_response",
          title: "AI Speaking",
          description: "Converting text to speech",
          status: "in_progress"
        })
      }
      
      utterance.onend = () => {
        setVoiceState("idle")
        addActivity({
          type: "voice_response",
          title: "Speech Complete",
          description: "Finished speaking response",
          status: "completed"
        })
      }
      
      utterance.onerror = (error) => {
        setVoiceState("error")
        console.error('TTS Error:', error)
        toast({
          title: "Speech Error",
          description: "Failed to generate speech. Please try again.",
          variant: "destructive"
        })
      }
      
      synthRef.current = utterance
      speechSynthesis.speak(utterance)
      
    } catch (error) {
      setVoiceState("error")
      console.error('TTS generation failed:', error)
      toast({
        title: "Speech Error",
        description: "Failed to generate speech. Please try again.",
        variant: "destructive"
      })
    }
  }, [textContent, voiceStyle, addActivity, toast])

  // Handle orb click - play/pause toggle
  const handleOrbClick = useCallback(() => {
    if (voiceState === "speaking") {
      speechSynthesis.pause()
      setVoiceState("paused")
    } else if (voiceState === "paused") {
      speechSynthesis.resume()
      setVoiceState("speaking")
    } else {
      generateAndPlayTTS()
    }
  }, [voiceState, generateAndPlayTTS])

  // Handle close
  const handleClose = useCallback(() => {
    speechSynthesis.cancel()
    setVoiceState("idle")
    onClose()
  }, [onClose])

  // Auto-play when modal opens
  useEffect(() => {
    if (isOpen && autoPlay && textContent) {
      // Small delay to let modal appear
      setTimeout(() => {
        generateAndPlayTTS()
      }, 500)
    }
  }, [isOpen, autoPlay, textContent, generateAndPlayTTS])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      speechSynthesis.cancel()
    }
  }, [])

  const getStatusText = () => {
    switch (voiceState) {
      case "generating":
        return "Preparing speech..."
      case "speaking":
        return "AI is speaking"
      case "paused":
        return "Speech paused"
      case "error":
        return "Speech error occurred"
      default:
        return "Ready to speak"
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="flex flex-col items-center justify-center p-8 relative"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute -top-12 right-0 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Voice Orb */}
          <VoiceOrb 
            state={voiceState} 
            onClick={handleOrbClick}
          />

          {/* Simple Status */}
          <div className="mt-6 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">
              {getStatusText()}
            </h3>
            <p className="text-sm text-white/70 max-w-md">
              {voiceState === "idle" && "Tap to hear AI response"}
              {voiceState === "generating" && "Converting text to speech..."}
              {voiceState === "speaking" && "Tap to pause"}
              {voiceState === "paused" && "Tap to resume"}
              {voiceState === "error" && "Tap to try again"}
            </p>
          </div>

          {/* Show text content in small print for reference */}
          <div className="mt-4 max-w-md max-h-20 overflow-y-auto bg-black/20 rounded p-3">
            <p className="text-xs text-white/60 leading-relaxed">
              {textContent}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default VoiceOutputModal 