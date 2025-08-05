"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// Consolidated Phosphor icons imports
import { 
  Copy, Check, Download, Play, Pause, Square, RotateCcw, FileText, 
  ImageIcon, Video, Mic, Calculator, Monitor, Sparkles, Zap, 
  TrendingUp, FileSearch, Brain, Loader2, User, AlertTriangle, 
  Info, Clock, Target, Edit 
} from '@/lib/icon-mapping'
import { FbcIcon } from '@/components/ui/fbc-icon'

// UI Components
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
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
import { AIThinkingIndicator, detectAIContext, type AIThinkingContext } from "./AIThinkingIndicator"
import { AIInsightCard } from "./AIInsightCard"
import type { 
  VoiceTranscriptResult, 
  WebcamCaptureResult, 
  VideoAppResult, 
  ScreenShareResult 
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
  onSendMessage
}: ChatAreaProps) {
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

  const formatMessageContent = useCallback((content: string): string => {
    if (!content) return ''
    
    // Enhanced markdown formatting with better styling and list support
    let formatted = content
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
        return <VoiceInput mode="card" onCancel={handleCancel} onTranscript={(transcript: string) => onVoiceTranscript(transcript)} />
      case 'webcam_capture':
        return <WebcamCapture mode="card" onCancel={handleCancel} onCapture={(imageData: string) => onWebcamCapture(imageData)} />
      case 'roi_calculator':
        return <ROICalculator mode="card" onCancel={handleCancel} onComplete={(result: ROICalculationResult) => onROICalculation(result)} />
      case 'video_to_app':
        return <VideoToApp 
          mode="card"
          videoUrl={`/api/video-uploads/${messageId}`} // Dynamic video URL based on session
          status="pending"
          sessionId={messageId}
          onCancel={handleCancel}
          onAppGenerated={(url: string) => {
            console.log('App generated:', url)
            // TODO: Handle app generation result
          }}
        />
      case 'screen_share':
        return <ScreenShare mode="card" onCancel={handleCancel} onAnalysis={(analysis: string) => onScreenAnalysis(analysis)} />
      default:
        return null
    }
  }

  const EmptyState = useMemo(() => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="text-center py-20 flex flex-col items-center justify-center min-h-[60vh]"
    >
      <motion.div 
        animate={{ 
          rotate: [0, 5, -5, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="w-20 h-20 mx-auto mb-8 rounded-full bg-muted/10 border border-border/20 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
      >
        <FbcIcon className="w-8 h-8 text-foreground/80" />
      </motion.div>
      
      <motion.h3 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-3xl font-bold mb-4 text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text"
      >
        Welcome to F.B/c AI
      </motion.h3>
      
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed text-lg"
      >
        I'm your intelligent AI assistant, ready to help with business analysis, automation strategies, and comprehensive consultation. 
        Let's start building something amazing together.
      </motion.p>
      
      {/* Enhanced Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full"
      >
        {[
          { 
            icon: FbcIcon, 
            title: "Ask about AI automation", 
            desc: "Get insights on process optimization", 
            color: "from-accent to-accent/80",
            action: () => {
              // Add a sample AI automation question
              const sampleQuestions = [
                "How can AI automate my customer service processes?",
                "What are the best AI tools for workflow automation?",
                "How do I implement chatbots for my business?",
                "What processes in my company can benefit from AI automation?"
              ];
              const randomQuestion = sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)];
              // Trigger input with sample question
              document.querySelector('textarea')?.focus();
              document.querySelector('textarea')?.setAttribute('placeholder', randomQuestion);
            }
          },
          { 
            icon: FileText, 
            title: "Upload a document", 
            desc: "Analyze files and extract insights", 
            color: "from-accent to-accent/80",
            action: () => {
              // Trigger file upload
              const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
              fileInput?.click();
            }
          },
          { 
            icon: TrendingUp, 
            title: "Business analysis", 
            desc: "Strategic planning and ROI calculations", 
            color: "from-accent to-accent/80",
            action: () => {
              // Trigger ROI calculator or business analysis
              const analysisPrompts = [
                "I need help analyzing my business performance",
                "Can you help me calculate ROI for a new project?",
                "I want to optimize my business processes",
                "Help me create a strategic plan for growth"
              ];
              const randomPrompt = analysisPrompts[Math.floor(Math.random() * analysisPrompts.length)];
              document.querySelector('textarea')?.focus();
              document.querySelector('textarea')?.setAttribute('placeholder', randomPrompt);
            }
          }
        ].map((action, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={action.action}
                    className="h-auto min-h-[120px] sm:min-h-[140px] p-4 sm:p-6 w-full flex flex-col items-center gap-3 sm:gap-4 hover:bg-accent/5 transition-all duration-300 border-border/30 rounded-xl group bg-card/50 backdrop-blur-sm hover:shadow-lg"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-center space-y-1 flex-1 flex flex-col justify-center">
                      <div className="font-semibold text-foreground">{action.title}</div>
                      <div className="text-sm text-muted-foreground leading-relaxed">{action.desc}</div>
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{action.desc}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  ), [])

  return (
    <div className="flex-1 min-h-0">
      {/* Single scroll container for the entire chat */}
      <div
        ref={scrollAreaRef}
        className="h-full overflow-y-auto overscroll-contain chat-scroll-container"
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
            "mx-auto space-y-4 sm:space-y-6 px-2 sm:px-4 md:px-6 py-4 sm:py-6",
            "max-w-4xl w-full", // Match footer width and ensure full width
            "min-h-full flex flex-col justify-end" // Push content to bottom when few messages
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
                              "relative group/message transition-all duration-200",
                              message.role === "user"
                                ? "chat-bubble-user"
                                : "chat-bubble-assistant"
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

                              <div
                                className={cn(
                                  "prose prose-sm max-w-none leading-relaxed break-words",
                                  "dark:prose-invert prose-slate text-foreground",
                                  "prose-headings:mt-4 prose-headings:mb-2 prose-p:mb-3 prose-li:mb-1",
                                  "prose-strong:text-current prose-em:text-current"
                                )}
                                dangerouslySetInnerHTML={{
                                  __html: formatMessageContent(message.content || ''),
                                }}
                              />

                              {/* Sources */}
                              {message.sources && message.sources.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.3 }}
                                  className="mt-4"
                                >
                                  <Separator className="my-4 opacity-30" />
                                  <div className="space-y-3">
                                    <p className="text-xs font-medium opacity-70 flex items-center gap-2">
                                      <Info className="w-3 h-3" />
                                      Sources & References:
                                    </p>
                                    <div className="space-y-2">
                                      {message.sources.map((src, idx) => (
                                        <motion.a
                                          key={`${message.id}-source-${idx}`}
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: 0.4 + idx * 0.1 }}
                                          href={src.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="block text-xs hover:underline opacity-80 hover:opacity-100 transition-all p-3 bg-muted/30 rounded-lg border border-border/20 hover:border-accent/30 hover:bg-accent/5"
                                        >
                                          <div className="font-medium">{src.title || 'Source'}</div>
                                          <div className="text-muted-foreground mt-1 truncate">{src.url}</div>
                                        </motion.a>
                                      ))}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </div>

                            {/* Message Actions - ChatGPT style */}
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-6 h-6 hover:bg-accent/10 transition-colors"
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
                              </Button>
                              
                              {message.role === "user" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-6 h-6 hover:bg-accent/10 transition-colors"
                                                                onClick={() => {
                                // Implement edit functionality
                                const newContent = prompt('Edit message:', message.content)
                                if (newContent && newContent.trim() !== message.content) {
                                  // TODO: Add proper edit handler to props
                                  console.log('Edit message:', message.id, 'New content:', newContent)
                                }
                              }}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                              )}
                            </motion.div>
                          </div>

                          {/* User Avatar - Small and minimal */}
                          {message.role === "user" && (
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                              <User className="w-3 h-3 text-primary" />
                            </div>
                          )}
                        </div>
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
                })}
              </AnimatePresence>

              {/* Scroll anchor with proper spacing */}
              <div 
                ref={messagesEndRef} 
                className="h-4 w-full" 
                style={{ scrollMarginBottom: '16px' }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
})
