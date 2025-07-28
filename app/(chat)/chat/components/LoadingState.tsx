"use client"

import { Loader2, Bot } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export const LoadingState = () => (
  <div className="flex gap-3 p-4">
    <Avatar className="w-8 h-8 shrink-0">
      <AvatarFallback className="bg-primary text-primary-foreground">
        <Bot className="w-4 h-4" />
      </AvatarFallback>
    </Avatar>
    <div className="p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-muted-foreground">AI is thinking...</span>
      </div>
    </div>
  </div>
)
