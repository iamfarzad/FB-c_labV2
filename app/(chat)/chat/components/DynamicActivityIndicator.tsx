"use client"

import { AnimatePresence, motion } from "framer-motion"
import type { Activity } from "../types/chat"

interface DynamicActivityIndicatorProps {
  activity: Activity | null
}

export function DynamicActivityIndicator({ activity }: DynamicActivityIndicatorProps) {
  return (
    <div className="h-10 px-6">
      <AnimatePresence>
        {activity && activity.status === "in_progress" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-background rounded-full py-1.5 px-4 border"
          >
            <activity.icon className="h-4 w-4 animate-spin" />
            <span>{activity.title}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
