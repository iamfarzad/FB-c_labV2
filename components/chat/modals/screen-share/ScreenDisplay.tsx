"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Monitor, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

type ScreenShareState = "initializing" | "sharing" | "analyzing" | "error" | "stopped"

interface ScreenDisplayProps {
  screenState: ScreenShareState
  videoRef: React.RefObject<HTMLVideoElement>
  canvasRef: React.RefObject<HTMLCanvasElement>
}

export const ScreenDisplay: React.FC<ScreenDisplayProps> = ({ screenState, videoRef, canvasRef }) => {
  return (
    <Card className="flex-1 bg-black/50 backdrop-blur-sm border-white/20 overflow-hidden">
      <CardContent className="p-0 h-full relative">
        {screenState === "initializing" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="p-6 rounded-full bg-blue-500/20 mb-4 mx-auto w-fit"
              >
                <Monitor className="w-12 h-12 text-blue-400" />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">Starting Screen Share</h3>
              <p className="text-white/70">Please select a screen or window to share</p>
            </div>
          </div>
        )}

        {screenState === "error" && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900/20">
            <div className="text-center">
              <div className="p-6 rounded-full bg-red-500/20 mb-4 mx-auto w-fit">
                <X className="w-12 h-12 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Screen Share Failed</h3>
              <p className="text-white/70">Please check permissions and try again</p>
            </div>
          </div>
        )}

        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain bg-black" />
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  )
}
