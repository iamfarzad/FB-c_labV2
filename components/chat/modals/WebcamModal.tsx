"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { X, Camera, RotateCcw, Play, Pause, Upload, Image } from "lucide-react"
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

type WebcamState = "initializing" | "active" | "error" | "stopped" | "permission-denied"
type InputMode = "camera" | "upload"

export const WebcamModal: React.FC<WebcamModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  onAIAnalysis,
}) => {
  const { toast } = useToast()
  const { addActivity } = useChatContext()
  
  const [webcamState, setWebcamState] = useState<WebcamState>("initializing")
  const [inputMode, setInputMode] = useState<InputMode>("camera")
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("")
  const [captureCount, setCaptureCount] = useState(0)
  const [isCapturing, setIsCapturing] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // Check camera permissions on mount
  useEffect(() => {
    if (!isOpen) return

    const checkCameraPermission = async () => {
      try {
        // Check if we're in a secure context
        if (!window.isSecureContext) {
          setWebcamState("error")
          toast({
            title: "HTTPS Required",
            description: "Camera access requires a secure connection (HTTPS).",
            variant: "destructive"
          })
          return
        }

        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setWebcamState("error")
          toast({
            title: "Camera Not Supported",
            description: "Camera access is not supported in this browser.",
            variant: "destructive"
          })
          return
        }

        // Request camera permission
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
        setPermissionGranted(true)
        setWebcamState("initializing")
        
        // Stop the stream immediately after permission check
        mediaStream.getTracks().forEach(track => track.stop())
        
        // Initialize camera
        await getAvailableDevices()
        await startCamera()
        
      } catch (error: any) {
        console.error("Camera permission error:", error)
        setPermissionGranted(false)
        
        if (error.name === 'NotAllowedError') {
          setWebcamState("permission-denied")
          toast({
            title: "Camera Permission Denied",
            description: "Please allow camera access in your browser settings and refresh the page.",
            variant: "destructive"
          })
        } else if (error.name === 'NotFoundError') {
          setWebcamState("error")
          toast({
            title: "No Camera Found",
            description: "Please connect a camera and try again.",
            variant: "destructive"
          })
        } else {
          setWebcamState("error")
          toast({
            title: "Camera Error",
            description: "Unable to access camera. Please check your settings.",
            variant: "destructive"
          })
        }
      }
    }

    checkCameraPermission()
  }, [isOpen, toast])

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
      
      let userMessage = "Failed to start camera. Please try again."
      
      if (errorMessage.includes("Permission denied") || errorMessage.includes("NotAllowedError")) {
        userMessage = "Camera permission denied. Please allow camera access in your browser settings."
        setWebcamState("permission-denied")
      } else if (errorMessage.includes("NotFoundError") || errorMessage.includes("no camera")) {
        userMessage = "No camera found. Please connect a camera and try again."
      } else if (errorMessage.includes("OverconstrainedError")) {
        userMessage = "Camera doesn't meet requirements. Please try a different camera."
      }
      
      toast({
        title: "Camera Access Failed",
        description: userMessage,
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

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive"
      })
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive"
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageData = e.target?.result as string
      if (imageData) {
        onCapture?.(imageData)
        
        addActivity({
          type: "image_upload",
          title: "Image Uploaded",
          description: `Uploaded: ${file.name}`,
          status: "completed"
        })
        
        toast({
          title: "📸 Image Uploaded",
          description: "Image sent to chat for AI analysis!"
        })

        // Auto-analyze the image
        setTimeout(async () => {
          try {
            const base64Data = imageData.split(",")[1]
            const response = await fetch('/api/analyze-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                image: base64Data, 
                type: 'upload',
                context: 'Uploaded image analysis'
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
      }
    }
    reader.readAsDataURL(file)
  }, [onCapture, onAIAnalysis, addActivity, toast])

  // Capture photo and send to chat immediately
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || webcamState !== "active" || isCapturing) return

    setIsCapturing(true)
    
    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        toast({ title: 'Camera Not Ready', description: 'Waiting for video stream...', variant: 'default' })
        return
      }

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCaptureCount(0)
      setInputMode("camera")
    }
  }, [isOpen])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      if (e.code === 'Space') {
        e.preventDefault()
        if (inputMode === "camera" && webcamState === "active") {
          capturePhoto()
        }
      } else if (e.code === 'KeyC') {
        e.preventDefault()
        if (inputMode === "camera" && availableDevices.length > 1) {
          switchCamera()
        }
      } else if (e.code === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isOpen, inputMode, webcamState, capturePhoto, switchCamera, availableDevices.length, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
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
                    <CardTitle className="text-white text-lg">Image Capture</CardTitle>
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
                    onClick={onClose}
                    className="rounded-full bg-white/10 hover:bg-white/20 text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Input Mode Switcher */}
          <div className="flex gap-2 p-4 bg-black/30">
            <Button
              variant={inputMode === "camera" ? "default" : "outline"}
              size="sm"
              onClick={() => setInputMode("camera")}
              disabled={!permissionGranted && webcamState === "permission-denied"}
              className={cn(
                "bg-white/10 border-white/20 text-white hover:bg-white/20",
                inputMode === "camera" && "bg-white/20",
                (!permissionGranted && webcamState === "permission-denied") && "opacity-50 cursor-not-allowed"
              )}
            >
              <Camera className="w-4 h-4 mr-2" />
              Camera
            </Button>
            <Button
              variant={inputMode === "upload" ? "default" : "outline"}
              size="sm"
              onClick={() => setInputMode("upload")}
              className={cn(
                "bg-white/10 border-white/20 text-white hover:bg-white/20",
                inputMode === "upload" && "bg-white/20"
              )}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </Button>
          </div>

          {/* Camera Display */}
          <Card className="flex-1 bg-black/50 backdrop-blur-sm border-white/20 overflow-hidden">
            <CardContent className="p-0 h-full relative">
              {inputMode === "camera" ? (
                <>
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
                      <div className="text-center max-w-md mx-auto p-6">
                        <div className="p-4 rounded-full bg-red-500/20 mb-4 mx-auto w-fit">
                          <X className="w-8 h-8 text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Camera Access Failed</h3>
                        <p className="text-white/70 text-sm mb-4">
                          We couldn't access your camera. This might be due to browser permissions or security settings.
                        </p>
                        
                        <div className="space-y-3">
                          <Button
                            variant="outline"
                            onClick={startCamera}
                            className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
                          >
                            Try Again
                          </Button>
                          
                          <Button
                            variant="outline"
                            onClick={() => setInputMode("upload")}
                            className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Image Instead
                          </Button>
                          
                          <div className="text-xs text-white/50 space-y-1">
                            <p>• Check browser camera permissions</p>
                            <p>• Ensure you're using HTTPS</p>
                            <p>• Try refreshing the page</p>
                            <p>• Use image upload instead</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {webcamState === "permission-denied" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                      <div className="text-center max-w-md mx-auto p-6">
                        <div className="p-4 rounded-full bg-orange-500/20 mb-4 mx-auto w-fit">
                          <X className="w-8 h-8 text-orange-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Camera Permission Denied</h3>
                        <p className="text-white/70 text-sm mb-4">
                          We couldn't access your camera. Please allow camera access in your browser settings.
                        </p>
                        
                        <div className="space-y-3">
                          <Button
                            variant="outline"
                            onClick={() => setInputMode("upload")}
                            className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Image Instead
                          </Button>
                          
                          <div className="text-xs text-white/50 space-y-1">
                            <p>• Check browser camera permissions</p>
                            <p>• Allow camera access in settings</p>
                            <p>• Refresh the page after allowing</p>
                            <p>• Use image upload as alternative</p>
                          </div>
                        </div>
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
                </>
              ) : (
                // Upload mode
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-center max-w-md mx-auto p-6">
                    <div className="p-4 rounded-full bg-blue-500/20 mb-4 mx-auto w-fit">
                      <Upload className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Upload Image</h3>
                    <p className="text-white/70 text-sm mb-4">
                      Select an image file to analyze with AI
                    </p>
                    
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Image className="w-4 h-4 mr-2" />
                      Choose Image File
                    </Button>
                    
                    <div className="text-xs text-white/50 space-y-1 mt-4">
                      <p>• Supported: JPEG, PNG, GIF</p>
                      <p>• Maximum size: 10MB</p>
                      <p>• Image will be analyzed automatically</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Controls */}
          <Card className="bg-black/50 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-4">
                {inputMode === "camera" && availableDevices.length > 1 && (
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
                
                {inputMode === "camera" && (
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
                )}
                
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  Done
                </Button>
              </div>
              
              {inputMode === "camera" && (
                <div className="mt-3 text-center">
                  <p className="text-xs text-white/60">
                    Press Space to capture • C to switch camera • Esc to close
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default WebcamModal
