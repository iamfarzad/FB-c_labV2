"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Paperclip, Mic, CornerDownLeft } from "lucide-react"

interface ChatComposerProps {
  onSend: (content: string) => void
}

export function ChatComposer({ onSend }: ChatComposerProps) {
  const [inputValue, setInputValue] = useState("")

  const handleSend = () => {
    if (inputValue.trim()) {
      onSend(inputValue)
      setInputValue("")
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="relative">
      <Textarea
        placeholder="Type your message here..."
        className="w-full resize-none pr-32"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="absolute bottom-2 right-2 flex items-center space-x-2">
        <Button variant="ghost" size="icon">
          <Paperclip className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Mic className="h-5 w-5" />
        </Button>
        <Button size="sm" onClick={handleSend}>
          Send <CornerDownLeft className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
