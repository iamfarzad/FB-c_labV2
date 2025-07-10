"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { X, Volume2, VolumeX, Play, Pause, SkipForward, Download, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useChatContext } from "@/app/chat/context/ChatProvider"
import { useToast } from "@/components/ui/use-toast"

interface VoiceOutputModalProps {
  isOpen: boolean
  onClose: () => void
  textContent: string
  audioData?: string
  audioChunks?: string[]
  voiceStyle?: string
  autoPlay?: boolean
}

type VoiceState = "idle" | "loading" | "speaking" | "paused" | "error" | "generating"

// Improved Voice Orb Component
function VoiceOrb({ 
  state, 
  onClick, 
  progress,
  size = "large" 
}: { 
  state: VoiceState
  onClick: () => void
  progress: number
  size?: "small" | "large"
}) {
  const orbSize = size === "large" ? "w-32 h-32" : "w-16 h-16"
  const iconSize = size === "large" ? "w-8 h-8" : "w-4 h-4"
  
  const getOrbColor = () => {
    switch (state) {
      case "speaking":
        return "from-emerald-400 via-emerald-500 to-emerald-600"
      case "loading":
      case "generating":
        return "from-amber-400 via-amber-500 to-amber-600"
      case "paused":
        return "from-blue-400 via-blue-500 to-blue-600"
      case "error":
        return "from-red-400 via-red-500 to-red-600"
      default:
        return "from-purple-400 via-purple-500 to-purple-600"
    }
  }

  return (
    <div className="relative">
      {/* Outer glow ring */}
      <div className={cn(
        "absolute inset-0 rounded-full opacity-20 blur-xl",
        orbSize,
        `bg-gradient-to-r ${getOrbColor()}`
      )} />
      
      {/* Progress Ring */}
      <svg className={cn("absolute inset-0 -rotate-90", orbSize)} viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="2"
          fill="none"
          strokeDasharray={`${2 * Math.PI * 45}`}
          strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress)}`}
          className="transition-all duration-500 ease-out"
        />
      </svg>

      <motion.div
        className={cn(
          "relative rounded-full bg-gradient-to-r shadow-2xl cursor-pointer backdrop-blur-sm",
          orbSize,
          getOrbColor()
        )}
        animate={{ 
          scale: state === "speaking" ? [1, 1.05, 1] : 1,
          rotate: state === "loading" || state === "generating" ? 360 : 0
        }}
        transition={{ 
          scale: { 
            duration: 1.2, 
            repeat: state === "speaking" ? Infinity : 0, 
            ease: "easeInOut" 
          },
          rotate: { 
            duration: 2, 
            repeat: state === "loading" || state === "generating" ? Infinity : 0, 
            ease: "linear" 
          }
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {(state === "speaking") && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1"
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-white/90 rounded-full"
                  animate={{ height: [8, Math.random() * 24 + 12, 8] }}
                  transition={{
                    duration: 0.6 + Math.random() * 0.4,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    delay: i * 0.1,
                  }}
                />
              ))}
            </motion.div>
          )}
          {state === "paused" && (
            <Play className={cn(iconSize, "text-white/90")} />
          )}
          {(state === "idle") && (
            <Volume2 className={cn(iconSize, "text-white/90")} />
          )}
          {state === "error" && (
            <VolumeX className={cn(iconSize, "text-white/90")} />
          )}
          {(state === "loading" || state === "generating") && (
            <RefreshCw className={cn(iconSize, "text-white/90 animate-spin")} />
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
  const { toast } = useToast()
  const [voiceState, setVoiceState] = useState<VoiceState>("idle")
  const [showTranscript, setShowTranscript] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isClientTTS, setIsClientTTS] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio()
    audio.volume = volume
    audio.preload = 'metadata'
    
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleDurationChange = () => setDuration(audio.duration)
    const handlePlay = () => setVoiceState("speaking")
    const handlePause = () => setVoiceState("paused")
    const handleEnded = () => {
      setVoiceState("idle")
      setCurrentTime(0)
    }
    const handleError = () => setVoiceState("error")
    
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleDurationChange)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    
    audioRef.current = audio
    
    return () => {
      audio.pause()
      audio.src = ''
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleDurationChange)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [volume])

  // Load audio when modal opens
  useEffect(() => {
    if (!isOpen) return

    const loadAudio = async () => {
      setVoiceState("generating")
      
      try {
        if (audioChunks && audioChunks.length > 0) {
          // Handle streaming audio chunks
          const fullAudioData = audioChunks.join('')
          await loadAudioData(fullAudioData)
        } else if (audioData) {
          // Check if it's client TTS instructions
          try {
            const parsed = JSON.parse(audioData)
            if (parsed.type === 'client_tts') {
              setIsClientTTS(true)
              await generateClientTTS(parsed.text, parsed.voiceStyle)
              return
            }
          } catch {
            // Not JSON, treat as regular audio data
          }
          
          await loadAudioData(audioData)
        } else {
          // Generate audio from text using TTS API
          await generateServerTTS(textContent)
        }

        if (autoPlay) {
          setTimeout(() => {
            playAudio()
          }, 500)
        } else {
          setVoiceState("idle")
        }
      } catch (error) {
        console.error('Failed to load audio:', error)
        setVoiceState("error")
        toast({
          title: "Audio Error",
          description: "Failed to generate or load audio. Please try again.",
          variant: "destructive"
        })
      }
    }

    loadAudio()
  }, [isOpen, textContent, audioData, audioChunks, voiceStyle, autoPlay])

  const loadAudioData = async (data: string) => {
    if (!audioRef.current) return
    
    const audioUrl = data.startsWith('data:') ? data : `data:audio/mp3;base64,${data}`
    audioRef.current.src = audioUrl
    setIsClientTTS(false)
  }

  const generateServerTTS = async (text: string) => {
    const response = await fetch('/api/gemini-live', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: text,
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
      // Check if it's client TTS instructions
      try {
        const parsed = JSON.parse(data.audioData)
        if (parsed.type === 'client_tts') {
          setIsClientTTS(true)
          await generateClientTTS(parsed.text, parsed.voiceStyle)
          return
        }
      } catch {
        // Not JSON, treat as regular audio data
      }
      
      await loadAudioData(data.audioData)
    } else {
      throw new Error('No audio data received')
    }
  }

  const generateClientTTS = async (text: string, voice: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'))
        return
      }

      const utterance = new SpeechSynthesisUtterance(text)
      
      // Configure voice
      const voices = speechSynthesis.getVoices()
      const selectedVoice = voices.find(v => 
        v.name.toLowerCase().includes(voice.toLowerCase()) ||
        (voice === 'neutral' && v.default)
      ) || voices[0]
      
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }
      
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = volume
      
      utterance.onstart = () => {
        setVoiceState("speaking")
        setCurrentTime(0)
        setDuration(text.length / 10) // Rough estimation
      }
      
      utterance.onend = () => {
        setVoiceState("idle")
        setCurrentTime(0)
        resolve()
      }
      
      utterance.onerror = (error) => {
        setVoiceState("error")
        reject(new Error(`Speech synthesis failed: ${error.error}`))
      }
      
      synthRef.current = utterance
      speechSynthesis.speak(utterance)
    })
  }

  const playAudio = () => {
    if (isClientTTS) {
      if (synthRef.current) {
        speechSynthesis.speak(synthRef.current)
      } else {
        generateClientTTS(textContent, voiceStyle)
      }
    } else if (audioRef.current) {
      audioRef.current.play()
    }
  }

  const pauseAudio = () => {
    if (isClientTTS) {
      speechSynthesis.pause()
      setVoiceState("paused")
    } else if (audioRef.current) {
      audioRef.current.pause()
    }
  }

  const handleOrbClick = useCallback(() => {
    if (voiceState === "speaking") {
      pauseAudio()
    } else {
      playAudio()
    }
  }, [voiceState, isClientTTS])

  const handleClose = useCallback(() => {
    if (isClientTTS) {
      speechSynthesis.cancel()
    } else if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setVoiceState("idle")
    onClose()
  }, [isClientTTS, onClose])

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const handleSeek = (value: number[]) => {
    if (audioRef.current && !isClientTTS) {
      const newTime = (value[0] / 100) * duration
      audioRef.current.currentTime = newTime
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? currentTime / duration : 0

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

          {/* Main content */}
          <div className="flex flex-col items-center space-y-8 w-full">
            {/* Voice Orb */}
            <div className="relative">
              <VoiceOrb 
                state={voiceState} 
                onClick={handleOrbClick}
                progress={progress}
                size="large"
              />
            </div>

            {/* Status and Info */}
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-white">
                {voiceState === "generating" && "Generating voice..."}
                {voiceState === "loading" && "Loading audio..."}
                {voiceState === "speaking" && "AI is speaking"}
                {voiceState === "paused" && "Paused"}
                {voiceState === "idle" && "Ready to play"}
                {voiceState === "error" && "Audio error occurred"}
              </h2>
              
              <div className="flex items-center justify-center gap-4 text-white/70">
                <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                  {isClientTTS ? "Browser TTS" : "Server TTS"}
                </Badge>
                <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                  Voice: {voiceStyle}
                </Badge>
                <span className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Controls */}
            <Card className="w-full max-w-lg bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 space-y-4">
                {/* Progress Bar */}
                {!isClientTTS && (
                  <div className="space-y-2">
                    <Slider
                      value={[progress * 100]}
                      onValueChange={handleSeek}
                      max={100}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Control Buttons */}
                <div className="flex items-center justify-center gap-4">
                  {!isClientTTS && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => audioRef.current && (audioRef.current.currentTime = Math.max(0, currentTime - 10))}
                      disabled={!duration}
                      className="rounded-full bg-white/10 hover:bg-white/20 text-white border-white/20"
                    >
                      <SkipForward className="w-4 h-4 rotate-180" />
                    </Button>
                  )}

                  <Button
                    size="lg"
                    onClick={handleOrbClick}
                    disabled={voiceState === "loading" || voiceState === "generating" || voiceState === "error"}
                    className="rounded-full w-16 h-16 bg-white/20 hover:bg-white/30 text-white"
                  >
                    {voiceState === "speaking" ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6" />
                    )}
                  </Button>

                  {!isClientTTS && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => audioRef.current && (audioRef.current.currentTime = Math.min(duration, currentTime + 10))}
                      disabled={!duration}
                      className="rounded-full bg-white/10 hover:bg-white/20 text-white border-white/20"
                    >
                      <SkipForward className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-3">
                  <VolumeX className="w-4 h-4 text-white/70" />
                  <Slider
                    value={[volume * 100]}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <Volume2 className="w-4 h-4 text-white/70" />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowTranscript(!showTranscript)}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                {showTranscript ? "Hide" : "Show"} Transcript
              </Button>
              
              {!isClientTTS && audioData && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = audioData
                    link.download = `voice_response_${Date.now()}.mp3`
                    link.click()
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
            </div>

            {/* Transcript */}
            {showTranscript && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full max-w-2xl mx-auto"
              >
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-4">
                    <div className="max-h-32 overflow-y-auto">
                      <p className="text-sm text-white/90 leading-relaxed">
                        {textContent}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Error Message */}
            {voiceState === "error" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <Card className="bg-red-500/20 border-red-500/30">
                  <CardContent className="p-4">
                    <p className="text-red-200 text-sm">
                      Failed to load or play audio. The system will fall back to browser speech synthesis.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateClientTTS(textContent, voiceStyle)}
                      className="mt-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-500/30"
                    >
                      Try Browser TTS
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default VoiceOutputModal 