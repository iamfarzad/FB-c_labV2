"use client"

import type React from "react"

import type { ActivityItem } from "@/app/(chat)/chat/types/chat"
import { SidebarContent } from "./SidebarContent"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

interface MobileSidebarSheetProps {
  activities: ActivityItem[]
  onNewChat: () => void
  onActivityClick: (activity: ActivityItem) => void
  onClearActivities?: () => void
  onCleanupStuckActivities?: () => void
  className?: string
  children?: React.ReactNode
}

export const MobileSidebarSheet = ({
  activities,
  onNewChat,
  onActivityClick,
  onClearActivities,
  onCleanupStuckActivities,
  className,
  children,
}: MobileSidebarSheetProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon" className={cn("md:hidden", className)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0 flex flex-col">
        <SheetHeader className="p-4 text-left border-b">
          <SheetTitle>Chat History</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          <SidebarContent
            activities={activities}
            onNewChat={onNewChat}
            onActivityClick={onActivityClick}
            onClearActivities={onClearActivities}
            onCleanupStuckActivities={onCleanupStuckActivities}
            isTablet={true} // Mobile view is similar to tablet
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MobileSidebarSheet
