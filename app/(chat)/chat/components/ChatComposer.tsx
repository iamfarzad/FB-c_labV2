"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Send,
  Paperclip,
  DollarSign,
  Search,
  ImageIcon,
  Video,
  Camera,
  ScreenShare,
  Bot,
  Calendar,
  Upload,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ChatComposerProps {
  onSendMessage: (message: string) => void
  onToolClick: (tool: string) => void
  isTyping: boolean
}

export function ChatComposer({ onSendMessage, onToolClick, isTyping }: ChatComposerProps) {
  const [message, setMessage] = useState("")

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message)
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="relative p-4 border-t bg-background/95 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto flex items-end gap-2">
        <DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <Paperclip className="w-5 h-5 text-muted-foreground" />
                    <span className="sr-only">Attach files or use tools</span>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Attach files or use tools</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuItem onClick={() => onToolClick("roi-analysis")}>
              <DollarSign className="mr-2 h-4 w-4" />
              <span>ROI Analysis</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToolClick("lead-research")}>
              <Search className="mr-2 h-4 w-4" />
              <span>Lead Research</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToolClick("document-upload")}>
              <Upload className="mr-2 h-4 w-4" />
              <span>Document Upload</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToolClick("image-generation")}>
              <ImageIcon className="mr-2 h-4 w-4" />
              <span>Image Generation</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToolClick("video-sharing")}>
              <Video className="mr-2 h-4 w-4" />
              <span>Video Sharing</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToolClick("screen-sharing")}>
              <ScreenShare className="mr-2 h-4 w-4" />
              <span>Screen Sharing</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToolClick("webcam-access")}>
              <Camera className="mr-2 h-4 w-4" />
              <span>Webcam Access</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToolClick("model-selection")}>
              <Bot className="mr-2 h-4 w-4" />
              <span>Model Selection</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToolClick("meeting-scheduler")}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Meeting Scheduler</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          rows={1}
          className="min-h-[40px] resize-none pr-12"
          disabled={isTyping}
        />
        <Button
          type="submit"
          size="icon"
          className="absolute right-6 bottom-6 h-8 w-8"
          onClick={handleSend}
          disabled={!message.trim() || isTyping}
        >
          <Send className="w-4 h-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </div>
  )
}
