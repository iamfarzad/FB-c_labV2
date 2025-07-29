"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Volume2, VolumeX, Play, Pause, RotateCcw, Download } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button-variants"
import { Card, CardContent } from "@/components/ui/card-variants"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useAudioPlayer } from "@/hooks/useAudioPlayer"
import { VoiceOrb } from "./voice-output/VoiceOrb"

interface VoiceOutputModalProps {
  isOpen: boolean
  onClose: () => void
  audioUrl?: string
  text?: string
  title?: string
}

export const VoiceOutputModal: React.FC<VoiceOutputModalProps> = ({
  isOpen,
  onClose,
  audioUrl,
  text,
  title = "AI Voice Response",
}) => {
  const { toast } = useToast()
  const [volume, setVolume] = useState(80)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showTranscript, setShowTranscript] = useState(false)

  const {
    isPlaying,
    isPaused,
    isLoading,
    currentTime,
    duration,
    progress,
    play,
    pause,
    stop,
    seek,
    setVolumeLevel,
    setPlaybackSpeed,
    error,
  } = useAudioPlayer({
    src: audioUrl,
    autoPlay: false,
    onEnd: () => {
      toast({
        title: "Playback Complete",
        description: "Voice response has finished playing.",
      })
    },
    onError: (error) => {
      toast({
        title: "Playback Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Update audio volume when slider changes
  useEffect(() => {
    setVolumeLevel(volume / 100)
  }, [volume, setVolumeLevel])

  // Update playback rate when slider changes
  useEffect(() => {
    setPlaybackSpeed(playbackRate)
  }, [playbackRate, setPlaybackSpeed])

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }, [isPlaying, play, pause])

  const handleStop = useCallback(() => {
    stop()
  }, [stop])

  const handleSeek = useCallback(
    (value: number[]) => {
      const newTime = (value[0] / 100) * duration
      seek(newTime)
    },
    [duration, seek],
  )

  const handleDownload = useCallback(async () => {
    if (!audioUrl) return

    try {
      const response = await fetch(audioUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `voice-response-${Date.now()}.mp3`
      a.click()

      URL.revokeObjectURL(url)

      toast({
        title: "Download Started",
        description: "Voice response is being downloaded.",
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download voice response.",
        variant: "destructive",
      })
    }
  }, [audioUrl, toast])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleClose = useCallback(() => {
    stop()
    onClose()
  }, [stop, onClose])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.code) {
        case "Space":
          e.preventDefault()
          handlePlayPause()
          break
        case "KeyS":
          e.preventDefault()
          handleStop()
          break
        case "KeyT":
          e.preventDefault()
          setShowTranscript(!showTranscript)
          break
        case "Escape":
          handleClose()
          break
        case "ArrowLeft":
          e.preventDefault()
          seek(Math.max(0, currentTime - 10))
          break
        case "ArrowRight":
          e.preventDefault()
          seek(Math.min(duration, currentTime + 10))
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isOpen, handlePlayPause, handleStop, showTranscript, handleClose, currentTime, duration, seek])

  if (!audioUrl && !text) {
    return null
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      description="AI-generated voice response with playback controls"
      icon={<Volume2 className="h-6 w-6 text-primary" />}
      size="md"
      theme="glass"
    >
      <div className="p-6 space-y-6">
        {/* Voice Orb Visualization */}
        <div className="flex justify-center">
          <VoiceOrb isActive={isPlaying} amplitude={isPlaying ? 0.8 : 0.2} size={120} className="drop-shadow-lg" />
        </div>

        {/* Status Badge */}
        <div className="flex justify-center">
          <Badge variant={isPlaying ? "default" : isPaused ? "secondary" : "outline"} className="px-3 py-1">
            {isLoading ? "Loading..." : isPlaying ? "Playing" : isPaused ? "Paused" : "Ready"}
          </Badge>
        </div>

        {/* Progress Bar */}
        {audioUrl && duration > 0 && (
          <div className="space-y-2">
            <Slider value={[progress]} onValueChange={handleSeek} max={100} step={0.1} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button onClick={handleStop} variant="outline" size="icon" disabled={!audioUrl || (!isPlaying && !isPaused)}>
            <RotateCcw className="w-4 h-4" />
          </Button>

          <Button
            onClick={handlePlayPause}
            variant="default"
            size="lg"
            disabled={!audioUrl || isLoading}
            loading={isLoading}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>

          <Button onClick={handleDownload} variant="outline" size="icon" disabled={!audioUrl}>
            <Download className="w-4 h-4" />
          </Button>
        </div>

        {/* Advanced Controls */}
        <Card variant="glass" padding="sm">
          <CardContent className="space-y-4">
            {/* Volume Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  Volume
                </label>
                <span className="text-xs text-muted-foreground">{volume}%</span>
              </div>
              <Slider
                value={[volume]}
                onValueChange={(value) => setVolume(value[0])}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            {/* Playback Speed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Playback Speed</label>
                <span className="text-xs text-muted-foreground">{playbackRate}x</span>
              </div>
              <Slider
                value={[playbackRate]}
                onValueChange={(value) => setPlaybackRate(value[0])}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Transcript */}
        {text && (
          <Card variant="outline" padding="sm">
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Transcript</label>
                <Button onClick={() => setShowTranscript(!showTranscript)} variant="ghost" size="sm">
                  {showTranscript ? "Hide" : "Show"}
                </Button>
              </div>
              {showTranscript && (
                <div className="p-3 bg-muted/50 rounded-md text-sm leading-relaxed max-h-32 overflow-y-auto">
                  {text}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card variant="outline" padding="sm" className="border-destructive/50">
            <CardContent>
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Keyboard Shortcuts */}
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>
            <kbd className="px-1.5 py-0.5 bg-muted rounded">Space</kbd> - Play/Pause
          </p>
          <p>
            <kbd className="px-1.5 py-0.5 bg-muted rounded">S</kbd> - Stop
          </p>
          <p>
            <kbd className="px-1.5 py-0.5 bg-muted rounded">T</kbd> - Toggle Transcript
          </p>
          <p>
            <kbd className="px-1.5 py-0.5 bg-muted rounded">←/→</kbd> - Seek ±10s
          </p>
        </div>
      </div>
    </Modal>
  )
}

export default VoiceOutputModal
