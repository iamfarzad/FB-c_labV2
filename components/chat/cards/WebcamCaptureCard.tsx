"use client"

import { ToolCardWrapper } from "@/components/chat/ToolCardWrapper"
import { Webcam } from "@/components/chat/webcam/Webcam"

interface WebcamCaptureCardProps {
  onCapture: (imageData: string) => void
  onCancel: () => void
  onAIAnalysis?: (analysis: string) => void
}

export function WebcamCaptureCard({ 
  onCapture, 
  onCancel,
  onAIAnalysis 
}: WebcamCaptureCardProps) {
  const handleCapture = (imageData: string) => {
    onCapture(imageData)
    onAIAnalysis?.(`Analysis of captured image: ${imageData.substring(0, 30)}...`)
  }

  return (
    <ToolCardWrapper
      title="Webcam Capture"
      description="Take a photo with your camera"
    >
      <Webcam 
        onCapture={handleCapture}
        onClose={onCancel}
        showCloseButton={false}
        showSwitchCamera={true}
        className="w-full"
      />
    </ToolCardWrapper>
  )
}
