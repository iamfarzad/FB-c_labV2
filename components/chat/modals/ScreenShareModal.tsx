"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Monitor, Square, RotateCcw, Send } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ScreenShareModalProps {
  isOpen: boolean
  onClose: () => void
  onAnalysis: (analysis: string) => void
}

export function ScreenShareModal({ isOpen, onClose, onAnalysis }: ScreenShareModalProps) {
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isSharing, setIsSharing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)

  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: 1280, height: 720 },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsSharing(true)

        // Handle stream end (user stops sharing)
        stream.getVideoTracks()[0].addEventListener("ended", () => {
          setIsSharing(false)
          streamRef.current = null
        })
      }
    } catch (error) {
      console.error("Screen share error:", error)
      toast({
        title: "Screen Share Error",
        description: "Unable to start screen sharing. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast])

  const stopScreenShare = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsSharing(false)
  }, [])

  const captureScreen = useCallback(() => {
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
      stopScreenShare()
    }
  }, [stopScreenShare])

  const analyzeScreen = useCallback(async () => {
    if (!capturedImage) return

    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: capturedImage,
          prompt:
            "Analyze this screenshot for business insights. Look for UI/UX improvements, workflow optimizations, data patterns, or strategic opportunities. Provide actionable recommendations.",
        }),
      })

      const data = await response.json()

      if (data.success) {
        onAnalysis(data.analysis)
        toast({
          title: "Screenshot Analyzed",
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
        description: error.message || "Failed to analyze screenshot",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }, [capturedImage, onAnalysis, onClose, toast])

  const resetCapture = useCallback(() => {
    setCapturedImage(null)
    startScreenShare()
  }, [startScreenShare])

  const handleClose = useCallback(() => {
    stopScreenShare()
    setCapturedImage(null)
    onClose()
  }, [stopScreenShare, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Screen Share Analysis
              </CardTitle>
              <CardDescription>Share your screen and capture a screenshot for AI analysis</CardDescription>
            </div>
            <Badge variant="secondary">Gemini Vision</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
            {capturedImage ? (
              <img
                src={capturedImage || "/placeholder.svg"}
                alt="Screen capture"
                className="w-full h-full object-contain"
              />
            ) : (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="flex gap-2 justify-center">
            {!isSharing && !capturedImage && (
              <Button onClick={startScreenShare} className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Start Screen Share
              </Button>
            )}

            {isSharing && (
              <Button onClick={captureScreen} className="flex items-center gap-2">
                <Square className="h-4 w-4" />
                Capture Screenshot
              </Button>
            )}

            {capturedImage && (
              <>
                <Button onClick={resetCapture} variant="outline" className="flex items-center gap-2 bg-transparent">
                  <RotateCcw className="h-4 w-4" />
                  Retake
                </Button>
                <Button onClick={analyzeScreen} disabled={isAnalyzing} className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  {isAnalyzing ? "Analyzing..." : "Analyze Screenshot"}
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
