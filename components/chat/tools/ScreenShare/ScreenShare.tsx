"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Monitor, Square, Play, Pause, Download, Trash2, X, Eye, EyeOff, Brain, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { ToolCardWrapper } from "@/components/chat/ToolCardWrapper"
import type { ScreenShareProps, ScreenShareState } from "./ScreenShare.types"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnalysisResult {
  id: string
  text: string
  timestamp: number
  imageData?: string
}

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
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([])
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(true)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [analysisCount, setAnalysisCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const autoAnalysisIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sessionIdRef = useRef<string>(`screen-share-session-${Date.now()}`)

  // Start real-time analysis session
  const startAnalysisSession = useCallback(async () => {
    try {
      const response = await fetch('/api/gemini-live-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start',
          sessionId: sessionIdRef.current,
          enableAudio: false,
          analysisMode: 'screen'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to start analysis session')
      }

      console.log('🖥️ Screen analysis session started')
    } catch (error) {
      console.error('❌ Failed to start analysis session:', error)
      setError('Failed to start analysis session')
    }
  }, [])

  // Send screen frame for analysis
  const sendScreenFrame = useCallback(async (imageData: string) => {
    try {
      setIsAnalyzing(true)
      
      const response = await fetch('/api/gemini-live-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData,
          sessionId: sessionIdRef.current,
          type: 'screen_frame',
          analysisMode: 'screen'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze screen frame')
      }

      const result = await response.json()
      
      const analysis: AnalysisResult = {
        id: Date.now().toString(),
        text: result.response || result.text || 'No analysis available',
        timestamp: Date.now(),
        imageData
      }
      
      setAnalysisHistory(prev => [...prev, analysis])
      setCurrentAnalysis(analysis.text)
      setAnalysisCount(prev => prev + 1)
      
      onAnalysis?.(analysis.text)
      
    } catch (error) {
      console.error('❌ Failed to analyze screen frame:', error)
      setError('Failed to analyze screen frame')
    } finally {
      setIsAnalyzing(false)
    }
  }, [onAnalysis])

  // Auto-analysis interval with throttling and cost awareness
  useEffect(() => {
    if (isAutoAnalyzing && screenState === "sharing") {
      let analysisCount = 0;
      const maxAnalysisPerSession = 20; // Limit to prevent excessive costs
      
      autoAnalysisIntervalRef.current = setInterval(async () => {
        // Check if we've exceeded the analysis limit
        if (analysisCount >= maxAnalysisPerSession) {
          console.warn('🚨 Auto-analysis limit reached to prevent excessive API costs');
          setIsAutoAnalyzing(false);
          return;
        }

        if (videoRef.current && canvasRef.current && !isAnalyzing) {
          const canvas = canvasRef.current
          const video = videoRef.current
          
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(video, 0, 0)
            const imageData = canvas.toDataURL('image/jpeg', 0.8)
            analysisCount++;
            console.log(`📊 Auto-analysis ${analysisCount}/${maxAnalysisPerSession}`);
            await sendScreenFrame(imageData)
          }
        }
      }, 15000) // Increased to 15 seconds to reduce API calls
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
  }, [isAutoAnalyzing, screenState, sendScreenFrame])

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
      
      // Start analysis session
      await startAnalysisSession()
      
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
      setError('Screen share failed')
      toast({
        title: "Screen Share Failed",
        description: "Could not access your screen. Please check permissions and try again.",
        variant: "destructive"
      })
    }
  }

  const captureScreenshot = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null

    try {
      const canvas = canvasRef.current
      const video = videoRef.current

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        return canvas.toDataURL('image/jpeg', 0.8)
      }
    } catch (error) {
      console.error('Screenshot capture failed:', error)
      setError('Screenshot capture failed')
    }
    return null
  }

  const handleAnalyze = async () => {
    const screenshot = captureScreenshot()
    if (screenshot) {
      await sendScreenFrame(screenshot)
    }
  }

  const ScreenShareUI = () => (
    <div className="flex flex-col gap-4">
      {/* Status and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            screenState === "sharing" ? "bg-green-500" : "bg-gray-400"
          )} />
          <span className="text-sm">
            {screenState === "sharing" ? "Screen Sharing" : "Screen Stopped"}
          </span>
          {isAnalyzing && (
            <Badge variant="secondary">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Analyzing
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Switch
            checked={isAutoAnalyzing}
            onCheckedChange={setIsAutoAnalyzing}
            disabled={screenState !== "sharing"}
          />
          <span className="text-xs">Auto Analysis</span>
        </div>
      </div>

      {/* Screen Display */}
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full rounded-lg border"
        />
        
        {/* Analysis Button Overlay */}
        <div className="absolute bottom-4 right-4">
          <Button
            onClick={handleAnalyze}
            disabled={screenState !== "sharing" || isAnalyzing}
            className="w-12 h-12 rounded-full bg-white/90 hover:bg-white"
          >
            {isAnalyzing ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
            ) : (
              <Brain className="w-6 h-6 text-gray-600" />
            )}
          </Button>
        </div>
        
        {/* Analysis Panel Toggle */}
        <Button
          onClick={() => setShowAnalysisPanel(!showAnalysisPanel)}
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70"
        >
          {showAnalysisPanel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
      </div>

      {/* Analysis Panel */}
      <AnimatePresence>
        {showAnalysisPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Current Analysis */}
            {currentAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Live Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{currentAnalysis}</p>
                </CardContent>
              </Card>
            )}

            {/* Analysis History */}
            {analysisHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    Analysis History ({analysisCount})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-40 overflow-y-auto">
                  {analysisHistory.slice(-3).map((analysis) => (
                    <div
                      key={analysis.id}
                      className="p-3 rounded-lg bg-gray-50 border-l-4 border-blue-500"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">AI</Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(analysis.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{analysis.text}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )

  if (mode === 'modal') {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Screen Share
            </DialogTitle>
          </DialogHeader>
          <ScreenShareUI />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <ToolCardWrapper
      title="Screen Share"
      description="Real-time screen sharing with AI analysis"
      icon={Monitor}
    >
      <ScreenShareUI />
    </ToolCardWrapper>
  )
}
