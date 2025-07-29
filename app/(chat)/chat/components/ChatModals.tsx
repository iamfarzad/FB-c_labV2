"use client"

import { useModalManager } from "@/app/(chat)/chat/hooks/useModalManager"
import { ROICalculatorModal } from "@/components/chat/modals/ROICalculatorModal"
import { ScreenShareModal } from "@/components/chat/modals/ScreenShareModal"
import { Video2AppModal } from "@/components/chat/modals/Video2AppModal"
import { VoiceInputModal } from "@/components/chat/modals/VoiceInputModal"
import { VoiceOutputModal } from "@/components/chat/modals/VoiceOutputModal"
import { WebcamModal } from "@/components/chat/modals/WebcamModal"
import { LeadResearchModal } from "@/app/(chat)/chat/components/LeadResearchModal"

export function ChatModals() {
  const { isModalOpen, activeModal, closeModal, modalData } = useModalManager()

  return (
    <>
      <ROICalculatorModal isOpen={isModalOpen && activeModal === "roi-calculator"} onClose={closeModal} />
      <ScreenShareModal isOpen={isModalOpen && activeModal === "screen-share"} onClose={closeModal} />
      <Video2AppModal isOpen={isModalOpen && activeModal === "video-to-app"} onClose={closeModal} />
      <VoiceInputModal isOpen={isModalOpen && activeModal === "voice-input"} onClose={closeModal} />
      <VoiceOutputModal isOpen={isModalOpen && activeModal === "voice-output"} onClose={closeModal} />
      <WebcamModal isOpen={isModalOpen && activeModal === "webcam"} onClose={closeModal} />
      <LeadResearchModal
        isOpen={isModalOpen && activeModal === "lead-research"}
        onClose={closeModal}
        leadId={modalData?.leadId as string | undefined}
      />
    </>
  )
}
