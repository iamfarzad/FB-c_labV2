"use client"

import type React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Volume2, VolumeX, Play, Pause } from "lucide-react"

type VoiceState = "idle" | "generating" | "speaking" | "paused" | "error"

interface VoiceOrbProps {
  state: VoiceState
  onClick: () => void
}

export const VoiceOrb: React.FC<VoiceOrbProps> = ({ state, onClick }) => {
  const getOrbColor = () => {
    switch (state) {
      case "speaking":
        return "from-green-400 to-green-600"
      case "generating":
        return "from-blue-400 to-blue-600"
      case "paused":
        return "from-yellow-400 to-yellow-600"
      case "error":
        return "from-red-400 to-red-600"
      default:
        return "from-purple-400 to-purple-600"
    }
  }

  const getIcon = () => {
    switch (state) {
      case "speaking":
        return <Pause className="w-8 h-8 text-white" />
      case "paused":
      case "idle":
        return <Play className="w-8 h-8 text-white" />
      case "error":
        return <VolumeX className="w-8 h-8 text-white" />
      case "generating":
        return <Volume2 className="w-8 h-8 text-white" />
    }
  }

  return (
    <motion.div
      className={cn("relative w-24 h-24 rounded-full bg-gradient-to-r shadow-2xl cursor-pointer", getOrbColor())}
      animate={{
        scale: state === "speaking" ? [1, 1.05, 1] : 1,
        rotate: state === "generating" ? 360 : 0,
      }}
      transition={{
        scale: { duration: 1, repeat: state === "speaking" ? Number.POSITIVE_INFINITY : 0, ease: "easeInOut" },
        rotate: { duration: 2, repeat: state === "generating" ? Number.POSITIVE_INFINITY : 0, ease: "linear" },
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {state === "speaking" && (
          <motion.div className="flex items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-white rounded-full"
                animate={{ height: [6, Math.random() * 16 + 8, 6] }}
                transition={{
                  duration: 0.5 + Math.random() * 0.3,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  delay: i * 0.1,
                }}
              />
            ))}
          </motion.div>
        )}
        {state !== "speaking" && getIcon()}
      </div>
    </motion.div>
  )
}
