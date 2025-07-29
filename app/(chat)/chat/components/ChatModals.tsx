"use client"

import { VoiceInputModal } from "@/components/chat/modals/VoiceInputModal"
import { WebcamModal } from "@/components/chat/modals/WebcamModal"
import { ScreenShareModal } from "@/components/chat/modals/ScreenShareModal"
import { Video2AppModal } from "@/components/chat/modals/Video2AppModal"
import { LeadResearchModal } from "./LeadResearchModal"

interface ChatModalsProps {
  modalState: {
    isOpen: boolean
    type: string | null
  }
  onCloseModal: () => void
}

export function ChatModals({ modalState, onCloseModal }: ChatModalsProps) {
  if (!modalState.isOpen || !modalState.type) return null

  const renderModal = () => {
    switch (modalState.type) {
      case "voice":
        return <VoiceInputModal isOpen={modalState.isOpen} onClose={onCloseModal} />
      case "webcam":
        return <WebcamModal isOpen={modalState.isOpen} onClose={onCloseModal} />
      case "screen":
        return <ScreenShareModal isOpen={modalState.isOpen} onClose={onCloseModal} />
      case "research":
        return <LeadResearchModal isOpen={modalState.isOpen} onClose={onCloseModal} />
      case "video-app":
        return <Video2AppModal isOpen={modalState.isOpen} onClose={onCloseModal} />
      default:
        return null
    }
  }

  return renderModal()
}
