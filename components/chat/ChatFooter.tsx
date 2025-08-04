"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
// Consolidated Phosphor icons imports
import { 
  Send, Camera, Mic, Paperclip, Play, Calculator, Monitor, Plus, X, 
  Sparkles, Zap, FileText, ImageIcon, ChevronDown 
} from "@/lib/icon-mapping"

// Hooks and Utils
import { useToast } from '@/hooks/use-toast'
import { cn } from "@/lib/utils"

// External Libraries
import { motion, AnimatePresence } from "framer-motion"

// UI Components
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault()
      if (input.trim() && !isLoading) {
        handleSubmit(e as any)
      }
    }
    if (e.key === 'Escape') {
      e.currentTarget.blur()
    }
  }

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onFileUpload) {
      onFileUpload(file)
    }
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
    if (event.target) {
      event.target.value = ''
    }
  }, [onImageUpload])

  const handleVoiceInput = useCallback(() => {
    if (setShowVoiceModal) {
      setShowVoiceModal(true)
    } else if (onVoiceTranscript) {
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
    } else {
      // Fallback to new tab if modal not available
      window.open('/video-learning-tool', '_blank')
    }
  }, [setShowVideo2AppModal])

  const handleROICalculator = useCallback(() => {
    if (setShowROICalculatorModal) {
      setShowROICalculatorModal(true)
    }
  }, [setShowROICalculatorModal])

  // Upload tools for dropdown
  const uploadTools = [
    {
      icon: FileText,
      label: "Upload Document",
      description: "PDF, DOC, TXT files",
      onClick: () => fileInputRef.current?.click(),
      disabled: !onFileUpload,
      color: "text-blue-500"
    },
    {
      icon: ImageIcon,
      label: "Upload Image",
      description: "JPG, PNG, GIF files",
      onClick: () => imageInputRef.current?.click(),
      disabled: !onImageUpload,
      color: "text-green-500"
    }
  ]

  // Main visible tools (reduced from 7 to 5 + dropdown)
  const toolButtons = [
    {
      icon: Mic,
      label: "Voice",
      description: "Speak your message",
      onClick: handleVoiceInput,
      disabled: !setShowVoiceModal && !onVoiceTranscript,
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Camera,
      label: "Webcam",
      description: "Capture from camera",
      onClick: handleWebcamCapture,
      disabled: !setShowWebcamModal,
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: Monitor,
      label: "Screen Share",
      description: "Share your screen",
      onClick: handleScreenShare,
      disabled: !setShowScreenShareModal,
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: Play,
      label: "Video to App",
      description: "Convert video to app",
      onClick: handleVideo2App,
      disabled: false,
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: Calculator,
      label: "ROI Calculator",
      description: "Calculate returns",
      onClick: handleROICalculator,
      disabled: !setShowROICalculatorModal,
      color: "from-teal-500 to-teal-600"
    }
  ]

  const canSend = input.trim() && !isLoading

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-20"
    >
      {/* Enhanced background with subtle animation */}
      <motion.div
        animate={{
          background: isFocused 
            ? "linear-gradient(90deg, transparent, rgba(255,165,0,0.02), transparent)"
            : "linear-gradient(90deg, transparent, rgba(255,165,0,0.01), transparent)"
        }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 pointer-events-none"
      />

      <div className="max-w-4xl mx-auto px-2 sm:px-4 md:px-6 py-2 sm:py-4 relative z-10">
        <form onSubmit={handleSubmit}>
          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.doc,.docx,.md,.csv,.json"
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

          {/* Clean Input Container with Tool Pills Only */}
          <motion.div
            animate={{
              borderColor: isFocused ? "hsl(var(--accent))" : "hsl(var(--border))",
              boxShadow: isFocused 
                ? "0 0 0 3px hsl(var(--accent) / 0.1)" 
                : "0 1px 3px rgba(0,0,0,0.1)"
            }}
            transition={{ duration: 0.2 }}
            className="relative rounded-2xl border bg-card/50 backdrop-blur-sm overflow-hidden"
          >
            {/* Tool Pills Row */}
            <div className="flex items-center gap-1.5 px-3 pt-2.5 pb-1.5 border-b border-border/10">
              {/* Upload Dropdown */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 px-3 rounded-full border border-border/30 bg-muted/40",
                        "hover:bg-accent/10 hover:border-accent/30 text-xs font-medium",
                        "transition-all duration-200 whitespace-nowrap"
                      )}
                      disabled={isLoading}
                    >
                      <Plus className="w-3 h-3 mr-1.5" />
                      Upload
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {uploadTools.map((tool, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={tool.onClick}
                        disabled={tool.disabled}
                        className="gap-3 cursor-pointer"
                      >
                        <tool.icon className={`w-4 h-4 ${tool.color}`} />
                        <div className="flex flex-col">
                          <span className="font-medium">{tool.label}</span>
                          <span className="text-xs text-muted-foreground">{tool.description}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>

              {/* Main Tool Pills */}
              {toolButtons.map((tool, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (index + 1) * 0.05, duration: 0.2 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 px-3 rounded-full border border-border/30 bg-muted/40",
                      "hover:bg-accent/10 hover:border-accent/30 text-xs font-medium",
                      "transition-all duration-200 whitespace-nowrap",
                      tool.disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={tool.onClick}
                    disabled={tool.disabled || isLoading}
                    aria-label={tool.description}
                    title={tool.description}
                  >
                    <tool.icon className="w-3 h-3 mr-1.5" />
                    {tool.label.replace(' Input', '').replace(' Capture', '')}
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* Input Area - Clean without duplicate buttons */}
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                placeholder="Ask anything about AI automation, business analysis, or upload a document..."
                                  className={cn(
                    "resize-none min-h-[48px] max-h-36 border-0 bg-transparent",
                    "focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                    "placeholder:text-muted-foreground/60 text-sm leading-relaxed",
                    "pl-3 pr-12 py-2.5" // Optimized padding for better spacing
                  )}
                disabled={isLoading}
              />

              {/* Right Send Button Only */}
              <motion.div
                className="absolute right-3 bottom-3"
                whileHover={{ scale: canSend ? 1.05 : 1 }}
                whileTap={{ scale: canSend ? 0.95 : 1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Button
                  type="submit"
                  size="icon"
                  className={cn(
                    "w-8 h-8 rounded-lg transition-all duration-300",
                    canSend
                      ? "bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 shadow-md hover:shadow-lg text-accent-foreground"
                      : "bg-muted/50 text-muted-foreground cursor-not-allowed"
                  )}
                  disabled={!canSend}
                >
                  <motion.div
                    animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                    transition={isLoading ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
                  >
                    {isLoading ? (
                      <Zap className="w-4 h-4" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </motion.div>
                </Button>
              </motion.div>

              {/* Input Enhancement Overlay */}
              {isFocused && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent/5 pointer-events-none rounded-2xl"
                />
              )}
            </div>
          </motion.div>
        </form>

        {/* Enhanced Status Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mt-3 text-xs text-muted-foreground"
        >
          <div className="flex items-center gap-4">
            <motion.span 
              animate={{
                color: input.length > 4000 ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))"
              }}
              className="font-mono"
            >
              {input.length}/4000
            </motion.span>
            
            {isLoading && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                <motion.div
                  animate={{ 
                    opacity: [0.4, 1, 0.4],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 bg-accent rounded-full"
                />
                AI is processing your request...
              </motion.span>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-xs opacity-60">
            <span className="hidden sm:inline">Press Enter to send</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Shift+Enter for new line</span>
            {showToolMenu && (
              <>
                <span>•</span>
                <span>ESC to close menu</span>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
