"use client"

import { ToolCardWrapper } from "@/components/chat/ToolCardWrapper"
import { ScreenShare } from "@/components/chat/screen/ScreenShare"

interface ScreenShareCardProps {
  onAnalysis: (analysis: string) => void
  onCancel: () => void
  onStream?: (stream: MediaStream) => void
}

export function ScreenShareCard({ 
  onAnalysis, 
  onCancel,
  onStream 
}: ScreenShareCardProps) {
  return (
    <ToolCardWrapper
      title="Screen Share"
      description="Share your screen for analysis"
    >
      <ScreenShare 
        onAnalysis={onAnalysis}
        onStream={onStream}
        onClose={onCancel}
        autoAnalyze={false}
      />
    </ToolCardWrapper>
  )
}
