"use client"

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Loader2, 
  Send, 
  Sparkles, 
  Image, 
  Video, 
  FileText, 
  Code, 
  Globe,
  Mic,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import {
  Message,
  ConversationState,
  SidebarActivity,
  CONVERSATION_STAGES,
  AI_CAPABILITIES
} from '@/api/ai-service/types'

interface AIShowcaseProps {
  className?: string
}

export default function AIShowcaseEnhanced({ className }: AIShowcaseProps) {
  const [conversationState, setConversationState] = useState<ConversationState>(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem('aiShowcase') : null
    return saved ? JSON.parse(saved) : {
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      stage: CONVERSATION_STAGES.GREETING,
      messages: [],
      messagesInStage: 0,
      capabilitiesShown: []
    }
  })

  const [sidebarActivity, setSidebarActivity] = useState<SidebarActivity | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Auto-save session state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('aiShowcase', JSON.stringify(conversationState))
    }
  }, [conversationState])

  // Scroll to bottom when new messages arrive
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
        const audio = new Audio(`data:audio/mpeg;base64,${audioData}`)
        audio.play().catch(console.error)
      }

      setIsLoading(false)
    })

    channel.on('broadcast', { event: 'sidebar-update' }, (payload) => {
      setSidebarActivity(payload.payload)
      // Clear sidebar activity after 3 seconds
      setTimeout(() => setSidebarActivity(null), 3000)
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
        text: "Hi! I'm here to showcase how AI can transform your business. What's your name?",
        sender: 'ai',
        timestamp: new Date(),
        capabilities: [AI_CAPABILITIES.TEXT_GENERATION]
      }
      setConversationState(prev => ({
        ...prev,
        messages: [greeting],
        capabilitiesShown: [AI_CAPABILITIES.TEXT_GENERATION]
      }))
    }
  }, [])

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    setIsLoading(true)
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    }

    setConversationState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }))

    try {
      const response = await fetch('/api/gemini?action=conversationalFlow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: message,
          conversationState,
          messageCount: conversationState.messages.length,
          sessionId: conversationState.sessionId,
          includeAudio: true
        })
      })

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error)
      }

      // Response handled via Supabase realtime
    } catch (error) {
      console.error('Error sending message:', error)
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
    const demos: Record<string, string> = {
      'image_generation': 'Generate a business visualization showing AI implementation ROI',
      'video_analysis': 'Analyze this YouTube video for business insights: https://youtube.com/watch?v=dQw4w9WgXcQ',
      'document_analysis': 'I have a business document to analyze',
      'code_execution': 'Calculate the ROI of implementing AI chatbots for customer service',
      'url_analysis': 'Analyze my company website for AI opportunities: https://example.com'
    }

    const demoPrompt = demos[capability]
    if (demoPrompt) {
      if (capability === 'document_analysis') {
        fileInputRef.current?.click()
      } else {
        setInput(demoPrompt)
        await handleSendMessage(demoPrompt)
      }
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || isLoading) return

    setIsLoading(true)
    setSidebarActivity({
      activity: 'document_processing',
      message: '📄 Processing document...',
      timestamp: Date.now(),
      progress: 10
    })

    try {
      // Convert file to base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result?.toString().split(',')[1]
        
        if (!base64) {
          throw new Error('Failed to read file')
        }

        const response = await fetch('/api/gemini?action=analyzeDocument', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentData: base64,
            mimeType: file.type,
            prompt: `Analyze this ${file.name} for business insights`,
            sessionId: conversationState.sessionId
          })
        })

        const result = await response.json()
        
        if (result.success) {
          const aiMessage: Message = {
            id: Date.now().toString(),
            text: result.data.text,
            sender: 'ai',
            timestamp: new Date(),
            capabilities: [AI_CAPABILITIES.DOCUMENT_UNDERSTANDING]
          }
          
          setConversationState(prev => ({
            ...prev,
            messages: [...prev.messages, aiMessage],
            capabilitiesShown: [...new Set([...prev.capabilitiesShown, AI_CAPABILITIES.DOCUMENT_UNDERSTANDING])]
          }))
        }
      }
      
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading document:', error)
      setIsLoading(false)
    }
  }

  const completeShowcase = async () => {
    if (!conversationState.name || !conversationState.email) return

    setIsLoading(true)
    setSidebarActivity({
      activity: 'summary_generation',
      message: '📊 Generating your personalized summary...',
      timestamp: Date.now(),
      progress: 50
    })

    try {
      const response = await fetch('/api/gemini?action=leadCapture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: conversationState.messages,
          userInfo: {
            name: conversationState.name,
            email: conversationState.email,
            companyInfo: conversationState.companyInfo
          },
          action: 'generate_summary'
        })
      })

      const result = await response.json()
      
      if (result.success) {
        const completionMessage: Message = {
          id: Date.now().toString(),
          text: `Perfect! I've created your personalized AI consultation summary and sent it to ${conversationState.email}. 

Your AI readiness score: ${result.data.leadScore}/100

${result.data.leadScore >= 70 ? 
  "🎯 Your high score shows you're ready for immediate AI implementation!" :
  result.data.leadScore >= 40 ?
  "📈 Your score indicates good potential for AI adoption with the right strategy." :
  "🌱 Your score suggests starting with AI education to build a strong foundation."}

Ready to implement these AI solutions in your business? Let's schedule your free strategy session!

[Book Your Free Consultation] 📅`,
          sender: 'ai',
          timestamp: new Date()
        }

        setConversationState(prev => ({
          ...prev,
          messages: [...prev.messages, completionMessage],
          stage: CONVERSATION_STAGES.FINALIZING
        }))

        // Download PDF if available
        if (result.data.pdfReport) {
          const link = document.createElement('a')
          link.href = result.data.pdfReport
          link.download = `AI_Report_${conversationState.name}.pdf`
          link.click()
        }
      }
    } catch (error) {
      console.error('Error completing showcase:', error)
    } finally {
      setIsLoading(false)
      setSidebarActivity(null)
    }
  }

  const shouldShowCompleteButton = () => {
    return conversationState.name && 
           conversationState.email && 
           conversationState.messages.length > 5 &&
           conversationState.capabilitiesShown.length >= 2 &&
           conversationState.stage !== CONVERSATION_STAGES.FINALIZING
  }

  return (
    <div className={`flex h-[600px] bg-gray-50 rounded-lg overflow-hidden ${className}`}>
      {/* Sidebar - AI Activity Monitor */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            AI Activity Monitor
          </h3>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          {/* Capabilities Demonstrated */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3 text-sm text-gray-700">Capabilities Showcased:</h4>
            <div className="space-y-2">
              {conversationState.capabilitiesShown.map((capability, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">{capability}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Current Activity */}
          {sidebarActivity && (
            <div className="mb-6 p-3 bg-blue-50 rounded-lg animate-pulse">
              <h4 className="font-semibold mb-2 text-sm">Current Activity:</h4>
              <div className="text-sm text-blue-800">
                {sidebarActivity.message}
              </div>
              {sidebarActivity.progress && (
                <div className="mt-2 bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${sidebarActivity.progress}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Quick Capability Demos */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3 text-sm text-gray-700">Try AI Capabilities:</h4>
            <div className="space-y-2">
              <Button 
                onClick={() => triggerCapabilityDemo('image_generation')}
                variant="outline"
                size="sm"
                className="w-full justify-start"
                disabled={isLoading}
              >
                <Image className="h-4 w-4 mr-2" />
                Image Generation
              </Button>
              <Button 
                onClick={() => triggerCapabilityDemo('video_analysis')}
                variant="outline"
                size="sm"
                className="w-full justify-start"
                disabled={isLoading}
              >
                <Video className="h-4 w-4 mr-2" />
                Video Analysis
              </Button>
              <Button 
                onClick={() => triggerCapabilityDemo('document_analysis')}
                variant="outline"
                size="sm"
                className="w-full justify-start"
                disabled={isLoading}
              >
                <FileText className="h-4 w-4 mr-2" />
                Document Processing
              </Button>
              <Button 
                onClick={() => triggerCapabilityDemo('code_execution')}
                variant="outline"
                size="sm"
                className="w-full justify-start"
                disabled={isLoading}
              >
                <Code className="h-4 w-4 mr-2" />
                Code Execution
              </Button>
              <Button 
                onClick={() => triggerCapabilityDemo('url_analysis')}
                variant="outline"
                size="sm"
                className="w-full justify-start"
                disabled={isLoading}
              >
                <Globe className="h-4 w-4 mr-2" />
                Website Analysis
              </Button>
            </div>
          </div>
        </ScrollArea>

        {/* Complete Showcase Button */}
        {shouldShowCompleteButton() && (
          <div className="p-4 border-t">
            <Button 
              onClick={completeShowcase}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={isLoading}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Complete AI Showcase
            </Button>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4">
          <h1 className="text-xl font-bold">F.B/c AI Showcase</h1>
          <p className="text-sm text-gray-600">Experience the future of business AI in real-time</p>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {conversationState.messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white border border-gray-200 shadow-sm'
                }`}>
                  <div className="text-sm whitespace-pre-wrap">{message.text}</div>
                  
                  {/* Audio playback */}
                  {message.audioData && (
                    <audio controls className="mt-2 w-full h-8">
                      <source src={`data:audio/mpeg;base64,${message.audioData}`} type="audio/mpeg" />
                    </audio>
                  )}
                  
                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-xs font-semibold mb-1">Sources:</div>
                      {message.sources.map((source, index) => (
                        <a 
                          key={index} 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs text-blue-600 hover:underline block truncate"
                        >
                          {source.title}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Capabilities shown */}
                  {message.capabilities && message.capabilities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {message.capabilities.map((capability, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-4">
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); setInput(''); }} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                conversationState.stage === CONVERSATION_STAGES.FINALIZING 
                  ? "Showcase completed! Click the booking link above." 
                  : "Type your message..."
              }
              disabled={isLoading || conversationState.stage === CONVERSATION_STAGES.FINALIZING}
              className="flex-1"
            />
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.csv"
              onChange={handleFileUpload}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading || conversationState.stage === CONVERSATION_STAGES.FINALIZING}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}