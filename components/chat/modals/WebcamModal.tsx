"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Camera, X, Loader2, Check } from "lucide-react"

interface WebcamModalProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (imageData: string) => void
  onAIAnalysis?: (analysis: string) => void
  theme?: "light" | "dark"
}

export default function WebcamModal({ isOpen, onClose, onCapture, onAIAnalysis, theme = "light" }: WebcamModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Initialize webcam when modal opens
  useEffect(() => {
    if (isOpen) {
      initializeWebcam()
    } else {
      // Clean up when modal closes
      stopWebcam()
      setCapturedImage(null)
      setError(null)
    }
  }, [isOpen])

  // Set up video stream when stream state changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  const initializeWebcam = async () => {
    try {
      setError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      })
      setStream(mediaStream)
    } catch (err) {
      console.error("Error accessing webcam:", err)
      setError("Could not access webcam. Please check permissions.")
    }
  }

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw video frame to canvas
      context?.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert canvas to data URL
      const imageData = canvas.toDataURL("image/jpeg")
      setCapturedImage(imageData)

      // Stop webcam after capturing
      stopWebcam()
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    initializeWebcam()
  }

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage)

      // Simulate AI analysis
      if (onAIAnalysis) {
        setIsAnalyzing(true)
        setTimeout(() => {
          const mockAnalysis =
            "This is a simulated AI analysis of the captured image. In a real application, this would be the result of processing your image through a vision model."
          onAIAnalysis(mockAnalysis)
          setIsAnalyzing(false)
          onClose()
        }, 1500)
      } else {
        onClose()
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Camera</DialogTitle>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-4">
          {/* Webcam display area */}
          <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden mb-4">
            {error ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-destructive bg-background/80 p-2 rounded">{error}</p>
              </div>
            ) : capturedImage ? (
              <img src={capturedImage || "/placeholder.svg"} alt="Captured" className="w-full h-full object-contain" />
            ) : (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            )}

            {/* Hidden canvas for capturing */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {!capturedImage ? (
              <Button onClick={takePhoto} disabled={!stream || !!error} className="gap-2">
                <Camera className="h-4 w-4" />
                Take Photo
              </Button>
            ) : isAnalyzing ? (
              <Button disabled className="gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </Button>
            ) : (
              <>
                <Button onClick={retakePhoto} variant="outline">
                  Retake
                </Button>
                <Button onClick={confirmPhoto} className="gap-2">
                  <Check className="h-4 w-4" />
                  Use Photo
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
