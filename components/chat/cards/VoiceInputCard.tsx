"use client"

import { useState } from "react"
import { ToolCardWrapper } from "@/components/chat/ToolCardWrapper"
import { CleanVoiceUI } from "@/components/chat/voice/CleanVoiceUI"

interface VoiceInputCardProps {
  onTranscript: (transcript: string) => void
  onCancel: () => void
  leadContext?: {
    name?: string
    company?: string
    role?: string
    interests?: string
  }
}

const VoiceInputCard = ({
  onTranscript,
  onCancel,
  leadContext
}: VoiceInputCardProps) => {
  const [isProcessing, setIsProcessing] = useState(false)
  
  const handleTranscript = (text: string) => {
    setIsProcessing(true)
    try {
      onTranscript(text)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <ToolCardWrapper
      title="Voice Input"
      description="Use your voice to input text"
    >
      <CleanVoiceUI 
        onTranscript={handleTranscript}
        onCancel={onCancel}
        className="w-full"
      />
    </ToolCardWrapper>
  )
}

export { VoiceInputCard }
