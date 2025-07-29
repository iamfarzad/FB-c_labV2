"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, Smile, Mic, Camera } from "lucide-react"
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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
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
            placeholder="Ask me anything about your business..."
            className="min-h-[44px] max-h-32 resize-none pr-12"
            disabled={isLoading}
          />
          <div className="absolute right-2 top-2 flex gap-1">
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Smile className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-1">
          <Button type="button" variant="outline" size="icon" className="shrink-0 bg-transparent">
            <Mic className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" size="icon" className="shrink-0 bg-transparent">
            <Camera className="h-4 w-4" />
          </Button>
          <Button type="submit" size="icon" disabled={!message.trim() || isLoading} className="shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
