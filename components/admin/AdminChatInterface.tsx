"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  Loader2, User, Bot, Send, Brain, MessageSquare, 
  Lightbulb, Copy, Check, Clock, AlertCircle, Sparkles,
  TrendingUp, Users, Calendar, Mail, DollarSign, Activity
} from "lucide-react"
import { useAdminChat, type AdminMessage } from "@/hooks/useAdminChat"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface AdminChatInterfaceProps {
  className?: string
}

const QUICK_ACTIONS = [
  {
    title: "Lead Analysis",
    description: "Analyze lead performance",
    icon: Users,
    prompt: "Analyze our recent leads and provide insights on conversion rates and scoring"
  },
  {
    title: "Performance Review",
    description: "Check system performance",
    icon: TrendingUp,
    prompt: "Review our AI performance metrics and identify areas for improvement"
  },
  {
    title: "Cost Analysis",
    description: "Review AI usage costs",
    icon: DollarSign,
    prompt: "Analyze our AI usage costs and suggest optimization strategies"
  },
  {
    title: "Email Campaign",
    description: "Draft email content",
    icon: Mail,
    prompt: "Draft a professional email campaign for our engaged leads"
  },
  {
    title: "Meeting Strategy",
    description: "Optimize scheduling",
    icon: Calendar,
    prompt: "Analyze our meeting schedule and suggest optimization strategies"
  },
  {
    title: "Activity Summary",
    description: "Get recent overview",
    icon: Activity,
    prompt: "Provide a summary of recent system activities and any alerts"
  }
]

const SUGGESTED_PROMPTS = [
  "What are our top performing leads this month?",
  "Draft a follow-up email for qualified leads",
  "Analyze our meeting conversion rates",
  "Suggest cost optimization strategies",
  "Review our AI response accuracy",
  "What insights can you provide about user engagement?"
]

export function AdminChatInterface({ className }: AdminChatInterfaceProps) {
  const { toast } = useToast()
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { 
    messages, 
    input, 
    setInput,
    handleInputChange, 
    handleSubmit, 
    isLoading, 
    error,
    sendMessage,
    clearMessages
  } = useAdminChat({
    onFinish: (message) => {
      toast({
        title: "AI Analysis Complete",
        description: "Insights generated based on current dashboard data",
      })
    },
    onError: (error) => {
      toast({
        title: "Analysis Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleQuickAction = async (prompt: string) => {
    setInput(prompt)
    await sendMessage(prompt)
  }

  const handleSuggestedPrompt = async (prompt: string) => {
    setInput(prompt)
    await sendMessage(prompt)
  }

  const copyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      toast({
        title: "Copied to clipboard",
        description: "Message content copied successfully",
      })
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy message to clipboard",
        variant: "destructive"
      })
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(timestamp)
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">AI Business Assistant</h3>
            <p className="text-sm text-muted-foreground">Powered by real-time dashboard data</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
            Connected
          </Badge>
          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearMessages}
              className="text-xs"
            >
              Clear Chat
            </Button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {messages.length === 0 && (
        <div className="p-4 border-b border-border">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Quick Actions
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {QUICK_ACTIONS.map((action, index) => {
                const Icon = action.icon
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="h-auto p-2 text-xs justify-start"
                    onClick={() => handleQuickAction(action.prompt)}
                    disabled={isLoading}
                  >
                    <Icon className="w-3 h-3 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-muted-foreground">{action.description}</div>
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Suggested Questions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {SUGGESTED_PROMPTS.map((prompt, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="h-auto p-2 text-xs justify-start text-muted-foreground hover:text-foreground"
                  onClick={() => handleSuggestedPrompt(prompt)}
                  disabled={isLoading}
                >
                  <MessageSquare className="w-3 h-3 mr-2" />
                  <span className="truncate">{prompt}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Ready to analyze your data</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Ask me anything about your leads, meetings, emails, costs, analytics, or system performance. 
                  I have access to all your dashboard data in real-time.
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    "flex-1 max-w-[85%] space-y-1",
                    message.role === "user" ? "order-2" : "order-1"
                  )}
                >
                  <Card className={cn(
                    "border-0 shadow-sm",
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-card"
                  )}>
                    <CardContent className="p-3">
                      <div className={cn(
                        "whitespace-pre-wrap text-sm",
                        message.role === "user" ? "text-white" : "text-foreground"
                      )}>
                        {message.content}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimestamp(message.timestamp)}</span>
                    {message.role === "assistant" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 ml-1"
                        onClick={() => copyMessage(message.content, message.id)}
                      >
                        {copiedMessageId === message.id ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {message.role === "user" && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 max-w-[85%] space-y-1">
                  <Card className="border-0 shadow-sm bg-card">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        <div>
                          <div className="text-sm font-medium text-foreground">Analyzing your data...</div>
                          <div className="text-xs text-muted-foreground">Gathering insights from dashboard</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {error && (
              <div className="flex gap-3 justify-start">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-red-100 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 max-w-[85%] space-y-1">
                  <Card className="border-0 shadow-sm bg-red-50 border border-red-200">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <div>
                          <div className="text-sm font-medium text-red-700">Analysis Error</div>
                          <div className="text-xs text-red-600">{error.message}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about your business data, draft emails, analyze leads..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
