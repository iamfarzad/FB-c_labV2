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
  const { modals, openModal, closeModal, closeAllModals } = useModalManager()

  return (
    <>
      <ROICalculatorModal isOpen={modals.roiCalculator} onClose={() => closeModal("roiCalculator")} />

      <ScreenShareModal isOpen={modals.screenShare} onClose={() => closeModal("screenShare")} onAnalysis={onAnalysis} />

      <Video2AppModal
        isOpen={modals.video2App}
        onClose={() => closeModal("video2App")}
        onAnalysisComplete={onCapture}
      />

      <VoiceInputModal
        isOpen={modals.voiceInput}
        onClose={() => closeModal("voiceInput")}
        onTransferToChat={onTransferToChat}
      />

      <VoiceOutputModal isOpen={modals.voiceOutput} onClose={() => closeModal("voiceOutput")} />

      <WebcamModal
        isOpen={modals.webcam}
        onClose={() => closeModal("webcam")}
        onCapture={onCapture}
        onAIAnalysis={onAnalysis}
      />

      <LeadResearchModal isOpen={modals.leadResearch} onClose={() => closeModal("leadResearch")} />
    </>
  )
}

export default ChatModals
