"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Send, Sparkles } from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  capabilities?: string[]
}

interface ConversationState {
  stage: 'greeting' | 'name_collection' | 'email_collection' | 'consultation'
  name?: string
  email?: string
  messages: Message[]
}

export default function AIShowcase() {
  const [conversation, setConversation] = useState<ConversationState>({
    stage: 'greeting',
    messages: []
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation.messages])

  // Initial greeting
  useEffect(() => {
    if (conversation.messages.length === 0) {
      const greeting: Message = {
        id: '1',
        text: "Hi! I'm F.B/c's AI assistant. I'd love to show you how AI can transform your business. What's your name?",
        sender: 'ai',
        timestamp: new Date(),
        capabilities: ['Natural Language Processing', 'Personalization']
      }
      setConversation(prev => ({
        ...prev,
        messages: [greeting]
      }))
    }
  }, [])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    // Update conversation state
    let newState = { ...conversation }
    newState.messages = [...newState.messages, userMessage]

    // Process based on current stage
    if (newState.stage === 'greeting' && !newState.name) {
      newState.name = input.trim()
      newState.stage = 'name_collection'
    } else if (newState.stage === 'name_collection' && input.includes('@')) {
      newState.email = input.trim()
      newState.stage = 'email_collection'
    }

    setConversation(newState)
    setInput('')
    setIsLoading(true)

    try {
      // Call AI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          context: {
            stage: newState.stage,
            name: newState.name,
            email: newState.email,
            messageCount: newState.messages.length
          }
        })
      })

      const result = await response.json()

      if (result.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: result.message,
          sender: 'ai',
          timestamp: new Date(),
          capabilities: result.capabilities || []
        }

        setConversation(prev => ({
          ...prev,
          messages: [...prev.messages, aiMessage]
        }))
      } else {
        throw new Error(result.error || 'Failed to get response')
      }
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble processing your message. Please try again.",
        sender: 'ai',
        timestamp: new Date()
      }
      setConversation(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage]
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Capabilities Showcase
          </h1>
        </div>
        <p className="text-muted-foreground">
          Experience F.B/c's AI solutions in action - from natural conversation to business insights
        </p>
      </div>

      <Card className="h-96 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversation.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  {message.capabilities && message.capabilities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {message.capabilities.map((capability, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          This showcase demonstrates: Natural Language Processing • Context Awareness • Lead Qualification • Business Intelligence
        </p>
        {conversation.stage === 'consultation' && (
          <Button className="mt-4">
            Schedule Your Free Consultation
          </Button>
        )}
      </div>
    </div>
  )
}
