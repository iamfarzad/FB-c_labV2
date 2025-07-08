"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, Square, RotateCcw, Send } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface WebcamModalProps {
  isOpen: boolean
  onClose: () => void
  onAnalysis: (analysis: string) => void
}

export function WebcamModal({ isOpen, onClose, onAnalysis }: WebcamModalProps) {
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsStreaming(true)
      }
    } catch (error) {
      console.error("Camera access error:", error)
      toast({
        title: "Camera Access Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      })
    }
  }, [toast])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsStreaming(false)
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas.getContext("2d")

    if (context) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0)

      const imageData = canvas.toDataURL("image/jpeg", 0.8)
      setCapturedImage(imageData)
      stopCamera()
    }
  }, [stopCamera])

  const analyzeImage = useCallback(async () => {
    if (!capturedImage) return

    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: capturedImage,
          prompt:
            "Analyze this image for business insights, opportunities, or recommendations. Focus on practical applications and actionable advice.",
        }),
      })

      const data = await response.json()

      if (data.success) {
        onAnalysis(data.analysis)
        toast({
          title: "Image Analyzed",
          description: "AI analysis complete! Check the chat for insights.",
        })
        onClose()
      } else {
        throw new Error(data.error || "Analysis failed")
      }
    } catch (error: any) {
      console.error("Analysis error:", error)
      toast({
        title: "Analysis Error",
        description: error.message || "Failed to analyze image",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }, [capturedImage, onAnalysis, onClose, toast])

  const resetCapture = useCallback(() => {
    setCapturedImage(null)
    startCamera()
  }, [startCamera])

  const handleClose = useCallback(() => {
    stopCamera()
    setCapturedImage(null)
    onClose()
  }, [stopCamera, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Webcam Analysis
              </CardTitle>
              <CardDescription>Capture a photo for AI-powered business analysis</CardDescription>
            </div>
            <Badge variant="secondary">Gemini Vision</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
            {capturedImage ? (
              <img src={capturedImage || "/placeholder.svg"} alt="Captured" className="w-full h-full object-cover" />
            ) : (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="flex gap-2 justify-center">
            {!isStreaming && !capturedImage && (
              <Button onClick={startCamera} className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Start Camera
              </Button>
            )}

            {isStreaming && (
              <Button onClick={capturePhoto} className="flex items-center gap-2">
                <Square className="h-4 w-4" />
                Capture Photo
              </Button>
            )}

            {capturedImage && (
              <>
                <Button onClick={resetCapture} variant="outline" className="flex items-center gap-2 bg-transparent">
                  <RotateCcw className="h-4 w-4" />
                  Retake
                </Button>
                <Button onClick={analyzeImage} disabled={isAnalyzing} className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  {isAnalyzing ? "Analyzing..." : "Analyze Image"}
                </Button>
              </>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
