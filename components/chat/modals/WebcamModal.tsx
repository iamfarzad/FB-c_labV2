"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Camera } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Card, CardContent } from "@/components/ui/card-variants"
import { useChatContext } from "@/app/(chat)/chat/context/ChatProvider"
import { useToast } from "@/components/ui/use-toast"
import { useFileUpload } from "@/hooks/use-file-upload"
import { useApiRequest } from "@/hooks/use-api-request"
import { WebcamHeader } from "./webcam/WebcamHeader"
import { InputModeSwitcher } from "./webcam/InputModeSwitcher"
import { CameraView } from "./webcam/CameraView"
import { UploadView } from "./webcam/UploadView"
import { WebcamControls } from "./webcam/WebcamControls"

interface WebcamModalProps {
  isOpen: boolean
  onClose: () => void
  onCapture?: (imageData: string) => void
  onAIAnalysis?: (analysis: string) => void
}

type WebcamState = "initializing" | "active" | "error" | "stopped" | "permission-denied"
type InputMode = "camera" | "upload"

export const WebcamModal: React.FC<WebcamModalProps> = ({ isOpen, onClose, onCapture, onAIAnalysis }) => {
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

  const { execute: analyzeImage } = useApiRequest({
    showErrorToast: false,
  })

  const { handleFileSelect, fileInputRef } = useFileUpload({
    allowedTypes: ["image/*"],
    maxSize: 10 * 1024 * 1024,
    onUploadComplete: (result) => {
      toast({
        title: "📸 Image Uploaded",
        description: "Image sent for analysis.",
      })
    },
  })

  const startCamera = useCallback(
    async (deviceId?: string) => {
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
        addActivity({
          type: "image_capture",
          title: "Camera Started",
          description: "Webcam is ready",
          status: "in_progress",
        })
      } catch (error) {
        console.error("Camera access failed:", error)
        setWebcamState("error")
        toast({
          title: "Camera Access Failed",
          description: "Please check permissions and try again.",
          variant: "destructive",
        })
      }
    },
    [addActivity, toast],
  )

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

  useEffect(() => {
    if (isOpen && inputMode === "camera" && !stream) {
      checkAndInitCamera()
    }
  }, [isOpen, inputMode, stream, checkAndInitCamera])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }, [stream])

  const handleClose = useCallback(() => {
    stopCamera()
    setWebcamState("stopped")
    onClose()
  }, [stopCamera, onClose])

  const handleImageAnalysis = useCallback(
    async (base64Data: string, type: "webcam" | "upload") => {
      try {
        const result = await analyzeImage("/api/analyze-image", {
          method: "POST",
          body: JSON.stringify({ image: base64Data, type, context: `Image analysis from ${type}` }),
        })
        if (result?.analysis || result?.content) {
          onAIAnalysis?.(result.analysis || result.content)
        }
      } catch (error) {
        console.error("Auto-analysis failed:", error)
      }
    },
    [analyzeImage, onAIAnalysis],
  )

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
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
          onCapture?.(imageData)
          addActivity({ type: "image_upload", title: "Image Uploaded", description: file.name, status: "completed" })
          toast({ title: "📸 Image Uploaded", description: "Image sent for analysis." })
          handleImageAnalysis(imageData.split(",")[1], "upload")
        }
      }
      reader.readAsDataURL(file)
    },
    [onCapture, addActivity, toast, handleImageAnalysis],
  )

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
      onCapture?.(imageData)
      setCaptureCount((prev) => prev + 1)
      addActivity({
        type: "image_capture",
        title: "Photo Captured",
        description: "Sent to chat for analysis",
        status: "completed",
      })
      toast({ title: "📸 Photo Captured", description: "Sent for analysis." })
      handleImageAnalysis(imageData.split(",")[1], "webcam")
    } catch (error) {
      toast({ title: "Capture Failed", variant: "destructive" })
    } finally {
      setIsCapturing(false)
    }
  }, [webcamState, isCapturing, onCapture, addActivity, toast, handleImageAnalysis])

  const switchCamera = useCallback(async () => {
    if (availableDevices.length <= 1) return
    const currentIndex = availableDevices.findIndex((d) => d.deviceId === selectedDeviceId)
    const nextIndex = (currentIndex + 1) % availableDevices.length
    const nextDevice = availableDevices[nextIndex]
    setSelectedDeviceId(nextDevice.deviceId)
    stopCamera()
    await startCamera(nextDevice.deviceId)
    toast({ title: "Camera Switched", description: `Using: ${nextDevice.label || `Camera ${nextIndex + 1}`}` })
  }, [availableDevices, selectedDeviceId, stopCamera, startCamera, toast])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.code === "Space" && inputMode === "camera" && webcamState === "active") capturePhoto()
      if (e.code === "KeyC" && inputMode === "camera" && availableDevices.length > 1) switchCamera()
      if (e.code === "Escape") handleClose()
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isOpen, inputMode, webcamState, capturePhoto, switchCamera, availableDevices.length, handleClose])

  useEffect(() => {
    if (!isOpen) {
      stopCamera()
      setCaptureCount(0)
      setInputMode("camera")
    }
  }, [isOpen, stopCamera])

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Camera & Image Analysis"
      description="Capture photos or upload images for AI analysis"
      icon={<Camera className="h-6 w-6 text-accent" />}
      size="lg"
      theme="dark"
      contentClassName="p-0"
    >
      <div className="space-y-4">
        <div className="px-6 pt-6">
          <WebcamHeader captureCount={captureCount} onClose={handleClose} />
          <InputModeSwitcher
            currentMode={inputMode}
            onModeChange={setInputMode}
            isCameraDisabled={!permissionGranted && webcamState === "permission-denied"}
          />
        </div>

        <Card variant="glass" padding="none" className="mx-6 overflow-hidden">
          <CardContent className="p-0 h-full relative">
            {inputMode === "camera" ? (
              <CameraView
                webcamState={webcamState}
                videoRef={videoRef}
                canvasRef={canvasRef}
                onRetry={() => startCamera(selectedDeviceId)}
                onSwitchToUpload={() => setInputMode("upload")}
              />
            ) : (
              <UploadView onFileSelect={() => fileInputRef.current?.click()} />
            )}
          </CardContent>
        </Card>

        <div className="px-6 pb-6">
          <Card variant="glass" padding="sm">
            <WebcamControls
              inputMode={inputMode}
              webcamState={webcamState}
              isCapturing={isCapturing}
              canSwitchCamera={availableDevices.length > 1}
              onCapture={capturePhoto}
              onSwitchCamera={switchCamera}
              onClose={handleClose}
            />
          </Card>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
      </div>
    </Modal>
  )
}

export default WebcamModal
