"use client"

import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal"
import { ScreenShareModal } from "@/components/chat/modals/ScreenShareModal"
import { VoiceInputModal } from "@/components/chat/modals/VoiceInputModal"
import { VoiceOutputModal } from "@/components/chat/modals/VoiceOutputModal"
import { WebcamModal } from "@/components/chat/modals/WebcamModal"
import { Video2AppModal } from "@/components/chat/modals/Video2AppModal"
import { ROICalculatorModal } from "@/components/chat/modals/ROICalculatorModal"
import type { ModalType } from "../hooks/useModalManager"
import type { ROICalculationResult, VideoAppResult } from "@/lib/services/tool-service"

interface ChatModalsProps {
  activeModal: ModalType | null
  closeModal: () => void
  voiceOutputData: { textContent: string; voiceStyle?: string } | null
  closeVoiceOutputModal: () => void
  handleScreenShareAnalysis: (analysis: string) => void
  handleVoiceTranscript: (transcript: string) => void
  handleWebcamCapture: (imageData: string) => void
  handleVideoAppResult: (result: VideoAppResult) => void
  handleROICalculation: (result: ROICalculationResult) => void
  append: (message: { role: "assistant"; content: string }) => void
  addActivity: (activity: any) => void
  leadContext?: { name?: string; company?: string }
}

export const ChatModals = ({
  activeModal,
  closeModal,
  voiceOutputData,
  closeVoiceOutputModal,
  handleScreenShareAnalysis,
  handleVoiceTranscript,
  handleWebcamCapture,
  handleVideoAppResult,
  append,
  addActivity,
  leadContext,
}: ChatModalsProps) => {
  return (
    <>
      <KeyboardShortcutsModal isOpen={activeModal === "keyboardShortcuts"} onClose={closeModal} />

      {activeModal === "screenShare" && (
        <ScreenShareModal
          isOpen={true}
          onClose={closeModal}
          onAIAnalysis={handleScreenShareAnalysis}
          onStream={() =>
            addActivity({
              type: "screen_share",
              title: "Screen Share Started",
              description: "Screen sharing session started",
              status: "in_progress",
            })
          }
        />
      )}
      {activeModal === "voiceInput" && (
        <VoiceInputModal
          isOpen={true}
          onClose={closeModal}
          onTransferToChat={handleVoiceTranscript}
          leadContext={leadContext}
        />
      )}
      {activeModal === "webcam" && (
        <WebcamModal
          isOpen={true}
          onClose={closeModal}
          onCapture={handleWebcamCapture}
          onAIAnalysis={(analysis) => append({ role: "assistant", content: `**Webcam Analysis:**\n${analysis}` })}
        />
      )}
      {activeModal === "video2App" && (
        <Video2AppModal isOpen={true} onClose={closeModal} onAnalysisComplete={handleVideoAppResult} />
      )}
      {activeModal === "roiCalculator" && <ROICalculatorModal isOpen={true} onClose={closeModal} />}
      {activeModal === "voiceOutput" && voiceOutputData && (
        <VoiceOutputModal
          isOpen={true}
          onClose={closeVoiceOutputModal}
          textContent={voiceOutputData.textContent}
          voiceStyle={voiceOutputData.voiceStyle}
          autoPlay={true}
        />
      )}
    </>
  )
}
