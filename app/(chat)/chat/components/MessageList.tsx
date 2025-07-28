"use client"

import type React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Bot, User, ImageIcon, Copy, Check, Info, Clock, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import type { Message } from "@/app/(chat)/chat/types/chat"
import { EmptyState } from "./EmptyState"
import { LoadingState } from "./LoadingState"
import { ErrorState } from "./ErrorState"

const formatMessageContent = (content: string): string => {
  if (!content) return ""
  return content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
}

const detectMessageType = (content: string): { type: string; icon?: React.ReactNode; badge?: string } => {
  if (!content) return { type: "default" }
  if (content.includes("```")) return { type: "code", icon: <FileText className="w-3 h-3 mr-1" />, badge: "Code" }
  if (content.includes("![") || content.includes("<img"))
    return { type: "image", icon: <ImageIcon className="w-3 h-3 mr-1" />, badge: "Image" }
  if (content.length > 300) return { type: "long", icon: <FileText className="w-3 h-3 mr-1" />, badge: "Long Message" }
  return { type: "default" }
}

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
  error: Error | undefined
  onExampleQuery: (query: string) => void
  onRetry: () => void
}

export function MessageList({ messages, isLoading, error, onExampleQuery, onRetry }: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (err) {
      console.error("Failed to copy text:", err)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const renderContent = () => {
    if (error) {
      return <ErrorState error={error} onRetry={onRetry} />
    }
    if (messages.length === 0 && !isLoading) {
      return <EmptyState onExampleQuery={onExampleQuery} />
    }
    return (
      <>
        {messages.map((message) => {
          if (!message?.id) return null
          const messageType =
            message.role === "assistant" ? detectMessageType(message.content || "") : { type: "default" }
          return (
            <div
              key={message.id}
              className={cn("flex gap-3 group", message.role === "user" ? "justify-end" : "justify-start")}
            >
              {message.role === "assistant" && (
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={cn("flex flex-col max-w-[80%]", message.role === "user" ? "items-end" : "items-start")}>
                {message.role === "assistant" && messageType.badge && (
                  <div className="mb-2">
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      {messageType.icon}
                      {messageType.badge}
                    </Badge>
                  </div>
                )}
                <div
                  className={cn(
                    "relative group/message transition-all duration-200 hover:shadow-md",
                    "focus-within:ring-2 focus-within:ring-accent/20 focus-within:ring-offset-2",
                    message.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant",
                  )}
                >
                  {message.imageUrl && (
                    <div className="mb-3">
                      <img
                        src={message.imageUrl || "/placeholder.svg"}
                        alt="Uploaded content"
                        className="max-w-full h-auto rounded-lg border max-h-96 object-contain"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div
                    className="prose prose-sm max-w-none leading-relaxed break-words prose-invert"
                    dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content || "") }}
                  />
                  {message.sources && message.sources.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div className="space-y-2">
                        <p className="text-xs font-medium opacity-70 flex items-center gap-1">
                          <Info className="w-3 h-3" /> Sources:
                        </p>
                        {message.sources.map((src, idx) => (
                          <a
                            key={`${message.id}-source-${idx}`}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-xs hover:underline opacity-80 hover:opacity-100 transition-opacity p-2 bg-slate-50 dark:bg-slate-800 rounded border-l-2 border-blue-400"
                          >
                            {src.title || "Source"}
                          </a>
                        ))}
                      </div>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover/message:opacity-100 transition-opacity hover:bg-accent/10"
                    onClick={() => copyToClipboard(message.content || "", message.id)}
                  >
                    {copiedMessageId === message.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
                {message.createdAt && (
                  <span className="text-xs text-muted-foreground mt-1 px-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
              {message.role === "user" && (
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="bg-accent text-accent-foreground">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          )
        })}
        {isLoading && <LoadingState />}
        <div ref={messagesEndRef} className="h-0 w-0" />
      </>
    )
  }

  return (
    <main className="flex-1 overflow-hidden">
      <ScrollArea className="h-full w-full chat-scroll-container" ref={scrollAreaRef}>
        <div className="max-w-4xl mx-auto space-y-6 p-4 pb-8 chat-message-container">{renderContent()}</div>
      </ScrollArea>
    </main>
  )
}
