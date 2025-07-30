"use client"

import { PanelLeft, LayoutPanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useChatContext } from "../context/ChatProvider" // Import useChatContext

interface ChatHeaderProps {
  onToggleActivityPanel: () => void
}

export function ChatHeader({ onToggleActivityPanel }: ChatHeaderProps) {
  const { activities } = useChatContext() // Get activities from context

  // Calculate completed activities
  const completedActivitiesCount = activities.filter((activity) => activity.status === "completed").length

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-700 bg-slate-900 px-4 text-slate-50">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="-ml-1 h-7 w-7 text-slate-400 hover:bg-slate-800 hover:text-slate-50"
          onClick={() => {
            // This button would typically toggle the main sidebar, which is handled by SidebarTrigger
            // For now, it can be a placeholder or removed if the main sidebar is always open
            // or if the toggle is handled by the Sidebar component itself.
            // Since ChatSidebar is now a direct child of ChatInterface, it manages its own collapse.
            // This button might be for a different sidebar or a mobile menu.
          }}
        >
          <PanelLeft className="h-4 w-4" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4 bg-slate-700" />
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="font-semibold">F.B/c AI Consultation</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>{completedActivitiesCount} Activities Completed</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-slate-400 hover:bg-slate-800 hover:text-slate-50"
          onClick={onToggleActivityPanel}
        >
          <LayoutPanelLeft className="h-4 w-4" />
          <span className="sr-only">Toggle Activity Panel</span>
        </Button>
      </div>
    </header>
  )
}
