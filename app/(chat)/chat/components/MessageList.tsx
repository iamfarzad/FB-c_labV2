"use client"

import { useEffect, useRef, useState } from "react"
import { Bot, User, Copy, ThumbsUp, ThumbsDown, MoreHorizontal, Sparkles, Clock } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Message } from "../types/chat"

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)

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

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (err) {
      console.error("Failed to copy text:", err)
    }
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center space-y-6 max-w-2xl">
          <div className="relative">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome to Uniq AI</h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Your advanced business AI assistant is ready to help you succeed
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              I can assist with ROI analysis, lead generation, document analysis, meeting scheduling, and much more.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            {[
              { icon: "📊", title: "ROI Analysis", desc: "Calculate returns and business metrics" },
              { icon: "👥", title: "Lead Generation", desc: "Research and capture potential clients" },
              { icon: "📈", title: "Document Analysis", desc: "Analyze business documents and reports" },
              { icon: "📅", title: "Meeting Scheduler", desc: "Schedule and manage appointments" },
            ].map((feature, index) => (
              <Card
                key={index}
                className="p-4 text-left hover:shadow-md transition-shadow duration-200 border-slate-200 dark:border-slate-700"
              >
                <div className="text-2xl mb-2">{feature.icon}</div>
                <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1">{feature.title}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{feature.desc}</div>
              </Card>
            ))}
          </div>

          <div className="pt-4">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Start by typing a message or selecting a business tool above
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex gap-4 group ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "assistant" && (
              <Avatar className="h-10 w-10 shrink-0 ring-2 ring-blue-500/20">
                <AvatarImage src="/placeholder-logo.svg" alt="AI" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            )}

            <div
              className={`max-w-[80%] space-y-2 ${message.role === "user" ? "items-end" : "items-start"} flex flex-col`}
            >
              {/* Message Header */}
              <div className="flex items-center gap-2">
                {message.role === "assistant" && (
                  <>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      {message.model || "AI"}
                    </Badge>
                    {index === messages.length - 1 && (
                      <Badge
                        variant="outline"
                        className="text-xs text-green-600 border-green-200 dark:text-green-400 dark:border-green-800"
                      >
                        Latest
                      </Badge>
                    )}
                  </>
                )}
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(message.timestamp)}
                </span>
              </div>

              {/* Message Content */}
              <div
                className={`relative group/message rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-12"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mr-12"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                {/* Message Actions */}
                <div
                  className={`absolute top-2 right-2 opacity-0 group-hover/message:opacity-100 transition-opacity ${
                    message.role === "user" ? "text-white/70" : ""
                  }`}
                >
                  <TooltipProvider>
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-black/10"
                            onClick={() => copyToClipboard(message.content, message.id)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{copiedMessageId === message.id ? "Copied!" : "Copy message"}</p>
                        </TooltipContent>
                      </Tooltip>

                      {message.role === "assistant" && (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-black/10">
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Good response</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-black/10">
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Poor response</p>
                            </TooltipContent>
                          </Tooltip>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-black/10">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>Regenerate</DropdownMenuItem>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>Share</DropdownMenuItem>
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
              <Avatar className="h-10 w-10 shrink-0 ring-2 ring-green-500/20">
                <AvatarImage src="/placeholder-user.jpg" alt="User" />
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {/* Loading State */}
        {isLoading && (
          <div className="flex gap-4 justify-start">
            <Avatar className="h-10 w-10 shrink-0 ring-2 ring-blue-500/20">
              <AvatarImage src="/placeholder-logo.svg" alt="AI" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 mr-12 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="secondary"
                  className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Thinking...
                </Badge>
              </div>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
