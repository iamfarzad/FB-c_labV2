"use client"

import { useEffect, useRef, useState } from "react"
import {
  Bot,
  User,
  Copy,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Sparkles,
  Clock,
  CheckCircle,
  RefreshCw,
  Share,
  Edit3,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Message } from "../types/chat"

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
  isTyping: boolean
}

export function MessageList({ messages, isLoading, isTyping }: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)

  const scrollToBottom = () => {
    const viewport = scrollAreaRef.current?.querySelector("div[data-radix-scroll-area-viewport]")
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch {
      return "Now"
    }
  }

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (err) {
      console.error("Failed to copy text:", err)
    }
  }

  // Enhanced emoji rendering function
  const renderMessageContent = (content: string) => {
    // Split content by emojis and render them with proper styling
    const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu
    const parts = content.split(emojiRegex)

    return parts.map((part, index) => {
      if (emojiRegex.test(part)) {
        return (
          <span
            key={index}
            className="inline-block text-lg leading-none mx-0.5 align-middle"
            style={{ fontFamily: "Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif" }}
          >
            {part}
          </span>
        )
      }
      return part
    })
  }

  if (messages.length === 0 && !isTyping) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center space-y-8 max-w-2xl">
          <div className="relative">
            <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-2xl">
              <Bot className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Welcome to Uniq AI</h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              Your advanced business AI assistant is ready to help you succeed
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500 max-w-lg mx-auto leading-relaxed">
              I can assist with ROI analysis, lead generation, document analysis, meeting scheduling, and much more.
              Let's transform your business operations together! 🚀
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-10">
            {[
              { emoji: "📊", title: "ROI Analysis", desc: "Calculate returns and business metrics" },
              { emoji: "👥", title: "Lead Generation", desc: "Research and capture potential clients" },
              { emoji: "📈", title: "Document Analysis", desc: "Analyze business documents and reports" },
              { emoji: "📅", title: "Meeting Scheduler", desc: "Schedule and manage appointments" },
            ].map((feature, index) => (
              <Card
                key={index}
                className="p-6 text-left hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 group cursor-pointer"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {feature.emoji}
                </div>
                <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-2">{feature.title}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</div>
              </Card>
            ))}
          </div>

          <div className="pt-6">
            <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-2">
              <Sparkles className="h-3 w-3" />
              Start by typing a message or selecting a business tool above
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full" ref={scrollAreaRef}>
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex gap-4 group ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "assistant" && (
              <Avatar className="w-8 h-8 border shrink-0">
                <AvatarFallback>
                  <Bot className="w-5 h-5 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
            )}

            <div
              className={`max-w-[75%] space-y-3 ${message.role === "user" ? "items-end" : "items-start"} flex flex-col`}
            >
              {/* Enhanced Message Header */}
              <div className="flex items-center gap-3">
                {message.role === "assistant" && (
                  <>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800 px-2 py-1"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      {message.model || "AI Assistant"}
                    </Badge>
                    {index === messages.length - 1 && (
                      <Badge
                        variant="outline"
                        className="text-xs text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800 px-2 py-1"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Latest
                      </Badge>
                    )}
                  </>
                )}
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {formatTime(message.timestamp)}
                </span>
              </div>

              {/* Enhanced Message Content with better emoji rendering */}
              <div
                className={`relative group/message rounded-2xl px-5 py-4 shadow-sm transition-all duration-300 hover:shadow-md ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white ml-12 shadow-lg"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mr-12 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {renderMessageContent(message.content)}
                </div>

                {/* Enhanced Message Actions */}
                <div
                  className={`absolute top-3 right-3 opacity-0 group-hover/message:opacity-100 transition-all duration-200 ${
                    message.role === "user" ? "text-white/70" : ""
                  }`}
                >
                  <TooltipProvider>
                    <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-lg p-1 backdrop-blur-sm">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-black/10 dark:hover:bg-white/10 rounded-md"
                            onClick={() => copyToClipboard(message.content, message.id)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{copiedMessageId === message.id ? "Copied! ✅" : "Copy message"}</p>
                        </TooltipContent>
                      </Tooltip>

                      {message.role === "assistant" && (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 hover:bg-black/10 dark:hover:bg-white/10 rounded-md hover:text-emerald-600"
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Good response 👍</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 hover:bg-black/10 dark:hover:bg-white/10 rounded-md hover:text-red-500"
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Poor response 👎</p>
                            </TooltipContent>
                          </Tooltip>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 hover:bg-black/10 dark:hover:bg-white/10 rounded-md"
                              >
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem className="gap-2">
                                <RefreshCw className="h-3 w-3" />
                                Regenerate
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Edit3 className="h-3 w-3" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Share className="h-3 w-3" />
                                Share
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      )}
                    </div>
                  </TooltipProvider>
                </div>
              </div>
            </div>

            {message.role === "user" && (
              <Avatar className="w-8 h-8 border shrink-0">
                <AvatarFallback>
                  <User className="w-5 h-5 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {/* Enhanced Loading State */}
        {isLoading && (
          <div className="flex gap-4 justify-start">
            <Avatar className="w-8 h-8 border">
              <AvatarFallback>
                <Bot className="w-5 h-5 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 mr-12 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Badge
                  variant="secondary"
                  className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                >
                  <Sparkles className="h-3 w-3 mr-1 animate-pulse" />
                  Thinking...
                </Badge>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              </div>
            </div>
          </div>
        )}

        {isTyping && (
          <div className="flex gap-4 justify-start">
            <Avatar className="w-8 h-8 border">
              <AvatarFallback>
                <Bot className="w-5 h-5 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-muted/50 border border-border/40 rounded-2xl px-5 py-4">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-pulse" />
                <div
                  className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                />
                <div
                  className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
