"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Camera, Mic, Paperclip, Play, Calculator, Monitor, Sparkles, Zap, MessageSquare, FileText, ImageIcon } from "lucide-react"
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
  const [isFocused, setIsFocused] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { textareaRef: finalInputRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 48,
    maxHeight: 120
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
      description: "Speak your message",
      onClick: handleVoiceInput,
      disabled: !setShowVoiceModal && !onVoiceTranscript,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400"
    },
    {
      icon: Camera,
      label: "Webcam",
      description: "Take a photo",
      onClick: handleWebcamCapture,
      disabled: !setShowWebcamModal,
      color: "bg-green-500/10 text-green-600 dark:text-green-400"
    },
    {
      icon: Monitor,
      label: "Screen Share",
      description: "Share your screen",
      onClick: handleScreenShare,
      disabled: !setShowScreenShareModal,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400"
    },
    {
      icon: Play,
      label: "Video to App",
      description: "Convert video to app",
      onClick: handleVideo2App,
      disabled: !setShowVideo2AppModal,
      color: "bg-orange-500/10 text-orange-600 dark:text-orange-400"
    },
    {
      icon: Calculator,
      label: "ROI Calculator",
      description: "Calculate ROI",
      onClick: handleROICalculator,
      disabled: !setShowROICalculatorModal,
      color: "bg-red-500/10 text-red-600 dark:text-red-400"
    }
  ]

  return (
    <motion.div 
      className="chat-input-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <div className="chat-input-wrapper">
        <form onSubmit={handleSubmit} className="relative">
          {/* Main Input Area */}
          <div className="relative">
            <motion.div
              className={cn(
                "relative rounded-2xl border transition-all duration-200",
                "bg-background/80 backdrop-blur-sm",
                isFocused 
                  ? "border-accent/50 shadow-lg shadow-accent/10" 
                  : "border-border/50 hover:border-border/70",
                "focus-within:ring-2 focus-within:ring-accent/20 focus-within:ring-offset-2"
              )}
              animate={{
                scale: isFocused ? 1.02 : 1,
                y: isFocused ? -2 : 0
              }}
              transition={{ duration: 0.2 }}
            >
              <Textarea
                ref={finalInputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Ask anything about AI automation, business analysis, or upload a document..."
                className={cn(
                  "resize-none min-h-[48px] max-h-32 border-0 bg-transparent",
                  "focus:ring-0 focus:border-0 focus:outline-none",
                  "placeholder:text-muted-foreground/70",
                  "text-sm leading-relaxed text-readable",
                  "px-4 py-3 pr-24", // Extra padding for buttons
                  "rounded-2xl"
                )}
                disabled={isLoading}
              />

              {/* Tool Menu Button */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-full hover:bg-accent/10 transition-all duration-200"
                    onClick={() => setShowToolMenu(!showToolMenu)}
                    disabled={isLoading}
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                </motion.div>

                {/* Send Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Button
                    type="submit"
                    size="icon"
                    className={cn(
                      "w-8 h-8 rounded-full transition-all duration-200",
                      input.trim() && !isLoading
                        ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                    disabled={!input.trim() || isLoading}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Tool Menu Dropdown */}
            <AnimatePresence>
              {showToolMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full left-0 mb-2 bg-card border border-border/50 rounded-xl shadow-xl p-3 z-50 min-w-[280px]"
                >
                  <div className="grid grid-cols-1 gap-2">
                    {toolButtons.map((tool, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          className={cn(
                            "h-auto p-3 flex items-center gap-3 text-left rounded-lg hover:bg-accent/5 transition-all duration-200",
                            tool.color
                          )}
                          onClick={tool.onClick}
                          disabled={tool.disabled || isLoading}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            tool.color
                          )}>
                            <tool.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{tool.label}</div>
                            <div className="text-xs text-muted-foreground">{tool.description}</div>
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
        </form>

        {/* Character Count and Status */}
        <motion.div 
          className="flex items-center justify-between mt-3 text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center gap-4">
            <span className={cn(
              "transition-colors font-medium",
              input.length > 4000 ? "text-destructive" : ""
            )}>
              {input.length}/4000
            </span>
            {isLoading && (
              <motion.span 
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span>AI is responding...</span>
              </motion.span>
            )}
          </div>
          <div className="text-xs opacity-60 flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            Press Enter to send, Shift+Enter for new line
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
