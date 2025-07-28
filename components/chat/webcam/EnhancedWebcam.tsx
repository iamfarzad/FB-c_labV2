"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Camera, Video, Download, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useChatContext } from "@/app/(chat)/chat/context/ChatProvider"

export function EnhancedWebcam() {
  const { addActivity } = useChatContext()
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
  const [capture, setCapture] = useState<string | null>(null)
  const [isPhotoMode, setIsPhotoMode] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      setMediaStream(stream)
      setIsCameraOn(true)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      addActivity({ type: "webcam", status: "in-progress", content: "Webcam activated" })
    } catch (err) {
      console.error("Error accessing webcam:", err)
      addActivity({ type: "error", status: "error", content: "Failed to access webcam" })
    }
  }, [addActivity])

  const stopCamera = useCallback(() => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop())
    }
    setIsCameraOn(false)
    setMediaStream(null)
    addActivity({ type: "webcam", status: "cancelled", content: "Webcam deactivated" })
  }, [mediaStream, addActivity])

  const takePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const context = canvas.getContext("2d")
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
        const dataUrl = canvas.toDataURL("image/png")
        setCapture(dataUrl)
        stopCamera()
        addActivity({ type: "webcam", status: "success", content: "Photo captured" })
      }
    }
  }, [stopCamera, addActivity])

  const handleCapture = () => {
    if (isPhotoMode) {
      takePhoto()
    } else {
      // Video recording logic would go here
      addActivity({ type: "info", status: "success", content: "Video recording not implemented yet" })
    }
  }

  const deleteCapture = () => {
    setCapture(null)
  }

  const downloadCapture = () => {
    if (capture) {
      const a = document.createElement("a")
      a.href = capture
      a.download = `capture-${new Date().toISOString()}.png`
      a.click()
    }
  }

  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [mediaStream])

  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground">
      <h3 className="font-semibold mb-2">Webcam Capture</h3>
      <div className="relative aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center">
        {isCameraOn ? (
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        ) : capture ? (
          <img src={capture || "/placeholder.svg"} alt="Webcam capture" className="w-full h-full object-contain" />
        ) : (
          <Camera className="w-16 h-16 text-muted-foreground" />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className="flex justify-between items-center mt-4">
        {!isCameraOn && !capture && (
          <Button onClick={startCamera}>
            <Camera className="mr-2 h-4 w-4" /> Start Camera
          </Button>
        )}
        {isCameraOn && (
          <>
            <Button onClick={handleCapture} className="w-16 h-16 rounded-full">
              {isPhotoMode ? <Camera className="w-8 h-8" /> : <Video className="w-8 h-8" />}
            </Button>
            <Button onClick={stopCamera} variant="destructive">
              Stop
            </Button>
          </>
        )}
        {capture && (
          <div className="flex gap-2">
            <Button onClick={downloadCapture} variant="outline">
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
            <Button onClick={deleteCapture} variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
