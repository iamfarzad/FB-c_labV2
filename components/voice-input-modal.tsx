"use client"

import type React from "react"
import { Mic, X, Loader, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface VoiceInputModalProps {
  isListening: boolean
  currentTranscription: string
  aiState: "listening" | "processing" | "idle" | "error"
  onClose: () => void
  theme: "light" | "dark"
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isListening,
  currentTranscription,
  aiState,
  onClose,
  theme,
}) => {
  const getStateConfig = () => {
    switch (aiState) {
      case "listening":
        return {
          title: "Listening...",
          subtitle: "Speak clearly into your microphone",
          icon: Mic,
          iconColor: "text-orange-500",
          bgGlow: "bg-orange-500/10",
          animate: true
        }
      case "processing":
        return {
          title: "Processing...",
          subtitle: "AI is analyzing your voice input",
          icon: Sparkles,
          iconColor: "text-blue-500",
          bgGlow: "bg-blue-500/10",
          animate: true
        }
      case "error":
        return {
          title: "Error",
          subtitle: "Voice input failed. Please try again.",
          icon: X,
          iconColor: "text-red-500",
          bgGlow: "bg-red-500/10",
          animate: false
        }
      default:
        return {
          title: "Ready",
          subtitle: "Click the microphone to start",
          icon: Mic,
          iconColor: "text-muted-foreground",
          bgGlow: "bg-muted/10",
          animate: false
        }
    }
  }

  const config = getStateConfig()
  const IconComponent = config.icon

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Main Modal Card - Liquid Glass Design */}
          <div className={`glassmorphism border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl bg-white/10 dark:bg-black/20 overflow-hidden relative ${config.animate ? 'shadow-orange-500/20 shadow-2xl' : ''}`}>
            {/* Glass Reflection Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none rounded-2xl" />
            <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${config.bgGlow}`}>
                  <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-white dark:text-white">{config.title}</h3>
                  <p className="text-sm text-white/70 dark:text-white/70">{config.subtitle}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4 text-white/70 dark:text-white/70 hover:text-white" />
              </button>
            </div>

                         {/* Voice Visualization */}
             <div className="p-8 flex flex-col items-center">
               {/* Voice Trebles/Waveform */}
               <div className="flex items-center justify-center gap-1 h-24 mb-4">
                 {Array.from({ length: 12 }).map((_, i) => (
                   <motion.div
                     key={i}
                     className={`w-1 rounded-full ${config.animate ? 'bg-orange-500' : 'bg-white/30 dark:bg-white/20'}`}
                     initial={{ height: 4 }}
                     animate={config.animate ? {
                       height: [4, Math.random() * 60 + 20, 4],
                       opacity: [0.3, 1, 0.3]
                     } : { height: 4 }}
                     transition={{
                       duration: 0.5 + Math.random() * 0.5,
                       repeat: config.animate ? Infinity : 0,
                       ease: "easeInOut",
                       delay: i * 0.1
                     }}
                   />
                 ))}
               </div>
               
               {/* State Icon */}
               <div className={`p-3 rounded-full ${config.bgGlow} mb-4`}>
                 <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
               </div>

              {/* Transcription Display */}
              <AnimatePresence>
                {currentTranscription && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-6 w-full"
                  >
                                       <div className="p-4 bg-white/10 dark:bg-white/5 rounded-lg border border-white/20 dark:border-white/10 backdrop-blur-sm">
                     <p className="text-sm text-white/70 dark:text-white/70 mb-1">Transcription:</p>
                     <p className="text-white dark:text-white font-medium">
                       {currentTranscription || "Start speaking..."}
                     </p>
                   </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Loading Indicator */}
              <AnimatePresence>
                {aiState === "processing" && (
                                     <motion.div
                     initial={{ opacity: 0, scale: 0.8 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.8 }}
                     className="mt-4 flex items-center gap-2 text-white/70 dark:text-white/70"
                   >
                     <Loader className="w-4 h-4 animate-spin text-orange-500" />
                     <span className="text-sm">Processing your input...</span>
                   </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-white/5 dark:bg-white/5 border-t border-white/20 dark:border-white/10">
              <p className="text-xs text-white/60 dark:text-white/60 text-center">
                {aiState === "listening" ? "Speak now or press ESC to cancel" : "Voice input ready"}
              </p>
            </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
