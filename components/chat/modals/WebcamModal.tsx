"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { X, Camera, RotateCcw, Play, Pause } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useChatContext } from "@/app/chat/context/ChatProvider"
import { useToast } from "@/components/ui/use-toast"

interface WebcamModalProps {
  isOpen: boolean
  onClose: () => void
  onCapture?: (imageData: string) => void
  onAIAnalysis?: (analysis: string) => void
}

type WebcamState = "initializing" | "active" | "error" | "stopped"

export const WebcamModal: React.FC<WebcamModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  onAIAnalysis,
}) => {
  const { toast } = useToast()
  const { addActivity } = useChatContext()
  
  const [webcamState, setWebcamState] = useState<WebcamState>("initializing")
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("")
  const [captureCount, setCaptureCount] = useState(0)
  const [isCapturing, setIsCapturing] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Get available camera devices
  const getAvailableDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      setAvailableDevices(videoDevices)
      
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId)
      }
    } catch (error) {
      console.error("Failed to get devices:", error)
    }
  }, [selectedDeviceId])

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setWebcamState("initializing")
      
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
          ...(selectedDeviceId && { deviceId: selectedDeviceId })
        },
        audio: false,
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      
      setStream(mediaStream)
      setWebcamState("active")

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }

      addActivity({
        type: "image_capture",
        title: "Camera Started",
        description: "Webcam is ready for photo capture",
        status: "in_progress"
      })
      
    } catch (error) {
      console.error("Camera access failed:", error)
      setWebcamState("error")
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      toast({
        title: "Camera Access Failed",
        description: errorMessage.includes("Permission denied") 
          ? "Camera permission denied. Please allow camera access."
          : "Failed to start camera. Please try again.",
        variant: "destructive"
      })
    }
  }, [selectedDeviceId, addActivity, toast])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    
    setWebcamState("stopped")
    
    addActivity({
      type: "image_capture",
      title: "Camera Stopped",
      description: `Session ended. ${captureCount} photos captured.`,
      status: "completed"
    })
    
    onClose()
  }, [stream, onClose, captureCount, addActivity])

  // Capture photo and send to chat immediately
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || webcamState !== "active" || isCapturing) return

    setIsCapturing(true)
    
    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      
      if (video.videoWidth === 0 || video.videoHeight === 0) return

      // Set canvas size to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const context = canvas.getContext("2d")
      if (!context) return
      
      // Draw current frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Convert to base64
      const imageData = canvas.toDataURL("image/jpeg", 0.9)
      
      // Send to chat immediately
      onCapture?.(imageData)
      setCaptureCount(prev => prev + 1)
      
      // Flash effect
      const flashElement = document.createElement('div')
      flashElement.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        opacity: 0.8;
        pointer-events: none;
        z-index: 9999;
      `
      document.body.appendChild(flashElement)
      
      setTimeout(() => {
        document.body.removeChild(flashElement)
      }, 150)
      
      // Add activity log
      addActivity({
        type: "image_capture",
        title: "Photo Captured",
        description: "Photo sent to chat for AI analysis",
        status: "completed"
      })
      
      toast({
        title: "📸 Photo Captured",
        description: "Photo sent to chat for AI analysis!"
      })

      // Auto-analyze the photo
      setTimeout(async () => {
        try {
          const base64Data = imageData.split(",")[1]
          const response = await fetch('/api/analyze-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              image: base64Data, 
              type: 'webcam',
              context: 'Webcam photo analysis'
            })
          })

          if (response.ok) {
            const data = await response.json()
            const analysis = data.analysis || data.content || "Analysis completed"
            onAIAnalysis?.(analysis)
          }
        } catch (error) {
          console.error("Auto-analysis failed:", error)
        }
      }, 1000)
      
    } catch (error) {
      console.error("Photo capture failed:", error)
      toast({
        title: "Capture Failed",
        description: "Failed to capture photo. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsCapturing(false)
    }
  }, [webcamState, isCapturing, onCapture, addActivity, toast, onAIAnalysis])

  // Switch camera
  const switchCamera = useCallback(async () => {
    if (availableDevices.length <= 1) return
    
    const currentIndex = availableDevices.findIndex(device => device.deviceId === selectedDeviceId)
    const nextIndex = (currentIndex + 1) % availableDevices.length
    const nextDevice = availableDevices[nextIndex]
    
    setSelectedDeviceId(nextDevice.deviceId)
    
    // Stop current stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    
    // Start with new device
    await startCamera()
    
    toast({
      title: "Camera Switched",
      description: `Now using: ${nextDevice.label || 'Camera ' + (nextIndex + 1)}`
    })
  }, [availableDevices, selectedDeviceId, stream, startCamera, toast])

  // Initialize camera when modal opens
  useEffect(() => {
    if (isOpen) {
      getAvailableDevices().then(() => {
        if (webcamState === "initializing") {
          startCamera()
        }
      })
    }
  }, [isOpen, getAvailableDevices, startCamera, webcamState])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCaptureCount(0)
    }
  }, [isOpen])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      if (e.code === 'Space') {
        e.preventDefault()
        capturePhoto()
      } else if (e.code === 'KeyC') {
        e.preventDefault()
        switchCamera()
      } else if (e.code === 'Escape') {
        e.preventDefault()
        stopCamera()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isOpen, capturePhoto, switchCamera, stopCamera])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={stopCamera}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          {/* Header */}
          <Card className="bg-black/50 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Camera className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">Camera</CardTitle>
                    <p className="text-sm text-white/70">
                      Photos automatically go to chat
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                    {captureCount} photos
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={stopCamera}
                    className="rounded-full bg-white/10 hover:bg-white/20 text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Camera Display */}
          <Card className="flex-1 bg-black/50 backdrop-blur-sm border-white/20 overflow-hidden">
            <CardContent className="p-0 h-full relative">
              {webcamState === "initializing" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="p-4 rounded-full bg-blue-500/20 mb-4 mx-auto w-fit"
                    >
                      <Camera className="w-8 h-8 text-blue-400" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-white mb-2">Starting Camera</h3>
                    <p className="text-white/70 text-sm">Please allow camera access</p>
                  </div>
                </div>
              )}

              {webcamState === "error" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-center">
                    <div className="p-4 rounded-full bg-red-500/20 mb-4 mx-auto w-fit">
                      <X className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Camera Error</h3>
                    <p className="text-white/70 text-sm">Failed to access camera</p>
                    <Button
                      variant="outline"
                      onClick={startCamera}
                      className="mt-4 bg-white/10 hover:bg-white/20 text-white border-white/20"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              )}

              {webcamState === "active" && (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Capture Overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-4 border-2 border-white/30 rounded-lg pointer-events-none" />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Controls */}
          <Card className="bg-black/50 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-4">
                {availableDevices.length > 1 && (
                  <Button
                    variant="outline"
                    onClick={switchCamera}
                    disabled={webcamState !== "active"}
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Switch Camera
                  </Button>
                )}
                
                <Button
                  onClick={capturePhoto}
                  disabled={webcamState !== "active" || isCapturing}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded-full"
                >
                  {isCapturing ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Camera className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <>
                      <Camera className="w-5 h-5 mr-2" />
                      Capture Photo
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={stopCamera}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  Done
                </Button>
              </div>
              
              <div className="mt-3 text-center">
                <p className="text-xs text-white/60">
                  Press Space to capture • C to switch camera • Esc to close
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default WebcamModal
