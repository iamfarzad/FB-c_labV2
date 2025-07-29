"use client"

import { useState } from "react"
import { MessageList } from "../MessageList"
import { ChatComposer } from "./ChatComposer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calculator, Search, FileText, Users, Calendar, Upload, Monitor, Mic, Camera, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Message } from "../../types/chat"

interface ChatPanelProps {
  messages: Message[]
  isLoading: boolean
  onSendMessage: (message: string) => void
  onOpenModal: (modalType: string) => void
}

export function ChatPanel({ messages, isLoading, onSendMessage, onOpenModal }: ChatPanelProps) {
  const [selectedModel, setSelectedModel] = useState("Gemini Pro")

  const businessTools = [
    { id: "roi", label: "ROI Calc", icon: Calculator, color: "bg-green-500" },
    { id: "research", label: "Research", icon: Search, color: "bg-blue-500" },
    { id: "analysis", label: "Analysis", icon: FileText, color: "bg-purple-500" },
    { id: "leads", label: "Leads", icon: Users, color: "bg-orange-500" },
    { id: "meeting", label: "Meeting", icon: Calendar, color: "bg-red-500" },
    { id: "upload", label: "Upload", icon: Upload, color: "bg-indigo-500" },
    { id: "screen", label: "Screen", icon: Monitor, color: "bg-teal-500" },
  ]

  const aiModels = ["Gemini Pro", "Gemini Flash", "GPT-4", "Claude 3.5"]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder-logo.svg" alt="Uniq AI" />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">AI</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold">Advanced Business AI Assistant</h1>
            <p className="text-sm text-muted-foreground">Ask Uniq AI Anything</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Online
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {selectedModel}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {aiModels.map((model) => (
                <DropdownMenuItem key={model} onClick={() => setSelectedModel(model)}>
                  {model}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Business Tools Toolbar */}
      <div className="flex items-center gap-2 p-4 border-b bg-muted/30">
        <span className="text-sm font-medium text-muted-foreground mr-2">Quick Tools:</span>
        {businessTools.map((tool) => (
          <Button
            key={tool.id}
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs bg-transparent"
            onClick={() => onOpenModal(tool.id)}
          >
            <div className={`w-2 h-2 rounded-full ${tool.color} mr-2`} />
            <tool.icon className="h-3 w-3 mr-1" />
            {tool.label}
          </Button>
        ))}

        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" className="h-8 px-3 bg-transparent" onClick={() => onOpenModal("voice")}>
            <Mic className="h-3 w-3 mr-1" />
            Voice
          </Button>
          <Button variant="outline" size="sm" className="h-8 px-3 bg-transparent" onClick={() => onOpenModal("webcam")}>
            <Camera className="h-3 w-3 mr-1" />
            Webcam
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="max-w-md">
              <h2 className="text-2xl font-semibold mb-4">Welcome to Uniq AI</h2>
              <p className="text-muted-foreground mb-6">
                Your advanced business AI assistant. I can help with ROI calculations, lead research, document analysis,
                meeting scheduling, and much more.
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-muted/50">
                  <Calculator className="h-5 w-5 mb-2 text-green-600" />
                  <div className="font-medium">ROI Analysis</div>
                  <div className="text-muted-foreground">Calculate business returns</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <Users className="h-5 w-5 mb-2 text-blue-600" />
                  <div className="font-medium">Lead Generation</div>
                  <div className="text-muted-foreground">Find and qualify prospects</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <FileText className="h-5 w-5 mb-2 text-purple-600" />
                  <div className="font-medium">Document Analysis</div>
                  <div className="text-muted-foreground">Analyze business documents</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <Calendar className="h-5 w-5 mb-2 text-red-600" />
                  <div className="font-medium">Meeting Scheduler</div>
                  <div className="text-muted-foreground">Book and manage meetings</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <MessageList messages={messages} isLoading={isLoading} />
        )}
      </div>

      {/* Chat Composer */}
      <div className="border-t bg-background">
        <ChatComposer onSendMessage={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}
