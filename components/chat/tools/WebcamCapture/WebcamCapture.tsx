"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Camera, Upload, X, Brain, Video, VideoOff, Eye, EyeOff, Loader2, Download } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { ToolCardWrapper } from "@/components/chat/ToolCardWrapper"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import type { WebcamCaptureProps, WebcamState, InputMode } from "./WebcamCapture.types"

interface AnalysisResult {
  id: string
  text: string
  timestamp: number
  imageData?: string
}

export function WebcamCapture({
  mode = 'card',
  onCapture,
  onClose,
  onCancel,
  onAIAnalysis
}: WebcamCaptureProps) {
  const { toast } = useToast()
  const [webcamState, setWebcamState] = useState<WebcamState>("initializing")
  const [inputMode, setInputMode] = useState<InputMode>("camera")
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("")
  const [isCapturing, setIsCapturing] = useState(false)

  // Real-time analysis states
  const [isAutoAnalyzing, setIsAutoAnalyzing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([])
  const [error, setError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const autoAnalysisInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const sessionIdRef = useRef<string>(`webcam-session-${Date.now()}`)

  const sendVideoFrame = useCallback(async (imageData: string) => {
    try {
      setIsAnalyzing(true)
      const response = await fetch('/api/gemini-live-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData,
          sessionId: sessionIdRef.current,
          type: 'video_frame',
          analysisMode: 'video'
        })
      })
      if (!response.ok) throw new Error('Failed to analyze video frame')
      const result = await response.json()
      const analysis: AnalysisResult = {
        id: Date.now().toString(),
        text: result.response || result.text || 'No analysis available',
        timestamp: Date.now(),
        imageData
      }
      setAnalysisHistory(prev => [analysis, ...prev])
      onAIAnalysis?.(analysis.text)
    } catch (e) {
      const err = e as Error;
      setError(err.message);
      console.error('❌ Failed to analyze video frame:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }, [onAIAnalysis])

  useEffect(() => {
    if (isAutoAnalyzing && webcamState === "active") {
      autoAnalysisInterval.current = setInterval(() => {
        if (videoRef.current && canvasRef.current) {
          const canvas = canvasRef.current
          const video = videoRef.current
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(video, 0, 0)
            const imageData = canvas.toDataURL('image/jpeg', 0.8)
            sendVideoFrame(imageData)
          }
        }
      }, 8000)
    } else if (autoAnalysisInterval.current) {
      clearInterval(autoAnalysisInterval.current)
    }
    return () => {
      if (autoAnalysisInterval.current) clearInterval(autoAnalysisInterval.current)
    }
  }, [isAutoAnalyzing, webcamState, sendVideoFrame])
  
  const startCamera = useCallback(async (deviceId?: string) => {
    try {
      setWebcamState("initializing")
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
          ...(deviceId && { deviceId: deviceId }),
        },
        audio: false,
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      setWebcamState("active")
      if (videoRef.current) videoRef.current.srcObject = mediaStream
      toast({ title: "Camera Started" })
    } catch (error) {
      setWebcamState("error")
      setError('Camera access failed')
      toast({ title: "Camera Access Failed", variant: "destructive" })
    }
  }, [toast])

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        onCapture(imageData);
        sendVideoFrame(imageData);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsCapturing(false);
    }
  }, [onCapture, sendVideoFrame]);

  useEffect(() => {
    async function setupWebcam() {
        if (inputMode === "camera") {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter((d) => d.kind === "videoinput");
                setAvailableDevices(videoDevices);
                if (videoDevices.length > 0) {
                    setSelectedDeviceId(videoDevices[0].deviceId);
                    startCamera(videoDevices[0].deviceId);
                } else {
                    setError("No camera found");
                }
            } catch (err) {
                setError("Could not enumerate devices");
            }
        }
    }
    setupWebcam();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [inputMode, startCamera, stream]);

  return (
    <ToolCardWrapper title="Webcam Capture" description="Real-time video capture with AI analysis" icon={Camera}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <Badge variant={webcamState === "active" ? "default" : "destructive"}>{webcamState}</Badge>
            <div className="flex items-center gap-2">
            <Switch checked={isAutoAnalyzing} onCheckedChange={setIsAutoAnalyzing} disabled={webcamState !== "active"} />
            <span className="text-xs">Auto Analysis</span>
            </div>
        </div>
        <div className="relative">
            <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg border" />
            <Button onClick={captureImage} disabled={webcamState !== "active" || isCapturing} className="absolute bottom-4 right-4 w-12 h-12 rounded-full">
            {isCapturing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
            </Button>
        </div>
        {analysisHistory.length > 0 && (
            <Card>
            <CardHeader><CardTitle className="text-sm">Analysis History</CardTitle></CardHeader>
            <CardContent className="space-y-2 max-h-40 overflow-y-auto">
                {analysisHistory.map((a) => <p key={a.id} className="text-sm border-b pb-1">{a.text}</p>)}
            </CardContent>
            </Card>
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </ToolCardWrapper>
  )
}
