"use client"

import { cn } from "@/lib/utils"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Camera, Monitor, Mic, Paperclip, Youtube, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
  setShowVideo2AppModal: (show: boolean) => void
}

export function ChatFooter({
  input,
  handleInputChange,
  isLoading,
  onFileUpload,
  onImageUpload,
  inputRef,
  setShowVoiceModal,
  setShowWebcamModal,
  setShowScreenShareModal,
  setShowVideo2AppModal,
}: ChatFooterProps) {
  const [isMobile, setIsMobile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const checkDevice = () => setIsMobile(window.innerWidth < 768)
    checkDevice()
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
    if (e.target) e.target.value = ""
  }

  const actions = [
    { id: "voice", icon: Mic, action: () => setShowVoiceModal(true), title: "Voice Input" },
    { id: "camera", icon: Camera, action: () => setShowWebcamModal(true), title: "Webcam Capture" },
    { id: "screen", icon: Monitor, action: () => setShowScreenShareModal(true), title: "Screen Share" },
    { id: "upload", icon: Paperclip, action: () => fileInputRef.current?.click(), title: "Upload File" },
    { id: "video2app", icon: Youtube, action: () => setShowVideo2AppModal(true), title: "Video to App" },
  ]

  return (
    <div className="shrink-0 border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="container max-w-4xl mx-auto p-4">
        <div className="flex items-end gap-3 relative">
          <div className="flex-1 relative">
            <div className="relative flex items-center">
              {/* Action buttons - Desktop */}
              {!isMobile && (
                <div className="absolute left-3 bottom-3 flex items-center gap-1 z-10">
                  {actions.map((action) => (
                    <Button
                      key={action.id}
                      variant="ghost"
                      size="icon"
                      onClick={action.action}
                      title={action.title}
                      className="h-8 w-8 hover:bg-muted"
                    >
                      <action.icon className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  ))}
                </div>
              )}

              {/* Action buttons - Mobile */}
              {isMobile && (
                <div className="absolute left-3 bottom-3 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      {actions.map((action) => (
                        <DropdownMenuItem key={action.id} onClick={action.action} className="gap-2">
                          <action.icon className="w-4 h-4" />
                          {action.title}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                className={cn(
                  "resize-none border-2 focus:border-primary/50 transition-colors w-full py-3 min-h-[56px] max-h-[200px]",
                  isMobile ? "pl-12 pr-4" : "pl-44 pr-4",
                )}
                disabled={isLoading}
              />
            </div>
          </div>

          <Button type="submit" disabled={!input.trim() || isLoading} className="h-[56px] px-6 shrink-0">
            <Send className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span>Press F1 for shortcuts</span>
          <span>AI can make mistakes. Verify important information.</span>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt"
      />
    </div>
  )
}
