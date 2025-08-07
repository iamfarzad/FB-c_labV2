"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import PillInput from "@/components/ui/PillInput"
import { ToolMenu } from "@/components/chat/ToolMenu"
// Consolidated Phosphor icons imports
import { Send, Zap } from "@/lib/icon-mapping"

// Hooks and Utils
import { useToast } from '@/hooks/use-toast'
import { cn } from "@/lib/utils"

// External Libraries
import { motion, AnimatePresence } from "framer-motion"

// UI Components

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
  voiceDraft?: string
  onClearVoiceDraft?: () => void
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
  setShowROICalculatorModal,
  voiceDraft,
  onClearVoiceDraft
}: ChatFooterProps) {
  const { toast } = useToast()
  const [isComposing, setIsComposing] = useState(false)
  const [showToolMenu] = useState(false)
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

  // Legacy tool definitions removed; ToolMenu handles tools from the plus button

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
            ? "linear-gradient(90deg, transparent, hsl(var(--accent) / 0.02), transparent)"
            : "linear-gradient(90deg, transparent, hsl(var(--accent) / 0.01), transparent)"
        }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 pointer-events-none"
      />

      <div className="mx-auto w-full max-w-7xl px-2 sm:px-4 md:px-6 py-2 sm:py-4 relative z-10">
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

          <PillInput
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onSubmit={(e) => {
              e.preventDefault()
              if (canSend) handleSubmit(e)
            }}
            placeholder="Ask anything..."
            disabled={isLoading}
            waveformChip={voiceDraft ? (
              <div className="hidden sm:flex items-center h-7 px-2 rounded-full bg-accent/10 text-accent text-xs border border-accent/20">
                <span className="mr-1">🎤</span>
                <span className="truncate max-w-[140px]">{voiceDraft}</span>
              </div>
            ) : undefined}
            leftSlot={
              <div className="flex items-center gap-2">
                <ToolMenu
                  onUploadDocument={() => fileInputRef.current?.click()}
                  onUploadImage={() => imageInputRef.current?.click()}
                  onWebcam={handleWebcamCapture}
                  onScreenShare={handleScreenShare}
                  onROI={handleROICalculator}
                  disabled={isLoading}
                />
                {voiceDraft && (
                  <button
                    type="button"
                    onClick={onClearVoiceDraft}
                    className="hidden sm:inline-flex items-center h-7 px-2 rounded-full bg-muted text-xs text-foreground/80 border border-border/40"
                    aria-label="Clear voice draft"
                  >
                    •••
                    <span className="ml-1 truncate max-w-[120px]">{voiceDraft}</span>
                  </button>
                )}
              </div>
            }
            rightSlot={
              <motion.div whileHover={{ scale: canSend ? 1.05 : 1 }} whileTap={{ scale: canSend ? 0.95 : 1 }}>
                <Button
                  type="submit"
                  size="icon"
                  className={cn(
                    "w-9 h-9 rounded-full transition-all duration-300 shadow-sm",
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
                    {isLoading ? <Zap className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                  </motion.div>
                </Button>
              </motion.div>
            }
          />
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
            {/* no persistent tool menu hints */}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
