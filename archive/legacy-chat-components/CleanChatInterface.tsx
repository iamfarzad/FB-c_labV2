"use client"

import React, { useState, useRef, useEffect } from 'react'
import { cn } from "@/lib/utils"
import { FbcIcon } from "@/components/ui/fbc-icon"
import { User, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  citations?: Citation[]
  sources?: Source[]
  isStreaming?: boolean
}

interface Citation {
  id: string
  text: string
  source: string
  url?: string
}

interface Source {
  id: string
  title: string
  url: string
  snippet?: string
}

interface CleanChatInterfaceProps {
  messages: Message[]
  isTyping?: boolean
  onSendMessage?: (message: string) => void
}

export function CleanChatInterface({ 
  messages, 
  isTyping = false, 
  onSendMessage 
}: CleanChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set())

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const toggleSources = (messageId: string) => {
    setExpandedSources(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Empty State */}
          {messages.length === 0 && !isTyping && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center">
                  <FbcIcon className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">Ready to collaborate</h2>
                  <p className="text-muted-foreground max-w-md">
                    Start a conversation with F.B/c AI. Ask questions, analyze content, or explore ideas together.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Context aware • Grounded responses</span>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isLast={index === messages.length - 1}
              onToggleSources={() => toggleSources(message.id)}
              sourcesExpanded={expandedSources.has(message.id)}
            />
          ))}

          {/* Typing Indicator */}
          {isTyping && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ 
  message, 
  isLast, 
  onToggleSources, 
  sourcesExpanded 
}: {
  message: Message
  isLast: boolean
  onToggleSources: () => void
  sourcesExpanded: boolean
}) {
  const isUser = message.role === 'user'
  const hasGrounding = message.citations?.length || message.sources?.length

  return (
    <div className={cn(
      "flex gap-4 group animate-slide-up",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
        isUser 
          ? "bg-primary/10 ring-2 ring-primary/20" 
          : "bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm"
      )}>
        {isUser ? (
          <User className="w-5 h-5 text-primary" />
        ) : (
          <FbcIcon className="w-5 h-5 text-primary" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex-1 max-w-3xl space-y-2",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Role Label */}
        <div className={cn(
          "text-xs text-muted-foreground flex items-center gap-2",
          isUser ? "justify-end" : "justify-start"
        )}>
          <span>{isUser ? "You" : "F.B/c AI"}</span>
          {!isUser && hasGrounding && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600 text-[10px] font-medium">Grounded</span>
            </div>
          )}
        </div>

        {/* Message Bubble */}
        <div className={cn(
          "relative px-4 py-3 rounded-2xl transition-all duration-200 hover:shadow-sm",
          isUser 
            ? "bg-primary text-primary-foreground ml-8" 
            : "bg-card border border-border/50 mr-8",
          message.isStreaming && "animate-pulse"
        )}>
          {/* Streaming Content */}
          {message.isStreaming ? (
            <StreamingText content={message.content} />
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {message.content}
            </div>
          )}

          {/* Citations */}
          {message.citations && message.citations.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {message.citations.map((citation, index) => (
                <CitationBadge key={citation.id} citation={citation} index={index + 1} />
              ))}
            </div>
          )}
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSources}
              className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
            >
              <span>Sources ({message.sources.length})</span>
              {sourcesExpanded ? (
                <ChevronUp className="w-3 h-3 ml-1" />
              ) : (
                <ChevronDown className="w-3 h-3 ml-1" />
              )}
            </Button>

            {sourcesExpanded && (
              <div className="space-y-2 animate-slide-down">
                {message.sources.map((source) => (
                  <SourceCard key={source.id} source={source} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        <div className={cn(
          "text-[10px] text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity",
          isUser ? "text-right" : "text-left"
        )}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}

function StreamingText({ content }: { content: string }) {
  const [displayedContent, setDisplayedContent] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedContent(prev => prev + content[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 20) // Adjust speed as needed

      return () => clearTimeout(timer)
    }
  }, [content, currentIndex])

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      {displayedContent}
      <span className="animate-pulse">|</span>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-4 animate-slide-up">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm">
        <FbcIcon className="w-5 h-5 text-primary" />
      </div>
      
      <div className="flex-1 max-w-3xl space-y-2">
        <div className="text-xs text-muted-foreground">F.B/c AI</div>
        
        <div className="bg-card border border-border/50 rounded-2xl px-4 py-3 mr-8">
          <div className="flex items-center gap-1">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:0ms]"></div>
              <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:150ms]"></div>
              <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:300ms]"></div>
            </div>
            <span className="text-xs text-muted-foreground ml-2">Thinking...</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function CitationBadge({ citation, index }: { citation: Citation; index: number }) {
  return (
    <button className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-xs rounded-md transition-colors group">
      <span className="font-medium">[{index}]</span>
      {citation.url && <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />}
    </button>
  )
}

function SourceCard({ source }: { source: Source }) {
  return (
    <div className="bg-muted/30 border border-border/30 rounded-lg p-3 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-foreground truncate">{source.title}</h4>
          {source.snippet && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{source.snippet}</p>
          )}
          <div className="text-xs text-muted-foreground/80 mt-1 truncate">{source.url}</div>
        </div>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0">
          <ExternalLink className="w-3 h-3" />
        </Button>
      </div>
    </div>
  )
}
