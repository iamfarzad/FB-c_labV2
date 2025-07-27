"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { X, Volume2, VolumeX, Play, Pause } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useChatContext } from "@/app/(chat)/chat/context/ChatProvider"
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
  const [voiceState, setVoiceState] = useState<VoiceState>("idle")
  const { addActivity } = useChatContext()
  const { toast } = useToast()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // ✅ NEW: Gemini TTS function
  const playGeminiTTS = async (text: string) => {
    console.log('🎤 Playing Gemini TTS:', { textLength: text.length })
    
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
    
    if (res.status === 429) {
      console.warn('🎤 TTS rate limited, skipping duplicate call')
      return // Gracefully handle rate limiting
    }
    
    if (!res.ok) {
      throw new Error(`TTS fetch failed: ${res.status}`)
    }
    
    // ✅ NEW: Handle raw audio response
    const contentType = res.headers.get('content-type')
    
    if (contentType?.includes('audio/wav')) {
      // Raw audio response - create blob directly
      const audioBlob = await res.blob()
      const url = URL.createObjectURL(audioBlob)
      const audio = new Audio(url)
      audioRef.current = audio
      
      // Set up audio event handlers
      audio.onplay = () => {
        setVoiceState("speaking")
        addActivity({
          type: "voice_response",
          title: "AI Speaking",
          description: "Playing Gemini TTS audio",
          status: "in_progress"
        })
      }
      
      audio.onended = () => {
        setVoiceState("idle")
        addActivity({
          type: "voice_response",
          title: "Speech Complete",
          description: "Finished playing Gemini TTS",
          status: "completed"
        })
        URL.revokeObjectURL(url)
        audioRef.current = null
      }
      
      audio.onerror = (error) => {
        setVoiceState("error")
        console.error('Gemini TTS Error:', error)
        toast({
          title: "Speech Error",
          description: "Failed to play Gemini TTS audio. Please try again.",
          variant: "destructive"
        })
        URL.revokeObjectURL(url)
        audioRef.current = null
      }
      
      await audio.play()
      console.log('✅ Gemini TTS raw audio played successfully')
    } else {
      // JSON response (fallback)
      const ttsData = await res.json()
      
      if (ttsData.success && ttsData.audioData) {
        // Convert base64 audio data to blob
        const base64Data = ttsData.audioData.replace('data:audio/wav;base64,', '')
        const binaryString = atob(base64Data)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        const blob = new Blob([bytes], { type: 'audio/wav' })
        
        // Play the audio
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audioRef.current = audio
        
        // Set up audio event handlers
        audio.onplay = () => {
          setVoiceState("speaking")
          addActivity({
            type: "voice_response",
            title: "AI Speaking",
            description: "Playing Gemini TTS audio",
            status: "in_progress"
          })
        }
        
        audio.onended = () => {
          setVoiceState("idle")
          addActivity({
            type: "voice_response",
            title: "Speech Complete",
            description: "Finished playing Gemini TTS",
            status: "completed"
          })
          URL.revokeObjectURL(url)
          audioRef.current = null
        }
        
        audio.onerror = (error) => {
          setVoiceState("error")
          console.error('Gemini TTS Error:', error)
          toast({
            title: "Speech Error",
            description: "Failed to play Gemini TTS audio. Please try again.",
            variant: "destructive"
          })
          URL.revokeObjectURL(url)
          audioRef.current = null
        }
        
        await audio.play()
        console.log('✅ Gemini TTS JSON audio played successfully')
      } else {
        throw new Error('No audio data received from Gemini TTS')
      }
    }
  }

  // Generate and play TTS using Gemini
  const generateAndPlayTTS = useCallback(async () => {
    if (!textContent.trim()) return
    
    try {
      setVoiceState("generating")
      
      await playGeminiTTS(textContent)
      
    } catch (error) {
      setVoiceState("error")
      console.error('Gemini TTS generation failed:', error)
      toast({
        title: "Speech Error",
        description: "Failed to generate Gemini TTS. Please try again.",
        variant: "destructive"
      })
    }
  }, [textContent, addActivity, toast])

  // Handle orb click - play/pause toggle
  const handleOrbClick = useCallback(() => {
    if (voiceState === "speaking" && audioRef.current) {
      audioRef.current.pause()
      setVoiceState("paused")
    } else if (voiceState === "paused" && audioRef.current) {
      audioRef.current.play()
      setVoiceState("speaking")
    } else {
      generateAndPlayTTS()
    }
  }, [voiceState, generateAndPlayTTS])

  // Handle close
  const handleClose = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
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
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
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