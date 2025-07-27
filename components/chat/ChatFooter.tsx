"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Camera, Mic, Paperclip, Play, Calculator, Monitor, Plus, X, Sparkles, Zap, FileText, Image as ImageIcon } from "lucide-react"
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
    minHeight: 52,
    maxHeight: 160
  })

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault()
      if (input.trim() && !isLoading) {
        handleSubmit(e as any)
        setShowToolMenu(false)
      }
    }
    if (e.key === 'Escape') {
      setShowToolMenu(false)
    }
  }

  // Auto-resize when input changes
  useEffect(() => {
    adjustHeight()
  }, [input, adjustHeight])

  // Close tool menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showToolMenu && !target.closest('[data-tool-menu]')) {
        setShowToolMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showToolMenu])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onFileUpload) {
      onFileUpload(file)
      setShowToolMenu(false)
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
        setShowToolMenu(false)
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
      setShowToolMenu(false)
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
      setShowToolMenu(false)
    }
  }, [setShowWebcamModal])

  const handleScreenShare = useCallback(() => {
    if (setShowScreenShareModal) {
      setShowScreenShareModal(true)
      setShowToolMenu(false)
    }
  }, [setShowScreenShareModal])

  const handleVideo2App = useCallback(() => {
    if (setShowVideo2AppModal) {
      setShowVideo2AppModal(true)
      setShowToolMenu(false)
    }
  }, [setShowVideo2AppModal])

  const handleROICalculator = useCallback(() => {
    if (setShowROICalculatorModal) {
      setShowROICalculatorModal(true)
      setShowToolMenu(false)
    }
  }, [setShowROICalculatorModal])

  const toolButtons = [
    {
      icon: FileText,
      label: "Upload Document",
      description: "PDF, DOC, TXT files",
      onClick: () => fileInputRef.current?.click(),
      disabled: !onFileUpload,
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: ImageIcon,
      label: "Upload Image",
      description: "JPG, PNG, GIF files",
      onClick: () => imageInputRef.current?.click(),
      disabled: !onImageUpload,
      color: "from-green-500 to-green-600"
    },
    {
      icon: Mic,
      label: "Voice Input",
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
      disabled: !setShowVideo2AppModal,
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
      className="border-t border-border/30 bg-card/80 backdrop-blur-2xl relative z-20"
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

      <div className="max-w-4xl mx-auto p-4 relative z-10">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          {/* Enhanced Tool Menu Button */}
          <div className="relative" data-tool-menu>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={cn(
                  "shrink-0 w-12 h-12 rounded-xl border-border/30 backdrop-blur-sm transition-all duration-300",
                  showToolMenu 
                    ? "bg-accent/10 border-accent/30 text-accent" 
                    : "hover:bg-accent/5 hover:border-accent/20"
                )}
                onClick={() => setShowToolMenu(!showToolMenu)}
                disabled={isLoading}
              >
                <motion.div
                  animate={{ rotate: showToolMenu ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {showToolMenu ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </motion.div>
              </Button>
            </motion.div>

            {/* Enhanced Tool Menu Dropdown */}
            <AnimatePresence>
              {showToolMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute bottom-full left-0 mb-3 bg-card/95 backdrop-blur-2xl border border-border/30 rounded-2xl shadow-2xl p-3 z-50 min-w-[320px]"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/20">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-accent" />
                      <span className="font-semibold text-sm text-foreground">AI Tools</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Choose an option</span>
                  </div>

                  {/* Tool Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {toolButtons.map((tool, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.2 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          className={cn(
                            "h-auto p-3 flex flex-col items-start gap-2 text-left w-full rounded-xl",
                            "hover:bg-accent/5 border border-transparent hover:border-accent/20",
                            "transition-all duration-200 group",
                            tool.disabled && "opacity-50 cursor-not-allowed"
                          )}
                          onClick={tool.onClick}
                          disabled={tool.disabled || isLoading}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <div className={cn(
                              "w-8 h-8 rounded-lg bg-gradient-to-r flex items-center justify-center shadow-sm",
                              "group-hover:shadow-md transition-shadow",
                              tool.color
                            )}>
                              <tool.icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-xs text-foreground truncate">
                                {tool.label}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {tool.description}
                              </div>
                            </div>
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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

          {/* Enhanced Main Input Area */}
          <div className="flex-1 relative">
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
              <Textarea
                ref={finalInputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                placeholder="Ask anything about AI automation, business analysis, or upload a document..."
                className={cn(
                  "resize-none min-h-[52px] max-h-40 border-0 bg-transparent",
                  "focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                  "placeholder:text-muted-foreground/60 text-sm leading-relaxed",
                  "px-4 py-3"
                )}
                disabled={isLoading}
              />

              {/* Input Enhancement Overlay */}
              {isFocused && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent/5 pointer-events-none rounded-2xl"
                />
              )}
            </motion.div>
          </div>

          {/* Enhanced Send Button */}
          <motion.div
            whileHover={{ scale: canSend ? 1.05 : 1 }}
            whileTap={{ scale: canSend ? 0.95 : 1 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Button
              type="submit"
              size="icon"
              className={cn(
                "shrink-0 w-12 h-12 rounded-xl transition-all duration-300",
                canSend
                  ? "bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 shadow-lg hover:shadow-xl text-accent-foreground"
                  : "bg-muted/50 text-muted-foreground cursor-not-allowed"
              )}
              disabled={!canSend}
            >
              <motion.div
                animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                transition={isLoading ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
              >
                {isLoading ? (
                  <Zap className="w-5 h-5" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </motion.div>
            </Button>
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
