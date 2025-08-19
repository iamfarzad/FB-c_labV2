"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Send, Mic, MicOff, Play, Pause, Users, Settings, MoreVertical, Phone, Video } from "lucide-react"
import Link from "next/link"

interface Message {
  id: string
  sender: string
  content: string
  timestamp: Date
  type: "text" | "voice"
  duration?: number
  avatar?: string
}

interface User {
  id: string
  name: string
  avatar?: string
  status: "online" | "offline" | "away"
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "Sarah Chen",
      content: "Hey everyone! Ready for our brainstorming session?",
      timestamp: new Date(Date.now() - 300000),
      type: "text",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: "2",
      sender: "Mike Johnson",
      content: "I have some great ideas to share.",
      timestamp: new Date(Date.now() - 240000),
      type: "text",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: "3",
      sender: "Sarah Chen",
      content: "Voice message about project timeline",
      timestamp: new Date(Date.now() - 180000),
      type: "voice",
      duration: 15,
      avatar: "/placeholder.svg?height=32&width=32",
    },
  ])

  const [newMessage, setNewMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)
  const [onlineUsers] = useState<User[]>([
    { id: "1", name: "Sarah Chen", status: "online", avatar: "/placeholder.svg?height=32&width=32" },
    { id: "2", name: "Mike Johnson", status: "online", avatar: "/placeholder.svg?height=32&width=32" },
    { id: "3", name: "Alex Rivera", status: "away", avatar: "/placeholder.svg?height=32&width=32" },
    { id: "4", name: "Emma Davis", status: "offline", avatar: "/placeholder.svg?height=32&width=32" },
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recordingInterval = useRef<NodeJS.Timeout>()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        sender: "You",
        content: newMessage,
        timestamp: new Date(),
        type: "text",
      }
      setMessages([...messages, message])
      setNewMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const startRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)
    recordingInterval.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)
  }

  const stopRecording = () => {
    setIsRecording(false)
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current)
    }

    // Simulate sending voice message
    const voiceMessage: Message = {
      id: Date.now().toString(),
      sender: "You",
      content: `Voice message (${recordingTime}s)`,
      timestamp: new Date(),
      type: "voice",
      duration: recordingTime,
    }
    setMessages([...messages, voiceMessage])
    setRecordingTime(0)
  }

  const toggleVoicePlayback = (messageId: string) => {
    if (playingVoice === messageId) {
      setPlayingVoice(null)
    } else {
      setPlayingVoice(messageId)
      // Simulate playback ending
      setTimeout(() => setPlayingVoice(null), 3000)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-emerald-500"
      case "away":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900">Team Chat</h1>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                  {onlineUsers.filter((u) => u.status === "online").length} online
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
              <Button variant="outline" size="sm">
                <Video className="w-4 h-4 mr-2" />
                Video
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
          {/* Online Users Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-emerald-600" />
                Online Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {onlineUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(user.status)} rounded-full border-2 border-white`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{user.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-3 flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">General Discussion</CardTitle>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.sender === "You" ? "flex-row-reverse" : ""}`}
                    >
                      {message.sender !== "You" && (
                        <Avatar className="w-8 h-8 mt-1">
                          <AvatarImage src={message.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {message.sender
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`flex-1 max-w-xs lg:max-w-md ${message.sender === "You" ? "text-right" : ""}`}>
                        {message.sender !== "You" && <p className="text-xs text-slate-500 mb-1">{message.sender}</p>}
                        <div
                          className={`rounded-lg p-3 ${
                            message.sender === "You" ? "bg-emerald-600 text-white" : "bg-white border border-slate-200"
                          }`}
                        >
                          {message.type === "text" ? (
                            <p className="text-sm">{message.content}</p>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`p-1 h-8 w-8 ${message.sender === "You" ? "hover:bg-emerald-700" : "hover:bg-slate-100"}`}
                                onClick={() => toggleVoicePlayback(message.id)}
                              >
                                {playingVoice === message.id ? (
                                  <Pause className="w-4 h-4" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                              </Button>
                              <div className="flex-1">
                                <div
                                  className={`h-1 rounded-full ${message.sender === "You" ? "bg-emerald-400" : "bg-slate-300"}`}
                                >
                                  <div
                                    className={`h-full rounded-full ${message.sender === "You" ? "bg-emerald-200" : "bg-emerald-500"} w-1/3`}
                                  />
                                </div>
                                <p className="text-xs mt-1 opacity-75">{message.duration}s</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{formatTime(message.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>

            {/* Message Input */}
            <div className="border-t p-4">
              {isRecording ? (
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm text-red-700">Recording... {recordingTime}s</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={stopRecording}
                    className="border-red-300 text-red-700 hover:bg-red-100 bg-transparent"
                  >
                    <MicOff className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startRecording}
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
