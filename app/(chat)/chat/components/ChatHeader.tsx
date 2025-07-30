"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { PanelLeft, Bot, Settings, PanelRightOpen } from "lucide-react"
import type { Activity } from "@/types/chat"

interface ChatHeaderProps {
  activities: Activity[]
  onToggleActivityPanel: () => void
}

export function ChatHeader({ activities, onToggleActivityPanel }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 border-b border-border bg-background">
      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
            {/* Placeholder for a potential future mobile sidebar */}
            <div className="p-4">
              <h2 className="text-lg font-semibold">F.B/c Consulting</h2>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold">F.B/c AI Assistant</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={onToggleActivityPanel} className="hidden md:inline-flex">
          <PanelRightOpen className="h-5 w-5" />
          <span className="sr-only">Toggle Activity Panel</span>
        </Button>
      </div>
    </header>
  )
}
