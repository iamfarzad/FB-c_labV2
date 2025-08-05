export interface VoiceInputProps {
  mode?: 'card' | 'modal'
  onTranscript: (transcript: string) => void
  onClose?: () => void
  onCancel?: () => void
  leadContext?: {
    name?: string
    company?: string
    role?: string
    interests?: string
  }
  className?: string
}

// Legacy interfaces kept for backward compatibility
// TODO: Remove these when all references are updated
export interface VoiceInputModalProps {
  isOpen: boolean
  onClose: () => void
  onTranscript: (transcript: string) => void
}

export interface VoiceInputCardProps {
  onTranscript: (transcript: string) => void
  onCancel: () => void
  leadContext?: {
    name?: string
    company?: string
    role?: string
    interests?: string
  }
}
