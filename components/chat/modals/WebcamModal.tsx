"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { X, Loader, Eye, Brain } from "lucide-react"
import { useAnalysisHistory } from "@/hooks/use-analysis-history"

interface WebcamModalProps {
  isOpen: boolean
  onClose: () => void
  onCapture?: (imageData: string) => void
  onAIAnalysis?: (analysis: string) => void
  theme?: "light" | "dark"
}

export const WebcamModal: React.FC<WebcamModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  onAIAnalysis,
  theme = "dark",
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentAnalysis, setCurrentAnalysis] = useState("")
  const { analysisHistory, addAnalysis, clearHistory } = useAnalysisHistory()
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      setStream(mediaStream)
      setIsCameraActive(true)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error("Camera access failed:", error)
    }
  }, [])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsCameraActive(false)
    onClose()
  }, [stream, onClose])

  const handleAnalysis = useCallback(
    async (imageData: string) => {
      if (!videoRef.current || !canvasRef.current || !isCameraActive) return

      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")

      if (!ctx) return

      // Set canvas size to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw current frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert to base64
      const base64Data = imageData.split(",")[1]

      setIsAnalyzing(true)

      try {
        // Mock AI analysis
        await new Promise((resolve) => setTimeout(resolve, 1500))
        const analysis = "AI analysis of the webcam feed would appear here. It seems to be a person in a room."
        setCurrentAnalysis(analysis)
        addAnalysis(analysis)
        if (onAIAnalysis) {
          onAIAnalysis(analysis)
        }
      } catch (error) {
        console.error("AI analysis error:", error)
      } finally {
        setIsAnalyzing(false)
      }
    },
    [isCameraActive, onAIAnalysis, addAnalysis],
  )

  const analyzeCurrentFrame = useCallback(async () => {
    if (!stream) return
    const video = videoRef.current
    if (!video) return

    const streamTracks = stream.getTracks()
    if (streamTracks.length === 0) return

    const track = streamTracks[0]
    if (!track) return

    const canvas = canvasRef.current
    if (!canvas) {
      console.error("Canvas is not initialized")
      return
    }

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      console.error("Canvas context is not initialized")
      return
    }

    const videoWidth = video.videoWidth
    const videoHeight = video.videoHeight

    canvas.width = videoWidth
    canvas.height = videoHeight

    ctx.drawImage(video, 0, 0, videoWidth, videoHeight)

    const imageData = canvas.toDataURL("image/jpeg", 0.8)
    await handleAnalysis(imageData)
  }, [stream, handleAnalysis])

  // Auto-analyze every 3 seconds when camera is active
  useEffect(() => {
    if (!isCameraActive) return

    const interval = setInterval(analyzeCurrentFrame, 3000)
    return () => clearInterval(interval)
  }, [isCameraActive, analyzeCurrentFrame])

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen && !isCameraActive) {
      startCamera()
    }
  }, [isOpen, isCameraActive, startCamera])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  useEffect(() => {
    if (!isOpen) {
      clearHistory()
    }
  }, [isOpen, clearHistory])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 transition-all duration-500 bg-black/50 backdrop-blur-sm">
      <div className="relative p-8 rounded-2xl flex flex-col items-center justify-center w-full h-full max-w-6xl">
        <button
          onClick={stopCamera}
          className="absolute top-8 right-8 p-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 z-30 transition-all duration-300 shadow-lg group"
          aria-label="Stop webcam stream"
        >
          <X size={24} className="group-hover:rotate-90 transition-transform" />
        </button>

        <div className="flex justify-center space-x-4">
          {/* Manual Analysis Button */}
          <button
            onClick={analyzeCurrentFrame}
            disabled={isAnalyzing || !isCameraActive}
            className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 z-30 transition-all duration-300 shadow-lg group disabled:opacity-50"
            aria-label="Analyze current view"
          >
            <Brain className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        <h2 className="text-3xl font-bold mb-6 text-white gradient-text">
          {isCameraActive ? "AI-Powered Webcam Analysis" : "Activating Camera..."}
        </h2>

        <div className="flex gap-6 w-full max-w-6xl">
          {/* Video Stream */}
          <div className="relative flex-1 aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {!isCameraActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="text-center">
                  <div className="p-6 rounded-full bg-white/10 mb-4">
                    <Loader size={48} className="animate-spin text-orange-500" />
                  </div>
                  <p className="text-lg text-white">Initializing camera...</p>
                </div>
              </div>
            )}

            {isCameraActive && (
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-sm font-medium text-white">LIVE</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye size={16} className="text-white" />
                    <span className="text-sm text-white">AI Watching</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Analysis Panel */}
          <div className="w-80 bg-black/20 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
            <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
              <Brain size={20} />
              AI Analysis
            </h3>

            {/* Current Analysis */}
            {currentAnalysis && (
              <div className="mb-4 p-3 bg-white/10 rounded-lg">
                <h4 className="text-sm font-semibold text-white mb-2">Current View:</h4>
                <p className="text-sm text-white opacity-90">{currentAnalysis}</p>
              </div>
            )}

            {/* Analysis History */}
            {analysisHistory.length > 1 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Recent Analysis:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {analysisHistory.slice(1).map((analysis, index) => (
                    <div key={index} className="p-2 bg-white/5 rounded text-xs text-white opacity-70">
                      {analysis.substring(0, 100)}...
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status */}
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center gap-2 text-sm text-white">
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

        <p className="mt-6 text-lg text-white opacity-80">AI is analyzing your webcam feed in real-time</p>
      </div>
    </div>
  )
}

export default WebcamModal
