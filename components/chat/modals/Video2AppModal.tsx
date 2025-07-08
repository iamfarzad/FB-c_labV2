"use client"

import type React from "react"
import { useState } from "react"
import { X } from "lucide-react"
import { VideoToAppGenerator } from "@/components/video-to-app-generator"
import { motion, AnimatePresence } from "framer-motion"

interface Video2AppModalProps {
  isOpen: boolean
  onClose: () => void
  initialVideoUrl?: string
}

export const Video2AppModal: React.FC<Video2AppModalProps> = ({ isOpen, onClose, initialVideoUrl }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleAnalysisComplete = (data: any) => {
    console.log("Video analysis complete:", data)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm modal-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`relative bg-background border border-border rounded-2xl shadow-2xl overflow-hidden video-generator-container ${
            isExpanded ? "w-[95vw] h-[95vh]" : "w-full max-w-4xl max-h-[90vh]"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-card/50">
            <div>
              <h2 className="text-2xl font-bold gradient-text">Video to Learning App</h2>
              <p className="text-muted-foreground mt-1">
                Transform YouTube videos into interactive learning experiences with AI
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                title={isExpanded ? "Minimize" : "Expand"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isExpanded ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5m11 11v4.5m0-4.5h4.5m0 0l-4.5 4.5M15 3h6v6M9 21H3v-6"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                    />
                  )}
                </svg>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            <VideoToAppGenerator
              onAnalysisComplete={handleAnalysisComplete}
              initialVideoUrl={initialVideoUrl}
              isExpanded={isExpanded}
              onToggleExpand={() => setIsExpanded(!isExpanded)}
              onClose={onClose}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default Video2AppModal
