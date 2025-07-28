"use client"
import { AnimatePresence, motion } from "framer-motion"
import { useChatContext } from "@/app/(chat)/chat/context/ChatProvider"
import { ActivityIcon } from "@/components/chat/sidebar/ActivityIcon"
import { cn } from "@/lib/utils"

export function EnhancedLiveActivity() {
  const { activityLog } = useChatContext()

  const statusClasses = {
    "in-progress": "bg-blue-500/10 text-blue-400",
    success: "bg-green-500/10 text-green-400",
    error: "bg-red-500/10 text-red-400",
    cancelled: "bg-gray-500/10 text-gray-400",
  }

  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground">
      <h3 className="font-semibold mb-4">Live Activity</h3>
      <div className="space-y-3 h-48 overflow-y-auto pr-2">
        <AnimatePresence>
          {activityLog.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm text-muted-foreground py-8"
            >
              No activities yet.
            </motion.div>
          )}
          {activityLog.map((activity) => (
            <motion.div
              key={activity.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={cn(
                "flex items-center gap-3 p-2 rounded-md text-sm",
                statusClasses[activity.status] || "bg-muted",
              )}
            >
              <div className="flex-shrink-0">
                <ActivityIcon type={activity.type} status={activity.status} className="w-5 h-5" />
              </div>
              <div className="flex-grow truncate">{activity.content}</div>
              <div className="text-xs text-muted-foreground flex-shrink-0">
                {new Date(activity.timestamp).toLocaleTimeString()}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
