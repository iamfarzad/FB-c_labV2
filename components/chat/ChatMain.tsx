"use client"

import type React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, User, Bot, ImageIcon, Copy, Check, Brain, AlertTriangle, Info, CheckCircle, Clock, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import type { Message } from "@/app/(chat)/chat/types/chat"

interface ChatMainProps {
  messages: Message[]
  isLoading: boolean
  messagesEndRef: React.RefObject<HTMLDivElement | null>
}

// Enhanced message formatter with better structure and readability
const formatMessageContent = (content: string) => {
  if (!content) return ""

  let formatted = content

  // Handle code blocks first (to preserve their content)
  const codeBlocks: string[] = []
  formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const index = codeBlocks.length
    codeBlocks.push(
      `<div class="my-4 p-4 bg-slate-900 rounded-lg border overflow-x-auto">
        ${lang ? `<div class="text-xs text-slate-400 mb-2 font-mono">${lang}</div>` : ''}
        <pre><code class="text-sm text-slate-100 font-mono">${code.trim()}</code></pre>
      </div>`
    )
    return `__CODE_BLOCK_${index}__`
  })

  // Handle inline code
  formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')

  // Handle headers with different levels
  formatted = formatted.replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-6 mb-3 text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">$1</h3>')
  formatted = formatted.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-4 text-slate-900 dark:text-slate-100">$1</h2>')
  formatted = formatted.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-4 text-slate-900 dark:text-slate-100">$1</h1>')

  // Handle special sections with icons and styling
  formatted = formatted.replace(/^\*\*Analysis:\*\*\s*(.+)$/gm, 
    '<div class="my-4 p-4 bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 rounded-r-lg">' +
    '<div class="flex items-center gap-2 mb-2">' +
    '<div class="w-5 h-5 text-blue-600 dark:text-blue-400"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>' +
    '<span class="font-semibold text-blue-900 dark:text-blue-100">Analysis</span>' +
    '</div>' +
    '<div class="text-blue-800 dark:text-blue-200">$1</div>' +
    '</div>'
  )

  formatted = formatted.replace(/^\*\*Summary:\*\*\s*(.+)$/gm, 
    '<div class="my-4 p-4 bg-green-50 dark:bg-green-950 border-l-4 border-green-500 rounded-r-lg">' +
    '<div class="flex items-center gap-2 mb-2">' +
    '<div class="w-5 h-5 text-green-600 dark:text-green-400"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>' +
    '<span class="font-semibold text-green-900 dark:text-green-100">Summary</span>' +
    '</div>' +
    '<div class="text-green-800 dark:text-green-200">$1</div>' +
    '</div>'
  )

  formatted = formatted.replace(/^\*\*Recommendation:\*\*\s*(.+)$/gm, 
    '<div class="my-4 p-4 bg-amber-50 dark:bg-amber-950 border-l-4 border-amber-500 rounded-r-lg">' +
    '<div class="flex items-center gap-2 mb-2">' +
    '<div class="w-5 h-5 text-amber-600 dark:text-amber-400"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>' +
    '<span class="font-semibold text-amber-900 dark:text-amber-100">Recommendation</span>' +
    '</div>' +
    '<div class="text-amber-800 dark:text-amber-200">$1</div>' +
    '</div>'
  )

  formatted = formatted.replace(/^\*\*Warning:\*\*\s*(.+)$/gm, 
    '<div class="my-4 p-4 bg-red-50 dark:bg-red-950 border-l-4 border-red-500 rounded-r-lg">' +
    '<div class="flex items-center gap-2 mb-2">' +
    '<div class="w-5 h-5 text-red-600 dark:text-red-400"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg></div>' +
    '<span class="font-semibold text-red-900 dark:text-red-100">Warning</span>' +
    '</div>' +
    '<div class="text-red-800 dark:text-red-200">$1</div>' +
    '</div>'
  )

  // Handle numbered lists with better styling
  formatted = formatted.replace(/^(\d+)\.\s*(.+)$/gm, (match, num, text) => {
    return `<div class="flex items-start gap-3 my-2">
      <div class="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">${num}</div>
      <div class="flex-1 pt-0.5">${text}</div>
    </div>`
  })

  // Handle bullet points with better styling
  formatted = formatted.replace(/^[\-\*\+]\s*(.+)$/gm, 
    '<div class="flex items-start gap-3 my-2">' +
    '<div class="flex-shrink-0 w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full mt-2"></div>' +
    '<div class="flex-1">$1</div>' +
    '</div>'
  )

  // Handle nested bullet points
  formatted = formatted.replace(/^  [\-\*\+]\s*(.+)$/gm, 
    '<div class="flex items-start gap-3 my-1 ml-6">' +
    '<div class="flex-shrink-0 w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mt-2"></div>' +
    '<div class="flex-1">$1</div>' +
    '</div>'
  )

  // Handle bold and italic text
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-slate-900 dark:text-slate-100">$1</strong>')
  formatted = formatted.replace(/\*([^*]+)\*/g, '<em class="italic text-slate-700 dark:text-slate-300">$1</em>')

  // Handle links
  formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, 
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">$1</a>'
  )

  // Handle line breaks and paragraphs
  formatted = formatted.replace(/\n\n/g, '</p><p class="mb-4">')
  formatted = formatted.replace(/\n/g, '<br>')

  // Wrap in paragraph if not already structured
  if (!formatted.includes('<div') && !formatted.includes('<h') && !formatted.includes('<p')) {
    formatted = `<p class="mb-4">${formatted}</p>`
  }

  // Restore code blocks
  codeBlocks.forEach((block, index) => {
    formatted = formatted.replace(`__CODE_BLOCK_${index}__`, block)
  })

  return formatted
}

// Detect message type for special handling
const detectMessageType = (content: string): { type: string; icon?: React.ReactNode; badge?: string } => {
  const lower = content.toLowerCase()
  
  if (lower.includes('analysis') || lower.includes('analyzing')) {
    return { type: 'analysis', icon: <Brain className="w-4 h-4" />, badge: 'Analysis' }
  }
  
  if (lower.includes('recommendation') || lower.includes('suggest') || lower.includes('should')) {
    return { type: 'recommendation', icon: <Target className="w-4 h-4" />, badge: 'Recommendation' }
  }
  
  if (lower.includes('step') || lower.includes('process') || lower.includes('how to')) {
    return { type: 'process', icon: <CheckCircle className="w-4 h-4" />, badge: 'Process' }
  }
  
  if (lower.includes('summary') || lower.includes('overview')) {
    return { type: 'summary', icon: <Info className="w-4 h-4" />, badge: 'Summary' }
  }
  
  return { type: 'default' }
}

export function ChatMain({ messages, isLoading, messagesEndRef }: ChatMainProps) {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  // Improved auto-scroll to bottom when messages change
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current && scrollAreaRef.current) {
        // Use requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
          messagesEndRef.current?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'end'
          })
        })
      }
    }

    // Scroll immediately for new messages
    scrollToBottom()
    
    // Also scroll after a short delay to handle dynamic content
    const timeoutId = setTimeout(scrollToBottom, 100)
    
    return () => clearTimeout(timeoutId)
  }, [messages, isLoading])

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden" data-testid="chat-main">
      <ScrollArea 
        ref={scrollAreaRef}
        className="flex-1 w-full chat-scroll-container"
        style={{ 
          height: '100%',
          // Ensure proper scrolling behavior
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="max-w-3xl mx-auto space-y-6 p-4 pb-8 chat-message-container" data-testid="messages-container">
          {messages.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Welcome to F.B/c AI</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Start a conversation by typing a message, uploading an image, or using voice input. I'm here to help with
              AI automation, analysis, and consultation.
            </p>
          </div>
        )}

        {messages.map((message) => {
          const messageType = message.role === "assistant" ? detectMessageType(message.content) : { type: 'default' }
          
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
                {/* Message type badge for AI responses */}
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
                    "px-4 py-2 rounded-lg max-w-[75%] break-words relative",
                    message.role === "user"
                      ? "chat-bubble-user"
                      : "chat-bubble-assistant"
                  )}
                >
                  {message.imageUrl && (
                    <div className="mb-3">
                      <div className="relative group/image">
                        <img
                          src={message.imageUrl || "/placeholder.svg"}
                          alt="Uploaded image"
                          className="max-w-full h-auto rounded-lg border max-h-96 object-contain"
                          loading="lazy"
                        />
                        <div className="absolute top-2 right-2 opacity-0 group-hover/image:opacity-100 transition-opacity">
                          <Button
                            variant="secondary"
                            size="icon"
                            className="w-8 h-8 bg-black/50 hover:bg-black/70 text-white"
                            onClick={() => window.open(message.imageUrl, "_blank")}
                          >
                            <ImageIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    className={cn(
                      "prose prose-sm max-w-none leading-relaxed",
                      message.role === "user" 
                        ? "prose-invert" 
                        : "dark:prose-invert prose-slate",
                      "prose-headings:mt-4 prose-headings:mb-2 prose-p:mb-3 prose-li:mb-1"
                    )}
                    dangerouslySetInnerHTML={{
                      __html: formatMessageContent(message.content),
                    }}
                  />

                  {message.sources && message.sources.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div className="space-y-2">
                        <p className="text-xs font-medium opacity-70 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          Sources:
                        </p>
                        <div className="space-y-1">
                          {message.sources.map((source, index) => (
                            <a
                              key={index}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-xs hover:underline opacity-80 hover:opacity-100 transition-opacity p-2 bg-slate-50 dark:bg-slate-800 rounded border-l-2 border-blue-400"
                            >
                              {source.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => copyToClipboard(message.content, message.id)}
                  >
                    {copiedMessageId === message.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>

                {message.createdAt && (
                  <span className="text-xs text-muted-foreground mt-1 px-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {message.createdAt.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>

              {message.role === "user" && (
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="bg-secondary">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          )
        })}

        {isLoading && (
          <div className="flex gap-3">
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div className="chat-bubble-assistant">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        {/* Scroll anchor - positioned at the bottom */}
        <div 
          ref={messagesEndRef} 
          className="h-0 w-0" 
          style={{ scrollMarginBottom: '20px' }}
        />
        </div>
      </ScrollArea>
    </div>
  )
}
