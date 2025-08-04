"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Monitor, Brain, Loader2 } from "@/lib/icon-mapping"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { ToolCardWrapper } from "@/components/chat/ToolCardWrapper"
import type { ScreenShareProps, ScreenShareState } from "./ScreenShare.types"

interface AnalysisResult {
  id: string
  text: string
  timestamp: number
}

export function ScreenShare({
  onAnalysis,
  onStream
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

  const sendScreenFrame = useCallback(async (imageData: string) => {
    try {
      setIsAnalyzing(true)
      const response = await fetch('/api/gemini-live-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData,
          sessionId: sessionIdRef.current,
          type: 'screen_frame',
          analysisMode: 'screen'
        })
      })
      if (!response.ok) throw new Error('Failed to analyze screen frame')
      const result = await response.json()
      const analysis: AnalysisResult = {
        id: Date.now().toString(),
        text: result.response || result.text || 'No analysis available',
        timestamp: Date.now(),
      }
      setAnalysisHistory(prev => [analysis, ...prev])
      onAnalysis?.(analysis.text)
    } catch (e) {
      setError((e as Error).message)
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
      if(videoRef.current) videoRef.current.srcObject = mediaStream
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
    <ToolCardWrapper title="Screen Share" description="Real-time screen sharing with AI analysis" icon={<Monitor className="w-4 h-4" />}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <Badge variant={screenState === "sharing" ? "default" : "destructive"}>{screenState}</Badge>
            <div className="flex items-center gap-2">
                <Switch 
                  checked={isAutoAnalyzing} 
                  onCheckedChange={setIsAutoAnalyzing} 
                  disabled={screenState !== "sharing"} 
                />
                <span className="text-xs">Auto Analysis</span>
            </div>
        </div>
        <div className="relative">
          <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg border bg-black" />
          <canvas ref={canvasRef} className="hidden" />
          {screenState === 'sharing' ? (
            <Button 
              onClick={captureScreenshot} 
              disabled={isAnalyzing} 
              className="absolute bottom-4 right-4 w-12 h-12 rounded-full"
            >
              {isAnalyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Brain className="w-6 h-6" />}
            </Button>
          ) : (
            <Button onClick={startScreenShare} className="absolute bottom-4 right-4">
              Start Sharing
            </Button>
          )}
        </div>
        {analysisHistory.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Analysis History</CardTitle></CardHeader>
            <CardContent className="space-y-2 max-h-40 overflow-y-auto">
              {analysisHistory.map((a) => (
                <p key={a.id} className="text-sm border-b pb-1">{a.text}</p>
              ))}
            </CardContent>
          </Card>
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </ToolCardWrapper>
  )
}
