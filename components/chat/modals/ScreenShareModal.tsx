"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { X, Monitor, Brain, Square, Play, Pause, Loader2, MonitorSpeaker, Eye, EyeOff, Download, RotateCcw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useAnalysisHistory } from "@/hooks/use-analysis-history"
import { useToast } from "@/components/ui/use-toast"

interface ScreenShareModalProps {
  isOpen: boolean
  onClose: () => void
  onAIAnalysis?: (analysis: string) => void
  onStream: (stream: MediaStream) => void
  theme?: "light" | "dark"
}

type ScreenShareState = "initializing" | "sharing" | "analyzing" | "error" | "stopped"

export const ScreenShareModal: React.FC<ScreenShareModalProps> = ({
  isOpen,
  onClose,
  onAIAnalysis,
  onStream,
  theme = "dark",
}) => {
  const { toast } = useToast()
  const { analysisHistory, addAnalysis, clearHistory } = useAnalysisHistory()
  
  const [screenState, setScreenState] = useState<ScreenShareState>("initializing")
  const [isAutoAnalyzing, setIsAutoAnalyzing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [currentAnalysis, setCurrentAnalysis] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisCount, setAnalysisCount] = useState(0)
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(true)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const autoAnalysisInterval = useRef<NodeJS.Timeout | null>(null)

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      setScreenState("initializing")
      
              const mediaStream = await navigator.mediaDevices.getDisplayMedia({
          video: { 
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false,
        })
      
      setStream(mediaStream)
      setScreenState("sharing")
      onStream?.(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }

      // Listen for screen share end
      mediaStream.getVideoTracks()[0].addEventListener("ended", () => {
        handleScreenShareEnd()
      })

      toast({
        title: "Screen Sharing Started",
        description: "Your screen is now being shared for AI analysis."
      })
      
    } catch (error) {
      console.error("Error starting screen share:", error)
      setScreenState("error")
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      toast({
        title: "Screen Share Failed",
        description: errorMessage.includes("Permission denied") 
          ? "Permission denied. Please allow screen sharing access."
          : "Failed to start screen sharing. Please try again.",
        variant: "destructive"
      })
      
      setTimeout(() => onClose(), 3000)
    }
  }, [onClose, onStream, toast])

  // Stop screen sharing
  const stopScreenShare = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    
    if (autoAnalysisInterval.current) {
      clearInterval(autoAnalysisInterval.current)
      autoAnalysisInterval.current = null
    }
    
    setIsAutoAnalyzing(false)
    setScreenState("stopped")
    
    toast({
      title: "Screen Sharing Stopped",
      description: `Session ended. Analyzed ${analysisCount} times.`
    })
    
    onClose()
  }, [stream, onClose, toast, analysisCount])

  const handleScreenShareEnd = useCallback(() => {
    stopScreenShare()
  }, [stopScreenShare])

  // Analyze current frame
  const analyzeCurrentFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !stream || isAnalyzing) return

    const video = videoRef.current
    const canvas = canvasRef.current
    
    // Ensure video is ready
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      toast({ title: 'Video Not Ready', description: 'Waiting for video stream...', variant: 'default' })
      return
    }

    setIsAnalyzing(true)
    setScreenState("analyzing")

    try {
      // Set canvas size to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const context = canvas.getContext("2d")
      if (!context) throw new Error("Could not get canvas context")
      
      // Draw current frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Convert to base64
      const imageData = canvas.toDataURL("image/jpeg", 0.8)
      const base64Data = imageData.split(",")[1]

      // Get session ID from sessionStorage
      const sessionId = sessionStorage.getItem('demo-session-id') || undefined

      // Call screenshot analysis API
      const response = await fetch('/api/analyze-screenshot', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-demo-session-id': sessionId || '',
          'x-user-id': 'anonymous_user'
        },
        body: JSON.stringify({ 
          imageData: base64Data, 
          description: 'Screen share analysis',
          context: 'Real-time screen sharing session'
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Analysis failed: ${response.statusText}`)
      }

      const data = await response.json()
      const analysis = data.analysis || "Analysis completed"

      const result = addAnalysis(analysis, 'screen')
      
      if (result.added) {
        setCurrentAnalysis(analysis)
        setAnalysisCount(prev => prev + 1)
        onAIAnalysis?.(analysis)

        toast({
          title: "Screenshot Analysis Complete",
          description: "Screen content has been analyzed for business insights."
        })
      } else {
        console.log(`Screen analysis skipped: ${result.reason}`)
        toast({
          title: "Analysis Skipped",
          description: result.reason || "Similar analysis already exists",
          variant: "default"
        })
      }
      
    } catch (error) {
      console.error("Screen analysis error:", error)
      const fallbackAnalysis = `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      
      const result = addAnalysis(fallbackAnalysis, 'screen_error')
      if (result.added) {
        setCurrentAnalysis(fallbackAnalysis)
      }
      
      toast({
        title: "Analysis Failed",
        description: "Could not analyze screen content. Please try again.",
        variant: "destructive"
      })
      
    } finally {
      setIsAnalyzing(false)
      setScreenState("sharing")
    }
  }, [stream, isAnalyzing, onAIAnalysis, addAnalysis, toast])

  // Handle auto-analysis toggle
  const handleAutoAnalysisToggle = useCallback((enabled: boolean) => {
    setIsAutoAnalyzing(enabled)
    
    if (enabled) {
      // Start auto-analysis every 10 seconds
      autoAnalysisInterval.current = setInterval(() => {
        analyzeCurrentFrame()
      }, 10000)
      
      toast({
        title: "Auto-Analysis Started",
        description: "Screen will be analyzed every 10 seconds automatically."
      })
    } else {
      // Stop auto-analysis
      if (autoAnalysisInterval.current) {
        clearInterval(autoAnalysisInterval.current)
        autoAnalysisInterval.current = null
      }
      
      toast({
        title: "Auto-Analysis Stopped",
        description: "Switched to manual analysis mode."
      })
    }
  }, [analyzeCurrentFrame, toast])

  // Initialize screen share when modal opens
  useEffect(() => {
    if (isOpen && !stream && screenState === "initializing") {
      startScreenShare()
    }
  }, [isOpen, stream, screenState, startScreenShare])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoAnalysisInterval.current) {
        clearInterval(autoAnalysisInterval.current)
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Clear history when modal closes
  useEffect(() => {
    if (!isOpen) {
      clearHistory()
      setAnalysisCount(0)
      setCurrentAnalysis("")
    }
  }, [isOpen, clearHistory])

  const downloadAnalysis = useCallback(() => {
    if (analysisHistory.length === 0) return
    
    const analysisText = analysisHistory.map((analysis, index) => 
      `Analysis ${index + 1}:\n${analysis}\n\n`
    ).join('')
    
    const blob = new Blob([analysisText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `screen_analysis_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: "Analysis Downloaded",
      description: "Screen analysis report has been saved."
    })
  }, [analysisHistory, toast])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full h-full flex flex-col p-6 relative max-w-7xl mx-auto"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <MonitorSpeaker className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Screen Analysis</h2>
                  <p className="text-sm text-white/70">
                    AI-powered real-time screen content analysis
                  </p>
                </div>
              </div>
              
              {/* Status badges */}
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "border-white/20",
                    screenState === "sharing" && "bg-green-500/20 text-green-200 border-green-500/30",
                    screenState === "analyzing" && "bg-blue-500/20 text-blue-200 border-blue-500/30",
                    screenState === "initializing" && "bg-amber-500/20 text-amber-200 border-amber-500/30",
                    screenState === "error" && "bg-red-500/20 text-red-200 border-red-500/30",
                    screenState === "stopped" && "bg-slate-500/20 text-slate-200 border-slate-500/30"
                  )}
                >
                  {screenState === "sharing" && "Sharing"}
                  {screenState === "analyzing" && "Analyzing"}
                  {screenState === "initializing" && "Starting"}
                  {screenState === "error" && "Error"}
                  {screenState === "stopped" && "Stopped"}
                </Badge>
                
                {isAutoAnalyzing && (
                  <Badge variant="outline" className="bg-purple-500/20 text-purple-200 border-purple-500/30">
                    Auto Mode
                  </Badge>
                )}
                
                <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                  {analysisCount} analyses
                </Badge>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnalysisPanel(!showAnalysisPanel)}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                {showAnalysisPanel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full bg-white/10 hover:bg-white/20 text-white border-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex gap-6 min-h-0">
            {/* Screen Display */}
            <div className="flex-1 flex flex-col">
              <Card className="flex-1 bg-black/50 backdrop-blur-sm border-white/20 overflow-hidden">
                <CardContent className="p-0 h-full relative">
                  {screenState === "initializing" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                      <div className="text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="p-6 rounded-full bg-blue-500/20 mb-4 mx-auto w-fit"
                        >
                          <Monitor className="w-12 h-12 text-blue-400" />
                        </motion.div>
                        <h3 className="text-xl font-bold text-white mb-2">Starting Screen Share</h3>
                        <p className="text-white/70">Please select a screen or window to share</p>
                      </div>
                    </div>
                  )}

                  {screenState === "error" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-900/20">
                      <div className="text-center">
                        <div className="p-6 rounded-full bg-red-500/20 mb-4 mx-auto w-fit">
                          <X className="w-12 h-12 text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Screen Share Failed</h3>
                        <p className="text-white/70">Please check permissions and try again</p>
                      </div>
                    </div>
                  )}

                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-contain bg-black" 
                  />
                  
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Overlay Controls */}
                  {stream && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center justify-between">
                        <Card className="bg-black/60 backdrop-blur-sm border-white/20">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                  className="w-2 h-2 rounded-full bg-red-500"
                                />
                                <span className="text-sm font-medium text-white">LIVE</span>
                              </div>
                              <Separator orientation="vertical" className="h-4 bg-white/20" />
                              <div className="flex items-center gap-2">
                                <Monitor className="w-4 h-4 text-white/70" />
                                <span className="text-sm text-white/70">
                                  {isAutoAnalyzing ? "Auto-analyzing" : "Manual mode"}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Quick Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={analyzeCurrentFrame}
                            disabled={isAnalyzing}
                            className="bg-black/60 hover:bg-black/80 text-white border-white/20"
                          >
                            {isAnalyzing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Brain className="w-4 h-4" />
                            )}
                          </Button>
                          
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={stopScreenShare}
                            className="bg-red-600/80 hover:bg-red-600"
                          >
                            <Square className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Bottom Controls */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={isAutoAnalyzing}
                      onCheckedChange={handleAutoAnalysisToggle}
                      disabled={!stream}
                    />
                    <span className="text-sm text-white/80">Auto-analyze (10s interval)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={analyzeCurrentFrame}
                    disabled={isAnalyzing || !stream}
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Brain className="w-4 h-4 mr-2" />
                    )}
                    Analyze Now
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadAnalysis}
                    disabled={analysisHistory.length === 0}
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>

            {/* Analysis Panel */}
            {showAnalysisPanel && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "400px", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="flex-shrink-0"
              >
                <Card className="h-full bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        Analysis Results
                      </div>
                      {analysisHistory.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearHistory}
                          className="text-white/70 hover:text-white hover:bg-white/10"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-1 overflow-hidden">
                    <div className="h-full flex flex-col">
                      {/* Current Analysis */}
                      {currentAnalysis && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400" />
                            Latest Analysis
                          </h4>
                          <Card className="bg-white/5 border-white/10">
                            <CardContent className="p-3">
                              <p className="text-sm text-white/90 leading-relaxed">
                                {currentAnalysis}
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      )}

                      {/* Analysis History */}
                      {analysisHistory.length > 1 && (
                        <div className="flex-1 min-h-0">
                          <h4 className="text-sm font-semibold text-white mb-2">History</h4>
                          <div className="space-y-2 h-full overflow-y-auto">
                            {analysisHistory.slice(1).reverse().map((analysis, index) => (
                              <Card key={index} className="bg-white/5 border-white/10">
                                <CardContent className="p-3">
                                  <p className="text-xs text-white/70 leading-relaxed">
                                    {analysis.length > 150 
                                      ? `${analysis.substring(0, 150)}...` 
                                      : analysis
                                    }
                                  </p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Status Info */}
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/70">Status</span>
                          <div className="flex items-center gap-2">
                            {isAnalyzing ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                                <span className="text-blue-400">Analyzing...</span>
                              </>
                            ) : (
                              <>
                                <div className="w-2 h-2 rounded-full bg-green-400" />
                                <span className="text-green-400">Ready</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ScreenShareModal
