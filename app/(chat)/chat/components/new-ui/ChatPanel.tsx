"use client"

import { useState } from "react"
import { Bot, ChevronDown, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MessageList } from "../MessageList"
import { ChatComposer } from "./ChatComposer"
import type { Message, AIModel } from "../../types/chat"

interface ChatPanelProps {
  messages: Message[]
  isLoading: boolean
  onSendMessage: (message: string) => void
  onToolClick: (tool: string) => void
}

const AI_MODELS: AIModel[] = [
  { id: "gemini-pro", name: "Gemini Pro", provider: "Google" },
  { id: "gemini-flash", name: "Gemini Flash", provider: "Google" },
  { id: "gpt-4", name: "GPT-4", provider: "OpenAI" },
  { id: "claude-3", name: "Claude 3", provider: "Anthropic" },
]

export function ChatPanel({ messages, isLoading, onSendMessage, onToolClick }: ChatPanelProps) {
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS[0])

  const tools = [
    { id: "roi-calc", label: "ROI Calc", icon: "📊" },
    { id: "research", label: "Research", icon: "🔍" },
    { id: "analysis", label: "Analysis", icon: "📈" },
    { id: "leads", label: "Leads", icon: "👥" },
    { id: "meeting", label: "Meeting", icon: "📅" },
    { id: "upload", label: "Upload", icon: "📎" },
    { id: "screen", label: "Screen", icon: "🖥️" },
  ]

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b px-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-logo.svg" alt="AI" />
            <AvatarFallback>
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg font-semibold">Advanced Business AI Assistant</h1>
            <p className="text-sm text-muted-foreground">Ask Uniq AI Anything</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            Online
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                {selectedModel.name}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {AI_MODELS.map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  className="flex items-center justify-between"
                >
                  <span>{model.name}</span>
                  <span className="text-xs text-muted-foreground">{model.provider}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick Tools */}
      <div className="border-b px-6 py-3">
        <div className="flex gap-2 overflow-x-auto">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant="outline"
              size="sm"
              onClick={() => onToolClick(tool.id)}
              className="shrink-0 gap-2"
            >
              <span>{tool.icon}</span>
              {tool.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      {/* Composer */}
      <div className="border-t">
        <ChatComposer onSendMessage={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}
