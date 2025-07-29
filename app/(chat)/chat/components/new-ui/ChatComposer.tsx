"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, Smile, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface ChatComposerProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
}

export function ChatComposer({ onSendMessage, isLoading }: ChatComposerProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [message])

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about ROI analysis, lead generation, document analysis, or schedule a meeting..."
            className="min-h-[44px] max-h-[120px] resize-none pr-20"
            disabled={isLoading}
          />

          <div className="absolute right-2 bottom-2 flex gap-1">
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={isLoading}>
              <Paperclip className="h-4 w-4" />
            </Button>

            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={isLoading}>
              <Smile className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" size="icon" disabled={isLoading}>
            <Mic className="h-4 w-4" />
          </Button>

          <Button type="submit" disabled={!message.trim() || isLoading} className="shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>

      <div className="mt-2 text-xs text-muted-foreground text-center">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  )
}
