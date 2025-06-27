"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { X, Loader, Monitor, Brain, Square, Play, Pause, Wifi, WifiOff } from "lucide-react"
import { GeminiLiveClient } from "@/lib/ai/gemini-live-client"

interface ScreenShareModalProps {
  isScreenSharing: boolean
  onStopScreenShare: () => void
  onAIAnalysis?: (analysis: string) => void
  theme: "light" | "dark"
}

export const ScreenShareModal: React.FC<ScreenShareModalProps> = ({
  isScreenSharing,
  onStopScreenShare,
  onAIAnalysis,
  theme,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastAnalysis, setLastAnalysis] = useState<string>("")
  const [analysisHistory, setAnalysisHistory] = useState<string[]>([])
  const [isAutoAnalyzing, setIsAutoAnalyzing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isLiveMode, setIsLiveMode] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const liveClientRef = useRef<GeminiLiveClient | null>(null)
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize Gemini Live client for screen streaming
  const initializeLiveClient = useCallback(async () => {
    try {
      setConnectionStatus('connecting')
      
      // Get WebSocket info from API
      const response = await fetch('/api/gemini-live')
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get WebSocket info')
      }
      
      // Create and configure client for screen analysis
      const client = new GeminiLiveClient(data.apiKey || '', {
        model: data.model || 'gemini-2.0-flash-exp',
        systemInstruction: `You are an AI assistant analyzing screen share content in real-time. 
        Describe what applications are open, what the user is working on, and provide insights about their workflow.
        Note any important content, code, documents, or activities visible on screen.
        Be informative and helpful in understanding the user's work context.`,
        responseModalities: ['TEXT'] // Text-only responses for screen analysis
      })
      
      // Set up event handlers
      client.onConnectionChange = (connected: boolean) => {
        setConnectionStatus(connected ? 'connected' : 'disconnected')
        console.log('Live screen connection:', connected)
      }
      
      client.onError = (error: Error) => {
        console.error('Live screen error:', error)
        setConnectionStatus('error')
      }
      
      client.onTextResponse = (text: string) => {
        // Handle AI analysis response
        if (text) {
          setLastAnalysis(text)
          setAnalysisHistory(prev => [text, ...prev.slice(0, 4)])
          onAIAnalysis?.(text)
          setIsAnalyzing(false)
        }
      }
      
      // Connect to WebSocket
      await client.connect()
      liveClientRef.current = client
      
    } catch (error) {
      console.error('Failed to initialize live screen:', error)
      setConnectionStatus('error')
    }
  }, [onAIAnalysis])

  // Send screen frame to Live API
  const sendFrameToLiveAPI = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !liveClientRef.current?.connected || !stream) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    setIsAnalyzing(true)

    // Set canvas size to match video
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720

    // Draw current frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to blob with higher quality for screen content
    canvas.toBlob((blob) => {
      if (blob && liveClientRef.current?.connected) {
        // Send frame as realtime input
        liveClientRef.current.sendRealtimeInput([blob])
      }
    }, 'image/jpeg', 0.9)
  }, [stream])

  // Start live streaming mode
  const startLiveMode = useCallback(async () => {
    setIsLiveMode(true)
    await initializeLiveClient()
    
    // Start sending frames every 2 seconds (screen content changes less frequently)
    frameIntervalRef.current = setInterval(sendFrameToLiveAPI, 2000)
  }, [initializeLiveClient, sendFrameToLiveAPI])

  // Stop live streaming mode
  const stopLiveMode = useCallback(() => {
    setIsLiveMode(false)
    
    // Stop frame interval
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current)
      frameIntervalRef.current = null
    }
    
    // Disconnect WebSocket
    if (liveClientRef.current) {
      liveClientRef.current.disconnect()
      liveClientRef.current = null
    }
    
    setConnectionStatus('disconnected')
  }, [])

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: true
      })

      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }

      // Listen for screen share end
      mediaStream.getVideoTracks()[0].addEventListener('ended', () => {
        onStopScreenShare()
      })

    } catch (error) {
      console.error('Screen share failed:', error)
    }
  }, [onStopScreenShare])

  // Stop screen sharing
  const stopScreenShare = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsAutoAnalyzing(false)
    stopLiveMode()
    onStopScreenShare()
  }, [stream, onStopScreenShare, stopLiveMode])

  // Analyze current screen frame (REST API fallback)
  const analyzeCurrentFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !stream) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw current frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    const base64Data = imageData.split(',')[1]

    setIsAnalyzing(true)

    try {
      // Send frame to AI for analysis
      const response = await fetch('/api/gemini?action=analyzeScreenShare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: base64Data,
          prompt: 'Analyze this screen share. Describe what applications are open, what the user is working on, and provide insights about their workflow or any notable content visible.'
        })
      })

      const result = await response.json()
      
      if (result.success) {
        const analysis = result.data.text
        setLastAnalysis(analysis)
        setAnalysisHistory(prev => [analysis, ...prev.slice(0, 4)]) // Keep last 5 analyses
        onAIAnalysis?.(analysis)
      }
    } catch (error) {
      console.error('Screen analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [stream, onAIAnalysis])

  // Auto-analyze every 5 seconds when enabled (REST API mode)
  useEffect(() => {
    if (!isAutoAnalyzing || !stream || isLiveMode) return

    const interval = setInterval(analyzeCurrentFrame, 5000)
    return () => clearInterval(interval)
  }, [isAutoAnalyzing, stream, isLiveMode, analyzeCurrentFrame])

  // Start screen share on mount if not already sharing
  useEffect(() => {
    if (!isScreenSharing && !stream) {
      startScreenShare()
    }
  }, [isScreenSharing, stream, startScreenShare])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScreenShare()
    }
  }, [stopScreenShare])

  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-40 transition-all duration-500 glassmorphism fade-in"
      style={
        {
          "--glass-bg": theme === "dark" ? "var(--color-gunmetal-light-alpha)" : "var(--color-light-silver-dark-alpha)",
        } as React.CSSProperties
      }
    >
      <div className="relative p-8 rounded-2xl flex flex-col items-center justify-center w-full h-full">
        {/* Header Controls */}
        <div className="absolute top-8 right-8 flex items-center gap-4 z-30">
          {/* Live Mode Toggle */}
          <button
            onClick={isLiveMode ? stopLiveMode : startLiveMode}
            disabled={!stream}
            className={`p-3 rounded-xl transition-all duration-300 shadow-lg group disabled:opacity-50 ${
              isLiveMode 
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
            }`}
            aria-label={isLiveMode ? "Stop live streaming" : "Start live streaming"}
          >
            {connectionStatus === 'connecting' ? (
              <Loader size={24} className="animate-spin" />
            ) : isLiveMode ? (
              <Wifi size={24} className="group-hover:scale-110 transition-transform" />
            ) : (
              <WifiOff size={24} className="group-hover:scale-110 transition-transform" />
            )}
          </button>

          {/* Auto-analyze Toggle (REST mode only) */}
          {!isLiveMode && (
            <button
              onClick={() => setIsAutoAnalyzing(!isAutoAnalyzing)}
              className={`p-3 rounded-xl transition-all duration-300 shadow-lg group ${
                isAutoAnalyzing
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                  : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700'
              }`}
              aria-label="Toggle auto-analysis"
            >
              {isAutoAnalyzing ? (
                <Pause size={24} className="group-hover:scale-110 transition-transform" />
              ) : (
                <Play size={24} className="group-hover:scale-110 transition-transform" />
              )}
            </button>
          )}

          {/* Manual Analysis Button */}
          <button
            onClick={isLiveMode ? sendFrameToLiveAPI : analyzeCurrentFrame}
            disabled={isAnalyzing || !stream}
            className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 z-30 transition-all duration-300 shadow-lg group disabled:opacity-50"
            aria-label="Analyze current screen"
          >
            {isAnalyzing ? (
              <Loader size={24} className="animate-spin" />
            ) : (
              <Brain size={24} className="group-hover:scale-110 transition-transform" />
            )}
          </button>

          {/* Stop Button */}
          <button
            onClick={stopScreenShare}
            className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 z-30 transition-all duration-300 shadow-lg group"
            aria-label="Stop screen sharing"
          >
            <Square size={24} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        <h2 className="text-3xl font-bold mb-6 text-[var(--text-primary)] gradient-text">
          {stream ? "AI-Powered Screen Analysis" : "Starting Screen Share..."}
        </h2>

        <div className="flex gap-6 w-full max-w-6xl h-[70vh]">
          {/* Screen Share Display */}
          <div className="relative flex-1 glassmorphism rounded-2xl overflow-hidden shadow-2xl border border-[var(--glass-border)]">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="w-full h-full object-contain bg-black"
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {!stream && (
              <div className="absolute inset-0 flex items-center justify-center glassmorphism">
                <div className="text-center">
                  <div className="p-6 rounded-full glassmorphism mb-4 floating-element">
                    <Loader size={48} className="animate-spin text-[var(--color-orange-accent)]" />
                  </div>
                  <p className="text-lg text-[var(--text-primary)]">Requesting screen access...</p>
                  <p className="text-sm text-[var(--text-primary)] opacity-70 mt-2">
                    Please select a screen or window to share
                  </p>
                </div>
              </div>
            )}

            {stream && (
              <div className="absolute bottom-4 left-4 right-4 glassmorphism rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isLiveMode ? 'bg-green-500' : 'bg-orange-500'} animate-pulse`}></div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {isLiveMode ? 'LIVE STREAMING' : 'SHARING'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Monitor size={16} className="text-[var(--text-primary)]" />
                    <span className="text-sm text-[var(--text-primary)]">
                      {isLiveMode ? 'Live connected' : (isAutoAnalyzing ? "Auto-analyzing" : "Manual mode")}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Analysis Panel */}
          <div className="w-80 glassmorphism rounded-2xl p-4 border border-[var(--glass-border)]">
            <h3 className="text-xl font-bold mb-4 text-[var(--text-primary)] flex items-center gap-2">
              <Brain size={20} />
              Screen Analysis
            </h3>

            {/* Connection Status */}
            {isLiveMode && (
              <div className="mb-4 p-2 glassmorphism rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-500' :
                    connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                    connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'
                  }`}></div>
                  <span className="text-[var(--text-primary)]">
                    {connectionStatus === 'connected' ? 'Live Connected' :
                     connectionStatus === 'connecting' ? 'Connecting...' :
                     connectionStatus === 'error' ? 'Connection Error' : 'Disconnected'}
                  </span>
                </div>
              </div>
            )}

            {/* Current Analysis */}
            {lastAnalysis && (
              <div className="mb-4 p-3 glassmorphism rounded-lg">
                <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Current Analysis:</h4>
                <p className="text-sm text-[var(--text-primary)] opacity-90">{lastAnalysis}</p>
              </div>
            )}

            {/* Analysis History */}
            {analysisHistory.length > 1 && (
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Previous Analysis:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {analysisHistory.slice(1).map((analysis, index) => (
                    <div key={index} className="p-2 glassmorphism rounded text-xs text-[var(--text-primary)] opacity-70">
                      {analysis.substring(0, 100)}...
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="mt-4 pt-4 border-t border-[var(--glass-border)]">
              <div className="space-y-2">
                {!isLiveMode && (
                  <button
                    onClick={() => setIsAutoAnalyzing(!isAutoAnalyzing)}
                    className={`w-full p-2 rounded-lg text-sm transition-colors ${
                      isAutoAnalyzing
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                    }`}
                  >
                    {isAutoAnalyzing ? 'Stop Auto-Analysis' : 'Start Auto-Analysis'}
                  </button>
                )}
                
                <div className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                  {isAnalyzing ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      <span>Analyzing screen...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{isLiveMode ? 'Live streaming active' : 'Ready for analysis'}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-lg text-[var(--text-primary)] opacity-80 fade-in">
          {isLiveMode 
            ? "AI is analyzing your screen share via live WebSocket connection" 
            : "AI is analyzing your screen share in real-time"}
        </p>
      </div>
    </div>
  )
} 