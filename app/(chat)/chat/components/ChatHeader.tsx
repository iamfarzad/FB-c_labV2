"use client"

import { PanelRightClose, ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { ActivityPanel } from "./ActivityPanel"
import type { Activity } from "@/types/chat"
import Link from "next/link"

interface ChatHeaderProps {
  activities: Activity[]
}

export function ChatHeader({ activities }: ChatHeaderProps) {
  const completedActivities = activities.filter((a) => a.status === "completed").length

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 text-foreground/90 hover:text-primary transition-colors">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="w-4 h-4" />
            <span className="sr-only">Back to Home</span>
          </Button>
        </Link>
        <div className="relative">
          <div className="w-3 h-3 bg-primary rounded-full" />
          <div className="absolute top-0 left-0 w-3 h-3 bg-primary rounded-full animate-ping" />
        </div>
        <h1 className="text-foreground/90 text-sm tracking-wide font-semibold">F.B/c AI Consultation</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="hidden sm:flex">
          <ArrowLeft className="w-4 h-4" />
          <span className="sr-only">Back</span>
        </Button>
        <Button variant="ghost" size="icon" className="hidden sm:flex">
          <ArrowLeft className="w-4 h-4" />
          <span className="sr-only">Back</span>
        </Button>
        <Button variant="ghost" size="icon" className="hidden sm:flex">
          <ArrowLeft className="w-4 h-4" />
          <span className="sr-only">Back</span>
        </Button>

        {/* Mobile Menu / Activity Panel Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="flex">
              <ArrowLeft className="w-4 h-4" />
              <span className="sr-only">Open Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-xs p-0 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Activities</h2>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </SheetTrigger>
            </div>
            <ActivityPanel activities={activities} />
            <div className="p-4 border-t">
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <ArrowLeft className="w-4 h-4" />
                New Chat
              </Button>
              <Separator className="my-3" />
              <Button variant="ghost" className="w-full justify-start gap-2">
                <ArrowLeft className="w-4 h-4" />
                Share Chat
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <ArrowLeft className="w-4 h-4" />
                Settings
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
