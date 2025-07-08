"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Monitor, Square, Camera, Download, Zap } from 'lucide-react'
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface ScreenShareModalProps {
  isOpen: boolean
  onClose: () => void
  onStream?: (stream: MediaStream) => void
  onAIAnalysis?: (analysis: string) => void
  theme?: "light" | "dark"
}

export default function ScreenShareModal({
  isOpen,
  onClose,
  onStream,
  onAIAnalysis,
  theme = "dark"
}: ScreenShareModalProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startScreenShare = async () => {
    setError(null)
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: "screen",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      })

      setStream(mediaStream)
      setIsSharing(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
      }

      onStream?.(mediaStream)

      // Handle stream end
      mediaStream.getVideoTracks()[0].addEventListener('ended', () => {
        stopScreenShare()
      })

    } catch (err) {
      setError("Failed to start screen sharing. Please check permissions.")
      console.error("Screen share error:", err)
    }
  }

  const stopScreenShare = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsSharing(false)
    setCapturedImage(null)
  }

  const captureScreen = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    ctx.drawImage(video, 0, 0)
    
    const imageData = canvas.toDataURL('image/png')
    setCapturedImage(imageData)
    
    return imageData
  }

  const analyzeWithAI = async () => {
    const imageData = captureScreen()
    if (!imageData) return

    setIsAnalyzing(true)
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const analysis = "AI Analysis: This appears to be a code editor with JavaScript/TypeScript code. The screen shows a React component with hooks and state management. There are several functions defined and the code structure follows modern React patterns."
      
      onAIAnalysis?.(analysis)
    } catch (err) {
      setError("Failed to analyze screen content")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const downloadCapture = () => {
    if (!capturedImage) return
    
    const link = document.createElement('a')
    link.download = `screen-capture-${Date.now()}.png`
    link.href = capturedImage
    link.click()
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "modal-content max-w-2xl",
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      )}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Screen Share & Analysis
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Video Preview */}
          {isSharing && (
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full h-auto max-h-64 rounded-lg bg-black"
                    muted
                    playsInline
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-3 h-3 bg-red-500 rounded-full"
                    />
                    <span className="text-xs bg-black/50 text-white px-2 py-1 rounded">
                      LIVE
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Captured Image Preview */}
          {capturedImage && (
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <img
                    src={capturedImage || "/placeholder.svg"}
                    alt="Screen capture"
                    className="w-full h-auto max-h-64 rounded-lg"
                  />
                  <div className="absolute top-2 right-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={downloadCapture}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <div className="text-red-500 text-sm text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
              {error}
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2">
            {!isSharing ? (
              <Button
                onClick={startScreenShare}
                className="flex-1"
                size="lg"
              >
                <Monitor className="w-4 h-4 mr-2" />
                Start Screen Share
              </Button>
            ) : (
              <>
                <Button
                  onClick={stopScreenShare}
                  variant="destructive"
                  className="flex-1"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop Sharing
                </Button>
                <Button
                  onClick={captureScreen}
                  variant="outline"
                  className="flex-1"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capture
                </Button>
              </>
            )}
          </div>

          {/* AI Analysis */}
          {capturedImage && (
            <Button
              onClick={analyzeWithAI}
              disabled={isAnalyzing}
              className="w-full"
              variant="secondary"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Analyze with AI
                </>
              )}
            </Button>
          )}
        </div>

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  )
}
