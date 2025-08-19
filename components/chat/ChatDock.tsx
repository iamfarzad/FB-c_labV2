"use client"

import React, { useState } from "react"
import { UnifiedChatInterface } from "@/components/chat/unified/UnifiedChatInterface"
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
    <div className={cn(
      "border-t bg-background",
      // remove visual frame
      "border-border/60",
      className
    )}>
      {/* remove header frame; keep a minimal control if needed later */}
      {!isMinimized && (
        <div className="overflow-hidden">
          {/* Mobile-friendly height with safe viewport units; taller on md+ */}
          <div className="h-[48svh] md:h-80 overflow-auto p-2">
            <UnifiedChatInterface messages={[]} isLoading={false} sessionId={null} mode="dock" />
          </div>
        </div>
      )}

      {false && showVoice && (
        <VoiceOverlay open={showVoice} onCancel={() => setShowVoice(false)} onAccept={() => setShowVoice(false)} />
      )}
    </div>
  )
}


