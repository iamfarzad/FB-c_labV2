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
    case "complete":
    case "video_complete":
      return "text-green-500"
    case "analyzing":
    case "processing":
    case "generating":
      return "text-blue-500"
    default:
      return "text-muted-foreground"
  }
}
