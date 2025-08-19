"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Monitor, Brain, Loader2, X, Square, Chrome, Play, Pause, StopCircle, Users, Pen, MousePointer, Type, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

interface ScreensharePanelProps {
  mode?: 'card' | 'fullscreen'
  onAnalysis?: (result: string) => void
  onClose?: () => void
  onCancel?: () => void
  onStream?: (stream: MediaStream) => void
  onLog?: (log: { level: string; message: string; timestamp: Date }) => void
}

type ScreenShareState = "stopped" | "initializing" | "sharing" | "error"

interface AnalysisResult {
  id: string
  text: string
  timestamp: number
}

export function ScreensharePanel({
  mode = 'card',
  onAnalysis,
  onClose,
  onCancel,
  onStream,
  onLog
}: ScreensharePanelProps) {
  const { toast } = useToast()
  const [screenState, setScreenState] = useState<ScreenShareState>("stopped")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isAutoAnalyzing, setIsAutoAnalyzing] = useState(false)
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([])
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [shareType, setShareType] = useState<"screen" | "window" | "tab">("screen")
  const [isRecording, setIsRecording] = useState(false)
  const [annotationTool, setAnnotationTool] = useState<"pointer" | "pen" | "text" | "circle">("pointer")
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const autoAnalysisIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sessionIdRef = useRef<string>(`screen-session-${Date.now()}`)
  const videoReadyRef = useRef<boolean>(false)

  const shareOptions = [
    { id: "screen", icon: Monitor, label: "Entire Screen", description: "Share your entire screen with AI analysis" },
    { id: "window", icon: Square, label: "Application Window", description: "Share a specific window" },
    { id: "tab", icon: Chrome, label: "Browser Tab", description: "Share a browser tab" },
  ]

  const annotationTools = [
    { id: "pointer", icon: MousePointer, label: "Pointer" },
    { id: "pen", icon: Pen, label: "Draw" },
    { id: "text", icon: Type, label: "Text" },
    { id: "circle", icon: Circle, label: "Highlight" },
  ]

  const viewers = [
    { id: 1, name: "Alex Chen", status: "viewing", joinTime: "2 min ago" },
    { id: 2, name: "Sarah Kim", status: "viewing", joinTime: "5 min ago" },
    { id: 3, name: "Mike Johnson", status: "viewing", joinTime: "1 min ago" },
  ]

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
  }, [onAnalysis, onLog])

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

  const startScreenShare = useCallback(async (type: "screen" | "window" | "tab" = "screen") => {
    try {
      setShareType(type)
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

  return (
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
                {shareOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <Button
                      key={option.id}
                      variant="outline"
                      className="w-full h-auto p-6 flex items-start gap-4 hover:bg-emerald-50 hover:border-emerald-200 bg-transparent"
                      onClick={() => startScreenShare(option.id as any)}
                      disabled={screenState === "initializing"}
                    >
                      <Icon className="w-8 h-8 text-emerald-600 mt-1" />
                      <div className="text-left">
                        <h3 className="font-semibold text-slate-900 mb-1">
                          {screenState === "initializing" ? "Initializing..." : option.label}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {screenState === "initializing" 
                            ? "Setting up screen sharing..." 
                            : option.description}
                        </p>
                      </div>
                    </Button>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="h-full bg-slate-900 rounded-lg overflow-hidden relative">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
            <canvas ref={canvasRef} className="hidden" />

            {/* Annotation Overlay */}
            <div className="absolute inset-0 pointer-events-none">{/* Simulated annotations would appear here */}</div>

            {/* Controls Overlay */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              <div className="flex gap-2">
                <Badge variant="default" className="bg-red-600">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                  Live - {shareType === "screen" ? "Entire Screen" : shareType === "window" ? "Application Window" : "Browser Tab"}
                </Badge>
                {isRecording && <Badge variant="destructive">Recording</Badge>}
              </div>

              <div className="flex gap-2">
                {annotationTools.map((tool) => {
                  const Icon = tool.icon
                  return (
                    <Button
                      key={tool.id}
                      variant={annotationTool === tool.id ? "default" : "secondary"}
                      size="sm"
                      onClick={() => setAnnotationTool(tool.id as any)}
                      className="bg-black/50 backdrop-blur-sm border-white/20"
                    >
                      <Icon className="w-4 h-4" />
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Analysis Button */}
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
                  variant={isRecording ? "destructive" : "secondary"}
                  size="sm"
                  onClick={() => setIsRecording(!isRecording)}
                  className="rounded-full"
                >
                  {isRecording ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={cleanup}
                  className="rounded-full"
                >
                  <StopCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-emerald-600" />
              Viewers ({viewers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {viewers.map((viewer) => (
              <div key={viewer.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-emerald-700">{viewer.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{viewer.name}</p>
                    <p className="text-xs text-slate-500">Joined {viewer.joinTime}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                  {viewer.status}
                </Badge>
              </div>
            ))}
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
                variant={isRecording ? "destructive" : "outline"}
                className="w-full"
                onClick={() => setIsRecording(!isRecording)}
              >
                {isRecording ? "Stop Recording" : "Start Recording"}
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
}
