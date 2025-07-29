"use client"

import { ScreenShare, Video, Mic, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useChatContext } from "@/app/(chat)/chat/context/ChatProvider"

export function ActionButtons() {
  const { openScreenShare, openVideo2App, openVoiceInput, openWebcam } = useChatContext()

  const actions = [
    { icon: ScreenShare, label: "Screen Share", onClick: openScreenShare },
    { icon: Video, label: "Video to App", onClick: openVideo2App },
    { icon: Mic, label: "Voice Input", onClick: openVoiceInput },
    { icon: Camera, label: "Webcam", onClick: openWebcam },
  ]

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        {actions.map((action, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={action.onClick} aria-label={action.label}>
                <action.icon className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{action.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  )
}
