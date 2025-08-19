"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// Virtual scrolling removed - can be added with @tanstack/react-virtual package
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FbcIcon } from '@/components/ui/fbc-icon'
import { Send, RotateCcw, Settings, Maximize2, Copy, Check, Edit, Languages, User } from 'lucide-react'
import { 
  Conversation, 
  ConversationContent, 
  ConversationScrollButton 
} from '@/components/ai-elements/conversation'
import { 
  Message as AIMessage, 
  MessageContent as AIMessageContent, 
  MessageAvatar 
} from '@/components/ai-elements/message'
import { Response } from '@/components/ai-elements/response'
import { Reasoning, ReasoningTrigger, ReasoningContent } from '@/components/ai-elements/reasoning'
import { Sources, SourcesTrigger, SourcesContent, Source } from '@/components/ai-elements/source'
import { Suggestions, Suggestion } from '@/components/ai-elements/suggestion'
import { Actions, Action } from '@/components/ai-elements/actions'
import { 
  PromptInput, 
  PromptInputToolbar, 
  PromptInputTools, 
  PromptInputTextarea, 
  PromptInputSubmit 
} from '@/components/ai-elements/prompt-input'
import { ToolMenu } from '@/components/chat/ToolMenu'
import { ROICalculator } from '@/components/chat/tools/ROICalculator'
import type { ChatMessage } from '@/types/chat'
import { ToolCardWrapper } from '@/components/chat/ToolCardWrapper'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import CitationDisplay from '@/components/chat/CitationDisplay'
import { ActivityChip } from '@/components/chat/activity/ActivityChip'
import type { Options } from 'react-markdown'

// Types
export interface UnifiedMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  type?: 'default' | 'code' | 'image' | 'analysis' | 'tool' | 'insight'
  metadata?: {
    timestamp?: Date
    edited?: boolean
    sources?: Array<{ url: string; title?: string; description?: string }>
    citations?: Array<{ uri: string; title?: string }>
    tools?: Array<{ type: string; data: any }>
    suggestions?: string[]
    imageUrl?: string
    activities?: Array<{ type: 'in' | 'out'; label: string }>
  }
  rendering?: {
    format?: 'markdown' | 'html' | 'plain'
    theme?: 'default' | 'code' | 'insight'
    showReasoning?: boolean
  }
}

export interface UnifiedChatInterfaceProps {
  messages: UnifiedMessage[]
  isLoading?: boolean
  sessionId?: string | null
  mode?: 'full' | 'dock'
  onSendMessage?: (message: string) => void
  onClearMessages?: () => void
  onToolAction?: (tool: string, data?: any) => void
  onAssistantInject?: (message: UnifiedMessage) => void
  className?: string
  // Optional slot rendered as a sticky header inside the scrollable message list
  stickyHeaderSlot?: React.ReactNode
  // Optional slot rendered directly above the composer, pinned with it
  composerTopSlot?: React.ReactNode
}

// Message Component with memoization
const MessageComponent = memo<{ message: UnifiedMessage; isLast: boolean }>(
  ({ message, isLast }) => {
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
    const [isTranslating, setIsTranslating] = useState(false)
    const [translation, setTranslation] = useState<string | null>(null)
    
    const handleCopy = useCallback(async () => {
      try {
        await navigator.clipboard.writeText(message.content)
        setCopiedMessageId(message.id)
        setTimeout(() => setCopiedMessageId(null), 2000)
      } catch (error) {
        console.error('Failed to copy:', error)
      }
    }, [message.content, message.id])
    
    const handleTranslate = useCallback(async () => {
      setIsTranslating(true)
      try {
        const res = await fetch('/api/tools/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: message.content, targetLang: 'es' })
        })
        if (res.ok) {
          const data = await res.json()
          setTranslation(data.translated)
        }
      } catch (error) {
        console.error('Translation failed:', error)
      } finally {
        setIsTranslating(false)
      }
    }, [message.content])
    
    // Extract activities from content
    const contentParts = useMemo(() => {
      const content = message.content
      const regex = /\[(ACTIVITY_IN|ACTIVITY_OUT):([^\]]+)\]/g
      const parts: Array<{ type: 'text' | 'activity'; value: string; dir?: 'in' | 'out' }> = []
      let lastIndex = 0
      let match: RegExpExecArray | null
      while ((match = regex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          parts.push({ type: 'text', value: content.slice(lastIndex, match.index) })
        }
        const dir = match[1] === 'ACTIVITY_IN' ? 'in' : 'out'
        parts.push({ type: 'activity', value: match[2].trim(), dir })
        lastIndex = regex.lastIndex
      }
      if (lastIndex < content.length) {
        parts.push({ type: 'text', value: content.slice(lastIndex) })
      }
      return parts
    }, [message.content])
    
    return (
      <AIMessage from={message.role}>
        {/* Avatar */}
        {message.role === 'assistant' ? (
          <div className="relative inline-flex h-8 w-8 flex-none max-w-none items-center justify-center rounded-full border border-accent/20 bg-card shadow-sm">
            <FbcIcon className="h-4 w-4 text-accent" />
          </div>
        ) : (
          <Avatar className="h-8 w-8 flex-none max-w-none border border-border bg-card">
            <AvatarFallback className="bg-card text-foreground">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        )}
        
        <AIMessageContent>
          {/* Reasoning (for assistant messages) */}
          {message.role === 'assistant' && message.rendering?.showReasoning && (
            <Reasoning defaultOpen={false} isStreaming={isLast && false}>
              <ReasoningTrigger>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <p>Thinking…</p>
                </div>
              </ReasoningTrigger>
              <ReasoningContent>Processing your request...</ReasoningContent>
            </Reasoning>
          )}
          
          {/* Main content with activity chips */}
          <div className="prose prose-sm max-w-none leading-relaxed break-words dark:prose-invert">
            {contentParts.map((part, idx) => {
              if (part.type === 'activity' && part.dir) {
                return (
                  <ActivityChip 
                    key={`${message.id}-act-${idx}`} 
                    direction={part.dir} 
                    label={part.value} 
                    className="mx-1 align-middle" 
                  />
                )
              }
              return (
                <Response key={`${message.id}-txt-${idx}`}>
                  {part.value}
                </Response>
              )
            })}
          </div>

          {/* Inline tool result cards */}
          {message.type === 'tool' && message.metadata?.tools?.length && (
            <div className="mt-3">
              {message.metadata.tools.map((t, i) => {
                if (t.type === 'roiResult') {
                  const r = t.data || {}
                  return (
                    <ToolCardWrapper key={`tool-${message.id}-${i}`} title="ROI Summary" icon={<FbcIcon className="h-4 w-4" />}>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="text-center p-3 rounded-md bg-accent/10">
                          <div className="font-semibold text-accent">{r.estimatedROI ?? r.roi}%</div>
                          <div className="text-xs text-muted-foreground">ROI</div>
                        </div>
                        <div className="text-center p-3 rounded-md bg-accent/5">
                          <div className="font-semibold">{r.paybackPeriod ?? '—'}</div>
                          <div className="text-xs text-muted-foreground">Payback (mo)</div>
                        </div>
                        <div className="text-center p-3 rounded-md bg-accent/5">
                          <div className="font-semibold">${(r.costSavings ?? r.netProfit)?.toLocaleString?.() ?? r.costSavings}</div>
                          <div className="text-xs text-muted-foreground">Net Profit</div>
                        </div>
                      </div>
                    </ToolCardWrapper>
                  )
                }
                return null
              })}
            </div>
          )}
          
          {/* Image if present */}
          {message.metadata?.imageUrl && (
            <div className="mt-3 rounded-lg overflow-hidden border border-border/20">
              <img 
                src={message.metadata.imageUrl} 
                alt="Message attachment" 
                className="max-w-full h-auto"
              />
            </div>
          )}
          
          {/* Citations */}
          {message.metadata?.citations && message.metadata.citations.length > 0 && (
            <CitationDisplay citations={message.metadata.citations} />
          )}
          
          {/* Sources */}
          {message.metadata?.sources && message.metadata.sources.length > 0 && (
            <div className="mt-2">
              <Sources>
                <SourcesTrigger count={message.metadata.sources.length} />
                <SourcesContent>
                  {message.metadata.sources.map((source, i) => (
                    <Source 
                      key={`${message.id}-src-${i}`} 
                      href={source.url} 
                      title={source.title || source.url} 
                    />
                  ))}
                </SourcesContent>
              </Sources>
            </div>
          )}
          
          {/* Translation */}
          {translation && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-sm border-l-2 border-accent/40 pl-3 text-foreground/90"
            >
              <div className="mb-1 text-xs uppercase tracking-wide opacity-70">
                Translated (ES)
              </div>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {translation}
              </div>
            </motion.div>
          )}
          
          {/* Suggestions */}
          {message.role === 'assistant' && message.metadata?.suggestions && (
            <div className="mt-2">
              <Suggestions>
                {message.metadata.suggestions.map((suggestion, i) => (
                  <Suggestion 
                    key={`${message.id}-sug-${i}`} 
                    suggestion={suggestion} 
                    onClick={() => console.log('Suggestion clicked:', suggestion)} 
                  />
                ))}
              </Suggestions>
            </div>
          )}
          
          {/* Actions */}
          <Actions className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Action
              tooltip={copiedMessageId === message.id ? 'Copied' : 'Copy'}
              aria-label="Copy"
              variant="ghost"
              size="sm"
              onClick={handleCopy}
            >
              {copiedMessageId === message.id ? 
                <Check className="w-3 h-3 text-green-600" /> : 
                <Copy className="w-3 h-3" />
              }
            </Action>
            
            {message.role === 'user' && (
              <Action
                tooltip="Edit"
                aria-label="Edit message"
                variant="ghost"
                size="sm"
                onClick={() => console.log('Edit message:', message.id)}
              >
                <Edit className="w-3 h-3" />
              </Action>
            )}
            
            {message.role === 'assistant' && (
              <Action
                tooltip={isTranslating ? 'Translating…' : 'Translate'}
                aria-label="Translate"
                variant="ghost"
                size="sm"
                onClick={handleTranslate}
                disabled={isTranslating}
              >
                <Languages className="w-3 h-3" />
              </Action>
            )}
          </Actions>
        </AIMessageContent>
      </AIMessage>
    )
  },
  (prevProps, nextProps) => {
    // Only re-render if key properties change
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.message.content === nextProps.message.content &&
      prevProps.message.metadata?.edited === nextProps.message.metadata?.edited &&
      prevProps.isLast === nextProps.isLast
    )
  }
)

MessageComponent.displayName = 'MessageComponent'

// Optimized Message List with performance considerations
const MessageList: React.FC<{ 
  messages: UnifiedMessage[]; 
  isLoading: boolean;
  stickyHeader?: React.ReactNode;
}> = ({ messages, isLoading, stickyHeader }) => {
  const parentRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isNearBottomRef = useRef(true)

  // Non-virtual rendering for visual stability; we'll re-introduce virtualization behind a flag later
  
  // Track whether user is near the bottom to decide stick-to-bottom behavior
  useEffect(() => {
    const el = parentRef.current
    if (!el) return
    const handleScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight
      isNearBottomRef.current = distance < 120
    }
    handleScroll()
    el.addEventListener('scroll', handleScroll)
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-scroll to bottom on new messages (only if user is near bottom)
  useEffect(() => {
    const id = window.setTimeout(() => {
      if (!isNearBottomRef.current) return
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }, 80)
    return () => window.clearTimeout(id)
  }, [messages.length])
  
  const handleKeyScroll = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const el = parentRef.current
    if (!el) return
    if (e.key === 'PageDown') {
      e.preventDefault()
      el.scrollBy({ top: el.clientHeight - 80, behavior: 'smooth' })
    } else if (e.key === 'PageUp') {
      e.preventDefault()
      el.scrollBy({ top: -(el.clientHeight - 80), behavior: 'smooth' })
    } else if (e.key === 'End') {
      e.preventDefault()
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    } else if (e.key === 'Home') {
      e.preventDefault()
      el.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  return (
    <div
      ref={parentRef}
      className="h-full overflow-y-auto"
      role="region"
      aria-label="Message list"
      tabIndex={0}
      onKeyDown={handleKeyScroll}
    >
      {stickyHeader && (
        <div className="sticky top-0 z-30 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="mx-auto max-w-3xl px-4 pt-2 pb-3">
            {stickyHeader}
          </div>
        </div>
      )}
      <div className="mx-auto max-w-3xl space-y-4 p-4 pb-32">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.15) }}
              layout
            >
              <MessageComponent message={message} isLast={index === messages.length - 1} />
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <div className="h-2 w-2 rounded-full bg-current animate-pulse" />
            <div className="h-2 w-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '75ms' }} />
            <div className="h-2 w-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '150ms' }} />
          </motion.div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>
    </div>
  )
}

// Main Unified Chat Interface
export const UnifiedChatInterface: React.FC<UnifiedChatInterfaceProps> = ({
  messages,
  isLoading = false,
  sessionId,
  mode = 'full',
  onSendMessage,
  onClearMessages,
  onToolAction,
  className,
  stickyHeaderSlot,
  composerTopSlot,
  onAssistantInject
}) => {
  const [input, setInput] = useState('')
  const isDock = mode === 'dock'
  const [isRoiOpen, setIsRoiOpen] = useState(false)
  const [localMessages, setLocalMessages] = useState<UnifiedMessage[]>(messages)

  // Keep local copy in sync when prop changes
  useEffect(() => { setLocalMessages(messages) }, [messages])

  // Listen for tool analysis events to append assistant messages
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ content: string; sources?: any; type?: string }>
      const payload = ce.detail || { content: '' }
      const msg: UnifiedMessage = {
        id: `msg-${Date.now()}-tool`,
        role: 'assistant',
        content: payload.content,
        type: payload.type === 'analysis' ? 'analysis' : 'tool',
        metadata: { timestamp: new Date(), sources: payload.sources }
      }
      if (typeof onAssistantInject === 'function') onAssistantInject(msg)
      else setLocalMessages(prev => [...prev, msg])
    }
    window.addEventListener('chat:assistant', handler as EventListener)
    return () => window.removeEventListener('chat:assistant', handler as EventListener)
  }, [])
  
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && onSendMessage) {
      onSendMessage(input.trim())
      setInput('')
    }
  }, [input, onSendMessage])
  
  return (
    <TooltipProvider>
      <div className={cn(
        isDock ? 'h-full flex flex-col overflow-hidden bg-background' : 
        'fixed inset-0 z-40 flex h-[100dvh] flex-col overflow-hidden bg-background',
        className
      )}>
        {/* Header */}
        {!isDock && (
          <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/95 p-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <FbcIcon className="h-6 w-6 text-accent" />
              <div>
                <h1 className="text-lg font-semibold text-foreground">F.B/c — Unified Chat</h1>
                <p className="text-xs text-muted-foreground">
                  Optimized message architecture
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={onClearMessages}
                className="border-accent/30 hover:border-accent hover:bg-accent/10"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-accent/10">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </header>
        )}
        
        {/* Conversation Area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <Conversation className="h-full" aria-live="polite" aria-busy={isLoading}>
            <ConversationContent className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6" aria-label="Chat messages">
              {messages.length === 0 && !isLoading ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 min-h-[40vh] grid place-items-center"
                >
                  <div className="text-center">
                    <h3 className="text-2xl font-semibold">
                      Ready to assist you
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      Ask anything or share what you're working on
                    </p>
                  </div>
                </motion.div>
              ) : (
                <MessageList 
                  messages={localMessages} 
                  isLoading={isLoading}
                  stickyHeader={stickyHeaderSlot}
                />
              )}
            </ConversationContent>
            <ConversationScrollButton className="bg-accent hover:bg-accent/90 text-accent-foreground backdrop-blur" />
          </Conversation>
        </div>
        
        {/* Composer */}
        <div className={cn(
          "sticky bottom-0 z-50 w-full",
          isDock ? 
          "bg-background/60 backdrop-blur" : 
          "bg-gradient-to-t from-background via-background/90 to-transparent"
        )}>
          <div className="mx-auto max-w-3xl px-4 pb-4 pt-2">
            {composerTopSlot && (
              <div className="mb-2 flex items-center justify-between gap-3">
                {composerTopSlot}
              </div>
            )}
            <PromptInput onSubmit={handleSubmit} aria-label="Chat composer">
            <PromptInputToolbar>
              <PromptInputTools>
                <ToolMenu 
                  onUploadDocument={() => onToolAction?.('document')}
                  onUploadImage={() => onToolAction?.('image')}
                  onWebcam={() => onToolAction?.('webcam')}
                  onScreenShare={() => onToolAction?.('screen')}
                  onROI={() => { onToolAction?.('roi') }}
                  onVideoToApp={() => onToolAction?.('video')}
                  comingSoon={['webcam','screen','video']}
                />
                <Badge className="ml-2 text-[11px] bg-accent/10 text-accent border-accent/20">
                  Context Aware
                </Badge>
              </PromptInputTools>
              {isDock && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto"
                  onClick={() => window.location.href = '/chat'}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              )}
            </PromptInputToolbar>
            <PromptInputTextarea
              placeholder="Message F.B/c…"
              className="min-h-[64px] text-base"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="Type your message"
              id="chat-textarea"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  if (input.trim()) {
                    onSendMessage?.(input.trim())
                    setInput('')
                  }
                }
              }}
            />
            <div className="flex items-center justify-between p-1">
              <div className="text-xs text-muted-foreground">
                {sessionId && `Session: ${sessionId.slice(0, 8)}...`}
              </div>
              <PromptInputSubmit status={isLoading ? 'submitted' : undefined} />
            </div>
          </PromptInput>
          </div>
        </div>
        {/* ROI inline tool host (invisible). Kept for future card-mode hosting if needed */}
        {false && (
          <ROICalculator 
            mode="card"
            onComplete={() => undefined}
            onEmitMessage={(msg: ChatMessage) => onAssistantInject?.({
              id: `msg-${Date.now()}-tool`,
              role: msg.role as any,
              type: (msg as any).type === 'roi.result' ? 'tool' : 'default',
              content: 'Tool result',
              metadata: { tools: [{ type: 'roiResult', data: (msg as any).payload }] }
            })}
          />
        )}
      </div>
    </TooltipProvider>
  )
}

export default UnifiedChatInterface
