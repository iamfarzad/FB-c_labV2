"use client"

import type { ActivityItem } from "@/app/(chat)/chat/types/chat"
import { VerticalProcessChain } from "../../activity/VerticalProcessChain"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface ActivityListProps {
  activities: ActivityItem[]
  onActivityClick: (activity: ActivityItem) => void
  isTablet?: boolean
}

export const ActivityList = ({ activities, onActivityClick, isTablet = false }: ActivityListProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
      className="flex-1 overflow-hidden flex items-center justify-center"
    >
      <div className={cn("w-full flex justify-center", isTablet && "px-2")}>
        <VerticalProcessChain activities={activities} onActivityClick={onActivityClick} />
      </div>
    </motion.div>
  )
}
