"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Mic,
  Video,
  Globe,
  Smartphone,
  Layers,
  Zap,
  ImageIcon,
  Paperclip,
  Plus,
  ChevronDown,
  User,
  Brain,
  ArrowUp,
} from "lucide-react"
import { useChatContext } from "../context/ChatProvider"
import type { Message } from "../types/chat"

interface ChatInterfaceProps {
  activeConversationTitle?: string
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ activeConversationTitle = "Business Strategy" }) => {
  const { messages, addMessage, isTyping, setIsTyping } = useChatContext()
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
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <div className="text-sm text-blue-500 mb-2">New Autonomous AI Coding Agent</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Ask Blackbox AI Anything</h1>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden px-4">
        <ScrollArea className="h-full">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.sender === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-1">
                    <Brain className="w-4 h-4 text-gray-600" />
                  </div>
                )}
                <div className={`max-w-[70%] ${message.sender === "user" ? "text-right" : "text-left"}`}>
                  <div
                    className={`inline-block rounded-2xl px-4 py-3 ${
                      message.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
                  </div>
                  <div
                    className={`text-xs text-gray-500 mt-1 px-1 ${
                      message.sender === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
                {message.sender === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-1">
                  <Brain className="w-4 h-4 text-gray-600" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
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

      {/* Input Area */}
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          {/* Main Input Container */}
          <div className="relative bg-white border border-gray-200 rounded-2xl shadow-sm">
            {/* Text Input */}
            <div className="flex items-end p-4">
              <div className="flex-1 mr-4">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Message Blackbox or @mention agent"
                  className="min-h-[60px] max-h-32 resize-none border-0 bg-transparent text-base placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                  disabled={isTyping}
                />
              </div>

              {/* Right Side Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-gray-100">
                  <Mic className="w-5 h-5 text-gray-600" />
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-gray-100">
                  <Video className="w-5 h-5 text-gray-600" />
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isTyping}
                  className="h-10 w-10 rounded-full bg-black hover:bg-gray-800 text-white disabled:opacity-40"
                >
                  <ArrowUp className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Bottom Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Auto
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  App Builder
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Deep Research
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Think
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Image Gen
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 px-3 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  Upload
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Multi-Panel
                </Button>
              </div>

              {/* Select Models Dropdown */}
              <Button variant="ghost" size="sm" className="h-8 px-3 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                Select Models
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </div>
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
