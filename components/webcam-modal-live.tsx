"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { X, Loader, Eye, Brain, Camera, Wifi, WifiOff } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { GeminiLiveClient } from "@/lib/ai/gemini-live-client"

interface WebcamModalLiveProps {
  videoRef: React.RefObject<HTMLVideoElement>
  canvasRef: React.RefObject<HTMLCanvasElement>
  isCameraActive: boolean
  onStopCamera: () => void
  onAIAnalysis?: (analysis: string) => void
  theme: "light" | "dark"
}

export const WebcamModalLive: React.FC<WebcamModalLiveProps> = ({
  videoRef,
  canvasRef,
  isCameraActive,
  onStopCamera,
  onAIAnalysis,
  theme,
}) => {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [lastAnalysis, setLastAnalysis] = useState<string>("")
  const [analysisHistory, setAnalysisHistory] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [fps, setFps] = useState(10)
  
  const liveClientRef = useRef<GeminiLiveClient | null>(null)
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
      
      // Create Live API client for video streaming
      const client = new GeminiLiveClient(apiKey, {
        model: defaultModel,
        responseModalities: ['TEXT'],
        systemInstruction: 'You are analyzing a live video stream. Describe what you see concisely and note any significant changes or activities. Focus on people, objects, environment, and actions.'
      })
      
      // Set up event handlers
      client.onSetupComplete = () => {
        console.log('Live API setup complete for webcam')
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
      
      // Start video streaming
      startVideoStreaming()
      
    } catch (error: any) {
      console.error('Failed to initialize Live API:', error)
      setError(error.message)
      setIsConnecting(false)
    }
  }, [onAIAnalysis])
  
  // Start streaming video frames
  const startVideoStreaming = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return
    
    // Stream frames at specified FPS
    const streamFrame = async () => {
      if (!liveClientRef.current?.connected || !isStreaming) return
      
      try {
        // Update canvas size to match video
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
        }
        
        // Draw current frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Convert to blob
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
          0.8
        )
      } catch (error) {
        console.error('Frame streaming error:', error)
      }
    }
    
    // Start streaming interval
    streamIntervalRef.current = setInterval(streamFrame, 1000 / 10) // 10 FPS default
    streamFrame() // Send first frame immediately
  }, [videoRef, canvasRef, isStreaming])
  
  // Stop streaming
  const stopStreaming = useCallback(() => {
    setIsStreaming(false)
    
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current)
      streamIntervalRef.current = null
    }
    
    if (liveClientRef.current) {
      liveClientRef.current.disconnect()
      liveClientRef.current = null
    }
  }, [])
  
  // Initialize on mount if camera is active
  useEffect(() => {
    if (isCameraActive) {
      initializeLiveConnection()
    }
    
    return () => {
      stopStreaming()
    }
  }, [isCameraActive, initializeLiveConnection, stopStreaming])
  
  // Restart streaming when connection changes
  useEffect(() => {
    if (isConnected && !streamIntervalRef.current) {
      startVideoStreaming()
    }
  }, [isConnected, startVideoStreaming])
  
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
        <button
          onClick={() => {
            stopStreaming()
            onStopCamera()
          }}
          className="absolute top-8 right-8 p-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 z-30 transition-all duration-300 shadow-lg group"
          aria-label="Stop webcam stream"
        >
          <X size={24} className="group-hover:rotate-90 transition-transform" />
        </button>

        {/* Connection Status */}
        <div className="absolute top-8 right-24 flex items-center gap-2">
          <div className={`p-3 rounded-xl ${isConnected ? 'bg-green-500/20' : isConnecting ? 'bg-yellow-500/20' : 'bg-red-500/20'} shadow-lg`}>
            {isConnected ? (
              <Wifi className="w-5 h-5 text-green-400" />
            ) : isConnecting ? (
              <Loader className="w-5 h-5 text-yellow-400 animate-spin" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-400" />
            )}
          </div>
          {isConnected && (
            <div className="px-3 py-2 rounded-lg bg-black/20 backdrop-blur">
              <span className="text-sm font-mono text-white">{fps} FPS</span>
            </div>
          )}
        </div>

        <h2 className="text-3xl font-bold mb-6 text-[var(--text-primary)] gradient-text">
          {isConnected ? "Live AI Vision Analysis" : isConnecting ? "Connecting to Live API..." : "Setting up stream..."}
        </h2>

        {/* Error Message */}
        {error && (
          <div className="absolute top-24 left-8 right-8 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        <div className="flex gap-6 w-full max-w-6xl">
          {/* Video Stream */}
          <div className="relative flex-1 aspect-video glassmorphism rounded-2xl overflow-hidden shadow-2xl border border-[var(--glass-border)]">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {!isCameraActive && (
              <div className="absolute inset-0 flex items-center justify-center glassmorphism">
                <div className="text-center">
                  <div className="p-6 rounded-full glassmorphism mb-4 floating-element">
                    <Loader size={48} className="animate-spin text-[var(--color-orange-accent)]" />
                  </div>
                  <p className="text-lg text-[var(--text-primary)]">Initializing camera...</p>
                </div>
              </div>
            )}

            {isCameraActive && isConnected && (
              <div className="absolute bottom-4 left-4 right-4 glassmorphism rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">LIVE STREAMING</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Camera size={16} className="text-[var(--text-primary)]" />
                    <span className="text-sm text-[var(--text-primary)]">AI Vision Active</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Analysis Panel */}
          <div className="w-80 glassmorphism rounded-2xl p-4 border border-[var(--glass-border)]">
            <h3 className="text-xl font-bold mb-4 text-[var(--text-primary)] flex items-center gap-2">
              <Brain size={20} />
              Live AI Analysis
            </h3>

            {/* Current Analysis */}
            {lastAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 glassmorphism rounded-lg"
              >
                <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                  <Eye size={14} />
                  Current View:
                </h4>
                <p className="text-sm text-[var(--text-primary)] opacity-90">{lastAnalysis}</p>
              </motion.div>
            )}

            {/* Analysis History */}
            {analysisHistory.length > 1 && (
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Recent Analysis:</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <AnimatePresence>
                    {analysisHistory.slice(1, 5).map((analysis, index) => (
                      <motion.div
                        key={`${index}-${analysis.substring(0, 20)}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-2 glassmorphism rounded text-xs text-[var(--text-primary)] opacity-70"
                      >
                        {analysis.substring(0, 100)}...
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="mt-4 pt-4 border-t border-[var(--glass-border)]">
              <div className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                {isStreaming ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Streaming video to AI</span>
                  </>
                ) : isConnecting ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span>Not streaming</span>
                  </>
                )}
              </div>
              
              {isStreaming && (
                <div className="mt-2 text-xs text-[var(--text-primary)] opacity-60">
                  <p>Model: Gemini Live 2.5 Flash</p>
                  <p>Latency: &lt;600ms</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="mt-6 text-lg text-[var(--text-primary)] opacity-80 fade-in">
          {isConnected 
            ? "AI is analyzing your webcam feed with real-time streaming"
            : "Setting up Live API connection for continuous analysis..."
          }
        </p>
      </div>
    </div>
  )
}
