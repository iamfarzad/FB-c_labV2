"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Camera, X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

type WebcamState = "initializing" | "active" | "error" | "stopped" | "permission-denied"

interface CameraViewProps {
  webcamState: WebcamState
  videoRef: React.RefObject<HTMLVideoElement>
  canvasRef: React.RefObject<HTMLCanvasElement>
  onRetry: () => void
  onSwitchToUpload: () => void
}

const StateDisplay: React.FC<{
  icon: React.ElementType
  title: string
  message: string
  children?: React.ReactNode
  iconBgColor: string
  iconColor: string
}> = ({ icon: Icon, title, message, children, iconBgColor, iconColor }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-black/80">
    <div className="text-center max-w-md mx-auto p-6">
      <div className={`p-4 rounded-full ${iconBgColor} mb-4 mx-auto w-fit`}>
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/70 text-sm mb-4">{message}</p>
      {children}
    </div>
  </div>
)

export const CameraView: React.FC<CameraViewProps> = ({
  webcamState,
  videoRef,
  canvasRef,
  onRetry,
  onSwitchToUpload,
}) => {
  if (webcamState === "active") {
    return (
      <>
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-4 border-2 border-white/30 rounded-lg pointer-events-none" />
        </div>
      </>
    )
  }

  if (webcamState === "initializing") {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/80">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="p-4 rounded-full bg-blue-500/20 mb-4 mx-auto w-fit"
          >
            <Camera className="w-8 h-8 text-blue-400" />
          </motion.div>
          <h3 className="text-lg font-semibold text-white mb-2">Starting Camera</h3>
          <p className="text-white/70 text-sm">Please allow camera access</p>
        </div>
      </div>
    )
  }

  if (webcamState === "error") {
    return (
      <StateDisplay
        icon={X}
        title="Camera Access Failed"
        message="We couldn't access your camera. This might be due to browser permissions or security settings."
        iconBgColor="bg-red-500/20"
        iconColor="text-red-400"
      >
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={onRetry}
            className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={onSwitchToUpload}
            className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Image Instead
          </Button>
        </div>
      </StateDisplay>
    )
  }

  if (webcamState === "permission-denied") {
    return (
      <StateDisplay
        icon={X}
        title="Camera Permission Denied"
        message="We couldn't access your camera. Please allow camera access in your browser settings."
        iconBgColor="bg-orange-500/20"
        iconColor="text-orange-400"
      >
        <Button
          variant="outline"
          onClick={onSwitchToUpload}
          className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Image Instead
        </Button>
      </StateDisplay>
    )
  }

  return null
}
