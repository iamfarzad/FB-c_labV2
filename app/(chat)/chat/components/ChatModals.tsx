"use client"

import { useChatContext } from "../context/ChatProvider"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Mic, Video, Monitor } from "lucide-react"

const VoiceInputModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Mic className="w-5 h-5" />
          Voice Input
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/20 flex items-center justify-center">
          <Mic className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-center text-gray-600">Voice input functionality coming soon.</p>
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </div>
    </DialogContent>
  </Dialog>
)

const WebcamModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Video className="w-5 h-5" />
          Webcam Capture
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <div className="w-16 h-16 rounded-full bg-blue-500/10 border-2 border-blue-500/20 flex items-center justify-center">
          <Video className="w-8 h-8 text-blue-500" />
        </div>
        <p className="text-center text-gray-600">Webcam capture functionality coming soon.</p>
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </div>
    </DialogContent>
  </Dialog>
)

const ScreenShareModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Monitor className="w-5 h-5" />
          Screen Share
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center">
          <Monitor className="w-8 h-8 text-emerald-500" />
        </div>
        <p className="text-center text-gray-600">Screen share functionality coming soon.</p>
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </div>
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
