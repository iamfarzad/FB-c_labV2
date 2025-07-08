"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Download, Bot, Menu } from "lucide-react"
import { MobileSidebarSheet } from "./sidebar/MobileSidebarSheet"
import type { ActivityItem } from "@/app/chat/types/chat"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

interface ChatHeaderProps {
  onDownloadSummary: () => void
  activities: ActivityItem[]
  onNewChat: () => void
  onActivityClick: (activity: ActivityItem) => void
  className?: string
}

export function ChatHeader({ onDownloadSummary, activities, onNewChat, onActivityClick, className }: ChatHeaderProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
    }

    checkDevice()
    window.addEventListener("resize", checkDevice)
    return () => window.removeEventListener("resize", checkDevice)
  }, [])

  const liveActivities = activities.filter((a) => a.status === "in_progress" || a.status === "pending").length

  return (
    <header
      className={cn(
        "flex items-center justify-between p-4 border-b border-border/30 bg-card/30 backdrop-blur-sm",
        // Mobile optimizations
        "mobile:px-3 mobile:py-3 mobile:min-h-[60px]",
        // Tablet optimizations
        "tablet:px-4 tablet:py-3 tablet:min-h-[64px]",
        // Desktop optimizations
        "desktop:px-6 desktop:py-4 desktop:min-h-[72px]",
        className,
      )}
    >
      {/* Left Section - Mobile Sidebar + AI Info */}
      <div className="flex items-center gap-3">
        {/* Mobile Sidebar Toggle */}
        <div className="md:hidden">
          <MobileSidebarSheet activities={activities} onNewChat={onNewChat} onActivityClick={onActivityClick}>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <Menu className="w-4 h-4" />
            </Button>
          </MobileSidebarSheet>
        </div>

        {/* AI Assistant Info */}
        <div className="flex items-center gap-3">
          <Avatar
            className={cn(
              "border-2 border-primary/20",
              // Responsive avatar sizes
              "mobile:w-8 mobile:h-8",
              "tablet:w-10 tablet:h-10",
              "desktop:w-12 desktop:h-12",
            )}
          >
            <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white">
              <Bot className={cn("mobile:w-4 mobile:h-4", "tablet:w-5 tablet:h-5", "desktop:w-6 desktop:h-6")} />
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1
                className={cn(
                  "font-semibold text-foreground",
                  // Responsive text sizes
                  "mobile:text-sm",
                  "tablet:text-base",
                  "desktop:text-lg",
                )}
              >
                F.B/c AI ASSISTANT
              </h1>
              {liveActivities > 0 && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "animate-pulse",
                    "mobile:text-xs mobile:px-1.5 mobile:py-0.5",
                    "tablet:text-xs",
                    "desktop:text-sm",
                  )}
                >
                  {liveActivities} live
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className={cn("text-muted-foreground", "mobile:text-xs", "tablet:text-sm", "desktop:text-sm")}>
                Online • Ready to help
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size={isMobile ? "sm" : "default"}
          onClick={onDownloadSummary}
          className={cn(
            "gap-2",
            // Mobile: Icon only, larger screens: Icon + text
            "mobile:px-2",
            "tablet:px-3",
            "desktop:px-4",
          )}
        >
          <Download className={cn("mobile:w-4 mobile:h-4", "tablet:w-4 tablet:h-4", "desktop:w-4 desktop:h-4")} />
          <span
            className={cn(
              // Hide text on mobile, show on larger screens
              "mobile:hidden",
              "tablet:inline",
              "desktop:inline",
            )}
          >
            Export Summary
          </span>
        </Button>
      </div>
    </header>
  )
}
