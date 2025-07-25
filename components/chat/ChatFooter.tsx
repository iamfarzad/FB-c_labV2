"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Camera, Mic, Paperclip, Play, Calculator, Monitor } from "lucide-react"
import { useToast } from '@/hooks/use-toast'
import { useAutoResizeTextarea } from "@/hooks/ui/use-auto-resize-textarea"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

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
  setShowROICalculatorModal: (show: boolean) => void
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
  setShowROICalculatorModal,
}: ChatFooterProps) {
  const [isMobile, setIsMobile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const attachRef = useRef<HTMLDivElement>(null)
  
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

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (attachRef.current && !attachRef.current.contains(e.target as Node)) {
        setShowAttachMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      setUploadProgress(0)
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsUploading(false)
            onFileUpload(file)
            return 100
          }
          return prev + 10
        })
      }, 100)
    }
  }

  const actions = [
    { id: "voice", icon: Mic, action: () => setShowVoiceModal(true), title: "Voice Input" },
    { id: "camera", icon: Camera, action: () => setShowWebcamModal(true), title: "Webcam Capture" },
    { id: "upload", icon: Paperclip, action: () => fileInputRef.current?.click(), title: "Upload File" },
    { id: "video2app", icon: Play, action: () => setShowVideo2AppModal(true), title: "Video2App Generator" },
    { id: "roi", icon: Calculator, action: () => setShowROICalculatorModal(true), title: "ROI Calculator" },
    { id: "screen-share", icon: Monitor, action: () => setShowScreenShareModal(true), title: "Screen Share" },
  ]

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="w-full border-t border-border/20 bg-background/60 backdrop-blur-xl glass-header shadow-lg shadow-black/5" 
      data-testid="chat-footer"
    >
      <div className="max-w-4xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          {/* Attachment Menu */}
          <div className="relative" ref={attachRef}>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400 }}
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="p-2 rounded-full hover:bg-accent/10 transition-colors shadow-sm hover:shadow-md"
            >
              <Paperclip size={20} />
            </motion.button>
            
            <AnimatePresence>
              {showAttachMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="absolute bottom-full left-0 mb-2 w-48 bg-card/90 backdrop-blur-xl border border-border/30 rounded-xl shadow-xl overflow-hidden"
                >
                  {actions.map((action) => (
                    <motion.button
                      key={action.id}
                      type="button"
                      whileHover={{ backgroundColor: "rgba(var(--accent), 0.1)" }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full text-left px-4 py-3 hover:bg-accent/10 flex items-center gap-3 transition-colors"
                      onClick={() => {
                        setShowAttachMenu(false)
                        action.action()
                      }}
                    >
                      <action.icon size={16} className="text-accent" />
                      {action.title}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input field with modern design */}
          <div className="flex-1 mx-4 relative">
            <motion.div
              className={cn(
                "relative rounded-2xl border border-border/30",
                "bg-card/50 backdrop-blur-sm",
                "focus-within:border-accent/50 focus-within:shadow-lg focus-within:shadow-accent/10",
                "transition-all duration-200"
              )}
            >
              <Textarea
                data-testid="message-input"
                ref={(el) => {
                  if (inputRef && el) {
                    inputRef.current = el
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
                placeholder="Ask anything..."
                className="resize-none bg-transparent outline-none placeholder-muted-foreground text-foreground w-full min-h-[46px] max-h-[200px] overflow-hidden px-4 py-3 rounded-2xl"
                style={{ lineHeight: '24px' }}
              />
            </motion.div>
            
            {/* Upload progress indicator */}
            {isUploading && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-8 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs px-3 py-1 rounded-full shadow-md"
              >
                Uploading: {uploadProgress}%
              </motion.div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {input.trim() ? (
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
                transition={{ type: "spring", stiffness: 400 }}
                className="p-3 rounded-full hover:bg-accent/10 transition-colors shadow-sm hover:shadow-md bg-accent text-accent-foreground"
              >
                <Send size={20} />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400 }}
                onClick={() => setShowVoiceModal(true)}
                className="p-3 rounded-full hover:bg-accent/10 transition-colors shadow-sm hover:shadow-md"
              >
                <Mic size={20} />
              </motion.button>
            )}
          </div>
        </form>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
      </div>
    </motion.div>
  )
}
