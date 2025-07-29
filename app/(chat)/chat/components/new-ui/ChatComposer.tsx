"use client"

import type React from "react"
import { useRef } from "react"
import { Paperclip, Mic, SendHorizontal, Webcam, ScreenShare } from "lucide-react"
import { useChatContext } from "@/app/(chat)/chat/context/ChatProvider"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAutoResizeTextarea } from "@/hooks/ui/use-auto-resize-textarea"

export function ChatComposer() {
  const { input, handleInputChange, handleSubmit, openModal, isLoading } = useChatContext()
  const formRef = useRef<HTMLFormElement>(null)
  const textareaRef = useAutoResizeTextarea(input)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      formRef.current?.requestSubmit()
    }
  }

  return (
    <TooltipProvider delayDuration={0}>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="relative flex w-full items-start gap-2 rounded-lg border bg-background p-2 shadow-sm"
      >
        <div className="flex gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground"
                onClick={() => document.getElementById("file-input")?.click()}
                disabled={isLoading}
              >
                <Paperclip className="h-5 w-5" />
                <span className="sr-only">Attach file</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Attach file</TooltipContent>
          </Tooltip>
          <input id="file-input" type="file" className="hidden" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground"
                onClick={() => openModal("voiceInput")}
                disabled={isLoading}
              >
                <Mic className="h-5 w-5" />
                <span className="sr-only">Use Microphone</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Use Microphone</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground"
                onClick={() => openModal("webcam")}
                disabled={isLoading}
              >
                <Webcam className="h-5 w-5" />
                <span className="sr-only">Use Webcam</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Use Webcam</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground"
                onClick={() => openModal("screenShare")}
                disabled={isLoading}
              >
                <ScreenShare className="h-5 w-5" />
                <span className="sr-only">Share Screen</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share Screen</TooltipContent>
          </Tooltip>
        </div>
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything..."
          className="min-h-[44px] flex-1 resize-none border-0 bg-transparent p-2 shadow-none focus-visible:ring-0"
          rows={1}
          disabled={isLoading}
        />
        <div className="flex items-center self-end">
          <Button type="submit" size="icon" className="shrink-0" disabled={isLoading || !input.trim()}>
            <SendHorizontal className="h-5 w-5" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </form>
    </TooltipProvider>
  )
}
