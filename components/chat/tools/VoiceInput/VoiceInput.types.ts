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
