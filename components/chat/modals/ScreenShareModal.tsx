"use client"

import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import { Monitor, Square, Play, Pause, Zap } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button-variants"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-variants"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useApiRequest } from "@/hooks/use-api-request"
import { useScreenShare } from "@/hooks/useScreenShare"

interface ScreenShareModalProps {
  isOpen: boolean
  onClose: () => void
  onAnalysis?: (analysis: string) => void
}

type ScreenShareState = "idle" | "requesting" | "active" | "error" | "analyzing"

export const ScreenShareModal: React.FC<ScreenShareModalProps> = ({ isOpen, onClose, onAnalysis }) => {
  const { toast } = useToast()
  const [state, setState] = useState<ScreenShareState>("idle")
  const [analysisText, setAnalysisText] = useState("")
  const [captureCount, setCaptureCount] = useState(0)
  const [isRecording, setIsRecording] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])

  const { execute: analyzeScreenshot, isLoading: isAnalyzing } = useApiRequest({
    showErrorToast: true,
    retryAttempts: 2,
  })

  const {
    stream,
    isSharing,
    error: screenShareError,
    startScreenShare,
    stopScreenShare,
  } = useScreenShare({
    onStreamStart: (stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setState("active")
      }
    },
    onStreamEnd: () => {
      setState("idle")
      setIsRecording(false)
    },
    onError: (error) => {
      setState("error")
      toast({
        title: "Screen Share Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleStartScreenShare = useCallback(async () => {
    setState("requesting")
    try {
      await startScreenShare()
    } catch (error) {
      setState("error")
    }
  }, [startScreenShare])

  const handleStopScreenShare = useCallback(() => {
    stopScreenShare()
    setIsRecording(false)
    setState("idle")
  }, [stopScreenShare])

  const captureScreenshot = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || state !== "active") return

    try {
      const video = videoRef.current
      const canvas = canvasRef.current

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const imageData = canvas.toDataURL("image/jpeg", 0.9)

      setCaptureCount((prev) => prev + 1)

      toast({
        title: "Screenshot Captured",
        description: "Analyzing screen content...",
      })

      // Analyze the screenshot
      const result = await analyzeScreenshot("/api/analyze-screenshot", {
        method: "POST",
        body: JSON.stringify({
          image: imageData.split(",")[1],
          context: "Screen share analysis",
        }),
      })

      if (result?.analysis) {
        setAnalysisText(result.analysis)
        onAnalysis?.(result.analysis)
        toast({
          title: "Analysis Complete",
          description: "Screen content has been analyzed.",
        })
      }
    } catch (error) {
      console.error("Screenshot capture failed:", error)
      toast({
        title: "Capture Failed",
        description: "Failed to capture and analyze screenshot.",
        variant: "destructive",
      })
    }
  }, [state, analyzeScreenshot, onAnalysis, toast])

  const startRecording = useCallback(() => {
    if (!stream || isRecording) return

    try {
      recordedChunksRef.current = []
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
      })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        })

        // Create download link
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `screen-recording-${Date.now()}.webm`
        a.click()
        URL.revokeObjectURL(url)

        toast({
          title: "Recording Saved",
          description: "Screen recording has been downloaded.",
        })
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(1000) // Capture data every second
      setIsRecording(true)

      toast({
        title: "Recording Started",
        description: "Screen recording is now active.",
      })
    } catch (error) {
      console.error("Recording failed:", error)
      toast({
        title: "Recording Failed",
        description: "Failed to start screen recording.",
        variant: "destructive",
      })
    }
  }, [stream, isRecording, toast])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  const handleClose = useCallback(() => {
    handleStopScreenShare()
    setAnalysisText("")
    setCaptureCount(0)
    onClose()
  }, [handleStopScreenShare, onClose])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.code === "Space" && state === "active") {
        e.preventDefault()
        captureScreenshot()
      }
      if (e.code === "KeyR" && state === "active") {
        e.preventDefault()
        if (isRecording) {
          stopRecording()
        } else {
          startRecording()
        }
      }
      if (e.code === "Escape") {
        handleClose()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isOpen, state, isRecording, captureScreenshot, startRecording, stopRecording, handleClose])

  const renderContent = () => {
    switch (state) {
      case "idle":
        return (
          <div className="p-6 text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Monitor className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Share Your Screen</h3>
              <p className="text-muted-foreground">
                Share your screen to get AI-powered analysis and insights about your content.
              </p>
            </div>
            <Button onClick={handleStartScreenShare} size="lg" leftIcon={<Monitor className="w-4 h-4" />}>
              Start Screen Share
            </Button>
          </div>
        )

      case "requesting":
        return (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
              <Monitor className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Requesting Permission</h3>
              <p className="text-muted-foreground">Please select a screen or window to share in the browser dialog.</p>
            </div>
          </div>
        )

      case "active":
        return (
          <div className="space-y-4">
            {/* Video Display */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video ref={videoRef} autoPlay muted className="w-full h-auto max-h-96 object-contain" />
              <canvas ref={canvasRef} className="hidden" />

              {/* Recording Indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4">
                  <Badge variant="destructive" className="animate-pulse">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                    Recording
                  </Badge>
                </div>
              )}

              {/* Capture Count */}
              {captureCount > 0 && (
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary">
                    {captureCount} capture{captureCount !== 1 ? "s" : ""}
                  </Badge>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-2 p-4 bg-muted/50 rounded-lg">
              <Button
                onClick={captureScreenshot}
                variant="default"
                size="sm"
                leftIcon={<Square className="w-4 h-4" />}
                loading={isAnalyzing}
                loadingText="Analyzing..."
              >
                Capture & Analyze
              </Button>

              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "secondary"}
                size="sm"
                leftIcon={isRecording ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              >
                {isRecording ? "Stop Recording" : "Start Recording"}
              </Button>

              <Button onClick={handleStopScreenShare} variant="outline" size="sm">
                Stop Sharing
              </Button>
            </div>

            {/* Analysis Results */}
            {analysisText && (
              <Card variant="elevated" padding="md">
                <CardHeader padding="sm">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    AI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent padding="sm">
                  <Textarea
                    value={analysisText}
                    onChange={(e) => setAnalysisText(e.target.value)}
                    className="min-h-[120px] resize-none"
                    placeholder="Analysis results will appear here..."
                    readOnly
                  />
                </CardContent>
              </Card>
            )}

            {/* Keyboard Shortcuts */}
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>
                <kbd className="px-1.5 py-0.5 bg-muted rounded">Space</kbd> - Capture Screenshot
              </p>
              <p>
                <kbd className="px-1.5 py-0.5 bg-muted rounded">R</kbd> - Toggle Recording
              </p>
              <p>
                <kbd className="px-1.5 py-0.5 bg-muted rounded">Esc</kbd> - Close
              </p>
            </div>
          </div>
        )

      case "error":
        return (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
              <Monitor className="w-8 h-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Screen Share Failed</h3>
              <p className="text-muted-foreground">
                {screenShareError?.message || "Failed to access screen share. Please check permissions and try again."}
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleStartScreenShare} variant="outline">
                Try Again
              </Button>
              <Button onClick={handleClose} variant="ghost">
                Close
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Screen Share & Analysis"
      description="Share your screen for AI-powered content analysis"
      icon={<Monitor className="h-6 w-6 text-primary" />}
      size="lg"
      theme="light"
    >
      {renderContent()}
    </Modal>
  )
}

export default ScreenShareModal
