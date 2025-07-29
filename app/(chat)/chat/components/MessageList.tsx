"use client"

import { useEffect, useRef } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, User } from "lucide-react"
import type { Message } from "../types/chat"

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
          {message.role === "assistant" && (
            <Avatar className="h-8 w-8 mt-1">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          )}

          <Card
            className={`max-w-[80%] p-4 ${
              message.role === "user" ? "bg-primary text-primary-foreground ml-12" : "bg-muted mr-12"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">{message.role === "user" ? "You" : "Uniq AI"}</span>
              {message.model && (
                <Badge variant="secondary" className="text-xs">
                  {message.model}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="prose prose-sm max-w-none">{message.content}</div>
          </Card>

          {message.role === "user" && (
            <Avatar className="h-8 w-8 mt-1">
              <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      ))}

      {isLoading && (
        <div className="flex gap-3 justify-start">
          <Avatar className="h-8 w-8 mt-1">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <Card className="max-w-[80%] p-4 bg-muted mr-12">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Uniq AI</span>
              <Badge variant="secondary" className="text-xs">
                Thinking...
              </Badge>
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
              <div
                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              />
              <div
                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
            </div>
          </Card>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}
