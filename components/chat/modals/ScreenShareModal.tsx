"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Monitor, X, Camera, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ScreenShareModalProps {
  isOpen: boolean
  onClose: () => void
  onStream: (stream: MediaStream) => void
  onAIAnalysis?: (analysis: string) => void
  theme?: "light" | "dark"
}

export default function ScreenShareModal({
  isOpen,
  onClose,
  onStream,
  onAIAnalysis,
  theme = "light",
}: ScreenShareModalProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Clean up when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopSharing()
      setError(null)
    }
  }, [isOpen])

  const startScreenShare = async () => {
    try {
      setError(null)

      // Request screen sharing
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always",
        },
        audio: false,
      })

      setStream(mediaStream)
      setIsSharing(true)

      // Handle when user stops sharing via browser UI
      mediaStream.getVideoTracks()[0].onended = () => {
        stopSharing()
      }
    } catch (err) {
      console.error("Error sharing screen:", err)
      setError("Could not share screen. Please try again.")
    }
  }

  const stopSharing = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsSharing(false)
  }

  const captureScreen = () => {
    if (stream) {
      setIsCapturing(true)

      // Pass the stream to parent component
      onStream(stream)

      // Simulate AI analysis
      if (onAIAnalysis) {
        setTimeout(() => {
          const mockAnalysis =
            "This is a simulated AI analysis of the screen capture. In a real application, this would be the result of processing your screen through a vision model."
          onAIAnalysis(mockAnalysis)
          setIsCapturing(false)
          onClose()
        }, 2000)
      } else {
        setIsCapturing(false)
        onClose()
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Screen</DialogTitle>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6">
          {/* Screen share visualization */}
          <div
            className={cn(
              "w-32 h-32 rounded-lg mb-6 flex items-center justify-center",
              isSharing ? "bg-primary/20 animate-pulse" : "bg-muted",
            )}
          >
            <Monitor className={cn("h-16 w-16", isSharing ? "text-primary" : "text-muted-foreground")} />
          </div>

          {/* Status text */}
          <div className="text-center mb-6">
            {isCapturing ? (
              <p className="text-lg font-medium">Capturing your screen...</p>
            ) : isSharing ? (
              <p className="text-lg font-medium">Screen sharing active</p>
            ) : error ? (
              <p className="text-destructive">{error}</p>
            ) : (
              <p className="text-muted-foreground">Share your screen to get AI analysis</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {!isSharing ? (
              <Button onClick={startScreenShare} className="gap-2">
                <Monitor className="h-4 w-4" />
                Share Screen
              </Button>
            ) : isCapturing ? (
              <Button disabled className="gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </Button>
            ) : (
              <>
                <Button onClick={stopSharing} variant="outline">
                  Stop Sharing
                </Button>
                <Button onClick={captureScreen} className="gap-2">
                  <Camera className="h-4 w-4" />
                  Capture Screen
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
