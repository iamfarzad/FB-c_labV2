import type { ReactElement } from "react"
import type { ActivityItem } from "../types/chat"
import { ActivityIcon } from "@/components/chat/sidebar/ActivityIcon"

export const getActivityIcon = (type: ActivityItem["type"]): ReactElement => {
  return <ActivityIcon type={type} />
}

export const getActivityColor = (type: ActivityItem["type"]): string => {
  switch (type) {
    case "error":
      return "text-red-500"
    case "ai_request":
    case "ai_stream":
      return "text-green-500"
    case "tool_used":
    case "user_action":
    case "stream_chunk":
      return "text-blue-500"
    default:
      return "text-muted-foreground"
  }
}