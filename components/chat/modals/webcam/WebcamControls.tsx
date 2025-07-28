"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Camera, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WebcamControlsProps {
  inputMode: "camera" | "upload"
  webcamState: string
  isCapturing: boolean
  canSwitchCamera: boolean
  onCapture: () => void
  onSwitchCamera: () => void
  onClose: () => void
}

export const WebcamControls: React.FC<WebcamControlsProps> = ({
  inputMode,
  webcamState,
  isCapturing,
  canSwitchCamera,
  onCapture,
  onSwitchCamera,
  onClose,
}) => {
  return (
    <div className="p-4">
      <div className="flex items-center justify-center gap-4">
        {inputMode === "camera" && canSwitchCamera && (
          <Button
            variant="outline"
            onClick={onSwitchCamera}
            disabled={webcamState !== "active"}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Switch Camera
          </Button>
        )}

        {inputMode === "camera" && (
          <Button
            onClick={onCapture}
            disabled={webcamState !== "active" || isCapturing}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded-full"
          >
            {isCapturing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <Camera className="w-5 h-5" />
              </motion.div>
            ) : (
              <>
                <Camera className="w-5 h-5 mr-2" />
                Capture Photo
              </>
            )}
          </Button>
        )}

        <Button
          variant="outline"
          onClick={onClose}
          className="bg-white/10 hover:bg-white/20 text-white border-white/20"
        >
          Done
        </Button>
      </div>

      {inputMode === "camera" && (
        <div className="mt-3 text-center">
          <p className="text-xs text-white/60">Press Space to capture • C to switch camera • Esc to close</p>
        </div>
      )}
    </div>
  )
}
