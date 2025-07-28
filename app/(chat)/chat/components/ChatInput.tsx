"use client"

import { useState } from "react"
import { Paperclip, Mic, Camera, Monitor, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Modal } from "@/components/ui/modal"
import { EnhancedVoiceUI } from "@/components/chat/voice/EnhancedVoiceUI"
import { EnhancedWebcam } from "@/components/chat/webcam/EnhancedWebcam"
import { EnhancedScreenShare } from "@/components/chat/screen/EnhancedScreenShare"
import { EnhancedFileUpload } from "@/components/chat/upload/EnhancedFileUpload"
import { useChatContext } from "@/app/(chat)/chat/context/ChatProvider"

type ModalType = "voice" | "webcam" | "screen" | "file" | null

export default function ChatInput() {
  const [input, setInput] = useState("")
  const [openModal, setOpenModal] = useState<ModalType>(null)
  const { addActivity } = useChatContext()

  const handleSend = () => {
    if (input.trim()) {
      addActivity({ type: "message", status: "success", content: `Message sent: ${input.substring(0, 30)}...` })
      console.log("Sending message:", input)
      setInput("")
    }
  }

  const modalContent = {
    voice: { title: "Voice Input", component: <EnhancedVoiceUI /> },
    webcam: { title: "Webcam Capture", component: <EnhancedWebcam /> },
    screen: { title: "Screen Share", component: <EnhancedScreenShare /> },
    file: { title: "File Upload", component: <EnhancedFileUpload /> },
  }

  return (
    <TooltipProvider>
      <div className="p-4 bg-background border-t">
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message or use the tools..."
            className="pr-28 pl-12 min-h-[52px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setOpenModal("file")}>
                  <Paperclip className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Attach File</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setOpenModal("voice")}>
                  <Mic className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Voice Input</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setOpenModal("webcam")}>
                  <Camera className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Webcam</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setOpenModal("screen")}>
                  <Monitor className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Screen Share</TooltipContent>
            </Tooltip>
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Button onClick={handleSend} disabled={!input.trim()}>
              <Send className="w-5 h-5" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </div>
      </div>
      <Modal
        isOpen={openModal !== null}
        onClose={() => setOpenModal(null)}
        title={openModal ? modalContent[openModal].title : ""}
        size="lg"
      >
        {openModal && modalContent[openModal].component}
      </Modal>
    </TooltipProvider>
  )
}
