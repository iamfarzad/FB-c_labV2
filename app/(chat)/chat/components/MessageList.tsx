"use client"

import { useEffect, useRef } from "react"
import { Bot, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { Message } from "../types/chat"

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch {
      return "Now"
    }
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Welcome to Uniq AI</h3>
            <p className="text-muted-foreground mb-4">
              Your advanced business AI assistant. I can help you with ROI analysis, lead generation, document analysis,
              meeting scheduling, and more.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <Card className="p-3 text-left">
              <div className="font-medium mb-1">📊 ROI Analysis</div>
              <div className="text-muted-foreground text-xs">Calculate returns and business metrics</div>
            </Card>
            <Card className="p-3 text-left">
              <div className="font-medium mb-1">👥 Lead Generation</div>
              <div className="text-muted-foreground text-xs">Research and capture potential clients</div>
            </Card>
            <Card className="p-3 text-left">
              <div className="font-medium mb-1">📈 Document Analysis</div>
              <div className="text-muted-foreground text-xs">Analyze business documents and reports</div>
            </Card>
            <Card className="p-3 text-left">
              <div className="font-medium mb-1">📅 Meeting Scheduler</div>
              <div className="text-muted-foreground text-xs">Schedule and manage appointments</div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
          {message.role === "assistant" && (
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src="/placeholder-logo.svg" alt="AI" />
              <AvatarFallback>
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          )}

          <div
            className={`max-w-[70%] space-y-1 ${message.role === "user" ? "items-end" : "items-start"} flex flex-col`}
          >
            <div className="flex items-center gap-2">
              {message.role === "assistant" && (
                <Badge variant="secondary" className="text-xs">
                  {message.model || "AI"}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
            </div>

            <div
              className={`rounded-lg px-3 py-2 ${
                message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>

          {message.role === "user" && (
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src="/placeholder-user.jpg" alt="User" />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      ))}

      {isLoading && (
        <div className="flex gap-3 justify-start">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src="/placeholder-logo.svg" alt="AI" />
            <AvatarFallback>
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>

          <div className="bg-muted rounded-lg px-3 py-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
              <div
                className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              />
              <div
                className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}
