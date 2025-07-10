"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { X, Camera, Brain, Square, Play, Pause, Download, RotateCcw, CameraIcon, Eye, EyeOff, Loader2, Video, VideoOff } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useAnalysisHistory } from "@/hooks/use-analysis-history"
import { useToast } from "@/components/ui/use-toast"

interface WebcamModalProps {
  isOpen: boolean
  onClose: () => void
  onCapture?: (imageData: string) => void
  onAIAnalysis?: (analysis: string) => void
  theme?: "light" | "dark"
}

type WebcamState = "initializing" | "active" | "analyzing" | "error" | "stopped"

export const WebcamModal: React.FC<WebcamModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  onAIAnalysis,
  theme = "dark",
}) => {
  const { toast } = useToast()
  const { analysisHistory, addAnalysis, clearHistory } = useAnalysisHistory()
  
  const [webcamState, setWebcamState] = useState<WebcamState>("initializing")
  const [isAutoAnalyzing, setIsAutoAnalyzing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [currentAnalysis, setCurrentAnalysis] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisCount, setAnalysisCount] = useState(0)
  const [captureCount, setCaptureCount] = useState(0)
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(true)
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("")
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const autoAnalysisInterval = useRef<NodeJS.Timeout | null>(null)

  // Get available camera devices
  const getAvailableDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      setAvailableDevices(videoDevices)
      
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId)
      }
    } catch (error) {
      console.error("Failed to get devices:", error)
    }
  }, [selectedDeviceId])

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setWebcamState("initializing")
      
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
          ...(selectedDeviceId && { deviceId: selectedDeviceId })
        },
        audio: false,
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      
      setStream(mediaStream)
      setWebcamState("active")

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }

      toast({
        title: "Camera Started",
        description: "Webcam is now active and ready for analysis."
      })
      
    } catch (error) {
      console.error("Camera access failed:", error)
      setWebcamState("error")
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      toast({
        title: "Camera Access Failed",
        description: errorMessage.includes("Permission denied") 
          ? "Camera permission denied. Please allow camera access."
          : "Failed to start camera. Please try again.",
        variant: "destructive"
      })
    }
  }, [selectedDeviceId, toast])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    
    if (autoAnalysisInterval.current) {
      clearInterval(autoAnalysisInterval.current)
      autoAnalysisInterval.current = null
    }
    
    setIsAutoAnalyzing(false)
    setWebcamState("stopped")
    
    toast({
      title: "Camera Stopped",
      description: `Session ended. ${captureCount} photos captured, ${analysisCount} analyses performed.`
    })
    
    onClose()
  }, [stream, onClose, toast, captureCount, analysisCount])

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || webcamState !== "active") return

    const video = videoRef.current
    const canvas = canvasRef.current
    
    if (video.videoWidth === 0 || video.videoHeight === 0) return

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const context = canvas.getContext("2d")
    if (!context) return
    
    // Draw current frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Convert to base64
    const imageData = canvas.toDataURL("image/jpeg", 0.9)
    
    // Trigger onCapture callback
    onCapture?.(imageData)
    setCaptureCount(prev => prev + 1)
    
    // Flash effect
    const flashElement = document.createElement('div')
    flashElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: white;
      opacity: 0.7;
      pointer-events: none;
      z-index: 9999;
    `
    document.body.appendChild(flashElement)
    
    setTimeout(() => {
      document.body.removeChild(flashElement)
    }, 150)
    
    toast({
      title: "Photo Captured",
      description: "Photo has been captured and sent to chat."
    })
  }, [webcamState, onCapture, toast])

  // Analyze current frame
  const analyzeCurrentFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || webcamState !== "active" || isAnalyzing) return

    const video = videoRef.current
    const canvas = canvasRef.current
    
    if (video.videoWidth === 0 || video.videoHeight === 0) return

    setIsAnalyzing(true)
    setWebcamState("analyzing")

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

      // Call analysis API
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: base64Data, 
          type: 'webcam',
          context: 'Webcam feed analysis'
        })
      })

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`)
      }

      const data = await response.json()
      const analysis = data.analysis || data.content || "Analysis completed"

      const result = addAnalysis(analysis, 'webcam')
      
      if (result.added) {
        setCurrentAnalysis(analysis)
        setAnalysisCount(prev => prev + 1)
        onAIAnalysis?.(analysis)

        if (!isAutoAnalyzing) {
          toast({
            title: "Analysis Complete",
            description: "Webcam image has been analyzed successfully."
          })
        }
      } else {
        console.log(`Webcam analysis skipped: ${result.reason}`)
        if (!isAutoAnalyzing) {
          toast({
            title: "Analysis Skipped",
            description: result.reason || "Similar analysis already exists",
            variant: "default"
          })
        }
      }
      
    } catch (error) {
      console.error("AI analysis error:", error)
      const fallbackAnalysis = `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      
      const result = addAnalysis(fallbackAnalysis, 'webcam_error')
      if (result.added) {
        setCurrentAnalysis(fallbackAnalysis)
      }
      
      toast({
        title: "Analysis Failed",
        description: "Could not analyze webcam image. Please try again.",
        variant: "destructive"
      })
      
    } finally {
      setIsAnalyzing(false)
      setWebcamState("active")
    }
  }, [webcamState, isAnalyzing, onAIAnalysis, addAnalysis, toast, isAutoAnalyzing])

  // Handle auto-analysis toggle
  const handleAutoAnalysisToggle = useCallback((enabled: boolean) => {
    setIsAutoAnalyzing(enabled)
    
    if (enabled) {
      // Start auto-analysis every 8 seconds
      autoAnalysisInterval.current = setInterval(() => {
        analyzeCurrentFrame()
      }, 8000)
      
      toast({
        title: "Auto-Analysis Started",
        description: "Webcam will be analyzed every 8 seconds automatically."
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

  // Switch camera
  const switchCamera = useCallback(async () => {
    if (availableDevices.length <= 1) return
    
    const currentIndex = availableDevices.findIndex(device => device.deviceId === selectedDeviceId)
    const nextIndex = (currentIndex + 1) % availableDevices.length
    const nextDevice = availableDevices[nextIndex]
    
    setSelectedDeviceId(nextDevice.deviceId)
    
    // Stop current stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    
    // Start with new device
    await startCamera()
  }, [availableDevices, selectedDeviceId, stream, startCamera])

  // Initialize camera and devices when modal opens
  useEffect(() => {
    if (isOpen) {
      getAvailableDevices().then(() => {
        if (webcamState === "initializing") {
          startCamera()
        }
      })
    }
  }, [isOpen, getAvailableDevices, startCamera, webcamState])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoAnalysisInterval.current) {
        clearInterval(autoAnalysisInterval.current)
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  // Clear history when modal closes
  useEffect(() => {
    if (!isOpen) {
      clearHistory()
      setAnalysisCount(0)
      setCaptureCount(0)
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
    a.download = `webcam_analysis_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: "Analysis Downloaded",
      description: "Webcam analysis report has been saved."
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
                <div className="p-2 rounded-lg bg-green-500/20">
                  <CameraIcon className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Webcam Analysis</h2>
                  <p className="text-sm text-white/70">
                    AI-powered real-time webcam feed analysis
                  </p>
                </div>
              </div>
              
              {/* Status badges */}
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "border-white/20",
                    webcamState === "active" && "bg-green-500/20 text-green-200 border-green-500/30",
                    webcamState === "analyzing" && "bg-blue-500/20 text-blue-200 border-blue-500/30",
                    webcamState === "initializing" && "bg-amber-500/20 text-amber-200 border-amber-500/30",
                    webcamState === "error" && "bg-red-500/20 text-red-200 border-red-500/30",
                    webcamState === "stopped" && "bg-slate-500/20 text-slate-200 border-slate-500/30"
                  )}
                >
                  {webcamState === "active" && "Live"}
                  {webcamState === "analyzing" && "Analyzing"}
                  {webcamState === "initializing" && "Starting"}
                  {webcamState === "error" && "Error"}
                  {webcamState === "stopped" && "Stopped"}
                </Badge>
                
                {isAutoAnalyzing && (
                  <Badge variant="outline" className="bg-purple-500/20 text-purple-200 border-purple-500/30">
                    Auto Mode
                  </Badge>
                )}
                
                <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                  {analysisCount} analyses
                </Badge>
                
                <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                  {captureCount} photos
                </Badge>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-3">
              {availableDevices.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={switchCamera}
                  disabled={webcamState !== "active"}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Switch Camera
                </Button>
              )}
              
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
            {/* Camera Display */}
            <div className="flex-1 flex flex-col">
              <Card className="flex-1 bg-black/50 backdrop-blur-sm border-white/20 overflow-hidden">
                <CardContent className="p-0 h-full relative">
                  {webcamState === "initializing" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                      <div className="text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="p-6 rounded-full bg-green-500/20 mb-4 mx-auto w-fit"
                        >
                          <Video className="w-12 h-12 text-green-400" />
                        </motion.div>
                        <h3 className="text-xl font-bold text-white mb-2">Starting Camera</h3>
                        <p className="text-white/70">Please allow camera access when prompted</p>
                      </div>
                    </div>
                  )}

                  {webcamState === "error" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-900/20">
                      <div className="text-center">
                        <div className="p-6 rounded-full bg-red-500/20 mb-4 mx-auto w-fit">
                          <VideoOff className="w-12 h-12 text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Camera Access Failed</h3>
                        <p className="text-white/70">Please check permissions and try again</p>
                        <Button
                          variant="outline"
                          onClick={startCamera}
                          className="mt-4 bg-white/10 hover:bg-white/20 text-white border-white/20"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Retry
                        </Button>
                      </div>
                    </div>
                  )}

                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover" 
                  />
                  
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Overlay Controls */}
                  {webcamState === "active" && (
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
                                <Eye className="w-4 h-4 text-white/70" />
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
                            onClick={capturePhoto}
                            className="bg-black/60 hover:bg-black/80 text-white border-white/20"
                          >
                            <Camera className="w-4 h-4" />
                          </Button>
                          
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
                            onClick={stopCamera}
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
                      disabled={webcamState !== "active"}
                    />
                    <span className="text-sm text-white/80">Auto-analyze (8s interval)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={capturePhoto}
                    disabled={webcamState !== "active"}
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Capture
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={analyzeCurrentFrame}
                    disabled={isAnalyzing || webcamState !== "active"}
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

export default WebcamModal
