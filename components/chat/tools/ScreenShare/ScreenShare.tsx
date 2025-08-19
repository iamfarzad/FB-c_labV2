"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Monitor, Brain, Loader2, X } from "@/lib/icon-mapping"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ToolCardWrapper } from "@/components/chat/ToolCardWrapper"
import type { ScreenShareProps, ScreenShareState } from "./ScreenShare.types"

interface AnalysisResult {
  id: string
  text: string
  timestamp: number
}

export function ScreenShare({
  mode = 'card',
  onAnalysis,
  onClose,
  onCancel,
  onStream,
  onLog
}: ScreenShareProps) {
  const { toast } = useToast()
  const [screenState, setScreenState] = useState<ScreenShareState>("stopped")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isAutoAnalyzing, setIsAutoAnalyzing] = useState(false)
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([])
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const autoAnalysisIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sessionIdRef = useRef<string>(`screen-session-${Date.now()}`)
  const videoReadyRef = useRef<boolean>(false)

  async function waitForScreenReady(video: HTMLVideoElement): Promise<void> {
    if (!video) return
    if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
      videoReadyRef.current = true
      return
    }
    await new Promise<void>((resolve) => {
      const onMeta = () => {
        void video.play().catch(() => {})
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          videoReadyRef.current = true
          video.removeEventListener('loadedmetadata', onMeta)
          resolve()
        }
      }
      video.addEventListener('loadedmetadata', onMeta)
      setTimeout(onMeta, 500)
    })
  }

  const sendScreenFrame = useCallback(async (imageData: string) => {
    try {
      setIsAnalyzing(true)
      onLog?.({ level: 'log', message: 'Analyzing screen frame…', timestamp: new Date() })
      const sid = typeof window !== 'undefined' ? (localStorage.getItem('intelligence-session-id') || '') : ''
      const response = await fetch('/api/tools/screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(sid ? { 'x-intelligence-session-id': sid } : {}) },
        body: JSON.stringify({
          image: imageData,
          type: 'screen' // Specify this is a screen capture for analysis
        })
      })
      if (!response.ok) throw new Error('Failed to analyze screen frame')
      const result = await response.json()
      const analysisText = result?.output?.analysis || result?.analysis || 'No analysis'
      onLog?.({ level: 'log', message: `Screen analysis: ${analysisText}`, timestamp: new Date() })
      const analysis: AnalysisResult = {
        id: Date.now().toString(),
        text: analysisText,
        timestamp: Date.now(),
      }
      setAnalysisHistory(prev => [analysis, ...prev])
      onAnalysis?.(analysis.text)
    } catch (e) {
      setError((e as Error).message)
      onLog?.({ level: 'error', message: `Screen analysis error: ${(e as Error).message}`, timestamp: new Date() })
    } finally {
      setIsAnalyzing(false)
    }
  }, [onAnalysis])

  // Auto-analysis interval with throttling and cost awareness
  useEffect(() => {
    if (isAutoAnalyzing && screenState === "sharing" && videoReadyRef.current) {
      let analysisCount = 0;
      const maxAnalysisPerSession = 20; // Limit to prevent excessive costs
      
      autoAnalysisIntervalRef.current = setInterval(async () => {
        // Check if we've exceeded the analysis limit
        if (analysisCount >= maxAnalysisPerSession) {
          console.warn('🚨 Auto-analysis limit reached to prevent excessive API costs');
          setIsAutoAnalyzing(false);
          return;
        }

        if (videoRef.current && canvasRef.current && !isAnalyzing && videoRef.current.readyState >= 2 && videoRef.current.videoWidth > 0) {
          const canvas = canvasRef.current
          const video = videoRef.current
          
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(video, 0, 0)
            const imageData = canvas.toDataURL('image/jpeg', 0.8)
            analysisCount++;
            console.info(`📊 Auto-analysis ${analysisCount}/${maxAnalysisPerSession}`);
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
  }, [isAutoAnalyzing, screenState, sendScreenFrame, isAnalyzing])

  const cleanup = useCallback(() => {
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
  }, [stream])

  const startScreenShare = useCallback(async () => {
    try {
      setScreenState("initializing")
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      })
      setStream(mediaStream)
      setScreenState("sharing")
      if(videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await waitForScreenReady(videoRef.current)
      }
      onStream?.(mediaStream)
      mediaStream.getVideoTracks()[0].addEventListener('ended', () => {
        cleanup()
      })
      toast({ title: "Screen Sharing Started" })
    } catch (error) {
      setScreenState("error")
      setError('Screen share failed')
      toast({ title: "Screen Share Failed", variant: "destructive" })
    }
  }, [onStream, toast, cleanup])

  const captureScreenshot = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current
    const video = videoRef.current
    if (video.videoWidth === 0 || video.videoHeight === 0 || video.readyState < 2) {
      setError('Screen stream is warming up… try again in a moment')
      return
    }
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0)
      const imageData = canvas.toDataURL('image/jpeg', 0.8)
      sendScreenFrame(imageData)
    }
  }, [sendScreenFrame])

  const ScreenShareUI = () => (
    <div className="h-full flex">
      {/* Main Screen Share Area */}
      <div className="flex-1 p-4">
        {screenState !== "sharing" ? (
          <div className="h-full flex items-center justify-center">
            <Card className="w-full max-w-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-slate-900 mb-2">Start Screen Sharing</CardTitle>
                <p className="text-slate-600">Share your screen with AI-powered analysis</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full h-auto p-6 flex items-start gap-4 hover:bg-emerald-50 hover:border-emerald-200 bg-transparent"
                  onClick={startScreenShare}
                  disabled={screenState === "initializing"}
                >
                  <Monitor className="w-8 h-8 text-emerald-600 mt-1" />
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-900 mb-1">
                      {screenState === "initializing" ? "Initializing..." : "Share Screen"}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {screenState === "initializing" 
                        ? "Setting up screen sharing..." 
                        : "Start sharing your screen for real-time analysis"}
                    </p>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="h-full bg-slate-900 rounded-lg overflow-hidden relative">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Status Badge */}
            <div className="absolute top-4 left-4">
              <Badge variant={screenState === "sharing" ? "default" : "destructive"} className="bg-red-600">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                {screenState === "sharing" ? "Live" : screenState}
              </Badge>
            </div>

            {/* Analysis Button */}
            {screenState === 'sharing' && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                  <Button
                    onClick={captureScreenshot}
                    disabled={isAnalyzing}
                    variant="secondary"
                    size="sm"
                    className="rounded-full"
                  >
                    {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={cleanup}
                    className="rounded-full"
                  >
                    Stop Sharing
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-white border-l border-slate-200 p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="w-5 h-5 text-emerald-600" />
              AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Switch 
                checked={isAutoAnalyzing} 
                onCheckedChange={setIsAutoAnalyzing} 
                disabled={screenState !== "sharing"} 
              />
              <span className="text-sm">Auto Analysis (15s intervals)</span>
            </div>
            {isAnalyzing && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing screen content...
              </div>
            )}
          </CardContent>
        </Card>

        {screenState === "sharing" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={captureScreenshot}
                disabled={isAnalyzing}
                className="w-full"
                variant="outline"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Now"}
              </Button>
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={cleanup}
              >
                Stop Sharing
              </Button>
            </CardContent>
          </Card>
        )}

        {analysisHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Analysis History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-60 overflow-y-auto">
              {analysisHistory.map((analysis) => (
                <div key={analysis.id} className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-700">{analysis.text}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(analysis.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Open Canvas
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Start Video Call
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Launch Workshop
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <p className="text-red-600 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )

  // Modal variant
  if (mode === 'modal') {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl rounded-3xl border border-border/20 shadow-xl">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <DialogTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Screen Share
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <ScreenShareUI />
        </DialogContent>
      </Dialog>
    )
  }

  if (mode === 'canvas') {
    return (
      <div className="flex h-full w-full flex-col overflow-hidden">
        <div className="flex h-10 items-center justify-between border-b px-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span>Screen Share</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={startScreenShare} disabled={screenState === 'sharing'}>Start</Button>
            <Button size="sm" variant="ghost" onClick={captureScreenshot} disabled={screenState !== 'sharing' || isAnalyzing}>Capture</Button>
            <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col p-2">
          <ScreenShareUI />
        </div>
      </div>
    )
  }

  // Card variant
  return (
    <ToolCardWrapper title="Screen Share" description="Real-time screen sharing with AI analysis" icon={<Monitor className="w-4 h-4" />}>
      <ScreenShareUI />
    </ToolCardWrapper>
  )
}
