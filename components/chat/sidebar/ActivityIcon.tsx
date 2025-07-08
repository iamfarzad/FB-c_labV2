import {
  MessageSquare,
  Zap,
  Search,
  FileText,
  Brain,
  Link2,
  ImageIcon,
  Mic,
  Monitor,
  Upload,
  User,
  AlertCircle,
  Loader2,
  Edit3,
  Globe,
  Database,
  Eye,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ActivityIconProps {
  type: string
  status: "pending" | "in_progress" | "completed" | "failed"
  className?: string
  size?: "sm" | "md" | "lg"
}

export function ActivityIcon({ type, status, className, size = "md" }: ActivityIconProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }

  const getIcon = () => {
    switch (type) {
      case "user_action":
        return User
      case "ai_request":
        return Sparkles
      case "ai_stream":
        return Edit3
      case "stream_chunk":
        return Edit3
      case "tool_used":
        return Zap
      case "google_search":
        return Search
      case "web_scrape":
        return Globe
      case "doc_analysis":
        return FileText
      case "memory_update":
        return Database
      case "grounding":
        return Link2
      case "function_call":
        return Zap
      case "image_upload":
      case "image_capture":
        return ImageIcon
      case "voice_input":
      case "voice_response":
        return Mic
      case "screen_share":
        return Monitor
      case "file_upload":
        return Upload
      case "lead_capture":
        return User
      case "search":
        return Search
      case "link":
        return Link2
      case "ai_thinking":
        return Brain
      case "vision_analysis":
        return Eye
      case "error":
        return AlertCircle
      default:
        return MessageSquare
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "pending":
        return "text-yellow-500"
      case "in_progress":
        return "text-blue-500"
      case "completed":
        return "text-green-500"
      case "failed":
        return "text-red-500"
      default:
        return "text-muted-foreground"
    }
  }

  const Icon = getIcon()
  const isLoading = status === "in_progress" || status === "pending"

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {isLoading ? (
        <Loader2 className={cn(sizeClasses[size], "animate-spin", getStatusColor())} />
      ) : (
        <Icon className={cn(sizeClasses[size], getStatusColor())} />
      )}

      {/* Status indicator dot */}
      <div
        className={cn(
          "absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-background",
          status === "completed" && "bg-green-500",
          status === "failed" && "bg-red-500",
          status === "in_progress" && "bg-blue-500 animate-pulse",
          status === "pending" && "bg-yellow-500",
        )}
      />
    </div>
  )
}
