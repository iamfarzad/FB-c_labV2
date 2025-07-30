"use client"

import { Button } from "@/components/ui/button"
import { PanelRightClose, PanelRightOpen } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ChatHeaderProps {
  isActivityPanelOpen: boolean
  toggleActivityPanel: () => void
}

export function ChatHeader({ isActivityPanelOpen, toggleActivityPanel }: ChatHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background/95 px-6 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/75 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
        </div>
        <h1 className="text-sm font-semibold tracking-wide text-foreground/90">F.B/c AI Consultation</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Powered by Gemini 2.5</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleActivityPanel}>
                {isActivityPanelOpen ? (
                  <PanelRightClose className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <PanelRightOpen className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isActivityPanelOpen ? "Hide Activity Panel" : "Show Activity Panel"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  )
}
