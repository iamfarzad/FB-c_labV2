"use client"

import { useState, useRef, type KeyboardEvent } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Paperclip, Mic, CornerDownLeft, BarChart, Search, ImageIcon } from "lucide-react"

interface ChatComposerProps {
  onSendMessage: (message: string) => void
  onToolClick: (tool: string) => void
  isTyping: boolean
}

export function ChatComposer({ onSendMessage, onToolClick, isTyping }: ChatComposerProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (message.trim() && !isTyping) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t bg-background/95 p-4 backdrop-blur-sm shrink-0">
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything or type '/' for commands..."
            className="w-full resize-none rounded-xl border-2 border-input bg-background py-3 pl-12 pr-20 shadow-sm focus:border-primary"
            rows={1}
            disabled={isTyping}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Attach files</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Button onClick={handleSend} size="sm" disabled={!message.trim() || isTyping}>
              Send
              <CornerDownLeft className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              {[
                { icon: BarChart, label: "ROI Analysis", tool: "roi-analysis" },
                { icon: Search, label: "Lead Research", tool: "lead-research" },
                { icon: ImageIcon, label: "Image Generation", tool: "image-generation" },
                { icon: Mic, label: "Voice Input", tool: "voice-input" },
              ].map(({ icon: Icon, label, tool }) => (
                <Tooltip key={tool}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                      onClick={() => onToolClick(tool)}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{label}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{label}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
          <p className="text-xs text-muted-foreground">Press Shift + Enter for new line</p>
        </div>
      </div>
    </div>
  )
}
