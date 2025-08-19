"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Send, Mic, MicOff, Paperclip, Smile, Search, ExternalLink, Globe, Share2, Copy, Check } from "lucide-react"

interface Citation {
  id: string
  title: string
  url: string
  snippet: string
  domain: string
}

interface Message {
  id: string
  user: string
  content: string
  timestamp: Date
  type: "text" | "voice" | "system" | "ai"
  feature?: string
  citations?: Citation[]
  searchQuery?: string
  contextShared?: boolean
}

interface PersistentChatProps {
  currentFeature: string
}

export function PersistentChat({ currentFeature }: PersistentChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      user: "AI Assistant",
      content: `Welcome to CollabSpace! I'm your AI assistant with access to real-time search and citations. You're currently in ${currentFeature}.`,
      timestamp: new Date(),
      type: "ai",
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (currentFeature !== "home") {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          user: "AI Assistant",
          content: `Context switched to ${currentFeature}. I now have access to ${currentFeature}-specific knowledge and can search for relevant information to help you.`,
          timestamp: new Date(),
          type: "system",
          feature: currentFeature,
          contextShared: true,
        },
      ])
    }
  }, [currentFeature])

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        user: "You",
        content: newMessage,
        timestamp: new Date(),
        type: "text",
        feature: currentFeature,
      }
      setMessages((prev) => [...prev, message])
      const userQuery = newMessage
      setNewMessage("")
      setIsSearching(true)

      // Simulate AI response with search and citations
      setTimeout(() => {
        const { response, citations, searchQuery } = getEnhancedContextualResponse(userQuery, currentFeature)
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          user: "AI Assistant",
          content: response,
          timestamp: new Date(),
          type: "ai",
          feature: currentFeature,
          citations,
          searchQuery,
          contextShared: true,
        }
        setMessages((prev) => [...prev, aiResponse])
        setIsSearching(false)
      }, 2000)
    }
  }

  const getEnhancedContextualResponse = (message: string, feature: string) => {
    const mockCitations: Citation[] = [
      {
        id: "1",
        title: "Best Practices for Collaborative Design Tools",
        url: "https://example.com/design-collaboration",
        snippet: "Modern collaborative tools should integrate real-time communication...",
        domain: "example.com",
      },
      {
        id: "2",
        title: "WebRTC Implementation Guide",
        url: "https://developer.mozilla.org/webrtc",
        snippet: "WebRTC enables peer-to-peer communication in web browsers...",
        domain: "developer.mozilla.org",
      },
      {
        id: "3",
        title: "Canvas API Documentation",
        url: "https://developer.mozilla.org/canvas",
        snippet: "The Canvas API provides a means for drawing graphics via JavaScript...",
        domain: "developer.mozilla.org",
      },
    ]

    const responses = {
      canvas: {
        response:
          "Based on current best practices for collaborative design tools, I can help you with advanced drawing techniques, layer management, and real-time collaboration features. The Canvas API offers extensive capabilities for creating interactive graphics.",
        citations: mockCitations.slice(0, 2),
        searchQuery: "collaborative canvas drawing tools best practices",
      },
      webcam: {
        response:
          "For optimal video communication, WebRTC provides the foundation for peer-to-peer connections. I can help you troubleshoot camera issues, optimize video quality, and implement advanced features like background blur or virtual backgrounds.",
        citations: mockCitations.slice(1, 3),
        searchQuery: "WebRTC webcam implementation video quality",
      },
      screenshare: {
        response:
          "Screen sharing technology has evolved significantly. Modern implementations support selective window sharing, annotation tools, and high-quality streaming. I can guide you through setup and optimization.",
        citations: mockCitations,
        searchQuery: "screen sharing API implementation guide",
      },
      workshop: {
        response:
          "Interactive learning platforms benefit from gamification and real-time feedback. I can help you create engaging quizzes, track learning analytics, and implement collaborative learning features.",
        citations: mockCitations.slice(0, 1),
        searchQuery: "interactive workshop quiz platform design",
      },
      pdf: {
        response:
          "PDF generation and editing in web applications can be achieved through various libraries and APIs. I can help you implement features like text editing, annotation, and collaborative document review.",
        citations: mockCitations.slice(1, 2),
        searchQuery: "web PDF editor implementation guide",
      },
      home: {
        response:
          "I'm here to help you navigate and optimize your collaborative workspace. I can provide guidance on any feature and search for the latest information to assist you.",
        citations: mockCitations.slice(0, 1),
        searchQuery: "collaborative workspace optimization",
      },
    }

    return (
      responses[feature as keyof typeof responses] || {
        response: "I can search for information and provide cited answers on any topic. How can I help you today?",
        citations: [],
        searchQuery: message,
      }
    )
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false)
        const voiceMessage: Message = {
          id: Date.now().toString(),
          user: "You",
          content: "🎤 Voice message: How can I improve my workflow?",
          timestamp: new Date(),
          type: "voice",
          feature: currentFeature,
        }
        setMessages((prev) => [...prev, voiceMessage])
      }, 2000)
    }
  }

  const copyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (err) {
      console.error("Failed to copy message:", err)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.user === "You" ? "justify-end" : "justify-start"}`}>
            {message.user !== "You" && (
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700">
                  {message.user === "AI Assistant" ? "AI" : message.user === "System" ? "S" : "AI"}
                </AvatarFallback>
              </Avatar>
            )}

            <div className={`max-w-xs lg:max-w-md ${message.user === "You" ? "order-first" : ""}`}>
              <div
                className={`rounded-lg px-3 py-2 ${
                  message.type === "system"
                    ? "bg-slate-100 text-slate-600 text-sm"
                    : message.user === "You"
                      ? "bg-emerald-600 text-white"
                      : "bg-white border border-slate-200 text-slate-900"
                }`}
              >
                <div className="flex gap-1 mb-2 flex-wrap">
                  {message.feature && message.type !== "system" && (
                    <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
                      {message.feature}
                    </Badge>
                  )}
                  {message.contextShared && (
                    <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                      <Share2 className="w-3 h-3 mr-1" />
                      Context Shared
                    </Badge>
                  )}
                  {message.searchQuery && (
                    <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">
                      <Search className="w-3 h-3 mr-1" />
                      Searched
                    </Badge>
                  )}
                </div>

                <p className="text-sm">{message.content}</p>

                {message.citations && message.citations.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Globe className="w-3 h-3" />
                      Sources:
                    </div>
                    {message.citations.map((citation) => (
                      <Card key={citation.id} className="p-2 bg-slate-50 border-slate-200">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <a
                              href={citation.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-blue-600 hover:text-blue-800 line-clamp-1"
                            >
                              {citation.title}
                            </a>
                            <p className="text-xs text-slate-600 mt-1 line-clamp-2">{citation.snippet}</p>
                            <p className="text-xs text-slate-400 mt-1">{citation.domain}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
                            onClick={() => window.open(citation.url, "_blank")}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-2">
                  <p className={`text-xs ${message.user === "You" ? "text-emerald-100" : "text-slate-500"}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>

                  {message.type === "ai" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 text-slate-400 hover:text-slate-600"
                      onClick={() => copyMessage(message.id, message.content)}
                    >
                      {copiedMessageId === message.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {message.user === "You" && (
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="text-xs bg-slate-100 text-slate-700">You</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {isSearching && (
          <div className="flex gap-3 justify-start">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700">AI</AvatarFallback>
            </Avatar>
            <div className="bg-white border border-slate-200 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 animate-spin text-emerald-600" />
                <span className="text-sm text-slate-600">Searching for relevant information...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-100 p-4">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700">
            <Paperclip className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700">
            <Smile className="w-4 h-4" />
          </Button>

          <div className="flex-1 flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Ask about ${currentFeature} - I'll search and cite sources...`}
              onKeyPress={(e) => e.key === "Enter" && !isSearching && handleSendMessage()}
              className="flex-1"
              disabled={isSearching}
            />
            <Button
              onClick={toggleRecording}
              variant={isRecording ? "destructive" : "ghost"}
              size="sm"
              className={isRecording ? "animate-pulse" : "text-slate-500 hover:text-slate-700"}
              disabled={isSearching}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button
              onClick={handleSendMessage}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={isSearching || !newMessage.trim()}
            >
              {isSearching ? <Search className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
