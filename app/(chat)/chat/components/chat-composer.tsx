"use client"

import * as React from "react"
import { Paperclip, Mic, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ChatComposerProps {
  input: string
  setInput: (value: string) => void
  isLoading: boolean
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export function ChatComposer({ input, setInput, isLoading, onSubmit }: ChatComposerProps) {
  const inputRef = React.useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      // Safe to assume form is parent
      inputRef.current?.closest("form")?.requestSubmit()
    }
  }

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`
    }
  }, [input])

  return (
    <TooltipProvider>
      <form onSubmit={onSubmit} className="relative flex w-full items-start gap-4 rounded-xl border bg-background p-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="shrink-0">
              <Paperclip className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Attach file</TooltipContent>
        </Tooltip>
        <Textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything..."
          className="max-h-32 min-h-[24px] flex-1 resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
          rows={1}
          disabled={isLoading}
        />
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="shrink-0">
                <Mic className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Use microphone</TooltipContent>
          </Tooltip>
          <Button type="submit" size="icon" className="shrink-0" disabled={isLoading || !input.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </TooltipProvider>
  )
}
