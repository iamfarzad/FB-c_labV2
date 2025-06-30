"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { X, Loader, Monitor, Brain, Square, Play, Pause } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAnalysisHistory } from "@/hooks/use-analysis-history"

interface ScreenShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAIAnalysis?: (analysis: string) => void;
  onStream: (stream: MediaStream) => void;
  theme?: "light" | "dark";
}

export const ScreenShareModal: React.FC<ScreenShareModalProps> = ({
  isOpen,
  onClose,
  onAIAnalysis,
  onStream,
  theme = "dark",
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastAnalysis, setLastAnalysis] = useState<string>("")
  const { analysisHistory, addAnalysis, clearHistory } = useAnalysisHistory()
  const [isAutoAnalyzing, setIsAutoAnalyzing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentAnalysis, setCurrentAnalysis] = useState('')

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      setStream(mediaStream);
      setIsScreenSharing(true);
      if (onStream) {
        onStream(mediaStream);
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }

      // Listen for screen share end
      mediaStream.getVideoTracks()[0].addEventListener('ended', () => {
        stopScreenShare()
      })

    } catch (error) {
      console.error("Error starting screen share:", error);
      onClose();
    }
  }, [onClose, onStream])

  // Stop screen sharing
  const stopScreenShare = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsAutoAnalyzing(false)
    setIsScreenSharing(false)
    onClose()
  }, [stream, onClose])

  const handleAnalysis = useCallback(async (imageData: string) => {
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
    const base64Data = imageData.split(',')[1]

    setIsAnalyzing(true)

    try {
      // Send frame to AI for analysis
              const response = await fetch('/api/ai?action=analyzeScreenShare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: base64Data,
          prompt: 'Analyze this screen share. Describe what applications are open, what the user is working on, and provide insights about their workflow or any notable content visible.'
        })
      })

      const data = await response.json()
      const analysis = data.data?.text || 'No analysis available.'
      setCurrentAnalysis(analysis)
      addAnalysis(analysis)
      if (onAIAnalysis) {
        onAIAnalysis(analysis)
      }
    } catch (error) {
      console.error('Screen analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [onAIAnalysis, addAnalysis])

  const analyzeCurrentFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !stream) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    await handleAnalysis(imageData);
  }, [stream, handleAnalysis]);

  // Auto-analyze every 5 seconds when enabled
  useEffect(() => {
    if (!isAutoAnalyzing || !stream) return;
    const interval = setInterval(analyzeCurrentFrame, 5000);
    return () => clearInterval(interval);
  }, [isAutoAnalyzing, stream, analyzeCurrentFrame]);

  // Start screen share on mount if not already sharing
  useEffect(() => {
    if (isOpen && !isScreenSharing && !stream) {
      startScreenShare()
    }
  }, [isOpen, isScreenSharing, stream, startScreenShare])

  useEffect(() => {
    if (!isOpen) {
      clearHistory()
    }
  }, [isOpen, clearHistory])

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 transition-all duration-500 bg-black/50 backdrop-blur-sm">
      <div className="relative p-8 rounded-2xl flex flex-col items-center justify-center w-full h-full">
        {/* Header Controls */}
        <div className="absolute top-8 right-8 flex items-center gap-4 z-30">
          {/* Auto-analyze Toggle */}
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

          {/* Manual Analysis Button */}
          <button
            onClick={analyzeCurrentFrame}
            disabled={isAnalyzing || !stream}
            className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 z-30 transition-all duration-300 shadow-lg group disabled:opacity-50"
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

        <h2 className="text-3xl font-bold mb-6 text-white gradient-text">
          {stream ? "AI-Powered Screen Analysis" : "Starting Screen Share..."}
        </h2>

        <div className="flex gap-6 w-full max-w-6xl h-[70vh]">
          {/* Screen Share Display */}
          <div className="relative flex-1 bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="w-full h-full object-contain bg-black"
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {!stream && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="text-center">
                  <div className="p-6 rounded-full bg-white/10 mb-4">
                    <Loader size={48} className="animate-spin text-orange-500" />
                  </div>
                  <p className="text-lg text-white">Requesting screen access...</p>
                  <p className="text-sm text-white opacity-70 mt-2">
                    Please select a screen or window to share
                  </p>
                </div>
              </div>
            )}

            {stream && (
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-sm font-medium text-white">SHARING</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Monitor size={16} className="text-white" />
                    <span className="text-sm text-white">
                      {isAutoAnalyzing ? "Auto-analyzing" : "Manual mode"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Analysis Panel */}
          <div className="w-80 bg-black/20 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
            <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
              <Brain size={20} />
              Screen Analysis
            </h3>

            {/* Current Analysis */}
            {currentAnalysis && (
              <div className="mb-4 p-3 bg-white/10 rounded-lg">
                <h4 className="text-sm font-semibold text-white mb-2">Current Analysis:</h4>
                <p className="text-sm text-white opacity-90">{currentAnalysis}</p>
              </div>
            )}

            {/* Analysis History */}
            {analysisHistory.length > 1 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Previous Analysis:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {analysisHistory.slice(1).map((analysis, index) => (
                    <div key={index} className="p-2 bg-white/5 rounded text-xs text-white opacity-70">
                      {analysis.substring(0, 100)}...
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="space-y-2">
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
                
                <div className="flex items-center gap-2 text-sm text-white">
                  {isAnalyzing ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      <span>Analyzing screen...</span>
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
        </div>

        <p className="mt-6 text-lg text-white opacity-80">
          AI is analyzing your screen share in real-time
        </p>
      </div>
    </div>
  )
}

export default ScreenShareModal;
