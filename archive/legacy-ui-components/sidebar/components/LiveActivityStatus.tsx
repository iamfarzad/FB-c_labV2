"use client"

import { Badge } from "@/components/ui/badge"
import { Radio } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface LiveActivityStatusProps {
  liveActivityCount: number
  isTablet?: boolean
}

export const LiveActivityStatus = ({ liveActivityCount, isTablet = false }: LiveActivityStatusProps) => {
  if (liveActivityCount === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("px-4 py-3 border-b border-border/20 bg-blue-50/30 dark:bg-blue-950/20", isTablet && "px-3 py-2")}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <Radio className={cn("text-blue-500", isTablet ? "w-3 h-3" : "w-4 h-4")} />
          </motion.div>
          <span className={cn("text-blue-700 dark:text-blue-300 font-medium", isTablet ? "text-xs" : "text-sm")}>
            {liveActivityCount} AI task{liveActivityCount !== 1 ? "s" : ""} active
          </span>
        </div>
        <Badge
          variant="secondary"
          className={cn(
            "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
            isTablet ? "text-xs px-2 py-0.5" : "text-xs px-2 py-1",
          )}
        >
          Live
        </Badge>
      </div>
    </motion.div>
  )
}
