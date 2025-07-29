"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ActivityList } from "@/components/chat/sidebar/components/ActivityList"
import type { ActivityItem } from "../../types/chat"

interface ChatSidebarProps {
  activities: ActivityItem[]
  onNewChat: () => void
}

export function ChatSidebar({ activities, onNewChat }: ChatSidebarProps) {
  return (
    <div className="flex h-full flex-col border-r bg-muted/40">
      <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
        <h2 className="text-lg font-semibold tracking-tight">Chat</h2>
        <Button variant="ghost" size="icon" onClick={onNewChat}>
          <Plus className="h-5 w-5" />
          <span className="sr-only">New Chat</span>
        </Button>
      </div>
      <div className="flex flex-1 flex-col min-h-0">
        <div className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">History</h3>
          <div className="mt-2 text-center text-sm text-muted-foreground py-4">No chat history yet.</div>
        </div>
        <Separator />
        <div className="flex-1 p-4 overflow-hidden">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Live Activity</h3>
          <ScrollArea className="h-full">
            <ActivityList activities={activities} />
          </ScrollArea>
        </div>
      </div>
      <div className="mt-auto border-t p-4">
        <Button variant="outline" className="w-full bg-transparent">
          <Trash2 className="mr-2 h-4 w-4" />
          Clear History
        </Button>
      </div>
    </div>
  )
}
