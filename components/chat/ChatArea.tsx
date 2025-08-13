"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// Consolidated Phosphor icons imports
import { 
  Copy, Check, Download, Play, Pause, Square, RotateCcw, FileText, 
  ImageIcon, Video, Mic, Calculator, Monitor, Sparkles, Zap, 
  TrendingUp, FileSearch, Brain, Loader2, User, AlertTriangle, 
  Clock, Target, Edit, Languages, Send 
} from '@/lib/icon-mapping'
import { FbcIcon } from '@/components/ui/fbc-icon'
import PillInput from '@/components/ui/PillInput'
import { ToolMenu } from '@/components/chat/ToolMenu'

// UI Components
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
// Separator not needed after removing sources summary
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Utils and Types
import { cn } from '@/lib/utils'
import { Message } from '@/app/(chat)/chat/types/chat'
import { VoiceInput } from "@/components/chat/tools/VoiceInput"
import { ROICalculator } from "@/components/chat/tools/ROICalculator"
import { VideoToApp } from "@/components/chat/tools/VideoToApp"
import { WebcamCapture } from "@/components/chat/tools/WebcamCapture"
import { ScreenShare } from "@/components/chat/tools/ScreenShare"
import { BusinessContentRenderer } from "@/components/chat/BusinessContentRenderer"
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from "@/components/ai-elements/tool"
import { AIThinkingIndicator, detectAIContext, type AIThinkingContext } from "./AIThinkingIndicator"
import { AIInsightCard } from "./AIInsightCard"
import {
  InlineCitation,
  InlineCitationText,
  InlineCitationCard,
  InlineCitationCardTrigger,
  InlineCitationCardBody,
  InlineCitationSource,
} from "@/components/ai-elements/inline-citation"
import { Reasoning, ReasoningTrigger, ReasoningContent } from "@/components/ai-elements/reasoning"
import type { Options } from 'react-markdown'
import { Response } from "@/components/ai-elements/response"
import { Actions, Action } from "@/components/ai-elements/actions"
import { Loader } from "@/components/ai-elements/loader"
import { WebPreview, WebPreviewNavigation, WebPreviewNavigationButton, WebPreviewUrl, WebPreviewBody, WebPreviewConsole } from "@/components/ai-elements/web-preview"
import { useMeeting } from '@/components/providers/meeting-provider'
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion"
import { ActivityChip } from "@/components/chat/activity/ActivityChip"
import type { 
  VoiceTranscriptResult, 
  VideoAppResult
} from "@/lib/services/tool-service"
import type { ROICalculationResult } from "@/components/chat/tools/ROICalculator/ROICalculator.types";
import type { BusinessInteractionData, UserBusinessContext } from "@/types/business-content"

interface ChatAreaProps {
  messages: Message[]
  isLoading: boolean
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  onVoiceTranscript: (transcript: string) => void
  onWebcamCapture: (imageData: string) => void
  onROICalculation: (result: ROICalculationResult) => void
  onVideoAppResult: (result: VideoAppResult) => void
  onScreenAnalysis: (analysis: string) => void
  onBusinessInteraction?: (data: BusinessInteractionData) => void
  userContext?: UserBusinessContext
  onSendMessage?: (message: string) => void
  loadingContext?: AIThinkingContext
  showHeroInput?: boolean
  inputValue?: string
  onInputChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onHeroEngage?: () => void
  onOpenVoice?: () => void
  voiceDraft?: string
}

export const ChatArea = memo(function ChatArea({
  messages,
  isLoading,
  messagesEndRef,
  onVoiceTranscript,
  onWebcamCapture,
  onROICalculation,
  onVideoAppResult,
  onScreenAnalysis,
  onBusinessInteraction,
  userContext,
  onSendMessage,
  loadingContext,
  showHeroInput,
  inputValue,
  onInputChange,
  onHeroEngage,
  onOpenVoice,
  voiceDraft
}: ChatAreaProps) {
  const meeting = useMeeting()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length, isLoading])

  // Keyboard navigation for messages
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Skip if user is typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return
    }

    switch (e.key) {
      case 'Home':
        e.preventDefault()
        scrollAreaRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
        break
      case 'End':
        e.preventDefault()
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        break
      case 'PageUp':
        e.preventDefault()
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' })
        }
        break
      case 'PageDown':
        e.preventDefault()
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' })
        }
        break
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [visibleMessages, setVisibleMessages] = useState<Set<string>>(new Set())
  const [hoveredAction, setHoveredAction] = useState<string | null>(null)
  const [translations, setTranslations] = useState<Record<string, { [lang: string]: string }>>({})
  const [translating, setTranslating] = useState<Record<string, boolean>>({})
  const [analysisLogs, setAnalysisLogs] = useState<Array<{ level: 'log' | 'warn' | 'error'; message: string; timestamp: Date }>>([])

  const pushLog = useCallback((log: { level: 'log' | 'warn' | 'error'; message: string; timestamp: Date }) => {
    setAnalysisLogs(prev => [log, ...prev].slice(0, 100))
  }, [])

  const handleTranslate = async (messageId: string, text: string, targetLang: string) => {
    if (!text || !messageId) return
    setTranslating(prev => ({ ...prev, [messageId]: true }))
    try {
      const res = await fetch('/api/tools/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang })
      })
      if (!res.ok) throw new Error('Translation failed')
      const data = await res.json()
      setTranslations(prev => ({
        ...prev,
        [messageId]: { ...(prev[messageId] || {}), [targetLang]: data.translated }
      }))
    } catch (e) {
      console.error('Translate error:', e)
    } finally {
      setTranslating(prev => ({ ...prev, [messageId]: false }))
    }
  }

  const formatMessageContent = useCallback((content: string): string => {
    if (!content) return ''
    
    // Enhanced markdown formatting with better styling and list support
    let formatted = content
      // Activity chips passthrough placeholder (handled separately before dangerous HTML)
      .replace(/\[(ACTIVITY_IN|ACTIVITY_OUT):([^\]]+)\]/g, (m) => `@@@ACTIVITY_MARKER@@@${m}@@@`)
      // Handle code blocks first (to avoid conflicts)
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted/40 border border-border/30 rounded-lg p-4 my-3 whitespace-pre-wrap break-words overflow-x-auto"><code class="text-sm font-mono">$1</code></pre>')
      // Handle inline code
      .replace(/`(.*?)`/g, '<code class="bg-muted/60 text-accent px-2 py-1 rounded-md text-sm font-mono border border-border/30">$1</code>')
      // Handle bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      // Handle italic text (but not bullet points)
      .replace(/(?<!\*)\*([^\*\n]+?)\*(?!\*)/g, '<em class="italic text-foreground/90">$1</em>')
    
    // Handle numbered lists (1. 2. 3. etc.)
    formatted = formatted.replace(/^(\d+)\.\s+(.+)$/gm, '<div class="flex items-start gap-2 my-1"><span class="text-accent font-medium min-w-[1.5rem]">$1.</span><span>$2</span></div>')
    
    // Handle bullet points (*, -, •)
    formatted = formatted.replace(/^[\*\-•]\s+(.+)$/gm, '<div class="flex items-start gap-2 my-1"><span class="text-accent font-medium min-w-[1rem]">•</span><span>$1</span></div>')
    
    // Handle line breaks for better formatting
    formatted = formatted.replace(/\n\n/g, '<br/><br/>')
    formatted = formatted.replace(/\n/g, '<br/>')
    
    return formatted
  }, [])

  // Extract activity markers and split content into parts
  const extractActivities = (content: string): { parts: Array<{ type: 'text' | 'activity'; value: string; dir?: 'in' | 'out' }> } => {
    if (!content) return { parts: [] }
    const regex = /\[(ACTIVITY_IN|ACTIVITY_OUT):([^\]]+)\]/g
    const parts: Array<{ type: 'text' | 'activity'; value: string; dir?: 'in' | 'out' }> = []
    let lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', value: content.slice(lastIndex, match.index) })
      }
      const dir = match[1] === 'ACTIVITY_IN' ? 'in' : 'out'
      const label = match[2].trim()
      parts.push({ type: 'activity', value: label, dir })
      lastIndex = regex.lastIndex
    }
    if (lastIndex < content.length) {
      parts.push({ type: 'text', value: content.slice(lastIndex) })
    }
    return { parts }
  }

  // Build markdown renderer options to turn inline links into InlineCitation hovers when they match message.sources
  const buildResponseOptions = useCallback((messageForOpts: Message): Options => {
    const sourceList = (messageForOpts as any)?.sources as Array<{ url: string; title?: string; description?: string }> | undefined
    return {
      components: {
        a: ({ node, children, href, className, ...props }) => {
          const url = typeof href === 'string' ? href : ''
          const src = sourceList?.find(s => s.url === url)
          if (!src) {
            return (
              <a
                className={cn('font-medium text-primary underline', className as string)}
                href={url}
                target="_blank"
                rel="noreferrer"
                {...props}
              >
                {children}
              </a>
            )
          }
          return (
            <InlineCitation className="inline-flex items-center">
              <InlineCitationText className="underline decoration-dotted underline-offset-2 decoration-accent">
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className={cn('font-medium', className as string)}
                  {...props}
                >
                  {children}
                </a>
              </InlineCitationText>
                <InlineCitationCard>
                  <InlineCitationCardTrigger sources={[url]} />
                  <InlineCitationCardBody>
                    <div className="p-3">
                      <InlineCitationSource title={src.title} url={src.url} description={src.description} />
                    </div>
                  </InlineCitationCardBody>
                </InlineCitationCard>
            </InlineCitation>
          )
        }
      }
    }
  }, [])

  const detectMessageType = useCallback((content: string): { type: string; icon?: React.ReactNode; badge?: string; color?: string } => {
    if (!content) return { type: 'default' }
    
    if (content.includes('```') || content.toLowerCase().includes('code')) {
      return {
        type: 'code',
        icon: <FileText className="w-3 h-3 mr-1" />,
        badge: 'Code',
        color: 'bg-purple-500/10 text-purple-600 border-purple-500/20'
      }
    }
    
    if (content.includes('![') || content.includes('<img') || content.toLowerCase().includes('image')) {
      return {
        type: 'image',
        icon: <ImageIcon className="w-3 h-3 mr-1" />,
        badge: 'Visual',
        color: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      }
    }

    if (content.toLowerCase().includes('roi') || content.toLowerCase().includes('calculation')) {
      return {
        type: 'analysis',
        icon: <TrendingUp className="w-3 h-3 mr-1" />,
        badge: 'Analysis',
        color: 'bg-green-500/10 text-green-600 border-green-500/20'
      }
    }
    
    if (content.length > 300) {
      return {
        type: 'long',
        icon: <FileText className="w-3 h-3 mr-1" />,
        badge: 'Detailed',
        color: 'bg-accent/10 text-accent border-accent/20'
      }
    }
    
    return { type: 'default' }
  }, [])

  const detectToolType = useCallback((content: string): string | null => {
    if (!content) return null
    if (content.includes('VOICE_INPUT')) return 'voice_input'
    if (content.includes('WEBCAM_CAPTURE')) return 'webcam_capture'
    if (content.includes('ROI_CALCULATOR')) return 'roi_calculator'
    if (content.includes('VIDEO_TO_APP')) return 'video_to_app'
    if (content.includes('SCREEN_SHARE')) return 'screen_share'
    return null
  }, [])

  const shouldRenderAsInsightCard = (content: string): boolean => {
    if (!content) return false
    
    // Check for company research patterns
    if (content.toLowerCase().includes('research') && content.match(/\w+\.com/i)) {
      return true
    }
    
    // Check for structured analysis with bullet points
    if (content.includes('*') && content.split('*').length > 3) {
      return true
    }
    
    // Check for strategic questions
    if (content.includes('?') && content.split('?').length > 2) {
      return true
    }
    
    // Check for long analytical content
    if (content.length > 500 && (
      content.toLowerCase().includes('analyz') ||
      content.toLowerCase().includes('recommend') ||
      content.toLowerCase().includes('suggest') ||
      content.toLowerCase().includes('strategy')
    )) {
      return true
    }
    
    return false
  }

  // Replace bare URLs that match message.sources with markdown links so they render as inline citations
  const wrapSourcedUrlsWithMarkdown = useCallback((text: string, messageForUrls: Message): string => {
    if (!text) return text
    const sources = (messageForUrls as any)?.sources as Array<{ url: string; title?: string }>
    if (!Array.isArray(sources) || sources.length === 0) return text
    let output = text
    for (const src of sources) {
      if (!src?.url) continue
      // Skip if already a markdown link to this url
      if (output.includes(`](${src.url})`)) continue
      try {
        const host = new URL(src.url).hostname
        // Replace exact url occurrences with a markdown link [host](url)
        const escaped = src.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const re = new RegExp(escaped, 'g')
        output = output.replace(re, `[${host}](${src.url})`)
      } catch {
        // If URL parsing fails, skip
      }
    }
    return output
  }, [])

  const copyToClipboard = useCallback(async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      console.error('Failed to copy text:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setCopiedMessageId(messageId)
        setTimeout(() => setCopiedMessageId(null), 2000)
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr)
      }
      document.body.removeChild(textArea)
    }
  }, [])

  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
      }
    }
    
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100)
    }
  }, [messages])

  // Intersection Observer for message animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleMessages(prev => new Set([...prev, entry.target.id]))
          }
        })
      },
      { threshold: 0.1 }
    )

    const messageElements = document.querySelectorAll('[data-message-id]')
    messageElements.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [messages])

  const renderToolCard = (toolType: string | null, messageId: string) => {
    const handleCancel = () => {
      // Handle tool cancellation
    }

    switch (toolType) {
      case 'voice_input':
        // Deprecated inline card to avoid double-mounting the voice hook; use the global VoiceOverlay instead
        return null
      case 'webcam_capture':
        return (
          <Tool className="rounded-2xl border-border/30">
            <ToolHeader type={`tool-webcam`} state={"input-available"} />
            <ToolContent>
              <ToolOutput output={<WebcamCapture onCapture={(imageData: string) => onWebcamCapture(imageData)} onAIAnalysis={() => {}} onLog={pushLog} />} errorText={undefined} />
            </ToolContent>
          </Tool>
        )
      case 'roi_calculator':
        return (
          <Tool className="rounded-2xl border-border/30">
            <ToolHeader type={`tool-roi`} state={"input-available"} />
            <ToolContent>
              <ToolOutput output={<ROICalculator mode="card" onCancel={handleCancel} onComplete={(result: ROICalculationResult) => onROICalculation(result)} />} errorText={undefined} />
            </ToolContent>
          </Tool>
        )
      case 'video_to_app':
        return (
          <Tool className="rounded-2xl border-border/30">
            <ToolHeader type={`tool-video-to-app`} state={"input-available"} />
            <ToolContent>
              <ToolOutput
                output={<VideoToApp 
                  mode="card"
                  videoUrl={`/api/video-uploads/${messageId}`}
                  status="pending"
                  sessionId={messageId}
                  onCancel={handleCancel}
                  onAppGenerated={(url: string) => { console.log('App generated:', url) }}
                />}
                errorText={undefined}
              />
            </ToolContent>
          </Tool>
        )
      case 'screen_share':
        return (
          <Tool className="rounded-2xl border-border/30">
            <ToolHeader type={`tool-screen-share`} state={"input-available"} />
            <ToolContent>
              <ToolOutput output={<ScreenShare onAnalysis={(analysis: string) => onScreenAnalysis(analysis)} onLog={pushLog} />} errorText={undefined} />
            </ToolContent>
          </Tool>
        )
      case 'meeting':
        return (
          <Tool className="rounded-2xl border-border/30">
            <ToolHeader type={`tool-meeting`} state={"input-available"} />
            <ToolContent>
              <div className="w-full text-center">
                <button
                  className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => meeting.open({ title: 'Book a Call' })}
                >
                  Open Scheduler
                </button>
              </div>
            </ToolContent>
          </Tool>
        )
      default:
        return null
    }
  }

  const EmptyState = useMemo(() => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 min-h-[40vh] grid place-items-center px-4"
    >
      <div className="text-center w-full">
        <h3 className="text-2xl sm:text-3xl font-semibold text-foreground">Ready to dive in?</h3>
        <p className="text-muted-foreground mt-2">Ask anything or paste a link. I’ll handle the rest.</p>
        {showHeroInput && (
          <div className="mt-6 max-w-3xl mx-auto">
            <PillInput
              value={inputValue || ''}
              placeholder="Ask anything..."
              onChange={onInputChange || (() => {})}
              onSubmit={(e) => { e.preventDefault(); onHeroEngage?.(); onSendMessage?.(inputValue || '') }}
              leftSlot={<ToolMenu />}
              rightSlot={
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Voice input"
                    className="w-9 h-9 rounded-full bg-muted/60 grid place-items-center"
                    onClick={onOpenVoice}
                  >
                    <FbcIcon className="w-4 h-4 text-foreground/70" />
                  </button>
                  <button
                    type="submit"
                    aria-label="Send"
                    className="w-9 h-9 rounded-full bg-accent text-accent-foreground grid place-items-center"
                    onClick={(e) => {
                      e.preventDefault();
                      onHeroEngage?.();
                      if (inputValue && inputValue.trim()) onSendMessage?.(inputValue)
                    }}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              }
              waveformChip={voiceDraft ? (
                <div className="hidden sm:flex items-center h-7 px-2 rounded-full bg-accent/10 text-accent text-xs border border-accent/20">
                  <span className="mr-1">🎤</span>
                  <span className="truncate max-w-[140px]">{voiceDraft}</span>
                </div>
              ) : undefined}
            />
          </div>
        )}
      </div>
    </motion.div>
  ), [showHeroInput, inputValue, onInputChange, onHeroEngage, onSendMessage, onOpenVoice, voiceDraft])

  return (
    <div className="flex-1 min-h-0">
      {/* Single scroll container for the entire chat */}
      <div
        ref={scrollAreaRef}
        className={cn(
          "h-full overscroll-contain chat-scroll-container",
          messages.length === 0 && !isLoading ? "overflow-hidden" : "overflow-y-auto"
        )}
        style={{ 
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch' // iOS momentum scrolling
        }}
        role="log"
        aria-live="polite"
        aria-label="Chat conversation"
      >
        <div 
          className={cn(
            "mx-auto space-y-3 sm:space-y-4 px-4 sm:px-6 md:px-8 lg:px-24 py-4 sm:py-6",
            "w-full max-w-[900px]",
            "min-h-full flex flex-col justify-end pb-24 md:pb-28"
          )} 
          data-testid="messages-container"
        >
          {messages.length === 0 && !isLoading ? (
            EmptyState
          ) : (
            <>
              <AnimatePresence>
                {messages.map((message, index) => {
                  if (!message?.id) return null
                  
                  const messageType = message.role === "assistant" ? detectMessageType(message.content || '') : { type: 'default' }
                  const toolType = detectToolType(message.content || '')
                  const isVisible = visibleMessages.has(message.id)
                  const isLastMessage = index === messages.length - 1
                  
                  // Render VideoToApp card if present
                  if (message.videoToAppCard) {
                    return (
                      <motion.div 
                        key={message.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="space-y-4"
                      >
                        {/* Regular message content */}
                        <div className="flex gap-3 justify-start">
                          <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-1">
                            <FbcIcon className="w-3 h-3 text-accent" />
                          </div>
                          <div className="flex flex-col max-w-[85%] min-w-0 items-start">
                            <div className="relative group/message transition-all duration-200 bg-transparent text-foreground">
                              <div className="prose prose-sm max-w-none leading-relaxed break-words dark:prose-invert prose-slate text-foreground">
                                {message.content}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* VideoToApp Card */}
                        <div className="flex justify-center">
                          <VideoToApp
                            mode="card"
                            videoUrl={message.videoToAppCard.videoUrl}
                            status={message.videoToAppCard.status}
                            progress={message.videoToAppCard.progress}
                            spec={message.videoToAppCard.spec}
                            code={message.videoToAppCard.code}
                            error={message.videoToAppCard.error}
                            sessionId={message.videoToAppCard.sessionId}
                            onAppGenerated={(url: string) => {
                              console.log('App generated:', url)
                            }}
                          />
                        </div>
                      </motion.div>
                    )
                  }

                  // Render Business Content if present
                  if (message.businessContent) {
                    return (
                      <motion.div 
                        key={message.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="space-y-4"
                      >
                        {/* Regular message content */}
                        {message.content && (
                          <div className="flex gap-3 justify-start">
                            <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-1">
                              <FbcIcon className="w-3 h-3 text-accent" />
                            </div>
                            <div className="flex flex-col max-w-[85%] min-w-0 items-start">
                              <div className="relative group/message transition-all duration-200 bg-transparent text-foreground">
                                <div className="prose prose-sm max-w-none leading-relaxed break-words dark:prose-invert prose-slate text-foreground">
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: formatMessageContent(message.content),
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Business Content Renderer */}
                        <div className="flex justify-center">
                          <BusinessContentRenderer
                            htmlContent={message.businessContent.htmlContent}
                            onInteract={onBusinessInteraction || (() => {})}
                            userContext={userContext}
                            isLoading={false}
                          />
                        </div>
                      </motion.div>
                    )
                  }
                  
                  if (toolType) {
                    return (
                      <motion.div 
                        key={message.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="flex justify-center"
                      >
                        {renderToolCard(toolType, message.id)}
                      </motion.div>
                    )
                  }
                  
                  // Check if this AI message should be rendered as an insight card
                  if (message.role === "assistant" && shouldRenderAsInsightCard(message.content || '')) {
                    return (
                      <React.Fragment key={message.id}>
                        <motion.div
                          data-message-id={message.id}
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ 
                            opacity: isVisible ? 1 : 0.7, 
                            y: 0, 
                            scale: 1 
                          }}
                          transition={{ 
                            duration: 0.4, 
                            delay: index * 0.05,
                            ease: [0.16, 1, 0.3, 1]
                          }}
                          className="flex justify-center"
                        >
                          <AIInsightCard 
                            content={message.content || ''} 
                            onContinue={(suggestion) => {
                              if (onSendMessage) {
                                onSendMessage(suggestion)
                              }
                            }}
                          />
                        </motion.div>
                        
                        {/* Show AI Thinking Indicator immediately after the last message when loading */}
                        {isLastMessage && isLoading && (
                          <AIThinkingIndicator 
                            context={detectAIContext(
                              message.content || '',
                              '/api/chat'
                            )}
                          />
                        )}
                      </React.Fragment>
                    )
                  }

                  return (
                    <React.Fragment key={message.id}>
                      <motion.div
                        data-message-id={message.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ 
                          opacity: isVisible ? 1 : 0.7, 
                          y: 0, 
                          scale: 1 
                        }}
                        transition={{ 
                          duration: 0.4, 
                          delay: index * 0.05,
                          ease: [0.16, 1, 0.3, 1]
                        }}
                        className="group relative"
                        role="article"
                        aria-label={`${message.role === 'user' ? 'User' : 'Assistant'} message`}
                      >
                        <div className={cn(
                          "flex gap-3 w-full",
                          message.role === "user" ? "justify-end" : "justify-start"
                        )}>
                          {/* AI Avatar - Small and minimal */}
                          {message.role === "assistant" && (
                            <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-1">
                              <FbcIcon className="w-3 h-3 text-accent" />
                            </div>
                          )}

                          <div className={cn(
                            "flex flex-col max-w-[85%] min-w-0",
                            message.role === "user" ? "items-end" : "items-start"
                          )}>
                            {/* Message Content - Minimal styling like ChatGPT */}
                            <div className={cn(
                              "relative group/message transition-all duration-200 max-w-[700px]",
                              message.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"
                            )}>
                              {message.imageUrl && (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.1 }}
                                  className="mb-3"
                                >
                                  <div className="relative group/image rounded-xl overflow-hidden">
                                    <img
                                      src={message.imageUrl || "/placeholder.svg"}
                                      alt="Uploaded image"
                                      className="max-w-full h-auto border border-border/20 max-h-96 object-contain rounded-xl"
                                      loading="lazy"
                                    />
                                    <div className="absolute top-3 right-3 opacity-0 group-hover/image:opacity-100 transition-opacity">
                                      <Button
                                        variant="secondary"
                                        size="icon"
                                        className="w-8 h-8 bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm"
                                        onClick={() => message.imageUrl && window.open(message.imageUrl, "_blank")}
                                      >
                                        <ImageIcon className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}

                              {/* Render text with inlined ActivityChips. Use ai-elements Response for markdown/code when present */}
                              <div className="prose prose-sm max-w-none leading-relaxed break-words dark:prose-invert prose-slate text-foreground prose-headings:mt-4 prose-headings:mb-2 prose-p:mb-3 prose-li:mb-1 prose-strong:text-current prose-em:text-current">
                                {(() => {
                                  const raw = message.content || ''
                                  const { parts } = extractActivities(raw)
                                  const processedRaw = wrapSourcedUrlsWithMarkdown(raw, message)
                                  const containsMarkdown = processedRaw.includes('```') || /`[^`]/.test(processedRaw) || /\]\(https?:\/\//.test(processedRaw)
                                  if (parts.length === 0) {
                                    return containsMarkdown ? (
                                      <Response options={buildResponseOptions(message)} className="prose prose-sm max-w-none dark:prose-invert prose-slate">{processedRaw}</Response>
                                    ) : (
                                      <span dangerouslySetInnerHTML={{ __html: formatMessageContent(processedRaw) }} />
                                    )
                                  }
                                  return (
                                    <>
                                      {parts.map((p, idx) => {
                                        if (p.type === 'activity') {
                                          return (
                                            <ActivityChip key={`${message.id}-act-${idx}`} direction={p.dir as 'in' | 'out'} label={p.value} className="mx-1 align-middle" />
                                          )
                                        }
                                        const processed = wrapSourcedUrlsWithMarkdown(p.value, message)
                                        const segmentHasMd = processed.includes('```') || /`[^`]/.test(processed) || /\]\(https?:\/\//.test(processed)
                                        return segmentHasMd ? (
                                          <Response key={`${message.id}-md-${idx}`} options={buildResponseOptions(message)} className="prose prose-sm max-w-none dark:prose-invert prose-slate">{processed}</Response>
                                        ) : (
                                          <span key={`${message.id}-txt-${idx}`} dangerouslySetInnerHTML={{ __html: formatMessageContent(processed) }} />
                                        )
                                      })}
                                    </>
                                  )
                                })()}
                              </div>

                              {/* Sources summary removed; inline citations only */}

                              {/* WebPreview for primary URL */}
                              {message.role === 'assistant' && Array.isArray((message as any).sources) && (message as any).sources.length > 0 && (
                                <div className="mt-3">
                                  <WebPreview defaultUrl={(message as any).sources[0]?.url}>
                                    <WebPreviewNavigation>
                                      <WebPreviewNavigationButton tooltip="Back">←</WebPreviewNavigationButton>
                                      <WebPreviewNavigationButton tooltip="Forward">→</WebPreviewNavigationButton>
                                      <WebPreviewUrl />
                                    </WebPreviewNavigation>
                                    <WebPreviewBody className="rounded-b-lg" />
                                    <WebPreviewConsole logs={analysisLogs} />
                                  </WebPreview>
                                </div>
                              )}

                              {/* Translated output (ES) */}
                              {message.role === 'assistant' && translations[message.id]?.['es'] && (
                                <motion.div
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="mt-3 text-sm border-l-2 border-accent/40 pl-3 text-foreground/90"
                                >
                                  <div className="mb-1 text-xs uppercase tracking-wide opacity-70">Translated (ES)</div>
                                  <div
                                    className="prose prose-sm max-w-none dark:prose-invert prose-slate"
                                    dangerouslySetInnerHTML={{ __html: formatMessageContent(translations[message.id]['es']) }}
                                  />
                                </motion.div>
                              )}
                            </div>

                            {/* Suggestions row under assistant messages */}
                            {message.role === 'assistant' && (
                              <div className="mt-2">
                                <Suggestions>
                                  <Suggestion suggestion="Summarize this" onClick={s => onSendMessage?.(s)} />
                                  <Suggestion suggestion="Explain step by step" onClick={s => onSendMessage?.(s)} />
                                  <Suggestion suggestion="Find relevant sources" onClick={s => onSendMessage?.(s)} />
                                </Suggestions>
                              </div>
                            )}

                            {/* Message Actions (ai-elements) */}
                            <Actions className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Action
                                tooltip={copiedMessageId === message.id ? 'Copied' : 'Copy'}
                                aria-label="Copy"
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(message.content || '', message.id)}
                              >
                                <motion.div
                                  animate={copiedMessageId === message.id ? { scale: [1, 1.2, 1] } : {}}
                                  transition={{ duration: 0.2 }}
                                >
                                  {copiedMessageId === message.id ? 
                                    <Check className="w-3 h-3 text-green-600" /> : 
                                    <Copy className="w-3 h-3" />
                                  }
                                </motion.div>
                              </Action>
                              {message.role === "user" && (
                                <Action
                                  tooltip="Edit"
                                  aria-label="Edit message"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newContent = prompt('Edit message:', message.content)
                                    if (newContent && newContent.trim() !== message.content) {
                                      console.log('Edit message:', message.id, 'New content:', newContent)
                                    }
                                  }}
                                >
                                  <Edit className="w-3 h-3" />
                                </Action>
                              )}
                              {message.role === 'assistant' && (
                                <Action
                                  tooltip={translating[message.id] ? 'Translating…' : 'Translate to Spanish'}
                                  aria-label="Translate to Spanish"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleTranslate(message.id, message.content || '', 'es')}
                                  disabled={!!translating[message.id]}
                                >
                                  <Languages className="w-3 h-3" />
                                </Action>
                              )}
                            </Actions>
                          </div>

                          {/* User Avatar - Small and minimal */}
                          {message.role === "user" && (
                            <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-1">
                              <User className="w-3 h-3 text-accent" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                      
                      {/* Show AI Thinking Indicator immediately after the last message when loading */}
                      {isLastMessage && (
                        <div className="mt-2">
                          {/* Chip-only streaming indicator (unified) */}
                          {isLoading && (
                            <AIThinkingIndicator 
                              context={loadingContext || detectAIContext(
                                message.content || '',
                                '/api/chat'
                              )}
                            />
                          )}
                        </div>
                      )}
                    </React.Fragment>
                  )
                })}
              </AnimatePresence>

              {/* Scroll anchor with proper spacing */}
              <div 
                ref={messagesEndRef} 
                className="h-4 w-full scroll-mb-4"
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
})
