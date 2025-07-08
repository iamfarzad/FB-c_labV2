"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, CameraOff, RotateCcw, Download, Zap, SwitchCamera } from 'lucide-react'
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface WebcamModalProps {
  isOpen: boolean
  onClose: () => void
  onCapture?: (imageData: string) => void
  onAIAnalysis?: (analysis: string) => void
  theme?: "light" | "dark"
}

export default function WebcamModal({
  isOpen,
  onClose,
  onCapture,
  onAIAnalysis,
  theme = "dark"
}: WebcamModalProps) {
  const [isActive, setIsActive] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user")
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("")
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Get available cameras
  useEffect(() => {
    const getDevices = async () => {
      try {
        const deviceList = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = deviceList.filter(device => device.kind === 'videoinput')
        setDevices(videoDevices)
        if (videoDevices.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoDevices[0].deviceId)
        }
      } catch (err) {
        console.error("Error getting devices:", err)
      }
    }

    if (isOpen) {
      getDevices()
    }
  }, [isOpen, selectedDeviceId])

  const startWebcam = async () => {
    setError(null)
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          ...(selectedDeviceId && { deviceId: selectedDeviceId })
        },
        audio: false
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      setIsActive(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
      }

    } catch (err) {
      setError("Failed to access camera. Please check permissions.")
      console.error("Webcam error:", err)
    }
  }

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsActive(false)
    setCapturedImage(null)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Flip image if using front camera
    if (facingMode === "user") {
      ctx.scale(-1, 1)
      ctx.drawImage(video, -canvas.width, 0)
    } else {
      ctx.drawImage(video, 0, 0)
    }
    
    const imageData = canvas.toDataURL('image/jpeg', 0.9)
    setCapturedImage(imageData)
    onCapture?.(imageData)
    
    return imageData
  }

  const switchCamera = async () => {
    const newFacingMode = facingMode === "user" ? "environment" : "user"
    setFacingMode(newFacingMode)
    
    if (isActive) {
      stopWebcam()
      setTimeout(() => {
        setFacingMode(newFacingMode)
        startWebcam()
      }, 100)
    }
  }

  const analyzeWithAI = async () => {
    if (!capturedImage) return

    setIsAnalyzing(true)
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const analysis = "AI Analysis: I can see a person in the image. The lighting appears to be indoor lighting, and the background suggests an office or home environment. The image quality is good with clear details visible."
      
      onAIAnalysis?.(analysis)
    } catch (err) {
      setError("Failed to analyze image")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const downloadImage = () => {
    if (!capturedImage) return
    
    const link = document.createElement('a')
    link.download = `webcam-capture-${Date.now()}.jpg`
    link.href = capturedImage
    link.click()
  }

  const retakePhoto = () => {
    setCapturedImage(null)
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
            <Camera className="w-5 h-5" />
            Webcam Capture
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera Preview or Captured Image */}
          <Card>
            <CardContent className="p-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                {capturedImage ? (
                  <img
                    src={capturedImage || "/placeholder.svg"}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                ) : isActive ? (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Click "Start Camera" to begin</p>
                    </div>
                  </div>
                )}

                {/* Camera Controls Overlay */}
                {isActive && !capturedImage && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={capturePhoto}
                      className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center shadow-lg"
                    >
                      <div className="w-12 h-12 bg-white rounded-full" />
                    </motion.button>
                  </div>
                )}

                {/* Switch Camera Button */}
                {isActive && devices.length > 1 && (
                  <div className="absolute top-4 right-4">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={switchCamera}
                      className="bg-black/50 hover:bg-black/70 text-white"
                    >
                      <SwitchCamera className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <div className="text-red-500 text-sm text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
              {error}
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2">
            {!isActive && !capturedImage ? (
              <Button
                onClick={startWebcam}
                className="flex-1"
                size="lg"
              >
                <Camera className="w-4 h-4 mr-2" />
                Start Camera
              </Button>
            ) : capturedImage ? (
              <>
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake
                </Button>
                <Button
                  onClick={downloadImage}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </>
            ) : (
              <Button
                onClick={stopWebcam}
                variant="destructive"
                className="flex-1"
              >
                <CameraOff className="w-4 h-4 mr-2" />
                Stop Camera
              </Button>
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
