"use client"

import type React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, User, Bot, ImageIcon, Copy, Check, Brain, AlertTriangle, Info, CheckCircle, Clock, Target, Monitor, FileText, Sparkles, MessageSquare, Zap, Camera, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import type { Message } from "@/app/(chat)/chat/types/chat"
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

  const formatMessageContent = (content: string): string => {
    if (!content) return ''
    // Basic markdown formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
  }

  const detectMessageType = (content: string): { type: string; icon?: React.ReactNode; badge?: string } => {
    if (!content) return { type: 'default' }
    
    if (content.includes('```')) {
      return {
        type: 'code',
        icon: <FileText className="w-3 h-3 mr-1" />,
        badge: 'Code'
      }
    }
    
    if (content.includes('![') || content.includes('<img')) {
      return {
        type: 'image',
        icon: <ImageIcon className="w-3 h-3 mr-1" />,
        badge: 'Image'
      }
    }
    
    if (content.length > 300) {
      return {
        type: 'long',
        icon: <FileText className="w-3 h-3 mr-1" />,
        badge: 'Long Message'
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
    <div className="flex-1 overflow-hidden">
      <ScrollArea
        className="h-full w-full chat-scroll-container"
        ref={scrollAreaRef}
      >
        <div className="max-w-4xl mx-auto space-y-6 p-4 pb-8 chat-message-container" data-testid="messages-container">
          {messages.length === 0 && !isLoading ? (
            <div className="text-center py-16 px-4">
              <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-foreground">Welcome to F.B/c AI</h3>
              <p className="text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed text-base">
                I'm your AI assistant ready to help with business analysis, automation, and consultation. 
                Start by asking a question or uploading a document.
              </p>
              
              {/* Quick action suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-accent/10 transition-all duration-200 scale-hover"
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
                  className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-accent/10 transition-all duration-200 scale-hover"
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-sm font-medium">Upload a document</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-accent/10 transition-all duration-200 scale-hover"
                >
                  <Zap className="w-5 h-5" />
                  <span className="text-sm font-medium">Business analysis</span>
                </Button>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => {
                if (!message?.id) return null
                
                const messageType = message.role === "assistant" ? detectMessageType(message.content || '') : { type: 'default' }
                const toolType = detectToolType(message.content || '')
                
                if (toolType) {
                  return (
                    <div key={message.id} className="flex justify-center">
                      {renderToolCard(toolType, message.id)}
                    </div>
                  )
                }
                
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
                                  onClick={() => message.imageUrl && window.open(message.imageUrl, "_blank")}
                                >
                                  <ImageIcon className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        <div
                          className={cn(
                            "prose prose-sm max-w-none leading-relaxed break-words",
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
                          <>
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
                                    className="block text-xs hover:underline opacity-80 hover:opacity-100 transition-opacity p-2 bg-slate-50 dark:bg-slate-800 rounded border-l-2 border-blue-400"
                                  >
                                    {src.title || 'Source'}
                                  </a>
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover/message:opacity-100 transition-opacity hover:bg-accent/10"
                          onClick={() => copyToClipboard(message.content || '', message.id)}
                        >
                          {copiedMessageId === message.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>

                      {message.createdAt && (
                        <span className="text-xs text-muted-foreground mt-1 px-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
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

              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="p-4 bg-muted/50 rounded-lg">
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
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
} 