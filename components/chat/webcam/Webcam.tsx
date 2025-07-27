"use client"

import { Camera, RotateCw, Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useWebcam } from "@/hooks/useWebcam"

interface WebcamProps {
  /**
   * Whether the component is in a modal context
   * @default false
   */
  inModal?: boolean
  
  /**
   * Callback when a photo is captured
   */
  onCapture?: (imageData: string) => void
  
  /**
   * Callback when the webcam is closed
   */
  onClose?: () => void
  
  /**
   * Whether to show the close button
   * @default true
   */
  showCloseButton?: boolean
  
  /**
   * Additional class names
   */
  className?: string
  
  /**
   * Whether to show the switch camera button
   * @default true
   */
  showSwitchCamera?: boolean
  
  /**
   * Whether to show the download button
   * @default true
   */
  showDownloadButton?: boolean
  
  /**
   * Whether to start the camera automatically
   * @default true
   */
  autoStart?: boolean
}

export function Webcam({
  inModal = false,
  onCapture,
  onClose,
  showCloseButton = true,
  className,
  showSwitchCamera = true,
  showDownloadButton = true,
  autoStart = true,
}: WebcamProps) {
  const {
    state,
    videoRef,
    canvasRef,
    capturedImage,
    availableDevices,
    startWebcam,
    stopWebcam,
    capturePhoto,
    switchCamera,
    retry,
    error,
  } = useWebcam({
    onCapture,
    autoStart,
  })

  // Handle download
  const handleDownload = () => {
    if (!capturedImage) return
    
    const link = document.createElement('a')
    link.download = `webcam-${new Date().toISOString()}.png`
    link.href = capturedImage
    link.click()
  }

  // Handle retry
  const handleRetry = () => {
    retry()
  }

  // Handle capture
  const handleCapture = () => {
    capturePhoto()
  }

  // Handle close
  const handleClose = () => {
    stopWebcam()
    onClose?.()
  }

  // Handle switch camera
  const handleSwitchCamera = () => {
    if (availableDevices.length > 1) {
      switchCamera()
    }
  }

  return (
    <div className={cn("relative w-full h-full flex flex-col", className)}>
      {/* Error State */}
      {state === 'error' || state === 'permission-denied' ? (
        <div className="flex flex-col items-center justify-center p-6 text-center flex-1">
          <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full mb-4">
            <X className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-medium mb-2">Camera Error</h3>
          <p className="text-muted-foreground text-sm mb-4">
            {error || 'Failed to access the camera. Please check your permissions.'}
          </p>
          <Button onClick={handleRetry} variant="outline">
            <RotateCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      ) : (
        <>
          {/* Webcam Preview */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            {state === 'initializing' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            )}
            
            {state === 'captured' && capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <video
                ref={videoRef}
                muted
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Overlay Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center justify-center gap-2">
                {state === 'active' && (
                  <Button
                    onClick={handleCapture}
                    size={inModal ? 'default' : 'sm'}
                    className="rounded-full w-12 h-12 p-0"
                  >
                    <span className="sr-only">Capture photo</span>
                    <Camera className="w-6 h-6" />
                  </Button>
                )}
                
                {state === 'captured' && (
                  <>
                    <Button
                      onClick={handleRetry}
                      variant="outline"
                      size={inModal ? 'default' : 'sm'}
                      className="rounded-full"
                    >
                      <RotateCw className="w-4 h-4 mr-2" />
                      Retake
                    </Button>
                    
                    {showDownloadButton && (
                      <Button
                        onClick={handleDownload}
                        size={inModal ? 'default' : 'sm'}
                        className="rounded-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {/* Top Right Controls */}
            <div className="absolute top-0 right-0 p-2">
              <div className="flex gap-2">
                {showSwitchCamera && availableDevices.length > 1 && state === 'active' && (
                  <Button
                    onClick={handleSwitchCamera}
                    variant="secondary"
                    size="icon"
                    className="rounded-full w-8 h-8"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span className="sr-only">Switch camera</span>
                  </Button>
                )}
                
                {showCloseButton && onClose && (
                  <Button
                    onClick={handleClose}
                    variant="secondary"
                    size="icon"
                    className="rounded-full w-8 h-8"
                  >
                    <X className="w-4 h-4" />
                    <span className="sr-only">Close camera</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Hidden canvas for captures */}
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Status */}
          {state === 'initializing' && (
            <p className="mt-2 text-sm text-muted-foreground text-center">
              Initializing camera...
            </p>
          )}
          
          {state === 'active' && availableDevices.length > 1 && (
            <p className="mt-2 text-xs text-muted-foreground text-center">
              Tap <RotateCw className="w-3 h-3 inline" /> to switch camera
            </p>
          )}
        </>
      )}
    </div>
  )
}
