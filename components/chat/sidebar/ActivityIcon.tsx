"use client"

import {
  MessageSquare,
  Bot,
  Upload,
  Camera,
  Mic,
  Monitor,
  FileText,
  Search,
  Link,
  Brain,
  Eye,
  AlertTriangle,
  Database,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ActivityItem } from "@/app/chat/types/chat"

interface ActivityIconProps {
  type: ActivityItem["type"]
  className?: string
}

export function ActivityIcon({ type, className }: ActivityIconProps) {
  const getIcon = () => {
    switch (type) {
      case "user_action":
        return <MessageSquare className={cn("text-blue-500", className)} />
      case "ai_request":
      case "ai_stream":
        return <Bot className={cn("text-green-500", className)} />
      case "image_upload":
      case "file_upload":
        return <Upload className={cn("text-purple-500", className)} />
      case "image_capture":
        return <Camera className={cn("text-orange-500", className)} />
      case "voice_input":
      case "voice_response":
        return <Mic className={cn("text-pink-500", className)} />
      case "screen_share":
        return <Monitor className={cn("text-indigo-500", className)} />
      case "doc_analysis":
        return <FileText className={cn("text-yellow-500", className)} />
      case "google_search":
      case "search":
        return <Search className={cn("text-red-500", className)} />
      case "link":
        return <Link className={cn("text-cyan-500", className)} />
      case "ai_thinking":
        return <Brain className={cn("text-violet-500", className)} />
      case "vision_analysis":
        return <Eye className={cn("text-teal-500", className)} />
      case "error":
        return <AlertTriangle className={cn("text-red-600", className)} />
      case "database":
        return <Database className={cn("text-gray-500", className)} />
      default:
        return <Zap className={cn("text-gray-400", className)} />
    }
  }

  return getIcon()
}
