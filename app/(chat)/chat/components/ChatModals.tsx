"use client"

import type React from "react"
import { ROICalculatorModal } from "@/components/chat/modals/ROICalculatorModal"
import { ScreenShareModal } from "@/components/chat/modals/ScreenShareModal"
import { Video2AppModal } from "@/components/chat/modals/Video2AppModal"
import { VoiceInputModal } from "@/components/chat/modals/VoiceInputModal"
import { VoiceOutputModal } from "@/components/chat/modals/VoiceOutputModal"
import { WebcamModal } from "@/components/chat/modals/WebcamModal"
import { LeadResearchModal } from "./LeadResearchModal"
import { useModalManager } from "../hooks/useModalManager"

interface ChatModalsProps {
  onTransferToChat: (message: string) => void
  onCapture?: (data: any) => void
  onAnalysis?: (analysis: string) => void
}

export const ChatModals: React.FC<ChatModalsProps> = ({ onTransferToChat, onCapture, onAnalysis }) => {
  const { activeModal, openModal, closeModal } = useModalManager()

  return (
    <>
      <ROICalculatorModal isOpen={activeModal === "roiCalculator"} onClose={() => closeModal()} />

      <ScreenShareModal isOpen={activeModal === "screenShare"} onClose={() => closeModal()} onAnalysis={onAnalysis} />

      <Video2AppModal
        isOpen={activeModal === "video2App"}
        onClose={() => closeModal()}
        onAnalysisComplete={onCapture}
      />

      <VoiceInputModal
        isOpen={activeModal === "voiceInput"}
        onClose={() => closeModal()}
        onTransferToChat={onTransferToChat}
      />

      <VoiceOutputModal isOpen={activeModal === "voiceOutput"} onClose={() => closeModal()} />

      <WebcamModal
        isOpen={activeModal === "webcam"}
        onClose={() => closeModal()}
        onCapture={onCapture}
        onAIAnalysis={onAnalysis}
      />

      <LeadResearchModal isOpen={activeModal === "leadResearch"} onClose={() => closeModal()} />
    </>
  )
}

export default ChatModals
