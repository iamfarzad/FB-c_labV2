"use client"

import { useState } from "react"
import { Bot, ChevronDown, Sparkles, Zap, Settings, MoreVertical } from "lucide-react"
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
  { id: "gemini-pro", name: "Gemini Pro", provider: "Google", description: "Most capable model" },
  { id: "gemini-flash", name: "Gemini Flash", provider: "Google", description: "Fastest responses" },
  { id: "gpt-4", name: "GPT-4", provider: "OpenAI", description: "Advanced reasoning" },
  { id: "claude-3", name: "Claude 3", provider: "Anthropic", description: "Excellent for analysis" },
]

export function ChatPanel({ messages, isLoading, onSendMessage, onToolClick }: ChatPanelProps) {
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS[0])

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900">
      {/* Enhanced Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-10 w-10 ring-2 ring-blue-500/20">
              <AvatarImage src="/placeholder-logo.svg" alt="AI" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Advanced Business AI</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              Ready to assist with your business needs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className="gap-1 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Online
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <Zap className="h-3 w-3" />
                {selectedModel.name}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {AI_MODELS.map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  className="flex flex-col items-start p-3 cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{model.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {model.provider}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">{model.description}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs text-muted-foreground">
                <Settings className="h-3 w-3 mr-2" />
                Model Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Business Toolbar */}
      <BusinessToolbar onToolClick={onToolClick} />

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-900">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      {/* Enhanced Composer */}
      <div className="border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <ChatComposer onSendMessage={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}
