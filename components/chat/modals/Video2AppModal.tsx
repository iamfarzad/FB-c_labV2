"use client"

import type React from "react"
import { useState } from "react"
import { X, Maximize2, Minimize2 } from "lucide-react"
import { VideoToAppGenerator } from "@/app/(chat)/chat/components/VideoToAppGenerator"

interface Video2AppModalProps {
  isOpen: boolean
  onClose: () => void
  videoUrl?: string
  onAnalysisComplete?: (data: any) => void
}

export const Video2AppModal: React.FC<Video2AppModalProps> = ({ isOpen, onClose, videoUrl, onAnalysisComplete }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={`relative bg-background rounded-lg shadow-2xl transition-all duration-300 ${
          isExpanded ? "w-[95vw] h-[95vh]" : "w-[90vw] h-[85vh] max-w-6xl"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">AI Video to Learning App Generator</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-muted rounded-md transition-colors"
              aria-label={isExpanded ? "Minimize" : "Maximize"}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-md transition-colors" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 h-[calc(100%-4rem)] overflow-hidden">
          <VideoToAppGenerator
            initialVideoUrl={videoUrl}
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
