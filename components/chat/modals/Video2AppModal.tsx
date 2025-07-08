"use client"

import type React from "react"
import { useState } from "react"
import { X } from "lucide-react"
import { VideoToAppGenerator } from "@/components/video-to-app-generator"

interface Video2AppModalProps {
  isOpen: boolean
  onClose: () => void
  onAnalysisComplete?: (result: { spec: string; code: string }) => void
}

export const Video2AppModal: React.FC<Video2AppModalProps> = ({ isOpen, onClose, onAnalysisComplete }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full h-full max-w-7xl max-h-[90vh] bg-background rounded-lg shadow-2xl overflow-hidden">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="h-full overflow-auto p-6">
          <VideoToAppGenerator
            onAnalysisComplete={onAnalysisComplete}
            onClose={onClose}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded(!isExpanded)}
            className="h-full"
          />
        </div>
      </div>
    </div>
  )
}

export default Video2AppModal
