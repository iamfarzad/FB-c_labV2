"use client"

import type React from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { SendHorizonal, Loader2 } from "lucide-react"
import { useAutoResizeTextarea } from "@/hooks/ui/use-auto-resize-textarea"
import { useRef } from "react"

interface InputWithSendProps {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
}

export function InputWithSend({ input, handleInputChange, handleSubmit, isLoading }: InputWithSendProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  useAutoResizeTextarea(textAreaRef.current, input)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any) // FormEvent is expected, but we can simulate
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex items-end gap-2 relative">
      <Textarea
        ref={textAreaRef}
        rows={1}
        placeholder="Ask a question or type '/' for commands..."
        className="py-3 px-4 resize-none pr-12"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        aria-label="Chat input"
      />
      <Button
        type="submit"
        size="icon"
        className="absolute right-2 bottom-2 w-8 h-8 shrink-0"
        disabled={isLoading || !input.trim()}
        aria-label="Send message"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendHorizonal className="w-4 h-4" />}
      </Button>
    </form>
  )
}
