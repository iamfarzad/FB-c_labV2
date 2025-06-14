"use client"

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  isWelcome?: boolean
  isError?: boolean
  audioData?: string
  sources?: { url: string; title: string }[]
}

interface ConversationState {
  sessionId: string
  name?: string
  email?: string
  companyInfo?: any
  stage: string
  messages: Message[]
  capabilitiesShown: string[]
}

interface SidebarActivity {
  activity: string
  message: string
  timestamp: number
  progress?: number
}

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSend(message)
      setMessage('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
      <div className="flex space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </form>
  )
}

// Error boundary wrapper for the AI Showcase
const AIShowcaseWithErrorBoundary = () => (
  <ErrorBoundary
    fallback={
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
        <Alert variant="destructive" className="max-w-2xl">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>AI Showcase Unavailable</AlertTitle>
          <AlertDescription>
            We're having trouble loading the AI Showcase. This could be due to high demand or temporary service issues.
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/contact">Contact Support</a>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    }
  >
    <AIShowcase />
  </ErrorBoundary>
)

// Main AI Showcase component
function AIShowcase() {
  const [conversationState, setConversationState] = useState<ConversationState>(() => {
    const saved = sessionStorage.getItem('aiShowcase')
    return saved ? JSON.parse(saved) : {
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      stage: 'greeting',
      messages: [],
      capabilitiesShown: []
    }
  })

  const [sidebarActivity, setSidebarActivity] = useState<SidebarActivity | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => {
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Missing required Supabase configuration')
      }
      return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
    } catch (err) {
      console.error('Failed to initialize Supabase:', err)
      setError('Failed to initialize the chat service. Please try again later.')
      return null
    }
  })

  // Auto-save session state
  useEffect(() => {
    sessionStorage.setItem('aiShowcase', JSON.stringify(conversationState))
  }, [conversationState])

  // Initial AI greeting
  useEffect(() => {
    if (conversationState.messages.length === 0) {
      try {
        const greeting: Message = {
          id: 'greeting-1',
          text: "Hi! I'm here to showcase how AI can transform your business. What's your name?",
          sender: 'ai',
          timestamp: new Date(),
          isWelcome: true
        }
        setConversationState(prev => ({
          ...prev,
          messages: [greeting]
        }))
      } catch (err) {
        console.error('Error initializing conversation:', err)
        setError('Failed to initialize the conversation. Please refresh the page to try again.')
      }
    }
  }, [])

  const handleSendMessage = async (message: string) => {
    setIsLoading(true)
    setError(null)
    
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
          conversationState: newState,
          userInfo: {
            name: newState.name,
            email: newState.email,
            companyInfo: newState.companyInfo
          },
          messageCount: newState.messages.length,
          sessionId: newState.sessionId,
          includeAudio: true
        })
      })

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Failed to send message. Please check your connection and try again.')
      
      // Add error message to conversation
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: "I apologize, but I'm having trouble processing your message. Please try again.",
        sender: 'ai',
        timestamp: new Date(),
        isError: true
      }
      
      setConversationState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage]
      }))
    }
  }

  const triggerCapabilityDemo = async (capability: string) => {
    const demos: Record<string, string> = {
      'image_generation': 'Generate a business visualization for my industry',
      'video_analysis': 'Analyze this YouTube video for business insights: https://youtube.com/watch?v=example',
      'document_analysis': 'Analyze a business document for optimization opportunities',
      'code_execution': 'Calculate ROI for implementing AI in my business',
      'url_analysis': 'Analyze my company website for AI opportunities'
    }

    if (demos[capability]) {
      await handleSendMessage(demos[capability])
    }
  }

  const completeShowcase = async () => {
    if (!conversationState.name || !conversationState.email) return

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
        // Show completion message with booking CTA
        const completionMessage: Message = {
          id: Date.now().toString(),
          text: `Perfect! I've created your personalized AI consultation summary and sent it to ${conversationState.email}. 

Your AI readiness score: ${result.data.leadScore}/100

Ready to implement these AI solutions in your business? Let's schedule your free strategy session to create a custom roadmap for your success!

[Book Your Free Consultation] 📅`,
          sender: 'ai',
          timestamp: new Date()
        }

        setConversationState(prev => ({
          ...prev,
          messages: [...prev.messages, completionMessage],
          stage: 'completed'
        }))
      }
    } catch (error) {
      console.error('Error completing showcase:', error)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - AI Activity Monitor */}
      <div className="w-80 bg-white border-r border-gray-200 p-4">
        <h3 className="font-bold text-lg mb-4">🤖 AI Activity Monitor</h3>
        
        {/* Capabilities Demonstrated */}
        <div className="mb-6">
          <h4 className="font-semibold mb-2">Capabilities Showcased:</h4>
          <div className="space-y-1">
            {conversationState.capabilitiesShown.map((capability, index) => (
              <div key={index} className="text-sm text-green-600 flex items-center">
                ✅ {capability}
              </div>
            ))}
          </div>
        </div>

        {/* Current Activity */}
        {sidebarActivity && (
          <div className="mb-6 p-3 bg-orange-50 rounded-lg">
            <h4 className="font-semibold mb-2">Current Activity:</h4>
            <div className="text-sm text-orange-800">
              {sidebarActivity.message}
            </div>
            <div className="mt-2 text-xs text-orange-600">
              {new Date(sidebarActivity.timestamp).toLocaleTimeString()}
            </div>
          </div>
        )}

        {/* Quick Capability Demos */}
        <div className="mb-6">
          <h4 className="font-semibold mb-2">Try AI Capabilities:</h4>
          <div className="space-y-2">
            <button 
              onClick={() => triggerCapabilityDemo('image_generation')}
              className="w-full text-left text-sm p-2 bg-purple-50 hover:bg-purple-100 rounded"
            >
              🎨 Image Generation
            </button>
            <button 
              onClick={() => triggerCapabilityDemo('video_analysis')}
              className="w-full text-left text-sm p-2 bg-red-50 hover:bg-red-100 rounded"
            >
              🎥 Video Analysis
            </button>
            <button 
              onClick={() => triggerCapabilityDemo('document_analysis')}
              className="w-full text-left text-sm p-2 bg-green-50 hover:bg-green-100 rounded"
            >
              📄 Document Processing
            </button>
            <button 
              onClick={() => triggerCapabilityDemo('code_execution')}
              className="w-full text-left text-sm p-2 bg-yellow-50 hover:bg-yellow-100 rounded"
            >
              ⚡ Code Execution
            </button>
            <button 
              onClick={() => triggerCapabilityDemo('url_analysis')}
              className="w-full text-left text-sm p-2 bg-indigo-50 hover:bg-indigo-100 rounded"
            >
              🌐 Website Analysis
            </button>
          </div>
        </div>

        {/* Complete Showcase Button */}
        {conversationState.name && conversationState.email && conversationState.messages.length > 5 && (
          <button 
            onClick={completeShowcase}
            className="w-full bg-orange-600 text-white p-3 rounded-lg font-semibold hover:bg-orange-700"
          >
            🎯 Complete AI Showcase & Get Summary
          </button>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4">
          <h1 className="text-xl font-bold">F.B/c AI Showcase</h1>
          <p className="text-sm text-gray-600">Experience the future of business AI in real-time</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversationState.messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-white border border-gray-200'
              }`}>
                <div className="text-sm whitespace-pre-wrap">{message.text}</div>
                
                {/* Audio playback */}
                {message.audioData && (
                  <audio controls className="mt-2 w-full">
                    <source src={`data:audio/mpeg;base64,${message.audioData}`} />
                  </audio>
                )}
                
                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-2 text-xs">
                    <div className="font-semibold">Sources:</div>
                    {message.sources.map((source, index) => (
                      <a 
                        key={index} 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-orange-600 hover:underline block"
                      >
                        {source.title}
                      </a>
                    ))}
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <ChatInput 
          onSend={handleSendMessage} 
          disabled={isLoading || conversationState.stage === 'completed'} 
        />
      </div>
    </div>
  )
}
