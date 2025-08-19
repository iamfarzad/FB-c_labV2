"use client"

import { useState, useRef, useCallback } from "react"

interface UseVoiceRecorderProps {
  onAudioChunk: (chunk: Blob) => void
  onTurnComplete: () => void
}

export function useVoiceRecorder({ onAudioChunk, onTurnComplete }: UseVoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [volume, setVolume] = useState(0)
  const [hasPermission, setHasPermission] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setHasPermission(true)
      streamRef.current = stream
      return true
    } catch (err) {
      setError("Microphone permission denied")
      return false
    }
  }, [])

  const startRecording = useCallback(async () => {
    if (!streamRef.current) {
      const hasAccess = await requestPermission()
      if (!hasAccess) return
    }

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current!)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          onAudioChunk(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        onTurnComplete()
      }

      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)
      setError(null)

      // Simulate volume detection
      const volumeInterval = setInterval(() => {
        setVolume(Math.random() * 0.8 + 0.1)
      }, 100)

      mediaRecorder.onstop = () => {
        clearInterval(volumeInterval)
        setVolume(0)
        onTurnComplete()
      }
    } catch (err) {
      setError("Failed to start recording")
    }
  }, [onAudioChunk, onTurnComplete, requestPermission])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  return {
    isRecording,
    startRecording,
    stopRecording,
    error,
    volume,
    hasPermission,
    requestPermission,
  }
}
