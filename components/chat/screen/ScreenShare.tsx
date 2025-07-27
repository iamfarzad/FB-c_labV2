"use client"

import { Monitor, Square, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useScreenShare } from "@/hooks/useScreenShare"

interface ScreenShareProps {
  inModal?: boolean
  onStream?: (stream: MediaStream) => void
  onAnalysis?: (analysis: string) => void
  autoAnalyze?: boolean
  onClose?: () => void
  className?: string
}

export function ScreenShare({
  inModal = false,
  onStream,
  onAnalysis,
  autoAnalyze = false,
  onClose,
  className,
}: ScreenShareProps) {
  const {
    state,
    stream,
    capturedImage,
    analysis,
    videoRef,
    canvasRef,
    startScreenShare,
    stopScreenShare,
    captureScreenshot,
    analyzeScreenshot,
  } = useScreenShare({ onStream, onAnalysis, autoAnalyze })

  const handleStart = async () => await startScreenShare()
  const handleStop = () => { stopScreenShare(); onClose?.() }
  
  const handleCapture = () => {
    const imageUrl = captureScreenshot()
    if (imageUrl && autoAnalyze) analyzeScreenshot(imageUrl)
  }

  const handleDownload = () => {
    if (!capturedImage) return
    const link = document.createElement('a')
    link.download = `screenshot-${new Date().toISOString()}.png`
    link.href = capturedImage
    link.click()
  }

  return (
    <div className={className}>
      {/* Video Preview */}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-contain"
        />
        {state === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Button onClick={handleStart} size="lg">
              <Monitor className="w-4 h-4 mr-2" />
              Start Screen Share
            </Button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {state === 'sharing' && (
          <>
            <Button variant="outline" size="sm" onClick={handleCapture}>
              <Square className="w-4 h-4 mr-2" />
              Capture
            </Button>
            <Button variant="destructive" size="sm" onClick={handleStop}>
              Stop Sharing
            </Button>
          </>
        )}
        
        {capturedImage && (
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        )}
      </div>

      {/* Hidden canvas for screenshots */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
