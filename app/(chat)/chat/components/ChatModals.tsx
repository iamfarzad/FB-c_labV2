"use client"

import { useChatContext } from "../context/ChatProvider"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Placeholder Modals - these can be built out later
const VoiceInputModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Voice Input</DialogTitle>
      </DialogHeader>
      <p>Voice input functionality coming soon.</p>
    </DialogContent>
  </Dialog>
)

const WebcamModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Webcam Capture</DialogTitle>
      </DialogHeader>
      <p>Webcam capture functionality coming soon.</p>
    </DialogContent>
  </Dialog>
)

const ScreenShareModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Screen Share</DialogTitle>
      </DialogHeader>
      <p>Screen share functionality coming soon.</p>
    </DialogContent>
  </Dialog>
)

export function ChatModals() {
  const { activeModal, closeModal } = useChatContext()

  return (
    <>
      <VoiceInputModal open={activeModal === "voiceInput"} onClose={closeModal} />
      <WebcamModal open={activeModal === "webcam"} onClose={closeModal} />
      <ScreenShareModal open={activeModal === "screenShare"} onClose={closeModal} />
    </>
  )
}
