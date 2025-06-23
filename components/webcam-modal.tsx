"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { X, Loader, Eye, Brain } from "lucide-react"

interface WebcamModalProps {
  videoRef: React.RefObject<HTMLVideoElement>
  canvasRef: React.RefObject<HTMLCanvasElement>
  isCameraActive: boolean
  onStopCamera: () => void
  onAIAnalysis?: (analysis: string) => void
  theme: "light" | "dark"
}

export const WebcamModal: React.FC<WebcamModalProps> = ({
  videoRef,
  canvasRef,
  isCameraActive,
  onStopCamera,
  onAIAnalysis,
  theme,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastAnalysis, setLastAnalysis] = useState<string>("")
  const [analysisHistory, setAnalysisHistory] = useState<string[]>([])

  // Real-time AI analysis function
  const analyzeCurrentFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) return

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
      const response = await fetch('/api/gemini?action=analyzeWebcamFrame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: base64Data,
          prompt: 'Analyze what you see in this webcam frame. Describe the scene, objects, people, and any notable activities. Be concise but informative.'
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
      console.error('AI analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [videoRef, canvasRef, isCameraActive, onAIAnalysis])

  // Auto-analyze every 3 seconds when camera is active
  useEffect(() => {
    if (!isCameraActive) return

    const interval = setInterval(analyzeCurrentFrame, 3000)
    return () => clearInterval(interval)
  }, [isCameraActive, analyzeCurrentFrame])

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
          onClick={onStopCamera}
          className="absolute top-8 right-8 p-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 z-30 transition-all duration-300 shadow-lg group"
          aria-label="Stop webcam stream"
        >
          <X size={24} className="group-hover:rotate-90 transition-transform" />
        </button>

        {/* Manual Analysis Button */}
        <button
          onClick={analyzeCurrentFrame}
          disabled={isAnalyzing || !isCameraActive}
          className="absolute top-8 right-24 p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 z-30 transition-all duration-300 shadow-lg group disabled:opacity-50"
          aria-label="Analyze current frame"
        >
          {isAnalyzing ? (
            <Loader size={24} className="animate-spin" />
          ) : (
            <Brain size={24} className="group-hover:scale-110 transition-transform" />
          )}
        </button>

        <h2 className="text-3xl font-bold mb-6 text-[var(--text-primary)] gradient-text">
          {isCameraActive ? "AI-Powered Webcam Analysis" : "Activating Camera..."}
        </h2>

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

            {isCameraActive && (
              <div className="absolute bottom-4 left-4 right-4 glassmorphism rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">LIVE</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye size={16} className="text-[var(--text-primary)]" />
                    <span className="text-sm text-[var(--text-primary)]">AI Watching</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Analysis Panel */}
          <div className="w-80 glassmorphism rounded-2xl p-4 border border-[var(--glass-border)]">
            <h3 className="text-xl font-bold mb-4 text-[var(--text-primary)] flex items-center gap-2">
              <Brain size={20} />
              AI Analysis
            </h3>

            {/* Current Analysis */}
            {lastAnalysis && (
              <div className="mb-4 p-3 glassmorphism rounded-lg">
                <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Current View:</h4>
                <p className="text-sm text-[var(--text-primary)] opacity-90">{lastAnalysis}</p>
              </div>
            )}

            {/* Analysis History */}
            {analysisHistory.length > 1 && (
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Recent Analysis:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {analysisHistory.slice(1).map((analysis, index) => (
                    <div key={index} className="p-2 glassmorphism rounded text-xs text-[var(--text-primary)] opacity-70">
                      {analysis.substring(0, 100)}...
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status */}
            <div className="mt-4 pt-4 border-t border-[var(--glass-border)]">
              <div className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                {isAnalyzing ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Ready for analysis</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-lg text-[var(--text-primary)] opacity-80 fade-in">
          AI is analyzing your webcam feed in real-time
        </p>
      </div>
    </div>
  )
}
