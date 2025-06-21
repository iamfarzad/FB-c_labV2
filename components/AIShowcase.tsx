// components/AIShowcase.tsx
"use client"
import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Sparkles,
  Send,
  Image as ImageIcon,
  Video,
  FileText,
  Code,
  Globe,
  Mic,
  CheckCircle,
  Clock,
  Activity,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  audioData?: string
  sources?: any[]
}

interface CompanyInfo {
  name?: string;
  domain?: string;
  analysis?: string;
}

interface ConversationState {
  sessionId: string
  name?: string
  email?: string
  companyInfo?: CompanyInfo
  stage: string
  messages: Message[]
  messagesInStage: number;
  aiGuidance?: string;
  sidebarActivity?: string;
  isLimitReached?: boolean;
  showBooking?: boolean;
  capabilitiesShown: string[]
}

interface SidebarActivity {
  activity: string
  message: string
  timestamp: number
  progress?: number
}

const capabilities = [
  { id: 'image_generation', label: 'Image Generation', icon: ImageIcon, color: 'text-purple-600' },
  { id: 'video_analysis', label: 'Video Analysis', icon: Video, color: 'text-red-600' },
  { id: 'document_analysis', label: 'Document Processing', icon: FileText, color: 'text-green-600' },
  { id: 'code_execution', label: 'Code Execution', icon: Code, color: 'text-yellow-600' },
  { id: 'url_analysis', label: 'Website Analysis', icon: Globe, color: 'text-blue-600' },
];

export default function AIShowcase() {
  const [conversationState, setConversationState] = useState<ConversationState>(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem('aiShowcase') : null;
    return saved ? JSON.parse(saved) : {
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      stage: 'greeting',
      messages: [],
      messagesInStage: 0,
      capabilitiesShown: []
    }
  })

  const [sidebarActivity, setSidebarActivity] = useState<SidebarActivity | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [supabase] = useState(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
    return createClient(url, key);
  })

  // Auto-save session state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('aiShowcase', JSON.stringify(conversationState))
    }
  }, [conversationState])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationState.messages])

  // Supabase realtime subscription
  useEffect(() => {
    const channel = supabase.channel('ai-showcase')

    channel.on('broadcast', { event: 'ai-response' }, (payload) => {
      const { text, audioData, sources, sidebarActivity, conversationState: newState } = payload.payload

      // Add AI message
      const aiMessage: Message = {
        id: Date.now().toString(),
        text,
        sender: 'ai',
        timestamp: new Date(),
        audioData,
        sources
      }

      setConversationState(prev => ({
        ...prev,
        ...newState,
        messages: [...prev.messages, aiMessage]
      }))

      // Play audio if available
      if (audioData) {
        try {
          const audio = new Audio(`data:audio/mpeg;base64,${audioData}`)
          audio.play()
        } catch (error) {
          console.error('Audio playback failed:', error)
        }
      }

      setIsLoading(false)
    })

    channel.on('broadcast', { event: 'sidebar-update' }, (payload) => {
      setSidebarActivity(payload.payload)
    })

    channel.subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [supabase])

  // Initial AI greeting
  useEffect(() => {
    if (conversationState.messages.length === 0) {
      const greeting: Message = {
        id: '1',
        text: "Welcome to F.B/c AI Showcase! I'm here to demonstrate how AI can transform your business. I'm Farzad's AI assistant, and I'll be showing you some amazing capabilities today. What's your name?",
        sender: 'ai',
        timestamp: new Date()
      }
      setConversationState(prev => ({
        ...prev,
        messages: [greeting]
      }))
    }
  }, [])

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const message = input.trim()
    if (!message || isLoading) return

    setIsLoading(true)
    setInput('')

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    }

    // Update conversation state based on message
    let newState = { ...conversationState }
    newState.messages = [...newState.messages, userMessage]
    newState.messagesInStage = (newState.messagesInStage || 0) + 1;

    if (newState.stage === 'greeting' && !newState.name) {
      newState.name = message
      newState.stage = 'email_request'
    } else if (newState.stage === 'email_request' && message.includes('@')) {
      newState.email = message
      newState.stage = 'email_collected'
    }

    setConversationState(newState)

    try {
      // Send to AI API
      const response = await fetch('/api/gemini?action=conversationalFlow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: message,
          currentConversationState: newState,
          messageCount: newState.messages.length,
          includeAudio: true
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'API request failed')
      }

      // Response handled via Supabase realtime

    } catch (error) {
      console.error('Error sending message:', error)
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble processing your message. Please try again.",
        sender: 'ai',
        timestamp: new Date()
      }
      setConversationState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage]
      }))
      setIsLoading(false)
    }
  }

  const triggerCapabilityDemo = async (capability: string) => {
    const demos: { [key: string]: string } = {
      'image_generation': 'Generate a business visualization for my industry',
      'video_analysis': 'Analyze this YouTube video for business insights: https://youtube.com/watch?v=example',
      'document_analysis': 'Analyze a business document for optimization opportunities',
      'code_execution': 'Calculate the potential ROI for implementing an AI solution in my business.',
      'url_analysis': 'Analyze my company website for AI opportunities',
    }

    if (demos[capability]) {
      setInput(demos[capability]);
      await handleSendMessage();
    }
  };

  const completeShowcase = async () => {
    if (!conversationState.name || !conversationState.email) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/gemini?action=leadCapture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currentConversationState: conversationState 
        })
      });
      
      const result = await response.json();
      if (result.success) {
        // Add completion message
        const completionMessage: Message = {
          id: Date.now().toString(),
          text: `Perfect! I've created your personalized AI consultation summary and sent it to ${conversationState.email}.\n\nYour AI readiness score: ${result.data.leadScore}/100\n\nReady to implement these AI solutions? Let's schedule your free strategy session!`,
          sender: 'ai',
          timestamp: new Date()
        };
        
        setConversationState(prev => ({
          ...prev,
          messages: [...prev.messages, completionMessage],
          stage: 'completed'
        }));
      }
    } catch (error) {
      console.error("Error completing showcase:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const readyToComplete = conversationState.name && 
                         conversationState.email && 
                         conversationState.messages.length > 5;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - AI Activity Monitor */}
      <div className="hidden md:flex w-80 border-r border-border bg-card/50 backdrop-blur-sm flex-col">
        <div className="p-6 border-b border-border">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            AI Activity Monitor
          </h3>
        </div>
        
        <ScrollArea className="flex-1 p-6">
          {/* Capabilities Demonstrated */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3 text-sm text-muted-foreground">Capabilities Showcased</h4>
            <div className="space-y-2">
              {conversationState.capabilitiesShown.map((capability, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 text-sm"
                >
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{capability}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Current Activity */}
          <AnimatePresence>
            {sidebarActivity && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/20"
              >
                <h4 className="font-semibold mb-2 text-sm">Current Activity</h4>
                <div className="text-sm text-muted-foreground">
                  {sidebarActivity.message}
                </div>
                {sidebarActivity.progress && (
                  <Progress value={sidebarActivity.progress} className="mt-2" />
                )}
                <div className="mt-2 text-xs text-muted-foreground">
                  {new Date(sidebarActivity.timestamp).toLocaleTimeString()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Capability Demos */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3 text-sm text-muted-foreground">Try AI Capabilities</h4>
            <div className="space-y-2">
              {capabilities.map((cap) => {
                const Icon = cap.icon;
                return (
                  <Button
                    key={cap.id}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => triggerCapabilityDemo(cap.id)}
                    disabled={isLoading}
                  >
                    <Icon className={cn("w-4 h-4 mr-2", cap.color)} />
                    {cap.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </ScrollArea>

        {/* Complete Showcase Button */}
        <div className="p-6 border-t border-border">
          {readyToComplete && (
            <Button
              onClick={completeShowcase}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Complete AI Showcase & Get Summary
            </Button>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-card border-b border-border p-4 md:p-6">
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            F.B/c AI Showcase
          </h1>
          <p className="text-sm text-muted-foreground">
            Experience the future of business AI in real-time
          </p>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4 md:p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <AnimatePresence initial={false}>
              {conversationState.messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={cn(
                    "flex",
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-3 shadow-sm",
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border'
                    )}
                  >
                    <div className="text-sm whitespace-pre-wrap">{message.text}</div>

                    {/* Audio playback */}
                    {message.audioData && (
                      <audio controls className="mt-3 w-full h-8">
                        <source src={`data:audio/mpeg;base64,${message.audioData}`} type="audio/mpeg" />
                      </audio>
                    )}

                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <div className="text-xs font-medium mb-1">Sources:</div>
                        {message.sources.map((source, idx) => (
                          <a
                            key={idx}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline block truncate"
                          >
                            {source.title || source.url}
                          </a>
                        ))}
                      </div>
                    )}

                    <div className={cn(
                      "text-xs mt-2",
                      message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    )}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-card border border-border rounded-lg px-4 py-3 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">AI is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border bg-card p-4 md:p-6">
          <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex gap-2">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={conversationState.stage === 'completed' ? "Showcase completed" : "Type your message..."}
              disabled={isLoading || conversationState.stage === 'completed'}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim() || conversationState.stage === 'completed'}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Mobile Activity Button */}
      <div className="md:hidden fixed bottom-20 right-4">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full shadow-lg bg-background"
          onClick={() => {/* Add mobile sidebar toggle */}}
        >
          <Activity className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
