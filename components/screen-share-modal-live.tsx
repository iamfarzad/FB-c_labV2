"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { X, Loader, Monitor, Brain, Wifi, WifiOff, Activity } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { GeminiLiveClient } from "@/lib/ai/gemini-live-client"

interface ScreenShareModalLiveProps {
  isScreenSharing: boolean
  onStopScreenShare: () => void
  onAIAnalysis?: (analysis: string) => void
  theme: "light" | "dark"
}

export const ScreenShareModalLive: React.FC<ScreenShareModalLiveProps> = ({
  isScreenSharing,
  onStopScreenShare,
  onAIAnalysis,
  theme,
}) => {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [lastAnalysis, setLastAnalysis] = useState<string>("")
  const [analysisHistory, setAnalysisHistory] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [fps, setFps] = useState(5)
  
  const liveClientRef = useRef<GeminiLiveClient | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastFrameTimeRef = useRef<number>(0)
  const frameCountRef = useRef<number>(0)

  // Initialize Live API connection
  const initializeLiveConnection = useCallback(async () => {
    setIsConnecting(true)
    setError(null)
    
    try {
      // Get connection info from API
      const response = await fetch('/api/gemini-live')
      const { success, wsUrl, apiKey, defaultModel, mockMode } = await response.json()
      
      if (!success || mockMode) {
        throw new Error('Live API not available - using mock mode')
      }
      
      // Create Live API client for screen sharing
      const client = new GeminiLiveClient(apiKey, {
        model: defaultModel,
        responseModalities: ['TEXT'],
        systemInstruction: 'You are analyzing a screen share in real-time. Describe what applications are open, what the user is working on, and provide insights about their workflow. Note UI elements, content, and any notable activities. Be helpful and suggest improvements when relevant.'
      })
      
      // Set up event handlers
      client.onSetupComplete = () => {
        console.log('Live API setup complete for screen share')
        setIsConnected(true)
        setIsConnecting(false)
        setIsStreaming(true)
      }
      
      client.onTextResponse = (text: string) => {
        setLastAnalysis(text)
        setAnalysisHistory(prev => [text, ...prev.slice(0, 9)]) // Keep last 10
        onAIAnalysis?.(text)
      }
      
      client.onConnectionChange = (connected: boolean) => {
        setIsConnected(connected)
        if (!connected) {
          setError('Connection lost')
          setIsStreaming(false)
        }
      }
      
      client.onError = (error: Error) => {
        console.error('Live API error:', error)
        setError(error.message)
        setIsStreaming(false)
      }
      
      // Connect to Live API
      await client.connect()
      liveClientRef.current = client
      
    } catch (error: any) {
      console.error('Failed to initialize Live API:', error)
      setError(error.message)
      setIsConnecting(false)
    }
  }, [onAIAnalysis])
  
  // Start screen share
  const startScreenShare = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor'
        } as MediaTrackConstraints,
        audio: false
      })
      
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      
      // Listen for screen share end
      mediaStream.getVideoTracks()[0].onended = () => {
        stopStreaming()
        onStopScreenShare()
      }
      
      // Start streaming after video is ready
      if (videoRef.current) {
        videoRef.current.onloadedmetadata = () => {
          startScreenStreaming()
        }
      }
    } catch (error) {
      console.error('Screen share failed:', error)
      setError('Failed to start screen sharing')
      onStopScreenShare()
    }
  }, [onStopScreenShare])
  
  // Start streaming screen frames
  const startScreenStreaming = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return
    
    // Stream frames at specified FPS (lower for screen share)
    const streamFrame = async () => {
      if (!liveClientRef.current?.connected || !isStreaming || !stream?.active) return
      
      try {
        // Update canvas size to match video
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
        }
        
        // Draw current frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Convert to blob with higher quality for text readability
        canvas.toBlob(
          (blob) => {
            if (blob && liveClientRef.current?.connected) {
              liveClientRef.current.sendRealtimeInput([blob])
              
              // Update frame counter
              frameCountRef.current++
              
              // Calculate actual FPS every second
              const now = Date.now()
              if (now - lastFrameTimeRef.current >= 1000) {
                setFps(Math.round(frameCountRef.current))
                frameCountRef.current = 0
                lastFrameTimeRef.current = now
              }
            }
          },
          'image/jpeg',
          0.9 // Higher quality for screen content
        )
      } catch (error) {
        console.error('Frame streaming error:', error)
      }
    }
    
    // Start streaming interval (5 FPS for screen share)
    streamIntervalRef.current = setInterval(streamFrame, 200) // 5 FPS
    streamFrame() // Send first frame immediately
  }, [stream, isStreaming])
  
  // Stop streaming
  const stopStreaming = useCallback(() => {
    setIsStreaming(false)
    
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current)
      streamIntervalRef.current = null
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    
    if (liveClientRef.current) {
      liveClientRef.current.disconnect()
      liveClientRef.current = null
    }
  }, [stream])
  
  // Initialize on mount
  useEffect(() => {
    if (!isScreenSharing && !stream) {
      initializeLiveConnection().then(() => {
        startScreenShare()
      })
    }
    
    return () => {
      stopStreaming()
    }
  }, [isScreenSharing, stream, initializeLiveConnection, startScreenShare, stopStreaming])
  
  // Restart streaming when connection changes
  useEffect(() => {
    if (isConnected && stream && !streamIntervalRef.current) {
      startScreenStreaming()
    }
  }, [isConnected, stream, startScreenStreaming])
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={() => {
          stopStreaming()
          onStopScreenShare()
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="absolute inset-x-0 top-4 mx-auto max-w-7xl px-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="glassmorphism border border-white/20 rounded-2xl shadow-2xl backdrop-blur-xl bg-black/50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Monitor className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    {isConnected ? "Live Screen Analysis" : "Setting up screen share..."}
                  </h3>
                  <p className="text-sm text-white/70">
                    {isConnected ? "AI is analyzing your screen in real-time" : "Connecting to Live API..."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Connection Status */}
                <div className={`p-2 rounded-lg ${isConnected ? 'bg-green-500/20' : isConnecting ? 'bg-yellow-500/20' : 'bg-red-500/20'}`}>
                  {isConnected ? (
                    <Wifi className="w-4 h-4 text-green-400" />
                  ) : isConnecting ? (
                    <Loader className="w-4 h-4 text-yellow-400 animate-spin" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-400" />
                  )}
                </div>
                {isConnected && (
                  <div className="px-3 py-1 rounded-lg bg-black/20 backdrop-blur">
                    <span className="text-xs font-mono text-white">{fps} FPS</span>
                  </div>
                )}
                <button
                  onClick={() => {
                    stopStreaming()
                    onStopScreenShare()
                  }}
                  className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                  aria-label="Stop screen sharing"
                >
                  <X className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="mx-4 mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}
            
            {/* Main Content */}
            <div className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Screen Display */}
                <div className="lg:col-span-2">
                  <div className="relative aspect-video glassmorphism rounded-xl overflow-hidden border border-white/10">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain bg-black" />
                    <canvas ref={canvasRef} style={{ display: "none" }} />
                    
                    {!stream && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <Loader className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
                          <p className="text-white/70">Please select a screen or window to share</p>
                        </div>
                      </div>
                    )}
                    
                    {stream && isStreaming && (
                      <div className="absolute bottom-4 left-4 right-4 glassmorphism rounded-lg p-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-white/90">LIVE STREAMING</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Activity size={14} className="text-green-400" />
                            <span className="text-xs text-white/70">AI Active</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* AI Analysis Panel */}
                <div className="glassmorphism rounded-xl p-4 border border-white/10">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Brain size={18} />
                    Live AI Insights
                  </h4>
                  
                  {/* Current Analysis */}
                  {lastAnalysis && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4"
                    >
                      <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <p className="text-sm text-white/90">{lastAnalysis}</p>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Analysis History */}
                  {analysisHistory.length > 1 && (
                    <div>
                      <h5 className="text-xs font-semibold text-white/70 mb-2">Previous Insights:</h5>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        <AnimatePresence>
                          {analysisHistory.slice(1, 4).map((analysis, index) => (
                            <motion.div
                              key={`${index}-${analysis.substring(0, 20)}`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              transition={{ delay: index * 0.05 }}
                              className="p-2 bg-white/5 rounded text-xs text-white/70"
                            >
                              {analysis.substring(0, 120)}...
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                  
                  {/* Status */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span>Model: Gemini Live 2.5</span>
                      <span>Latency: &lt;600ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-4 py-3 bg-white/5 border-t border-white/20">
              <p className="text-xs text-white/60 text-center">
                {isConnected 
                  ? "🖥️ Screen is being analyzed in real-time with Gemini Live API" 
                  : "⏳ Setting up secure screen analysis connection..."
                }
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
