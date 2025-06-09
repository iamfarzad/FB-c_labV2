"use client"

import type React from "react"
import { X, Loader } from "lucide-react"

interface WebcamModalProps {
  videoRef: React.RefObject<HTMLVideoElement>
  canvasRef: React.RefObject<HTMLCanvasElement>
  isCameraActive: boolean
  onStopCamera: () => void
  theme: "light" | "dark"
}

export const WebcamModal: React.FC<WebcamModalProps> = ({
  videoRef,
  canvasRef,
  isCameraActive,
  onStopCamera,
  theme,
}) => {
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

        <h2 className="text-3xl font-bold mb-6 text-[var(--text-primary)] gradient-text">
          {isCameraActive ? "Webcam Stream Live" : "Activating Camera..."}
        </h2>

        <div className="relative w-full max-w-4xl aspect-video glassmorphism rounded-2xl overflow-hidden shadow-2xl border border-[var(--glass-border)]">
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
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-sm font-medium text-[var(--text-primary)]">LIVE</span>
              </div>
            </div>
          )}
        </div>

        <p className="mt-6 text-lg text-[var(--text-primary)] opacity-80 fade-in">The AI is now seeing what you see.</p>
      </div>
    </div>
  )
}
