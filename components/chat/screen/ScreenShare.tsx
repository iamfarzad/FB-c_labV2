"use client"

import { Monitor, Square, Download, Loader2, Brain } from "lucide-react"
import { ToolButton } from "@/components/ui/tool-button"
import { useScreenShare } from "@/hooks/useScreenShare"
import { cn } from "@/lib/utils"

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

  const getStatusText = () => {
    switch (state) {
      case 'idle':
        return 'Ready to share'
      case 'sharing':
        return 'Screen sharing active'
      case 'captured':
        return 'Screenshot captured'
      case 'analyzing':
        return 'Analyzing content...'
      case 'completed':
        return 'Analysis complete'
      case 'error':
        return 'Error occurred'
      default:
        return 'Unknown state'
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Status Indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className={cn(
          "w-2 h-2 rounded-full",
          state === 'idle' && "bg-muted-foreground",
          state === 'sharing' && "bg-green-500",
          state === 'captured' && "bg-blue-500",
          state === 'analyzing' && "bg-blue-500 animate-pulse",
          state === 'error' && "bg-red-500"
        )} />
        <span>{getStatusText()}</span>
      </div>

      {/* Video Preview */}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-border">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-contain"
        />
        {state === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="text-center">
              <div className="p-4 rounded-full bg-accent/10 mb-4 mx-auto w-fit">
                <Monitor className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Screen Share</h3>
              <p className="text-white/70 mb-4">Share your screen for AI analysis</p>
              <ToolButton
                onClick={handleStart}
                size="lg"
                icon={<Monitor className="w-4 h-4" />}
              >
                Start Screen Share
              </ToolButton>
            </div>
          </div>
        )}
        
        {state === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900/20">
            <div className="text-center">
              <div className="p-4 rounded-full bg-red-500/20 mb-4 mx-auto w-fit">
                <Monitor className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Screen Share Failed</h3>
              <p className="text-white/70">Please check permissions and try again</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {state === 'sharing' && (
          <>
            <ToolButton
              onClick={handleCapture}
              variant="secondary"
              icon={<Square className="w-4 h-4" />}
            >
              Capture Screenshot
            </ToolButton>
            
            <ToolButton
              onClick={handleStop}
              variant="destructive"
              icon={<Square className="w-4 h-4" />}
            >
              Stop Sharing
            </ToolButton>
          </>
        )}
        
        {capturedImage && (
          <ToolButton
            onClick={handleDownload}
            variant="secondary"
            icon={<Download className="w-4 h-4" />}
          >
            Download Screenshot
          </ToolButton>
        )}

        {autoAnalyze && state === 'sharing' && (
          <ToolButton
            onClick={() => {
              const imageUrl = captureScreenshot()
              if (imageUrl) analyzeScreenshot(imageUrl)
            }}
            variant="secondary"
            icon={<Brain className="w-4 h-4" />}
          >
            Analyze Now
          </ToolButton>
        )}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="p-4 bg-muted/50 rounded-lg border border-border">
          <h4 className="font-semibold text-foreground mb-2">Analysis Results</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {analysis}
          </p>
        </div>
      )}

      {/* Hidden canvas for screenshots */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
