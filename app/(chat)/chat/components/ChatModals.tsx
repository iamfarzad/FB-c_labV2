"use client"

import { useChatContext } from "../context/ChatProvider"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Mic, Video, Monitor, MicOff, Square } from "lucide-react"
import { useState } from "react"

const VoiceInputModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [isRecording, setIsRecording] = useState(false)

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // Add actual voice recording logic here
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Voice Input
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          <div
            className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
              isRecording
                ? "bg-red-500/20 border-red-500 animate-pulse"
                : "bg-gray-100 border-gray-300 hover:border-gray-400"
            }`}
          >
            {isRecording ? <MicOff className="w-8 h-8 text-red-600" /> : <Mic className="w-8 h-8 text-gray-600" />}
          </div>
          <div className="text-center">
            <p className="text-lg font-medium mb-2">{isRecording ? "Recording..." : "Ready to record"}</p>
            <p className="text-sm text-gray-600">
              {isRecording ? "Click to stop recording" : "Click the microphone to start"}
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={toggleRecording} variant={isRecording ? "destructive" : "default"}>
              {isRecording ? <Square className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
              {isRecording ? "Stop" : "Start Recording"}
            </Button>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const WebcamModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [isCapturing, setIsCapturing] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Webcam Capture
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          <div className="w-full max-w-md aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <Video className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Camera preview will appear here</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setIsCapturing(!isCapturing)} variant={isCapturing ? "destructive" : "default"}>
              <Video className="w-4 h-4 mr-2" />
              {isCapturing ? "Stop Capture" : "Start Capture"}
            </Button>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const ScreenShareModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [isSharing, setIsSharing] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Screen Share
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          <div className="w-full max-w-md aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Screen preview will appear here</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-medium mb-2">{isSharing ? "Sharing Screen..." : "Ready to share"}</p>
            <p className="text-sm text-gray-600">Share your screen for AI analysis and assistance</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setIsSharing(!isSharing)} variant={isSharing ? "destructive" : "default"}>
              <Monitor className="w-4 h-4 mr-2" />
              {isSharing ? "Stop Sharing" : "Start Sharing"}
            </Button>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

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
