"use client"

import { memo } from "react"
import type { Message } from "@/types/chat"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, User } from "lucide-react"

interface ChatMessagesProps {
  messages: Message[]
}

export const ChatMessages = memo<ChatMessagesProps>(({ messages }) => {
  if (!messages.length) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Start a conversation to see messages here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <div key={index} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
          {message.role === "assistant" && (
            <Avatar className="w-8 h-8">
              <AvatarFallback>
                <Bot className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
          )}

          <Card className={`max-w-[80%] ${message.role === "user" ? "bg-primary text-primary-foreground" : ""}`}>
            <CardContent className="p-3">
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </CardContent>
          </Card>

          {message.role === "user" && (
            <Avatar className="w-8 h-8">
              <AvatarFallback>
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      ))}
    </div>
  )
})

ChatMessages.displayName = "ChatMessages"
