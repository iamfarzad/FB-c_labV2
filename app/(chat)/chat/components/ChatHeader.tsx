"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, MessageSquare } from "lucide-react"
import type { EngagementType } from "./ChatContainer"

interface ChatHeaderProps {
  engagementType: EngagementType
  onDownloadSummary?: () => void
  leadName?: string
}

export function ChatHeader({ engagementType, onDownloadSummary, leadName }: ChatHeaderProps) {
  const getEngagementBadge = () => {
    switch (engagementType) {
      case "demo":
        return <Badge variant="secondary">Demo Mode</Badge>
      case "free-trial":
        return <Badge variant="outline">Free Trial</Badge>
      case "sales-call":
        return <Badge>Sales Consultation</Badge>
      default:
        return <Badge variant="secondary">Chat</Badge>
    }
  }

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5" />
          <div>
            <h1 className="font-semibold">{leadName ? `Chat with ${leadName}` : "AI Assistant"}</h1>
            {getEngagementBadge()}
          </div>
        </div>

        {onDownloadSummary && (
          <Button variant="outline" size="sm" onClick={onDownloadSummary} className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export Summary
          </Button>
        )}
      </div>
    </div>
  )
}
