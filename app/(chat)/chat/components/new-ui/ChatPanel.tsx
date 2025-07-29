"use client"

import { useState } from "react"
import { Bot, ChevronDown, Zap, Settings, MoreVertical, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { MessageList } from "../MessageList"
import { ChatComposer } from "./ChatComposer"
import { BusinessToolbar } from "./BusinessToolbar"
import type { Message, AIModel } from "../../types/chat"

interface ChatPanelProps {
  messages: Message[]
  isLoading: boolean
  onSendMessage: (message: string) => void
  onToolClick: (tool: string) => void
}

const AI_MODELS: AIModel[] = [
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    provider: "Google",
    description: "Most capable model for complex reasoning",
    status: "active",
  },
  {
    id: "gemini-flash",
    name: "Gemini Flash",
    provider: "Google",
    description: "Fastest responses for quick tasks",
    status: "active",
  },
  {
    id: "gpt-4",
    name: "GPT-4",
    provider: "OpenAI",
    description: "Advanced reasoning and analysis",
    status: "active",
  },
  {
    id: "claude-3",
    name: "Claude 3",
    provider: "Anthropic",
    description: "Excellent for detailed analysis",
    status: "active",
  },
]

export function ChatPanel({ messages, isLoading, onSendMessage, onToolClick }: ChatPanelProps) {
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS[0])

  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Refined Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-10 w-10 ring-2 ring-blue-500/20 shadow-sm">
              <AvatarImage src="/placeholder-logo.svg" alt="AI Assistant" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 text-white">
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm">
              <Activity className="w-2 h-2 text-white animate-pulse" />
            </div>
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              Advanced Business AI
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              Ready to assist with your business needs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className="gap-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 px-3 py-1"
          >
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Online
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 backdrop-blur-sm"
              >
                <Zap className="h-3 w-3 text-blue-500" />
                <span className="font-medium">{selectedModel.name}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-2">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                AI Models
              </div>
              {AI_MODELS.map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  className="flex flex-col items-start p-3 cursor-pointer rounded-lg"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-medium text-sm">{model.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs px-2 py-0.5">
                        {model.provider}
                      </Badge>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground leading-relaxed">{model.description}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem className="text-xs text-muted-foreground p-3">
                <Settings className="h-3 w-3 mr-2" />
                Model Settings & Preferences
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Business Toolbar */}
      <BusinessToolbar onToolClick={onToolClick} />

      {/* Messages Area with refined background */}
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      {/* Enhanced Composer */}
      <div className="border-t border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <ChatComposer onSendMessage={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}
