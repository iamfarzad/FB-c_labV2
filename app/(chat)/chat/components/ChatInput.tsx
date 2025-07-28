"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Camera, Mic, Paperclip, Play, Calculator, Monitor } from "lucide-react"
import { useAutoResizeTextarea } from "@/hooks/ui/use-auto-resize-textarea"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import type { ModalType } from "../hooks/useModalManager"

interface ChatInputProps {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  onFileUpload: (file: File) => void
  onImageUpload: (imageData: string, fileName: string) => void
  openModal: (modal: ModalType) => void
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  onFileUpload,
  onImageUpload,
  openModal,
}: ChatInputProps) {
  const [isComposing, setIsComposing] = useState(false)
  const [showToolMenu, setShowToolMenu] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const { textareaRef: finalInputRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 44, maxHeight: 128 })

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault()
      if (input.trim() && !isLoading) {
        handleSubmit(e as any)
      }
    }
  }

  useEffect(() => {
    adjustHeight()
  }, [input, adjustHeight])

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) onFileUpload(file)
      if (event.target) event.target.value = ""
    },
    [onFileUpload],
  )

  const handleImageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => onImageUpload(e.target?.result as string, file.name)
        reader.readAsDataURL(file)
      }
      if (event.target) event.target.value = ""
    },
    [onImageUpload],
  )

  const toolButtons = [
    { icon: Mic, label: "Voice Input", onClick: () => openModal("voiceInput") },
    { icon: Camera, label: "Webcam", onClick: () => openModal("webcam") },
    { icon: Monitor, label: "Screen Share", onClick: () => openModal("screenShare") },
    { icon: Play, label: "Video to App", onClick: () => openModal("video2App") },
    { icon: Calculator, label: "ROI Calculator", onClick: () => openModal("roiCalculator") },
  ]

  return (
    <footer className="border-t border-border/50 bg-background/95 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 w-10 h-10 bg-transparent"
              onClick={() => setShowToolMenu(!showToolMenu)}
              disabled={isLoading}
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <AnimatePresence>
              {showToolMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full left-0 mb-2 bg-card border border-border rounded-lg shadow-lg p-2 z-50 w-48"
                  onMouseLeave={() => setShowToolMenu(false)}
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
                        disabled={isLoading}
                      >
                        <tool.icon className="w-4 h-4" />
                        <span>{tool.label}</span>
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
          <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />

          <div className="flex-1 relative">
            <Textarea
              ref={finalInputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder="Ask anything about AI automation, business analysis, or upload a document..."
              className="input-minimal resize-none min-h-[44px] max-h-32 focus:ring-2 focus:ring-accent/20 focus:ring-offset-2 placeholder:text-muted-foreground/70 text-sm leading-relaxed"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            size="icon"
            className="shrink-0 w-10 h-10 btn-primary"
            disabled={!input.trim() || isLoading}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span className={cn("transition-colors", input.length > 4000 ? "text-destructive" : "")}>
            {input.length}/4000
          </span>
          <div className="text-xs opacity-60">Press Enter to send, Shift+Enter for new line</div>
        </div>
      </div>
    </footer>
  )
}
