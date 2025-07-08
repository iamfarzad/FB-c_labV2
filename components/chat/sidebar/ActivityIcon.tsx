import {
  MessageSquare,
  FileText,
  Camera,
  Monitor,
  Mic,
  Search,
  BrainCircuit,
  Sparkles,
  Code,
  Youtube,
  UserCheck,
  Activity,
  type LightbulbIcon as LucideProps,
  FileUp,
  Video,
} from "lucide-react"

interface ActivityIconProps extends LucideProps {
  type: string
}

export function ActivityIcon({ type, ...props }: ActivityIconProps) {
  switch (type) {
    case "message":
      return <MessageSquare {...props} />
    case "file_upload":
      return <FileUp {...props} />
    case "document_analysis":
      return <FileText {...props} />
    case "image_analysis":
      return <Camera {...props} />
    case "screen_share":
      return <Monitor {...props} />
    case "voice_input":
      return <Mic {...props} />
    case "web_search":
      return <Search {...props} />
    case "insight_generation":
      return <BrainCircuit {...props} />
    case "summary_generation":
      return <Sparkles {...props} />
    case "code_generation":
      return <Code {...props} />
    case "video_analysis":
      return <Youtube {...props} />
    case "video_to_app":
      return <Video {...props} />
    case "lead_captured":
      return <UserCheck {...props} />
    case "ai_interaction":
      return <Sparkles {...props} />
    case "tool_used":
      return <Search {...props} />
    default:
      return <Activity {...props} />
  }
}
