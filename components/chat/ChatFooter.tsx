"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Camera, Monitor, Mic, Paperclip, Youtube, MoreHorizontal } from "lucide-react"
import { useChatContext } from "@/app/chat/context/ChatProvider"
import dynamic from "next/dynamic"
import { Video2AppModal } from "./modals/Video2AppModal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const ScreenShareModal = dynamic(() => import("./modals/ScreenShareModal"), { ssr: false })
const VoiceInputModal = dynamic(() => import("./modals/VoiceInputModal"), { ssr: false })
const WebcamModal = dynamic(() => import("./modals/WebcamModal"), { ssr: false })

interface ChatFooterProps {
  input: string
  setInput: (value: string) => void
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  isLoading: boolean
  onFileUpload: (file: File) => void
  onImageUpload: (imageData: string, fileName: string) => void
  onVoiceTranscript: (transcript: string) => void
  inputRef: React.RefObject<HTMLTextAreaElement>
  showVoiceModal: boolean
  setShowVoiceModal: (show: boolean) => void
  showWebcamModal: boolean
  setShowWebcamModal: (show: boolean) => void
  showScreenShareModal: boolean
  setShowScreenShareModal: (show: boolean) => void
}

export function ChatFooter({
  input,
  setInput,
  handleInputChange,
  isLoading,
  onFileUpload,
  onImageUpload,
  inputRef,
  showVoiceModal,
  setShowVoiceModal,
  showWebcamModal,
  setShowWebcamModal,
  showScreenShareModal,
  setShowScreenShareModal,
}: ChatFooterProps) {
  const { addActivity } = useChatContext()
  const [showVideo2AppModal, setShowVideo2AppModal] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const checkDevice = () => setIsMobile(window.innerWidth < 768)
    checkDevice()
    setIsMounted(true)
    window.addEventListener("resize", checkDevice)
    return () => window.removeEventListener("resize", checkDevice)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (loadEvent) => {
        if (loadEvent.target?.result) {
          onImageUpload(loadEvent.target.result as string, file.name)
        }
      }
      reader.readAsDataURL(file)
    } else {
      onFileUpload(file)
    }
    e.target.value = "" // Reset input
  }

  const actions = [
    { id: "voice", icon: Mic, action: () => setShowVoiceModal(true), title: "Voice Input" },
    { id: "camera", icon: Camera, action: () => setShowWebcamModal(true), title: "Webcam Capture" },
    { id: "screen", icon: Monitor, action: () => setShowScreenShareModal(true), title: "Screen Share" },
    { id: "upload", icon: Paperclip, action: () => fileInputRef.current?.click(), title: "Upload File" },
    { id: "video2app", icon: Youtube, action: () => setShowVideo2AppModal(true), title: "Video to App" },
  ]

  return (
    <div className="border-t border-border bg-background/95 backdrop-blur-sm p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-2 relative">
          <div className="flex-1 relative flex items-center">
            {isMobile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="mr-2 shrink-0">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {actions.map((action) => (
                    <DropdownMenuItem key={action.id} onClick={action.action} className="gap-2">
                      <action.icon className="w-4 h-4" />
                      {action.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-1 absolute left-2 bottom-2">
                {actions.map((action) => (
                  <Button key={action.id} variant="ghost" size="icon" onClick={action.action} title={action.title}>
                    <action.icon className="w-5 h-5 text-muted-foreground" />
                  </Button>
                ))}
              </div>
            )}
            <Textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  e.currentTarget.closest("form")?.requestSubmit()
                }
              }}
              placeholder="Type your message..."
              className="resize-none border-2 focus:border-primary/50 transition-colors w-full pl-36 pr-12 py-3 min-h-[56px] max-h-[200px]"
            />
          </div>
          <Button type="submit" disabled={!input.trim() || isLoading} className="h-[56px] px-6 shrink-0">
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>Press F1 for shortcuts</span>
          <span>AI can make mistakes. Verify important information.</span>
        </div>
      </div>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      {isMounted && showVideo2AppModal && (
        <Video2AppModal isOpen={showVideo2AppModal} onClose={() => setShowVideo2AppModal(false)} />
      )}
    </div>
  )
}
