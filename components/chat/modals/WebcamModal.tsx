"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Camera, RotateCcw, Zap } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { activityLogger } from "@/lib/activity-logger"

interface WebcamModalProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (imageData: string) => void
  onAIAnalysis: (analysis: string) => void
}

export function WebcamModal({ isOpen, onClose, onCapture, onAIAnalysis }: WebcamModalProps) {
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsStreaming(true)
        activityLogger.log({
          type: "webcam",
          title: "Webcam Started",
          description: "Camera stream initiated",
          status: "in_progress",
        })
      }
    } catch (error) {
      console.error("Camera access error:", error)
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to use this feature.",
        variant: "destructive",
      })
    }
  }, [toast])

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setIsStreaming(false)
    }
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    const imageData = canvas.toDataURL("image/jpeg", 0.8)
    setCapturedImage(imageData)

    activityLogger.log({
      type: "image_capture",
      title: "Photo Captured",
      description: "Webcam photo taken successfully",
      status: "completed",
    })

    toast({
      title: "Photo Captured",
      description: "Image ready for analysis or chat",
    })
  }, [toast])

  const analyzeWithAI = useCallback(async () => {
    if (!capturedImage) return

    setIsAnalyzing(true)
    activityLogger.log({
      type: "vision_analysis",
      title: "AI Analysis Started",
      description: "Analyzing captured image with Gemini Vision",
      status: "in_progress",
    })

    try {
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData: capturedImage,
          prompt:
            "Analyze this webcam image. Describe what you see, identify any objects, people, or text, and provide insights about the context or setting.",
        }),
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const { analysis } = await response.json()

      onAIAnalysis(analysis)
      activityLogger.log({
        type: "vision_analysis",
        title: "AI Analysis Complete",
        description: "Image analyzed successfully",
        status: "completed",
      })

      toast({
        title: "Analysis Complete",
        description: "AI has analyzed your image",
      })
    } catch (error) {
      console.error("Analysis error:", error)
      activityLogger.log({
        type: "error",
        title: "Analysis Failed",
        description: "Failed to analyze image",
        status: "failed",
      })
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }, [capturedImage, onAIAnalysis, toast])

  const sendToChat = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage)
      onClose()
    }
  }, [capturedImage, onCapture, onClose])

  const retakePhoto = useCallback(() => {
    setCapturedImage(null)
  }, [])

  useEffect(() => {
    if (isOpen) {
      startCamera()
    } else {
      stopCamera()
      setCapturedImage(null)
    }

    return () => stopCamera()
  }, [isOpen, startCamera, stopCamera])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Webcam Capture
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!capturedImage ? (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-lg bg-black"
                style={{ aspectRatio: "4/3" }}
              />
              <canvas ref={canvasRef} className="hidden" />

              {isStreaming && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <Button onClick={capturePhoto} size="lg" className="rounded-full">
                    <Camera className="w-5 h-5 mr-2" />
                    Capture Photo
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <img src={capturedImage || "/placeholder.svg"} alt="Captured" className="w-full rounded-lg" />

              <div className="flex gap-2 justify-center">
                <Button onClick={retakePhoto} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake
                </Button>

                <Button onClick={analyzeWithAI} disabled={isAnalyzing} variant="secondary">
                  <Zap className="w-4 h-4 mr-2" />
                  {isAnalyzing ? "Analyzing..." : "AI Analysis"}
                </Button>

                <Button onClick={sendToChat}>Send to Chat</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
