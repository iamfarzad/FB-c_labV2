"use client"
import type { ActivityItem } from "@/app/(chat)/chat/types/chat"
import { SidebarHeader } from "./components/SidebarHeader"
import { LiveActivityStatus } from "./components/LiveActivityStatus"
import { ActivityList } from "./components/ActivityList"
import { SidebarFooter } from "./components/SidebarFooter"

interface SidebarContentProps {
  activities: ActivityItem[]
  onNewChat: () => void
  onActivityClick: (activity: ActivityItem) => void
  onClearActivities?: () => void
  onCleanupStuckActivities?: () => void
  isTablet?: boolean
}

export const SidebarContent = ({
  activities,
  onNewChat,
  onActivityClick,
  onClearActivities,
  onCleanupStuckActivities,
  isTablet = false,
}: SidebarContentProps) => {
  const liveActivitiesCount = activities.filter((a) => a.status === "in_progress" || a.status === "pending").length

  return (
    <div className="flex flex-col h-full">
      <SidebarHeader
        activityCount={activities.length}
        liveActivityCount={liveActivitiesCount}
        onNewChat={onNewChat}
        onClearActivities={onClearActivities}
        onCleanupStuckActivities={onCleanupStuckActivities}
        isTablet={isTablet}
      />

      <LiveActivityStatus liveActivityCount={liveActivitiesCount} isTablet={isTablet} />

      <ActivityList activities={activities} onActivityClick={onActivityClick} isTablet={isTablet} />

      <SidebarFooter isTablet={isTablet} />
    </div>
  )
}

export default SidebarContent
