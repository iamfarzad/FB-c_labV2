"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Mic, MicOff, Upload, Video, Monitor, User, Brain } from "lucide-react"
import { useChatContext } from "../context/ChatProvider"
import type { Message } from "../types/chat"

interface ChatInterfaceProps {
  activeConversationTitle?: string
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ activeConversationTitle = "Business Strategy" }) => {
  const { messages, addMessage, isTyping, setIsTyping, activeFeatures, toggleFeature } = useChatContext()

  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    })
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToBottom()
    }, 100)
    return () => clearTimeout(timeoutId)
  }, [messages, isTyping])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date(),
    }

    addMessage(userMessage)
    setNewMessage("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(
      () => {
        const responses = [
          "Thank you for your message. I'm analyzing your request and will provide a comprehensive response based on the information you've shared.",
          "I understand your question. Let me break this down and provide you with actionable insights.",
          "Great question! Based on current best practices and industry standards, here's what I recommend...",
          "I can help you with that. Let me provide some detailed analysis and suggestions.",
        ]

        const randomResponse = responses[Math.floor(Math.random() * responses.length)]

        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: randomResponse,
          sender: "ai",
          timestamp: new Date(),
        }

        addMessage(aiResponse)
        setIsTyping(false)
      },
      1500 + Math.random() * 1000,
    )
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Minimalist Header */}
      <div className="border-b border-border/60 bg-background/95 backdrop-blur-sm flex-shrink-0">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-foreground/90 text-sm tracking-wide">{activeConversationTitle}</span>
              {(activeFeatures.video || activeFeatures.screen || activeFeatures.voice) && (
                <div className="flex items-center gap-1 ml-2">
                  {activeFeatures.video && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full opacity-80"></div>}
                  {activeFeatures.screen && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full opacity-80"></div>}
                  {activeFeatures.voice && <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>}
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground tracking-wider uppercase">AI Assistant</div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 group ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.sender === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Brain className="w-4 h-4 text-primary/70" />
                  </div>
                )}
                <div className={`max-w-[75%] ${message.sender === "user" ? "text-right" : "text-left"}`}>
                  <div
                    className={`inline-block rounded-2xl px-5 py-4 ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 border border-border/40"
                    }`}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
                  </div>
                  <div
                    className={`text-xs text-muted-foreground/60 mt-2 px-1 ${
                      message.sender === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
                {message.sender === "user" && (
                  <div className="w-8 h-8 rounded-full bg-muted/30 border border-border/40 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <Brain className="w-4 h-4 text-primary/70" />
                </div>
                <div className="bg-muted/50 border border-border/40 rounded-2xl px-5 py-4">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-pulse" />
                    <div
                      className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-pulse"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <div
                      className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-pulse"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Minimalist Input Area */}
      <div className="border-t border-border/60 bg-background/95 backdrop-blur-sm flex-shrink-0">
        <div className="max-w-4xl mx-auto p-6">
          {/* Feature Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFeature("voice")}
                className={`h-8 px-3 text-xs rounded-full transition-all duration-200 ${
                  activeFeatures.voice
                    ? "bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/15"
                    : "hover:bg-muted/60 text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                {activeFeatures.voice ? <MicOff className="w-3 h-3 mr-1.5" /> : <Mic className="w-3 h-3 mr-1.5" />}
                Voice
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFeature("video")}
                className={`h-8 px-3 text-xs rounded-full transition-all duration-200 ${
                  activeFeatures.video
                    ? "bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/15"
                    : "hover:bg-muted/60 text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                <Video className="w-3 h-3 mr-1.5" />
                Video
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFeature("screen")}
                className={`h-8 px-3 text-xs rounded-full transition-all duration-200 ${
                  activeFeatures.screen
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/15"
                    : "hover:bg-muted/60 text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                <Monitor className="w-3 h-3 mr-1.5" />
                Screen
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 px-3 text-xs rounded-full hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              <Upload className="w-3 h-3 mr-1.5" />
              Attach
            </Button>
          </div>

          {/* Message Input */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="min-h-[52px] max-h-32 resize-none rounded-2xl border-border/60 bg-muted/20 backdrop-blur-sm focus:bg-background/80 transition-all duration-200 px-4 py-4 text-sm leading-relaxed"
                disabled={isTyping}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isTyping}
              className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all duration-200 disabled:opacity-40 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.jpg,.jpeg,.png"
          />
        </div>
      </div>
    </div>
  )
}
