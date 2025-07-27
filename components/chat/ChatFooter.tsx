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
  onFileUpload?: (file: File) => void
  onImageUpload?: (imageData: string, fileName: string) => void
  onVoiceTranscript?: (transcript: string) => void
  inputRef?: React.RefObject<HTMLTextAreaElement>
  showVoiceModal?: boolean
  setShowVoiceModal?: (show: boolean) => void
  showWebcamModal?: boolean
  setShowWebcamModal?: (show: boolean) => void
  showScreenShareModal?: boolean
  setShowScreenShareModal?: (show: boolean) => void
  setShowVideo2AppModal?: (show: boolean) => void
  setShowROICalculatorModal?: (show: boolean) => void
}

export function ChatFooter({
  input,
  setInput,
  handleInputChange,
  handleSubmit,
  isLoading,
  onFileUpload,
  onImageUpload,
  onVoiceTranscript,
  inputRef,
  showVoiceModal,
  setShowVoiceModal,
  showWebcamModal,
  setShowWebcamModal,
  showScreenShareModal,
  setShowScreenShareModal,
  setShowVideo2AppModal,
  setShowROICalculatorModal
}: ChatFooterProps) {
  const { toast } = useToast()
  const [isComposing, setIsComposing] = useState(false)
  const [showToolMenu, setShowToolMenu] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { textareaRef: finalInputRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 44,
    maxHeight: 128
  })

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault()
      if (input.trim() && !isLoading) {
        handleSubmit(e as any)
      }
    }
  }

  // Auto-resize when input changes
  useEffect(() => {
    adjustHeight()
  }, [input, adjustHeight])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onFileUpload) {
      onFileUpload(file)
    }
    // Reset input
    if (event.target) {
      event.target.value = ''
    }
  }, [onFileUpload])

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onImageUpload) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        onImageUpload(result, file.name)
      }
      reader.readAsDataURL(file)
    }
    // Reset input
    if (event.target) {
      event.target.value = ''
    }
  }, [onImageUpload])

  const handleVoiceInput = useCallback(() => {
    if (setShowVoiceModal) {
      setShowVoiceModal(true)
    } else if (onVoiceTranscript) {
      // Fallback to direct voice input
      toast({
        title: "Voice Input",
        description: "Voice input is not available in this mode.",
        variant: "destructive"
      })
    }
  }, [setShowVoiceModal, onVoiceTranscript, toast])

  const handleWebcamCapture = useCallback(() => {
    if (setShowWebcamModal) {
      setShowWebcamModal(true)
    }
  }, [setShowWebcamModal])

  const handleScreenShare = useCallback(() => {
    if (setShowScreenShareModal) {
      setShowScreenShareModal(true)
    }
  }, [setShowScreenShareModal])

  const handleVideo2App = useCallback(() => {
    if (setShowVideo2AppModal) {
      setShowVideo2AppModal(true)
    }
  }, [setShowVideo2AppModal])

  const handleROICalculator = useCallback(() => {
    if (setShowROICalculatorModal) {
      setShowROICalculatorModal(true)
    }
  }, [setShowROICalculatorModal])

  const toolButtons = [
    {
      icon: Mic,
      label: "Voice Input",
      onClick: handleVoiceInput,
      disabled: !setShowVoiceModal && !onVoiceTranscript
    },
    {
      icon: Camera,
      label: "Webcam",
      onClick: handleWebcamCapture,
      disabled: !setShowWebcamModal
    },
    {
      icon: Monitor,
      label: "Screen Share",
      onClick: handleScreenShare,
      disabled: !setShowScreenShareModal
    },
    {
      icon: Play,
      label: "Video to App",
      onClick: handleVideo2App,
      disabled: !setShowVideo2AppModal
    },
    {
      icon: Calculator,
      label: "ROI Calculator",
      onClick: handleROICalculator,
      disabled: !setShowROICalculatorModal
    }
  ]

  return (
    <div className="border-t border-border/50 bg-background/95 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          {/* Tool Menu Button */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 w-10 h-10"
            onClick={() => setShowToolMenu(!showToolMenu)}
            disabled={isLoading}
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          {/* Tool Menu Dropdown */}
          <AnimatePresence>
            {showToolMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full left-4 mb-2 bg-card border border-border rounded-lg shadow-lg p-2 z-50"
              >
                <div className="grid grid-cols-2 gap-2">
                  {toolButtons.map((tool, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-2 flex flex-col items-center gap-1 text-xs"
                      onClick={tool.onClick}
                      disabled={tool.disabled || isLoading}
                    >
                      <tool.icon className="w-4 h-4" />
                      <span>{tool.label}</span>
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* File Upload Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Main Input Area */}
          <div className="flex-1 relative">
            <Textarea
              ref={finalInputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder="Ask anything about AI automation, business analysis, or upload a document..."
              className={cn(
                "input-minimal resize-none min-h-[44px] max-h-32",
                "focus:ring-2 focus:ring-accent/20 focus:ring-offset-2",
                "placeholder:text-muted-foreground/70",
                "text-sm leading-relaxed"
              )}
              disabled={isLoading}
            />
          </div>

          {/* Send Button */}
          <Button
            type="submit"
            size="icon"
            className="shrink-0 w-10 h-10 btn-primary"
            disabled={!input.trim() || isLoading}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>

        {/* Character Count and Status */}
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className={cn(
              "transition-colors",
              input.length > 4000 ? "text-destructive" : ""
            )}>
              {input.length}/4000
            </span>
            {isLoading && (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                AI is responding...
              </span>
            )}
          </div>
          <div className="text-xs opacity-60">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  )
}
