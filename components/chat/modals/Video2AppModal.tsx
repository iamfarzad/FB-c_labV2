"use client"

import { Modal } from "@/components/ui/modal"
import VideoToAppGenerator from "@/app/(chat)/chat/components/VideoToAppGenerator"

interface Video2AppModalProps {
  isOpen: boolean
  onClose: () => void
  onAnalysisComplete?: (data: any) => void
}

export function Video2AppModal({ isOpen, onClose, onAnalysisComplete }: Video2AppModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl w-full"
      dialogContentClassName="h-[90vh] flex flex-col"
    >
      <VideoToAppGenerator onAnalysisComplete={onAnalysisComplete} onClose={onClose} />
    </Modal>
  )
}

export default Video2AppModal
