"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Camera, Upload, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ToolCardWrapper } from "@/components/chat/ToolCardWrapper"
import type { WebcamCaptureProps, WebcamState, InputMode } from "./WebcamCapture.types"

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
  const [captureCount, setCaptureCount] = useState(0)
  const [isCapturing, setIsCapturing] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCapture = (imageData: string) => {
    onCapture(imageData)
    onAIAnalysis?.(`Analysis of captured image: ${imageData.substring(0, 30)}...`)
  }

  const handleClose = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setWebcamState("stopped")
    onClose?.()
    onCancel?.()
  }, [stream, onClose, onCancel])

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
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error("Camera access failed:", error)
      setWebcamState("error")
      toast({
        title: "Camera Access Failed",
        description: "Please check permissions and try again.",
        variant: "destructive",
      })
    }
  }, [toast])

  const checkAndInitCamera = useCallback(async () => {
    try {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        setWebcamState("error")
        toast({
          title: "Camera Not Supported",
          description: "Camera requires a secure connection (HTTPS) and a supported browser.",
          variant: "destructive",
        })
        return
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
      setPermissionGranted(true)
      mediaStream.getTracks().forEach((track) => track.stop())

      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter((d) => d.kind === "videoinput")
      setAvailableDevices(videoDevices)

      const currentDeviceId = videoDevices[0]?.deviceId
      if (currentDeviceId) {
        setSelectedDeviceId(currentDeviceId)
        await startCamera(currentDeviceId)
      } else {
        setWebcamState("error")
        toast({ title: "No Camera Found", description: "Please connect a camera.", variant: "destructive" })
      }
    } catch (error: any) {
      console.error("Camera permission error:", error)
      setPermissionGranted(false)
      setWebcamState(error.name === "NotAllowedError" ? "permission-denied" : "error")
      toast({
        title: "Camera Permission Denied",
        description: "Please allow camera access in browser settings.",
        variant: "destructive",
      })
    }
  }, [startCamera, toast])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      toast({
        title: "Invalid File",
        description: "Please select an image file smaller than 10MB.",
        variant: "destructive",
      })
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageData = e.target?.result as string
      if (imageData) {
        handleCapture(imageData)
        toast({ title: "📸 Image Uploaded", description: "Image sent for analysis." })
      }
    }
    reader.readAsDataURL(file)
  }, [handleCapture, toast])

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || webcamState !== "active" || isCapturing) return
    setIsCapturing(true)
    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height)
      const imageData = canvas.toDataURL("image/jpeg", 0.9)
      handleCapture(imageData)
      setCaptureCount((prev) => prev + 1)
      toast({ title: "📸 Photo Captured", description: "Sent for analysis." })
    } catch (error) {
      toast({ title: "Capture Failed", variant: "destructive" })
    } finally {
      setIsCapturing(false)
    }
  }, [webcamState, isCapturing, handleCapture, toast])

  const switchCamera = useCallback(async () => {
    if (availableDevices.length <= 1) return
    const currentIndex = availableDevices.findIndex((d) => d.deviceId === selectedDeviceId)
    const nextIndex = (currentIndex + 1) % availableDevices.length
    const nextDevice = availableDevices[nextIndex]
    setSelectedDeviceId(nextDevice.deviceId)
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    await startCamera(nextDevice.deviceId)
    toast({ title: "Camera Switched", description: `Using: ${nextDevice.label || `Camera ${nextIndex + 1}`}` })
  }, [availableDevices, selectedDeviceId, stream, startCamera, toast])

  useEffect(() => {
    if (inputMode === "camera" && !stream) {
      checkAndInitCamera()
    }
  }, [inputMode, stream, checkAndInitCamera])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" && inputMode === "camera" && webcamState === "active") capturePhoto()
      if (e.code === "KeyC" && inputMode === "camera" && availableDevices.length > 1) switchCamera()
      if (e.code === "Escape") handleClose()
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [inputMode, webcamState, capturePhoto, switchCamera, availableDevices.length, handleClose])

  // Card mode - simple wrapper
  if (mode === 'card') {
    return (
      <ToolCardWrapper
        title="Webcam Capture"
        description="Take a photo with your camera"
      >
        <div className="space-y-4">
          <div className="relative">
            {webcamState === "active" ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-48 object-cover rounded-lg"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center bg-muted rounded-lg">
                <div className="text-center">
                  {webcamState === "initializing" && (
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
                      <p className="text-muted-foreground">Initializing camera...</p>
                    </div>
                  )}
                  {webcamState === "error" && (
                    <div className="flex flex-col items-center gap-2">
                      <Camera className="w-8 h-8 text-destructive" />
                      <p className="text-destructive">Camera error</p>
                      <Button size="sm" onClick={() => startCamera(selectedDeviceId)}>
                        Retry
                      </Button>
                    </div>
                  )}
                  {webcamState === "permission-denied" && (
                    <div className="flex flex-col items-center gap-2">
                      <Camera className="w-8 h-8 text-destructive" />
                      <p className="text-destructive">Camera permission denied</p>
                      <Button size="sm" onClick={() => setInputMode("upload")}>
                        Switch to Upload
                      </Button>
                    </div>
                  )}
                  {webcamState === "stopped" && (
                    <div className="flex flex-col items-center gap-2">
                      <Camera className="w-8 h-8 text-muted-foreground" />
                      <p className="text-muted-foreground">Camera stopped</p>
                      <Button size="sm" onClick={() => checkAndInitCamera()}>
                        Start Camera
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={capturePhoto}
              disabled={webcamState !== "active" || isCapturing}
              className="flex-1"
            >
              <Camera className="w-4 h-4 mr-2" />
              {isCapturing ? "Capturing..." : "Capture"}
            </Button>
            {availableDevices.length > 1 && (
              <Button
                variant="outline"
                onClick={switchCamera}
                disabled={webcamState !== "active"}
                size="sm"
              >
                Switch
              </Button>
            )}
          </div>
        </div>
      </ToolCardWrapper>
    )
  }

  // Modal mode - full featured
  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-6 w-6 text-accent" />
            Camera & Image Analysis
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Captures: {captureCount}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={inputMode === "camera" ? "default" : "outline"}
                size="sm"
                onClick={() => setInputMode("camera")}
                disabled={!permissionGranted && webcamState === "permission-denied"}
              >
                <Camera className="w-4 h-4 mr-2" />
                Camera
              </Button>
              <Button
                variant={inputMode === "upload" ? "default" : "outline"}
                size="sm"
                onClick={() => setInputMode("upload")}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-0 h-full relative">
              {inputMode === "camera" ? (
                <div className="relative">
                  {webcamState === "active" ? (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                      <div className="text-center">
                        {webcamState === "initializing" && (
                          <p className="text-muted-foreground">Initializing camera...</p>
                        )}
                        {webcamState === "error" && (
                          <div>
                            <p className="text-destructive mb-2">Camera error</p>
                            <Button onClick={() => startCamera(selectedDeviceId)}>
                              Retry
                            </Button>
                          </div>
                        )}
                        {webcamState === "permission-denied" && (
                          <div>
                            <p className="text-destructive mb-2">Camera permission denied</p>
                            <Button onClick={() => setInputMode("upload")}>
                              Switch to Upload
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  className="h-64 flex items-center justify-center bg-muted rounded-lg border-2 border-dashed border-border cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Click to upload an image</p>
                    <p className="text-xs text-muted-foreground mt-1">Max 10MB</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                {inputMode === "camera" ? (
                  <div className="flex gap-2">
                    <Button
                      onClick={capturePhoto}
                      disabled={webcamState !== "active" || isCapturing}
                      className="flex-1"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {isCapturing ? "Capturing..." : "Capture Photo"}
                    </Button>
                    {availableDevices.length > 1 && (
                      <Button
                        variant="outline"
                        onClick={switchCamera}
                        disabled={webcamState !== "active"}
                      >
                        Switch Camera
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Select Image
                  </Button>
                )}
                <Button variant="outline" onClick={handleClose}>
                  <X className="w-4 h-4 mr-2" />
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>

          <input 
            ref={fileInputRef} 
            type="file" 
            accept="image/*" 
            onChange={handleFileUpload} 
            className="hidden" 
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
