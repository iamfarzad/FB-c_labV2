"use client"

import { Bot, Menu, PlusCircle, Settings, Share, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { ActivityPanel } from "./ActivityPanel"
import type { Activity } from "@/types/chat"

interface ChatHeaderProps {
  activities: Activity[]
}

export function ChatHeader({ activities }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-primary/70" />
        </div>
        <h1 className="text-foreground/90 text-sm tracking-wide font-semibold">F.B/c AI Consultation</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="hidden sm:flex">
          <Share className="w-4 h-4" />
          <span className="sr-only">Share Chat</span>
        </Button>
        <Button variant="ghost" size="icon" className="hidden sm:flex">
          <Settings className="w-4 h-4" />
          <span className="sr-only">Settings</span>
        </Button>

        {/* Mobile Menu / Activity Panel Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="flex">
              <Menu className="w-4 h-4" />
              <span className="sr-only">Open Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-xs p-0 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Activities</h2>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <X className="w-4 h-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </SheetTrigger>
            </div>
            <ActivityPanel activities={activities} />
            <div className="p-4 border-t">
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <PlusCircle className="w-4 h-4" />
                New Chat
              </Button>
              <Separator className="my-3" />
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Share className="w-4 h-4" />
                Share Chat
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
