"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useDevice } from "@/hooks/use-device"
import type { ActivityItem } from "@/app/(chat)/chat/types/chat"

import { AIAvatar } from "./header/components/AIAvatar"
import { Greeting } from "./header/components/Greeting"
import { OnlineStatus } from "./header/components/OnlineStatus"
import { ExportButton } from "./header/components/ExportButton"
import { MobileMenu } from "./header/components/MobileMenu"

interface ChatHeaderProps {
  onDownloadSummary: () => void
  activities: ActivityItem[]
  onNewChat: () => void
  onActivityClick: (activity: ActivityItem) => void
  className?: string
  leadName?: string
}

export function ChatHeader({
  onDownloadSummary,
  activities,
  onNewChat,
  onActivityClick,
  className,
  leadName,
}: ChatHeaderProps) {
  const device = useDevice()
  const [greeting, setGreeting] = useState(`How can I help?`)

  useEffect(() => {
    setGreeting(`How can I help${leadName ? `, ${leadName}` : ""}?`)
  }, [leadName])

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "flex items-center justify-between p-4 border-b border-border/20",
        "bg-card/40 backdrop-blur-xl glass-header",
        "shadow-sm shadow-black/5",
        "flex-shrink-0",
        "px-3 py-3 min-h-[60px]",
        "md:px-4 md:py-3 md:min-h-[64px]",
        "lg:px-6 lg:py-4 lg:min-h-[72px]",
        className,
      )}
      style={{
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Left Section - Mobile Sidebar + AI Info */}
      <div className="flex items-center gap-3 flex-1">
        <MobileMenu activities={activities} onNewChat={onNewChat} onActivityClick={onActivityClick} />

        {/* AI Assistant Info */}
        <div className="flex items-center gap-3 flex-1">
          <AIAvatar />
          <div className="flex flex-col flex-1">
            <Greeting text={greeting} />
            <OnlineStatus />
          </div>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        <ExportButton onClick={onDownloadSummary} device={device} />
      </div>
    </motion.header>
  )
}
