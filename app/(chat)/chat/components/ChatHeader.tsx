"use client"

import { PanelRightClose } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Activity } from "@/types/chat"

interface ChatHeaderProps {
  activities: Activity[]
  onToggleActivityPanel: () => void
}

export function ChatHeader({ activities, onToggleActivityPanel }: ChatHeaderProps) {
  const completedActivities = activities.filter((a) => a.status === "completed").length

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/60 bg-background/95 px-6 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-3 h-3 bg-primary rounded-full" />
          <div className="absolute top-0 left-0 w-3 h-3 bg-primary rounded-full animate-ping" />
        </div>
        <h1 className="text-foreground/90 text-base tracking-wide font-semibold">F.B/c AI Consultation</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{completedActivities}</span> Activities Completed
        </div>
        <Button variant="ghost" size="icon" onClick={onToggleActivityPanel} className="hidden md:inline-flex">
          <PanelRightClose className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
