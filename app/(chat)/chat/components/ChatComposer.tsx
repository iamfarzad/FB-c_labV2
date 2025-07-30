"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Mic, Video, Monitor, Upload, BarChart, Search, Zap, ImageIcon } from "lucide-react"

interface ChatComposerProps {
  onSendMessage: (message: string) => void
  onToolClick: (tool: string) => void
  isTyping: boolean
}

const ActionButton = ({
  icon: Icon,
  label,
  onClick,
}: { icon: React.ElementType; label: string; onClick: () => void }) => (
  <Button
    variant="ghost"
    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground h-8 px-3"
    onClick={onClick}
  >
    <Icon className="h-4 w-4" />
    <span className="text-sm font-medium">{label}</span>
  </Button>
)

export function ChatComposer({ onSendMessage, onToolClick, isTyping }: ChatComposerProps) {
  const [message, setMessage] = useState("")

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message)
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-border/60 bg-background/95 backdrop-blur-sm p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-background border border-border rounded-2xl p-2 shadow-sm">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Message F.B/c AI or @mention an agent..."
            className="w-full p-4 text-base bg-transparent border-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={isTyping}
          />
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
            <div className="flex items-center gap-1 flex-wrap">
              <ActionButton icon={BarChart} label="ROI Analysis" onClick={() => onToolClick("ROI Analysis")} />
              <ActionButton icon={Search} label="Lead Research" onClick={() => onToolClick("Lead Research")} />
              <ActionButton icon={Zap} label="Automate" onClick={() => onToolClick("Automation")} />
              <ActionButton icon={ImageIcon} label="Image Gen" onClick={() => onToolClick("Image Generation")} />
              <ActionButton icon={Upload} label="Upload" onClick={() => onToolClick("Document Upload")} />
              {/* Removed the following line */}
              {/* <ActionButton icon={Plus} label="Multi-Panel" onClick={() => onToolClick("Multi-Panel")} /> */}
              <ActionButton icon={Video} label="Video" onClick={() => onToolClick("Video Call")} />
              <ActionButton icon={Monitor} label="Screen" onClick={() => onToolClick("Screen Share")} />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Mic className="h-5 w-5" />
              </Button>
              <Button
                onClick={handleSend}
                disabled={!message.trim() || isTyping}
                className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
