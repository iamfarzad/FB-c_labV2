"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip, Smile } from "lucide-react"
import { useAutoResizeTextarea } from "@/hooks/ui/use-auto-resize-textarea"

interface ChatComposerProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
}

export function ChatComposer({ onSendMessage, isLoading }: ChatComposerProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useAutoResizeTextarea(textareaRef, message)

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

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about ROI calculations, lead research, document analysis, or anything else..."
            className="min-h-[60px] max-h-[200px] resize-none pr-12 py-3"
            disabled={isLoading}
          />
          <div className="absolute right-3 bottom-3 flex gap-1">
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Smile className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">Press Enter to send, Shift+Enter for new line</div>
          <Button type="submit" disabled={!message.trim() || isLoading} className="h-9 px-4">
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </div>
      </form>
    </div>
  )
}
