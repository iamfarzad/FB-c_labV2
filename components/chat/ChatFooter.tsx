"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Camera, Monitor, Mic, Paperclip, Youtube, MoreHorizontal, Radio } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast'
import { useAutoResizeTextarea } from "@/hooks/ui/use-auto-resize-textarea"

interface ChatFooterProps {
  input: string
  setInput: (value: string) => void
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  onFileUpload: (file: File) => void
  onImageUpload: (imageData: string, fileName: string) => void
  onVoiceTranscript: (transcript: string) => void
  inputRef: React.RefObject<HTMLTextAreaElement | null>
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
  handleSubmit,
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
  const { toast } = useToast()
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  
  // Auto-resize textarea
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 46,
    maxHeight: 200
  })
  
  // Handle input changes with auto-resize
  const handleLocalInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e)
    adjustHeight()
  }, [handleInputChange, adjustHeight])

  useEffect(() => {
    const checkDevice = () => setIsMobile(window.innerWidth < 768)
    checkDevice()
    window.addEventListener("resize", checkDevice)
    return () => window.removeEventListener("resize", checkDevice)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // Simulate progress (or use real if API supports)
      const interval = setInterval(() => setUploadProgress(p => Math.min(p + 10, 100)), 200)
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
      clearInterval(interval)
      setUploadProgress(100)
      toast({ title: 'Upload successful', description: file.name })
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e.message, variant: 'destructive' })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const actions = [
    { id: "voice", icon: Mic, action: () => setShowVoiceModal(true), title: "Voice Input" },
    { id: "camera", icon: Camera, action: () => setShowWebcamModal(true), title: "Webcam Capture" },
    { id: "screen", icon: Monitor, action: () => setShowScreenShareModal(true), title: "Screen Share" },
    { id: "upload", icon: Paperclip, action: () => fileInputRef.current?.click(), title: "Upload File" },
    { id: "video2app", icon: Youtube, action: () => setShowVideo2AppModal(true), title: "Video to App" },
  ]

  return (
    <div className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" data-testid="chat-footer">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end gap-2">
            {/* Main input area */}
            <div className="flex-1 relative">
              <Textarea
                data-testid="message-input"
                ref={(el) => {
                  // Set both refs to the same element
                  if (inputRef) {
                    if (typeof inputRef === 'function') {
                      inputRef(el)
                    } else {
                      inputRef.current = el
                    }
                  }
                  if (textareaRef && el) {
                    textareaRef.current = el
                  }
                }}
                value={input}
                onChange={handleLocalInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    e.currentTarget.closest("form")?.requestSubmit()
                  }
                }}
                onFocus={() => adjustHeight()}
                placeholder="Message..."
                className="resize-none border border-border rounded-2xl focus:border-primary/50 transition-colors w-full pl-4 pr-12 py-3 min-h-[46px] max-h-[200px] bg-background overflow-hidden"
              />
              
              {/* Upload progress indicator */}
              {isUploading && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full shadow-md">
                  Uploading: {uploadProgress}%
                </div>
              )}
              
              {/* Attachment button */}
              <div className="absolute right-2 bottom-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full text-muted-foreground hover:bg-muted"
                      data-testid="attachment-button"
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {actions.map((action) => (
                      <DropdownMenuItem 
                        key={action.id} 
                        onClick={action.action} 
                        className="gap-2 cursor-pointer"
                      >
                        <action.icon className="w-4 h-4" />
                        <span>{action.title}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Send button */}
            <Button 
              type="submit" 
              disabled={!input.trim() || isLoading} 
              size="icon"
              className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0"
            >
              <Send className="w-5 h-5" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Press F1 for shortcuts</span>
            <span>AI can make mistakes. Verify important information.</span>
          </div>
        </form>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      </div>
    </div>
  )
}
