"use client"

import { AnimatePresence, motion } from "framer-motion"
import type { Activity } from "@/types/chat"
import { Loader } from "lucide-react"

interface DynamicActivityIndicatorProps {
  activity: Activity | null
}

export function DynamicActivityIndicator({ activity }: DynamicActivityIndicatorProps) {
  return (
    <div className="h-8 flex justify-center items-center px-4">
      <AnimatePresence>
        {activity && activity.status === "in_progress" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-muted rounded-full"
          >
            <Loader className="h-3 w-3 animate-spin" />
            <span>{activity.title}...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
