"use client"

import type React from "react"

import type { ActivityItem } from "@/app/chat/types/chat"
import { SidebarContent } from "./SidebarContent"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"

interface DesktopSidebarProps {
  activities: ActivityItem[]
  isOpen: boolean
  onToggle: () => void
  onNewChat: () => void
  onActivityClick: (activity: ActivityItem) => void
  className?: string
}

export const DesktopSidebar = ({
  activities,
  isOpen,
  onToggle,
  onNewChat,
  onActivityClick,
  className,
}: DesktopSidebarProps) => {
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      setIsTablet(width >= 768 && width < 1024)
    }

    checkDevice()
    window.addEventListener("resize", checkDevice)
    return () => window.removeEventListener("resize", checkDevice)
  }, [])

  // Responsive sidebar width
  const sidebarWidth = isTablet ? 300 : 350

  return (
    <>
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: sidebarWidth, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "h-full relative z-30 hidden md:flex flex-col border-r border-border/30 bg-card/30 backdrop-blur-sm overflow-hidden",
              className,
            )}
            style={{ width: sidebarWidth }}
          >
            <SidebarContent
              activities={activities}
              onNewChat={onNewChat}
              onActivityClick={onActivityClick}
              isTablet={isTablet}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <div
        className={cn(
          "fixed top-20 z-50 hidden md:block transition-all duration-300",
          isOpen ? "left-[calc(var(--sidebar-width)-16px)]" : "left-4",
        )}
        style={
          {
            "--sidebar-width": isOpen ? `${sidebarWidth}px` : "0px",
          } as React.CSSProperties
        }
      >
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "bg-background/90 backdrop-blur-md border border-border/30 rounded-lg shadow-lg hover:bg-muted hover:scale-105 transition-all duration-200",
            "tablet:h-9 tablet:w-9",
            "desktop:h-10 desktop:w-10",
          )}
          onClick={onToggle}
        >
          {isOpen ? (
            <ChevronLeft className={cn("tablet:h-4 tablet:w-4", "desktop:h-4 desktop:w-4")} />
          ) : (
            <ChevronRight className={cn("tablet:h-4 tablet:w-4", "desktop:h-4 desktop:w-4")} />
          )}
        </Button>
      </div>
    </>
  )
}

export default DesktopSidebar
