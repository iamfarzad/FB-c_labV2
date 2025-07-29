"use client"

import { useChatContext } from "@/app/(chat)/chat/context/ChatProvider"
import ScreenShareModal from "@/app/(chat)/chat/components/modals/ScreenShareModal"
import Video2AppModal from "@/app/(chat)/chat/components/modals/Video2AppModal"
import VoiceInputModal from "@/app/(chat)/chat/components/modals/VoiceInputModal"
import WebcamModal from "@/app/(chat)/chat/components/modals/WebcamModal"

export function ChatModals() {
  const {
    isScreenShareOpen,
    closeScreenShare,
    isVideo2AppOpen,
    closeVideo2App,
    isVoiceInputOpen,
    closeVoiceInput,
    isWebcamOpen,
    closeWebcam,
  } = useChatContext()

  return (
    <>
      <ScreenShareModal isOpen={isScreenShareOpen} onClose={closeScreenShare} />
      <Video2AppModal isOpen={isVideo2AppOpen} onClose={closeVideo2App} />
      <VoiceInputModal isOpen={isVoiceInputOpen} onClose={closeVoiceInput} />
      <WebcamModal isOpen={isWebcamOpen} onClose={closeWebcam} />
    </>
  )
}
