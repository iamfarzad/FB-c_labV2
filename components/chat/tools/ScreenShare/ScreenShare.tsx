'use client'

import { MultimodalInterface } from '../MultimodalInterface'

interface ScreenShareProps {
  leadId?: string
  onAnalysisComplete?: (result: string) => void
  className?: string
}

export function ScreenShare({ 
  leadId, 
  onAnalysisComplete, 
  className = '' 
}: ScreenShareProps) {
  return (
    <MultimodalInterface
      leadId={leadId}
      onAnalysisComplete={onAnalysisComplete}
      className={className}
    />
  )
}
