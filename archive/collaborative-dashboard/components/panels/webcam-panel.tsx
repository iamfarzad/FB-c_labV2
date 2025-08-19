"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Camera, CameraOff, Mic, MicOff, Video, VideoOff, RotateCcw, Download, Settings, Users, Phone, PhoneOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface WebcamPanelProps {
  mode?: 'card' | 'fullscreen'
  onCapture?: (imageData: string) => void
  onClose?: () => void
  onCancel?: () => void
  onAIAnalysis?: (result: any) => void
  onLog?: (message: string) => void
}

interface AnalysisResult {
  id: string
  text: string
  timestamp: number
  imageData?: string
}

export function WebcamPanel({ 
  mode = 'card',
  onCapture, 
  onClose,
  onCancel,
  onAIAnalysis,
  onLog,
}: WebcamPanelProps) {
  const { toast } = useToast()
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user")
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingInterval = useRef<NodeJS.Timeout>()

  const participants = [
    { id: "1", name: "You", isVideoOn: isVideoOn, isAudioOn: isAudioOn },
    { id: "2", name: "Sarah Chen", isVideoOn: true, isAudioOn: true },
    { id: "3", name: "Mike Johnson", isVideoOn: false, isAudioOn: true },
    { id: "4", name: "Alex Rivera", isVideoOn: true, isAudioOn: false },
  ]

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      })

      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setIsVideoOn(true)
      setIsAudioOn(true)
    } catch (error) {
      console.error("Error accessing camera:", error)
      setError("Failed to access camera")
      toast({
        title: "Camera Error",
        description: "Failed to access camera. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsVideoOn(false)
    setIsAudioOn(false)
  }

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOn(videoTrack.enabled)
      }
    }
  }

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioOn(audioTrack.enabled)
      }
    }
  }

  const switchCamera = async () => {
    const newFacingMode = facingMode === "user" ? "environment" : "user"
    setFacingMode(newFacingMode)

    if (stream) {
      stopCamera()
      setTimeout(() => {
        setFacingMode(newFacingMode)
        startCamera()
      }, 100)
    }
  }

  const startRecording = () => {
    if (!stream) return

    const mediaRecorder = new MediaRecorder(stream)
    const chunks: BlobPart[] = []

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `recording-${Date.now()}.webm`
      a.click()
    }

    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.start()
    setIsRecording(true)
    setRecordingTime(0)

    recordingInterval.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current)
      }
    }
  }

  const takeScreenshot = () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext("2d")

    if (ctx) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `screenshot-${Date.now()}.png`
          a.click()
          
          // Also trigger onCapture callback
          const imageData = canvas.toDataURL("image/jpeg", 0.8)
          onCapture?.(imageData)
        }
      })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    if (!stream) {
      startCamera()
    }
  }, [stream])

  return (
    <div className="h-full flex">
      {/* Main Video Area */}
      <div className="flex-1 p-4">
        <div className="h-full bg-slate-900 rounded-lg overflow-hidden relative">
          {isVideoOn && stream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{
                filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                transform: facingMode === "user" ? "scaleX(-1)" : "none",
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white">
                <CameraOff className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <p className="text-lg">Camera is off</p>
              </div>
            </div>
          )}

          {/* Video Controls Overlay */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
              <Button
                variant={isAudioOn ? "secondary" : "destructive"}
                size="sm"
                onClick={toggleAudio}
                className="rounded-full w-10 h-10 p-0"
              >
                {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>

              <Button
                variant={isVideoOn ? "secondary" : "destructive"}
                size="sm"
                onClick={toggleVideo}
                className="rounded-full w-10 h-10 p-0"
              >
                {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={takeScreenshot}
                className="rounded-full w-10 h-10 p-0 bg-emerald-600 hover:bg-emerald-700"
              >
                <Camera className="w-4 h-4" />
              </Button>

              <Button variant="secondary" size="sm" className="rounded-full w-10 h-10 p-0">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Recording Indicator */}
          {isRecording && (
            <div className="absolute top-4 left-4">
              <Badge variant="destructive" className="animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                Recording {formatTime(recordingTime)}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-white border-l border-slate-200 p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-emerald-600" />
              Participants ({participants.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-emerald-700">{participant.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{participant.name}</p>
                    <p className="text-xs text-slate-500">
                      {participant.id === "1" ? "host" : "participant"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <div className={`w-4 h-4 rounded ${participant.isVideoOn ? "bg-green-500" : "bg-red-500"}`}>
                    {participant.isVideoOn ? (
                      <Camera className="w-3 h-3 text-white m-0.5" />
                    ) : (
                      <CameraOff className="w-3 h-3 text-white m-0.5" />
                    )}
                  </div>
                  <div className={`w-4 h-4 rounded ${participant.isAudioOn ? "bg-green-500" : "bg-red-500"}`}>
                    {participant.isAudioOn ? (
                      <Mic className="w-3 h-3 text-white m-0.5" />
                    ) : (
                      <MicOff className="w-3 h-3 text-white m-0.5" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Session Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant={isRecording ? "destructive" : "outline"}
              className="w-full"
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? "Stop Recording" : "Start Recording"}
            </Button>
            <Button variant="outline" className="w-full bg-transparent" onClick={switchCamera}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Switch Camera
            </Button>
            <Button variant="outline" className="w-full bg-transparent" onClick={takeScreenshot}>
              <Download className="w-4 h-4 mr-2" />
              Take Screenshot
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Switch to Canvas
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Start Workshop
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Share Screen
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Hidden canvas for screenshots */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
