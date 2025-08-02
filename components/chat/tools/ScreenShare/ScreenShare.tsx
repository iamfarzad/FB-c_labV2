"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Monitor, Square, Play, Pause, Download, Trash2, X, Eye, EyeOff } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { ToolCardWrapper } from "@/components/chat/ToolCardWrapper"
import type { ScreenShareProps, ScreenShareState } from "./ScreenShare.types"
import { motion, AnimatePresence } from "framer-motion"

export function ScreenShare({ 
  mode = 'card',
  onAnalysis, 
  onClose,
  onCancel,
  onStream 
}: ScreenShareProps) {
  const { toast } = useToast()
  const [screenState, setScreenState] = useState<ScreenShareState>("stopped")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isAutoAnalyzing, setIsAutoAnalyzing] = useState(false)
  const [currentAnalysis, setCurrentAnalysis] = useState("")
  const [analysisHistory, setAnalysisHistory] = useState<string[]>([])
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(true)
  const [stream, setStream] = useState<MediaStream | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const autoAnalysisIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleClose = useCallback(() => {
    cleanup()
    onClose?.()
    onCancel?.()
  }, [onClose, onCancel])

  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    if (autoAnalysisIntervalRef.current) {
      clearInterval(autoAnalysisIntervalRef.current)
      autoAnalysisIntervalRef.current = null
    }

    setScreenState("stopped")
    setIsAnalyzing(false)
    setIsAutoAnalyzing(false)
  }

  const startScreenShare = async () => {
    try {
      setScreenState("initializing")
      
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: false
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
      }

      setStream(mediaStream)
      setScreenState("sharing")
      onStream?.(mediaStream)

      // Handle stream end
      mediaStream.getVideoTracks()[0].addEventListener('ended', () => {
        handleClose()
      })

      toast({
        title: "Screen Share Started",
        description: "Your screen is now being shared and ready for AI analysis.",
      })

    } catch (error) {
      console.error("Screen share error:", error)
      setScreenState("error")
      toast({
        title: "Screen Share Failed",
        description: "Could not access your screen. Please check permissions and try again.",
        variant: "destructive"
      })
    }
  }

  const captureScreenshot = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return null

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    return canvas.toDataURL('image/png')
  }

  const handleAnalyze = async () => {
    if (isAnalyzing || !stream) return

    try {
      setIsAnalyzing(true)
      setScreenState("analyzing")

      const imageData = captureScreenshot()
      if (!imageData) {
        throw new Error("Failed to capture screenshot")
      }

      // Call the analyze-image API
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
          context: "screen_share_analysis",
          prompt: "Analyze this screen content. Provide insights about what's being displayed, any important information, patterns, or recommendations for improvement."
        }),
      })

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`)
      }

      const result = await response.json()
      const analysis = result.analysis || result.message || "Analysis completed successfully"

      // Check for duplicate analysis
      const isDuplicate = analysisHistory.some(prev => 
        prev.length > 50 && analysis.length > 50 && 
        prev.substring(0, 100) === analysis.substring(0, 100)
      )

      if (!isDuplicate) {
        setCurrentAnalysis(analysis)
        setAnalysisHistory(prev => [analysis, ...prev])
        
        // Send to chat
        onAnalysis(`**Screen Analysis:**\n\n${analysis}`)

        toast({
          title: "Screen Analysis Complete",
          description: "AI has analyzed your screen content.",
        })
      }

      setScreenState("sharing")
    } catch (error) {
      console.error("Analysis error:", error)
      setScreenState("sharing")
      toast({
        title: "Analysis Failed",
        description: "Could not analyze screen content. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  useEffect(() => {
    if (mode === 'modal') {
      startScreenShare()
    }
    return cleanup
  }, [mode])

  // Auto-analysis interval
  useEffect(() => {
    if (isAutoAnalyzing && stream && screenState === "sharing") {
      autoAnalysisIntervalRef.current = setInterval(() => {
        if (!isAnalyzing) {
          handleAnalyze()
        }
      }, 10000) // 10 second intervals
    } else {
      if (autoAnalysisIntervalRef.current) {
        clearInterval(autoAnalysisIntervalRef.current)
        autoAnalysisIntervalRef.current = null
      }
    }

    return () => {
      if (autoAnalysisIntervalRef.current) {
        clearInterval(autoAnalysisIntervalRef.current)
      }
    }
  }, [isAutoAnalyzing, stream, screenState, isAnalyzing])

  // Card mode - simple wrapper
  if (mode === 'card') {
    return (
      <ToolCardWrapper
        title="Screen Share"
        description="Share your screen for analysis"
      >
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-4 p-6">
            {screenState === "initializing" && (
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
                <p className="text-muted-foreground">Starting screen share...</p>
              </div>
            )}
            {screenState === "stopped" && (
              <div className="flex flex-col items-center gap-4">
                <Monitor className="w-12 h-12 text-muted-foreground" />
                <p className="text-muted-foreground">Click to start screen sharing</p>
                <Button onClick={startScreenShare} className="w-full">
                  <Monitor className="w-4 h-4 mr-2" />
                  Start Screen Share
                </Button>
              </div>
            )}
            {screenState === "sharing" && (
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-contain"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="bg-card/90 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
                        <div className="animate-spin w-5 h-5 border-2 border-accent border-t-transparent rounded-full" />
                        <span className="text-sm font-medium">Analyzing screen...</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 w-full">
                  <Button
                    onClick={handleAnalyze}
                    disabled={!stream || isAnalyzing}
                    className="flex-1"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Analyze
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleClose}>
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                </div>
              </div>
            )}
            {screenState === "error" && (
              <div className="flex flex-col items-center gap-4">
                <Monitor className="w-12 h-12 text-destructive" />
                <p className="text-destructive">Screen share failed</p>
                <Button onClick={startScreenShare} className="w-full">Try Again</Button>
              </div>
            )}
          </div>
        </div>
      </ToolCardWrapper>
    )
  }

  // Modal mode - full featured
  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 bg-gradient-to-br from-background via-card to-background border-border">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col h-full p-6"
        >
          {/* Header */}
          <DialogHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <DialogTitle className="flex items-center gap-2">
              <Monitor className="h-6 w-6 text-accent" />
              Screen Share & Analysis
              <Badge variant="outline" className="ml-2">
                {screenState === "sharing" ? "Active" : screenState}
              </Badge>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnalysisPanel(!showAnalysisPanel)}
              >
                {showAnalysisPanel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showAnalysisPanel ? "Hide" : "Show"} Analysis
              </Button>
              <Button variant="outline" size="sm" onClick={handleClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Main Content */}
          <div className="flex-1 flex gap-6 min-h-0">
            {/* Screen Display */}
            <div className="flex-1 flex flex-col min-w-0">
              <Card className="flex-1 overflow-hidden">
                <CardContent className="p-0 h-full relative">
                  {screenState === "sharing" ? (
                    <div className="relative h-full">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-contain bg-black rounded-lg"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      {isAnalyzing && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <div className="bg-card/90 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
                            <div className="animate-spin w-5 h-5 border-2 border-accent border-t-transparent rounded-full" />
                            <span className="text-sm font-medium">Analyzing screen...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center bg-muted rounded-lg">
                      <div className="text-center">
                        {screenState === "initializing" && (
                          <div className="flex flex-col items-center gap-4">
                            <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
                            <p className="text-muted-foreground">Starting screen share...</p>
                          </div>
                        )}
                        {screenState === "error" && (
                          <div className="flex flex-col items-center gap-4">
                            <Monitor className="w-12 h-12 text-destructive" />
                            <p className="text-destructive">Screen share failed</p>
                            <Button onClick={startScreenShare}>Try Again</Button>
                          </div>
                        )}
                        {screenState === "stopped" && (
                          <div className="flex flex-col items-center gap-4">
                            <Monitor className="w-12 h-12 text-muted-foreground" />
                            <p className="text-muted-foreground">Screen share stopped</p>
                            <Button onClick={startScreenShare}>Start Again</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Controls */}
              <Card className="mt-4">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button
                        onClick={handleAnalyze}
                        disabled={!stream || isAnalyzing || screenState !== "sharing"}
                        className="flex-1"
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Analyze Screen
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsAutoAnalyzing(!isAutoAnalyzing)}
                        disabled={!stream || screenState !== "sharing"}
                      >
                        {isAutoAnalyzing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        Auto ({isAutoAnalyzing ? "On" : "Off"})
                      </Button>
                    </div>
                    <Button variant="outline" onClick={handleClose}>
                      <Square className="w-4 h-4 mr-2" />
                      Stop Sharing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analysis Panel */}
            <AnimatePresence>
              {showAnalysisPanel && (
                <motion.div
                  initial={{ opacity: 0, x: 300, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: 400 }}
                  exit={{ opacity: 0, x: 300, width: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-shrink-0"
                >
                  <Card className="h-full">
                    <CardContent className="p-4 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Analysis Results</h3>
                        <div className="flex gap-2">
                          {analysisHistory.length > 0 && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const content = analysisHistory
                                    .map((analysis, index) => `## Analysis ${analysisHistory.length - index}\n\n${analysis}\n\n---\n`)
                                    .join('\n')
                                  const blob = new Blob([content], { type: 'text/markdown' })
                                  const url = URL.createObjectURL(blob)
                                  const a = document.createElement('a')
                                  a.href = url
                                  a.download = `screen-analysis-${new Date().toISOString().split('T')[0]}.md`
                                  document.body.appendChild(a)
                                  a.click()
                                  document.body.removeChild(a)
                                  URL.revokeObjectURL(url)
                                }}
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setAnalysisHistory([])
                                  setCurrentAnalysis("")
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <ScrollArea className="flex-1">
                        {analysisHistory.length === 0 ? (
                          <div className="text-center text-muted-foreground py-8">
                            <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No analysis yet</p>
                            <p className="text-xs mt-1">Click "Analyze Screen" to start</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {analysisHistory.map((analysis, index) => (
                              <div key={index} className="p-3 bg-muted/30 rounded-lg border">
                                <div className="text-xs text-muted-foreground mb-2">
                                  Analysis #{analysisHistory.length - index}
                                </div>
                                <div className="text-sm whitespace-pre-wrap">{analysis}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
