"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Monitor, Square, Zap, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { activityLogger } from "@/lib/activity-logger"

interface ScreenShareModalProps {
  isOpen: boolean
  onClose: () => void
  onAIAnalysis: (analysis: string) => void
  onStream: () => void
}

export function ScreenShareModal({ isOpen, onClose, onAIAnalysis, onStream }: ScreenShareModalProps) {
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isSharing, setIsSharing] = useState(false)
  const [capturedScreen, setCapturedScreen] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: "screen" },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsSharing(true)
        onStream()

        activityLogger.log({
          type: "screen_share",
          title: "Screen Share Started",
          description: "Screen sharing initiated",
          status: "in_progress",
        })

        // Handle stream end
        stream.getVideoTracks()[0].addEventListener("ended", () => {
          setIsSharing(false)
          activityLogger.log({
            type: "screen_share",
            title: "Screen Share Ended",
            description: "Screen sharing stopped",
            status: "completed",
          })
        })
      }
    } catch (error) {
      console.error("Screen share error:", error)
      toast({
        title: "Screen Share Failed",
        description: "Could not access screen. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast, onStream])

  const stopScreenShare = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setIsSharing(false)
    }
  }, [])

  const captureScreen = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    const imageData = canvas.toDataURL("image/jpeg", 0.8)
    setCapturedScreen(imageData)

    activityLogger.log({
      type: "screen_capture",
      title: "Screen Captured",
      description: "Screenshot taken successfully",
      status: "completed",
    })

    toast({
      title: "Screen Captured",
      description: "Screenshot ready for AI analysis",
    })
  }, [toast])

  const analyzeScreen = useCallback(async () => {
    if (!capturedScreen) return

    setIsAnalyzing(true)
    activityLogger.log({
      type: "vision_analysis",
      title: "Screen Analysis Started",
      description: "Analyzing screenshot with Gemini Vision",
      status: "in_progress",
    })

    try {
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData: capturedScreen,
          prompt:
            "Analyze this screenshot. Identify the application, UI elements, any text content, and provide insights about what the user might be working on or any potential improvements.",
        }),
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const { analysis } = await response.json()

      onAIAnalysis(analysis)
      activityLogger.log({
        type: "vision_analysis",
        title: "Screen Analysis Complete",
        description: "Screenshot analyzed successfully",
        status: "completed",
      })

      toast({
        title: "Analysis Complete",
        description: "AI has analyzed your screen",
      })
    } catch (error) {
      console.error("Screen analysis error:", error)
      activityLogger.log({
        type: "error",
        title: "Analysis Failed",
        description: "Failed to analyze screenshot",
        status: "failed",
      })
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the screen. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }, [capturedScreen, onAIAnalysis, toast])

  const downloadScreenshot = useCallback(() => {
    if (!capturedScreen) return

    const link = document.createElement("a")
    link.download = `screenshot-${Date.now()}.jpg`
    link.href = capturedScreen
    link.click()

    toast({
      title: "Screenshot Downloaded",
      description: "Image saved to your downloads",
    })
  }, [capturedScreen, toast])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Screen Share & Analysis
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isSharing && !capturedScreen && (
            <div className="text-center py-8">
              <Monitor className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Share Your Screen</h3>
              <p className="text-muted-foreground mb-4">
                Share your screen to capture and analyze what you're working on
              </p>
              <Button onClick={startScreenShare} size="lg">
                <Monitor className="w-5 h-5 mr-2" />
                Start Screen Share
              </Button>
            </div>
          )}

          {isSharing && (
            <div className="space-y-4">
              <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg bg-black" />
              <canvas ref={canvasRef} className="hidden" />

              <div className="flex gap-2 justify-center">
                <Button onClick={captureScreen} variant="secondary">
                  <Square className="w-4 h-4 mr-2" />
                  Capture Screen
                </Button>
                <Button onClick={stopScreenShare} variant="outline">
                  Stop Sharing
                </Button>
              </div>
            </div>
          )}

          {capturedScreen && (
            <div className="space-y-4">
              <img
                src={capturedScreen || "/placeholder.svg"}
                alt="Screen capture"
                className="w-full rounded-lg border"
              />

              <div className="flex gap-2 justify-center">
                <Button onClick={analyzeScreen} disabled={isAnalyzing}>
                  <Zap className="w-4 h-4 mr-2" />
                  {isAnalyzing ? "Analyzing..." : "AI Analysis"}
                </Button>

                <Button onClick={downloadScreenshot} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>

                <Button onClick={() => setCapturedScreen(null)} variant="outline">
                  Capture New
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
