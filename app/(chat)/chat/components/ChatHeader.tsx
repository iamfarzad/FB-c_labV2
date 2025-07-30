"use client"

import { Bot, MessageSquare, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useChatContext } from "../context/ChatProvider" // Import useChatContext
import { useSidebar } from "@/components/ui/sidebar" // Import useSidebar

export function ChatHeader() {
  const { activities } = useChatContext() // Get activities from context
  const { toggleSidebar } = useSidebar() // Use useSidebar hook for toggling

  // Calculate completed activities count
  const completedActivitiesCount = activities.filter((activity) => activity.status === "completed").length

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
      <div className="flex items-center gap-2">
        <Bot className="h-6 w-6 text-primary" />
        <h1 className="text-lg font-semibold">F.B/c AI Consultation</h1>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8"
                onClick={toggleSidebar} // Use toggleSidebar from hook
              >
                <MessageSquare className="h-5 w-5" />
                {completedActivitiesCount > 0 && (
                  <Badge className="absolute -right-2 -top-2 h-5 w-5 flex items-center justify-center rounded-full p-0 text-xs">
                    {completedActivitiesCount}
                  </Badge>
                )}
                <span className="sr-only">Activities</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>AI Activity Log</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
