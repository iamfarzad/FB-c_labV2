"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Mic, ImageIcon, Upload, Video, Monitor, BarChart, Search } from "lucide-react"

interface ChatComposerProps {
  onSendMessage: (message: string) => void
  onToolClick: (tool: string) => void
  isLoading: boolean
}

export function ChatComposer({ onSendMessage, onToolClick, isLoading }: ChatComposerProps) {
  const [message, setMessage] = useState("")

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message)
      setMessage("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col gap-2 p-4 border-t border-slate-700 bg-slate-900">
      <div className="relative">
        <Textarea
          placeholder="Message F.B/c AI or @mention an agent..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[48px] w-full resize-none rounded-xl border border-slate-700 bg-slate-800 p-4 pr-16 text-slate-50 shadow-sm focus-visible:ring-slate-500"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-blue-600 text-white hover:bg-blue-700"
          onClick={handleSend}
          disabled={isLoading || !message.trim()}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-slate-400 hover:bg-slate-800 hover:text-slate-50"
            onClick={() => onToolClick("ROI Analysis")}
            disabled={isLoading}
          >
            <BarChart className="h-4 w-4" />
            ROI Analysis
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-slate-400 hover:bg-slate-800 hover:text-slate-50"
            onClick={() => onToolClick("Lead Research")}
            disabled={isLoading}
          >
            <Search className="h-4 w-4" />
            Lead Research
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-slate-400 hover:bg-slate-800 hover:text-slate-50"
            onClick={() => onToolClick("Image Generation")}
            disabled={isLoading}
          >
            <ImageIcon className="h-4 w-4" />
            Image Gen
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-slate-400 hover:bg-slate-800 hover:text-slate-50"
            onClick={() => onToolClick("Document Upload")}
            disabled={isLoading}
          >
            <Upload className="h-4 w-4" />
            Upload
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-slate-400 hover:bg-slate-800 hover:text-slate-50"
            onClick={() => onToolClick("Video Call")}
            disabled={isLoading}
          >
            <Video className="h-4 w-4" />
            Video
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-slate-400 hover:bg-slate-800 hover:text-slate-50"
            onClick={() => onToolClick("Screen Share")}
            disabled={isLoading}
          >
            <Monitor className="h-4 w-4" />
            Screen
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-400 hover:bg-slate-800 hover:text-slate-50"
          onClick={() => onToolClick("Voice Input")}
          disabled={isLoading}
        >
          <Mic className="h-4 w-4" />
          <span className="sr-only">Voice input</span>
        </Button>
      </div>
    </div>
  )
}
