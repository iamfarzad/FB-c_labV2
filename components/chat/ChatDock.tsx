"use client"

import React, { useState } from "react"
import { AIEChat } from "@/components/chat/AIEChat"
import { Button } from "@/components/ui/button"
import { Mic, X } from "lucide-react"
import { cn } from "@/lib/utils"
import VoiceOverlay from "@/components/chat/VoiceOverlay"

interface ChatDockProps {
  className?: string
}

export function ChatDock({ className }: ChatDockProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [showVoice, setShowVoice] = useState(false)

  return (
    <div
      className={cn(
        // container
        "border-t bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60",
        "rounded-t-2xl shadow-2xl border-border/60",
        className
      )}
    >
      <div className="h-12 px-3 flex items-center justify-between border-b/60">
        <div className="text-xs text-muted-foreground">Smart Chat</div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={() => setShowVoice(v => !v)} aria-label="Toggle Voice">
            <Mic className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setIsMinimized(v => !v)} aria-label="Minimize">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {!isMinimized && (
        <div className="overflow-hidden">
          {/* Mobile-friendly height with safe viewport units; taller on md+ */}
          <div className="h-[48svh] md:h-80 overflow-auto p-2">
            <AIEChat />
          </div>
        </div>
      )}

      {showVoice && (
        <VoiceOverlay open={showVoice} onCancel={() => setShowVoice(false)} onAccept={() => setShowVoice(false)} />
      )}
    </div>
  )
}


