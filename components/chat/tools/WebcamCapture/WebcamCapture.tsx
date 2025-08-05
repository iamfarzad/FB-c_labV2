'use client'

import { MultimodalInterface } from '../MultimodalInterface'

interface WebcamCaptureProps {
  leadId?: string
  onAnalysisComplete?: (result: string) => void
  className?: string
}

export function WebcamCapture({ 
  leadId, 
  onAnalysisComplete, 
  className = '' 
}: WebcamCaptureProps) {
  return (
    <MultimodalInterface
      leadId={leadId}
      onAnalysisComplete={onAnalysisComplete}
      className={className}
    />
  )
}
