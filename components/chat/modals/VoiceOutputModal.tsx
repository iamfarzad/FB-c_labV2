"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { X, Volume2, VolumeX, Play, Pause, SkipForward } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { useChatContext } from "@/app/chat/context/ChatProvider"
import { useAudioPlayer } from "@/hooks/useAudioPlayer"

interface VoiceOutputModalProps {
  isOpen: boolean
  onClose: () => void
  textContent: string
  audioData?: string
  audioChunks?: string[]
  voiceStyle?: string
  autoPlay?: boolean
}

type VoiceState = "idle" | "loading" | "speaking" | "paused" | "error"

function VoiceOrb({ 
  state, 
  onClick, 
  progress 
}: { 
  state: VoiceState
  onClick: () => void
  progress: number 
}) {
  const getOrbColor = () => {
    switch (state) {
      case "speaking":
        return "from-green-400 to-green-600"
      case "loading":
        return "from-orange-400 to-orange-500"
      case "paused":
        return "from-blue-400 to-blue-600"
      case "error":
        return "from-red-400 to-red-600"
      default:
        return "from-purple-400 to-indigo-600"
    }
  }

  return (
    <div className="relative">
      {/* Progress Ring */}
      <svg className="absolute inset-0 w-32 h-32 -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="2"
          fill="none"
          strokeDasharray={`${2 * Math.PI * 45}`}
          strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress)}`}
          className="transition-all duration-300"
        />
      </svg>

      <motion.div
        className={cn("relative w-32 h-32 rounded-full bg-gradient-to-r shadow-2xl cursor-pointer", getOrbColor())}
        animate={{ 
          scale: state === "speaking" ? [1, 1.05, 1] : 1,
          rotate: state === "loading" ? 360 : 0
        }}
        transition={{ 
          scale: { duration: 1, repeat: state === "speaking" ? Infinity : 0, ease: "easeInOut" },
          rotate: { duration: 2, repeat: state === "loading" ? Infinity : 0, ease: "linear" }
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {state === "speaking" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1"
            >
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
            </motion.div>
          )}
          {state === "paused" && (
            <Play className="w-8 h-8 text-white/80" />
          )}
          {state === "idle" && (
            <Volume2 className="w-8 h-8 text-white/80" />
          )}
          {state === "error" && (
            <VolumeX className="w-8 h-8 text-white/80" />
          )}
        </div>
      </motion.div>
    </div>
  )
}

export const VoiceOutputModal: React.FC<VoiceOutputModalProps> = ({ 
  isOpen, 
  onClose, 
  textContent,
  audioData,
  audioChunks,
  voiceStyle = "neutral",
  autoPlay = true
}) => {
  const { addActivity } = useChatContext()
  const [voiceState, setVoiceState] = useState<VoiceState>("idle")
  const [showTranscript, setShowTranscript] = useState(true)

  const { state: audioState, controls: audioControls } = useAudioPlayer({
    autoPlay: false,
    volume: 0.8,
    onPlay: () => {
      setVoiceState("speaking")
      addActivity({
        type: "voice_response",
        title: "AI Voice Response",
        description: "AI is speaking response",
        status: "in_progress"
      })
    },
    onPause: () => {
      setVoiceState("paused")
    },
    onEnd: () => {
      setVoiceState("idle")
      addActivity({
        type: "voice_response",
        title: "AI Voice Complete",
        description: "AI finished speaking",
        status: "completed"
      })
    },
    onError: (error) => {
      setVoiceState("error")
      addActivity({
        type: "error",
        title: "Voice Playback Error",
        description: error,
        status: "failed"
      })
    }
  })

  // Calculate progress
  const progress = audioState.duration > 0 ? audioState.currentTime / audioState.duration : 0

  // Load audio when modal opens
  useEffect(() => {
    if (!isOpen) return

    const loadAudio = async () => {
      setVoiceState("loading")
      
      try {
        if (audioChunks && audioChunks.length > 0) {
          // Play streaming audio chunks
          await audioControls.playStreamingAudio(audioChunks)
        } else if (audioData) {
          // Play single audio data
          await audioControls.playAudioData(audioData)
        } else {
          // Generate audio from text using TTS API
          const response = await fetch('/api/gemini-live', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: textContent,
              enableTTS: true,
              voiceStyle: voiceStyle,
              streamAudio: false
            })
          })

          if (!response.ok) {
            throw new Error('Failed to generate audio')
          }

          const data = await response.json()
          if (data.success && data.audioData) {
            await audioControls.playAudioData(data.audioData)
          } else {
            throw new Error('No audio data received')
          }
        }

        if (autoPlay) {
          setTimeout(() => {
            audioControls.play()
          }, 500) // Small delay for better UX
        } else {
          setVoiceState("idle")
        }
      } catch (error) {
        console.error('Failed to load audio:', error)
        setVoiceState("error")
      }
    }

    loadAudio()
  }, [isOpen, textContent, audioData, audioChunks, voiceStyle, autoPlay, audioControls])

  // Update voice state based on audio state
  useEffect(() => {
    if (audioState.isLoading && voiceState !== "loading") {
      setVoiceState("loading")
    } else if (audioState.isPlaying && voiceState !== "speaking") {
      setVoiceState("speaking")
    } else if (audioState.isPaused && voiceState !== "paused") {
      setVoiceState("paused")
    } else if (audioState.error && voiceState !== "error") {
      setVoiceState("error")
    }
  }, [audioState, voiceState])

  const handleOrbClick = useCallback(() => {
    if (audioState.isPlaying) {
      audioControls.pause()
    } else {
      audioControls.play()
    }
  }, [audioState.isPlaying, audioControls])

  const handleClose = useCallback(() => {
    audioControls.stop()
    setVoiceState("idle")
    onClose()
  }, [audioControls, onClose])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

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
          className="w-full h-full flex flex-col items-center justify-center p-8 relative"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute top-8 right-8 rounded-full bg-background/50"
          >
            <X className="w-5 h-5" />
          </Button>

          <div className="relative z-10 flex flex-col items-center justify-center space-y-8 w-full max-w-4xl">
            {/* Voice Orb */}
            <VoiceOrb 
              state={voiceState} 
              onClick={handleOrbClick}
              progress={progress}
            />

            {/* Voice Status */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">
                {voiceState === "loading" && "Generating voice..."}
                {voiceState === "speaking" && "AI is speaking"}
                {voiceState === "paused" && "Paused"}
                {voiceState === "idle" && "Ready to play"}
                {voiceState === "error" && "Audio error"}
              </h2>
              <p className="text-sm text-white/70">
                Voice: {voiceStyle} • {formatTime(audioState.currentTime)} / {formatTime(audioState.duration)}
              </p>
            </div>

            {/* Audio Controls */}
            <div className="w-full max-w-md space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <Slider
                  value={[progress * 100]}
                  onValueChange={(value) => {
                    const newTime = (value[0] / 100) * audioState.duration
                    audioControls.seek(newTime)
                  }}
                  max={100}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => audioControls.seek(Math.max(0, audioState.currentTime - 10))}
                  disabled={!audioState.duration}
                  className="rounded-full"
                >
                  <SkipForward className="w-4 h-4 rotate-180" />
                </Button>

                <Button
                  size="lg"
                  onClick={handleOrbClick}
                  disabled={voiceState === "loading" || voiceState === "error"}
                  className="rounded-full w-16 h-16"
                >
                  {audioState.isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => audioControls.seek(Math.min(audioState.duration, audioState.currentTime + 10))}
                  disabled={!audioState.duration}
                  className="rounded-full"
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-3">
                <VolumeX className="w-4 h-4 text-white/70" />
                <Slider
                  value={[audioState.volume * 100]}
                  onValueChange={(value) => audioControls.setVolume(value[0] / 100)}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <Volume2 className="w-4 h-4 text-white/70" />
              </div>
            </div>

            {/* Transcript Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowTranscript(!showTranscript)}
              className="text-sm"
            >
              {showTranscript ? "Hide" : "Show"} Transcript
            </Button>

            {/* Transcript */}
            {showTranscript && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full max-w-2xl mx-auto"
              >
                <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 max-h-32 overflow-y-auto">
                  <p className="text-sm text-white/90 leading-relaxed">
                    {textContent}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {voiceState === "error" && (
              <div className="text-center text-red-400 text-sm">
                Failed to load or play audio. Please try again.
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default VoiceOutputModal 