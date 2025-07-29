"use client"

import { useChatContext } from "@/app/(chat)/chat/context/ChatProvider"
import ScreenShareModal from "@/components/chat/modals/ScreenShareModal"
import VoiceInputModal from "@/components/chat/modals/VoiceInputModal"
import WebcamModal from "@/components/chat/modals/WebcamModal"

export function ChatModals() {
  const { isModalOpen, closeModal } = useChatContext()

  return (
    <>
      <ScreenShareModal isOpen={isModalOpen("screenShare")} onClose={() => closeModal("screenShare")} />
      <VoiceInputModal isOpen={isModalOpen("voiceInput")} onClose={() => closeModal("voiceInput")} />
      <WebcamModal isOpen={isModalOpen("webcam")} onClose={() => closeModal("webcam")} />
    </>
  )
}
