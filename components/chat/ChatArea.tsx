"use client"

import type React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, User, Bot, ImageIcon, Copy, Check, Brain, AlertTriangle, Info, CheckCircle, Clock, Target, Monitor, FileText, Sparkles, MessageSquare, Zap, Camera, Mic, Heart, ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import type { Message } from "@/app/(chat)/chat/types/chat"
import { motion, AnimatePresence } from "framer-motion"
import { 
  VoiceInputCard, 
  WebcamCaptureCard, 
  ROICalculatorCard, 
  VideoToAppCard, 
  ScreenShareCard 
} from "@/components/chat/cards"
import type { 
  ROICalculationResult, 
  VoiceTranscriptResult, 
  WebcamCaptureResult, 
  VideoAppResult, 
  ScreenShareResult 
} from "@/lib/services/tool-service"

interface ChatAreaProps {
  messages: Message[]
  isLoading: boolean
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  onVoiceTranscript: (transcript: string) => void
  onWebcamCapture: (imageData: string) => void
  onROICalculation: (result: ROICalculationResult) => void
  onVideoAppResult: (result: VideoAppResult) => void
  onScreenAnalysis: (analysis: string) => void
}

export function ChatArea({
  messages,
  isLoading,
  messagesEndRef,
  onVoiceTranscript,
  onWebcamCapture,
  onROICalculation,
  onVideoAppResult,
  onScreenAnalysis
}: ChatAreaProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null)

  const formatMessageContent = (content: string): string => {
    if (!content) return ''
    // Enhanced markdown formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-2 py-1 rounded-md text-sm font-mono">$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-4 rounded-lg overflow-x-auto"><code class="text-sm font-mono">$1</code></pre>')
  }

  const detectMessageType = (content: string): { type: string; icon?: React.ReactNode; badge?: string; color?: string } => {
    if (!content) return { type: 'default' }
    
    if (content.includes('```')) {
      return {
        type: 'code',
        icon: <FileText className="w-3 h-3 mr-1" />,
        badge: 'Code',
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
      }
    }
    
    if (content.includes('![') || content.includes('<img')) {
      return {
        type: 'image',
        icon: <ImageIcon className="w-3 h-3 mr-1" />,
        badge: 'Image',
        color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
      }
    }
    
    if (content.length > 300) {
      return {
        type: 'long',
        icon: <FileText className="w-3 h-3 mr-1" />,
        badge: 'Long Message',
        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
      }
    }
    
    return { type: 'default' }
  }

  const detectToolType = (content: string): string | null => {
    if (!content) return null
    if (content.includes('VOICE_INPUT')) return 'voice_input'
    if (content.includes('WEBCAM_CAPTURE')) return 'webcam_capture'
    if (content.includes('ROI_CALCULATOR')) return 'roi_calculator'
    if (content.includes('VIDEO_TO_APP')) return 'video_to_app'
    if (content.includes('SCREEN_SHARE')) return 'screen_share'
    return null
  }

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }

  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
      }
    }
    
    // Scroll to bottom when new messages are added
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100)
    }
  }, [messages])

  const renderToolCard = (toolType: string | null, messageId: string) => {
    const handleCancel = () => {
      // Handle tool cancellation
    }

    const handleSubmit = (result: ROICalculationResult | VoiceTranscriptResult | WebcamCaptureResult | VideoAppResult | ScreenShareResult) => {
      switch (toolType) {
        case 'voice_input':
          onVoiceTranscript((result as VoiceTranscriptResult).transcript)
          break
        case 'webcam_capture':
          onWebcamCapture((result as WebcamCaptureResult).imageData)
          break
        case 'roi_calculator':
          onROICalculation(result as ROICalculationResult)
          break
        case 'video_to_app':
          onVideoAppResult(result as VideoAppResult)
          break
        case 'screen_share':
          onScreenAnalysis((result as ScreenShareResult).analysis)
          break
      }
    }

    switch (toolType) {
      case 'voice_input':
        return <VoiceInputCard onCancel={handleCancel} onTranscript={(transcript: string) => onVoiceTranscript(transcript)} />
      case 'webcam_capture':
        return <WebcamCaptureCard onCancel={handleCancel} onCapture={(imageData: string) => onWebcamCapture(imageData)} />
      case 'roi_calculator':
        return <ROICalculatorCard onCancel={handleCancel} onComplete={onROICalculation} />
      case 'video_to_app':
        return <VideoToAppCard onCancel={handleCancel} onComplete={onVideoAppResult} />
      case 'screen_share':
        return <ScreenShareCard onCancel={handleCancel} onAnalysis={(analysis: string) => onScreenAnalysis(analysis)} />
      default:
        return null
    }
  }

  return (
    <div className="chat-container">
      <ScrollArea
        className="h-full w-full scrollbar-thin smooth-scroll"
        ref={scrollAreaRef}
      >
        <div className="chat-messages" data-testid="messages-container">
          {messages.length === 0 && !isLoading ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-center py-16 px-4"
            >
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-accent/10 to-primary/10 flex items-center justify-center"
              >
                <Sparkles className="w-12 h-12 text-accent" />
              </motion.div>
              
              <motion.h3 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-2xl font-semibold mb-4 text-foreground"
              >
                Welcome to F.B/c AI
              </motion.h3>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed text-base text-readable"
              >
                I'm your AI assistant ready to help with business analysis, automation, and consultation. 
                Start by asking a question or uploading a document.
              </motion.p>
              
              {/* Quick action suggestions */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto"
              >
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-accent/10 transition-all duration-200 scale-hover rounded-xl border-border/50"
                  onClick={() => {
                    // Trigger a sample question
                    const event = new Event('focus')
                    document.dispatchEvent(event)
                  }}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-sm font-medium">Ask about AI automation</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-accent/10 transition-all duration-200 scale-hover rounded-xl border-border/50"
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-sm font-medium">Upload a document</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-accent/10 transition-all duration-200 scale-hover rounded-xl border-border/50"
                >
                  <Zap className="w-5 h-5" />
                  <span className="text-sm font-medium">Business analysis</span>
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => {
                if (!message?.id) return null
                
                const messageType = message.role === "assistant" ? detectMessageType(message.content || '') : { type: 'default' }
                const toolType = detectToolType(message.content || '')
                
                if (toolType) {
                  return (
                    <motion.div 
                      key={message.id} 
                      className="flex justify-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {renderToolCard(toolType, message.id)}
                    </motion.div>
                  )
                }
                
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={cn("flex gap-4 group", message.role === "user" ? "justify-end" : "justify-start")}
                    onMouseEnter={() => setHoveredMessageId(message.id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                    {message.role === "assistant" && (
                      <motion.div
                        initial={{ scale: 0.8, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Avatar className="w-10 h-10 shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-accent to-accent/80 text-accent-foreground">
                            <Bot className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                    )}

                    <div className={cn("flex flex-col max-w-[85%]", message.role === "user" ? "items-end" : "items-start")}>
                      {message.role === "assistant" && messageType.badge && (
                        <motion.div 
                          className="mb-2"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs flex items-center gap-1 rounded-full",
                              messageType.color
                            )}
                          >
                            {messageType.icon}
                            {messageType.badge}
                          </Badge>
                        </motion.div>
                      )}

                      <motion.div
                        className={cn(
                          "relative group/message transition-all duration-200",
                          "focus-within:ring-2 focus-within:ring-accent/20 focus-within:ring-offset-2",
                          message.role === "user"
                            ? "chat-bubble-user"
                            : "chat-bubble-assistant"
                        )}
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                      >
                        {message.imageUrl && (
                          <motion.div 
                            className="mb-3"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="relative group/image">
                              <img
                                src={message.imageUrl || "/placeholder.svg"}
                                alt="Uploaded image"
                                className="max-w-full h-auto rounded-lg border max-h-96 object-contain shadow-sm"
                                loading="lazy"
                              />
                              <div className="absolute top-2 right-2 opacity-0 group-hover/image:opacity-100 transition-opacity">
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  className="w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-lg"
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
                            "prose prose-sm max-w-none leading-relaxed break-words text-readable",
                            message.role === "user" 
                              ? "prose-invert" 
                              : "dark:prose-invert prose-slate",
                            "prose-headings:mt-4 prose-headings:mb-2 prose-p:mb-3 prose-li:mb-1"
                          )}
                          dangerouslySetInnerHTML={{
                            __html: formatMessageContent(message.content || ''),
                          }}
                        />

                        {message.sources && message.sources.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.3 }}
                          >
                            <Separator className="my-4" />
                            <div className="space-y-2">
                              <p className="text-xs font-medium opacity-70 flex items-center gap-1">
                                <Info className="w-3 h-3" />
                                Sources:
                              </p>
                              <div className="space-y-1">
                                {message.sources.map((src, idx) => (
                                  <a
                                    key={`${message.id}-source-${idx}`}
                                    href={src.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-xs hover:underline opacity-80 hover:opacity-100 transition-opacity p-2 bg-muted/50 rounded-lg border-l-2 border-accent"
                                  >
                                    {src.title || 'Source'}
                                  </a>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* Message actions */}
                        <AnimatePresence>
                          {hoveredMessageId === message.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.2 }}
                              className="absolute top-2 right-2 flex items-center gap-1"
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-6 h-6 opacity-0 group-hover/message:opacity-100 transition-opacity hover:bg-accent/10 rounded-full"
                                onClick={() => copyToClipboard(message.content || '', message.id)}
                              >
                                {copiedMessageId === message.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              </Button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      {message.createdAt && (
                        <motion.span 
                          className="text-xs text-muted-foreground mt-2 px-1 flex items-center gap-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
                          <Clock className="w-3 h-3" />
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </motion.span>
                      )}
                    </div>

                    {message.role === "user" && (
                      <motion.div
                        initial={{ scale: 0.8, rotate: 10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Avatar className="w-10 h-10 shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                            <User className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}

              {isLoading && (
                <motion.div 
                  className="flex gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Avatar className="w-10 h-10 shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-accent to-accent/80 text-accent-foreground">
                      <Bot className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="p-4 bg-muted/50 rounded-2xl border border-border/50">
                    <div className="typing-indicator">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <span className="text-sm text-muted-foreground ml-2">AI is thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Scroll anchor - positioned at the bottom */}
              <div 
                ref={messagesEndRef} 
                className="h-0 w-0" 
                style={{ scrollMarginBottom: '20px' }}
              />
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>
    </div>
  )
} 