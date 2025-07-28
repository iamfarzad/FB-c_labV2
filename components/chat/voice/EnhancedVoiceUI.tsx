"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, StopCircle, Play, Pause, Trash2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useChatContext } from "@/app/(chat)/chat/context/ChatProvider"

const MAX_RECORDING_MS = 60000 // 1 minute

export function EnhancedVoiceUI() {
  const { addActivity } = useChatContext()
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" })
        setAudioBlob(blob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      addActivity({ type: "voice", status: "in-progress", content: "Voice recording started" })

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 100
          if (newTime >= MAX_RECORDING_MS) {
            stopRecording()
          }
          return newTime
        })
      }, 100)
    } catch (error) {
      console.error("Error starting recording:", error)
      addActivity({ type: "error", status: "error", content: "Could not start voice recording" })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      addActivity({ type: "voice", status: "success", content: "Voice recording finished" })
    }
  }

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const deleteRecording = () => {
    setAudioBlob(null)
    setRecordingTime(0)
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.src = ""
    }
    addActivity({ type: "voice", status: "cancelled", content: "Voice recording deleted" })
  }

  const downloadRecording = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `recording-${new Date().toISOString()}.webm`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      addActivity({ type: "voice", status: "success", content: "Recording downloaded" })
    }
  }

  useEffect(() => {
    if (audioBlob && audioRef.current) {
      audioRef.current.src = URL.createObjectURL(audioBlob)
    }
  }, [audioBlob])

  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground">
      <h3 className="font-semibold mb-2">Voice Input</h3>
      {!audioBlob ? (
        <div className="flex flex-col items-center gap-4">
          <Button onClick={isRecording ? stopRecording : startRecording} size="icon" className="w-16 h-16 rounded-full">
            {isRecording ? <StopCircle className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </Button>
          {isRecording && (
            <div className="w-full text-center">
              <p className="text-sm text-muted-foreground">Recording... {Math.floor(recordingTime / 1000)}s</p>
              <Progress value={(recordingTime / MAX_RECORDING_MS) * 100} className="h-2 mt-2" />
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Button onClick={togglePlay} size="icon">
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          <div className="flex-grow text-sm">Recording ready ({Math.floor(audioBlob.size / 1024)} KB)</div>
          <Button onClick={downloadRecording} variant="ghost" size="icon">
            <Download className="w-5 h-5" />
          </Button>
          <Button onClick={deleteRecording} variant="destructive" size="icon">
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      )}
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />
    </div>
  )
}
