"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useTransition,
} from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowDown,
  BookOpen,
  Camera as CameraIcon,
  ChevronLeft,
  ChevronRight,
  Code2,
  CornerDownLeft,
  Download,
  FileText as FileTextIcon,
  FileUp,
  Film,
  ImageIcon,
  Lightbulb,
  Loader2 as Loader,
  LogOut,
  Menu as MenuIcon,
  MessageSquare,
  MessageSquareText,
  Mic,
  MoreVertical,
  Newspaper,
  Paperclip,
  Play,
  Plus,
  ScreenShare,
  Send,
  Settings as SettingsIconLucide,
  Settings2,
  Sparkles,
  Sun,
  Moon,
  Trash2,
  Triangle,
  User,
  Users,
  Video as VideoIconLucide,
  X,
  Youtube,
} from "lucide-react"
import { motion } from "framer-motion"

import { ErrorBoundary } from "@/components/ErrorBoundary"
import { DynamicDataRenderer } from "@/components/dynamic-data-renderer"
import { parseDataFromText } from "@/lib/data-parser"
import type { DataItem } from "@/lib/data-types"
import { VoiceInputModal } from "@/components/voice-input-modal"
import { WebcamModal } from "@/components/webcam-modal"
import { VideoLearningModal } from "@/components/video-learning-modal"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/dialog" // Assuming dialog is where sheet components are

import { cn } from "@/lib/utils"

// Merged Interfaces
interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  dataItems?: DataItem[]
}

interface ActivityItem {
  id: string
  type:
    | "message"
    | "file"
    | "image"
    | "video_processing"
    | "video_complete"
    | "event"
    | "analyzing_video"
    | "generating_image"
    | "summarizing_chat"
    | "error"
    | "ai_thinking"
    | "user_action"
    | "system_message"
    | "analyzing"
    | "generating"
    | "processing"
    | "complete"
  title: string
  description?: string
  timestamp: Date
  user?: string
  progress?: number
  isLiveProcessing?: boolean
  isPerMessageLog?: boolean
  sourceMessageId?: string
  link?: string
  icon?: React.ElementType
  status?: "pending" | "in_progress" | "completed" | "failed"
  details?: string
}

interface AISettings {
  model: string
  temperature: number
  maxTokens: number
}

const getActivityIcon = (type: ActivityItem["type"]): React.ElementType => {
  switch (type) {
    case "message": return SearchIcon
    case "file": return FileUp
    case "image": return ImageIcon
    case "analyzing_video": return Film
    case "video_processing": return Loader
    case "video_complete": return Youtube
    case "event": return Sparkles
    case "generating_image": return ImageIcon
    case "summarizing_chat": return MessageSquareText
    case "error": return AlertTriangle
    default: return FileTextIcon
  }
}

const getActivityColor = (type: ActivityItem["type"]): string => {
  switch (type) {
    case "message": return "text-blue-500"
    case "file": return "text-green-500"
    case "image": return "text-purple-500"
    case "analyzing_video": return "text-yellow-500"
    case "video_processing": return "text-orange-500"
    case "video_complete": return "text-red-500"
    case "event": return "text-yellow-500"
    case "generating_image": return "text-fuchsia-600"
    case "summarizing_chat": return "text-teal-600"
    case "error": return "text-red-500"
    default: return "text-gray-500"
  }
}

// New Sidebar from feat/new-sidebar-video-tool-page
const SidebarContent: React.FC<{
  open: boolean
  activities: ActivityItem[]
  onSummarizeChat?: () => void
}> = ({ open, activities, onSummarizeChat }) => {
  return (
    <div
      className={cn(
        "h-full flex flex-col bg-card/50 backdrop-blur-lg border-r",
        open ? "p-4" : "p-2 items-center"
      )}
    >
      <div
        className={cn(
          "flex items-center mb-6",
          open ? "justify-between" : "justify-center"
        )}
      >
        {open && <h1 className="text-xl font-bold gradient-text">AI Hub</h1>}
      </div>
      <nav className="flex-grow">
        {[
          { icon: Newspaper, label: "Threads", href: "/threads" },
          { icon: Users, label: "Shared With Me", href: "/shared-with-me" },
          { icon: SettingsIconLucide, label: "Settings", href: "/settings" },
        ].map(item => (
          <TooltipProvider key={item.label} delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full flex items-center mb-2",
                      open ? "justify-start" : "justify-center"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", open && "mr-3")} />
                    {open && <span className="text-sm">{item.label}</span>}
                  </Button>
                </Link>
              </TooltipTrigger>
              {!open && (
                <TooltipContent side="right">{item.label}</TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ))}
      </nav>
      {open && (
        <div className="mt-auto">
          <h2 className="text-sm font-semibold mb-2 text-muted-foreground">
            Recent Activity
          </h2>
          <ScrollArea className="h-[200px]">
            {activities.map(activity => (
              <div
                key={activity.id}
                className="flex items-start mb-3 p-2 rounded-md hover:bg-muted transition-colors"
              >
                <div
                  className={cn("mr-3 mt-1", getActivityColor(activity.type))}
                >
                  {React.createElement(getActivityIcon(activity.type), {
                    className: "w-4 h-4",
                  })}
                </div>
                <div>
                  <p className="text-xs font-medium">
                    {activity.title || activity.details}
                  </p>
                  {activity.description && (
                    <p className="text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                  )}
                  {typeof activity.progress === "number" &&
                    activity.progress < 100 && (
                      <Progress
                        value={activity.progress}
                        className="h-1 w-full mt-1"
                      />
                    )}
                  <p className="text-xs text-muted-foreground">
                    {activity.user || "System"} -{" "}
                    {new Date(activity.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {activity.link && activity.type === "video_complete" && (
                    <a
                      href={activity.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Open App
                    </a>
                  )}
                </div>
              </div>
            ))}
          </ScrollArea>
          {onSummarizeChat && open && (
            <div className="mt-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={onSummarizeChat}
              >
                <MessageSquareText className="w-4 h-4 mr-2" />
                Summarize Chat
              </Button>
            </div>
          )}
        </div>
      )}
      <Separator className={cn("my-4", !open && "my-2")} />
      <div
        className={cn(
          "flex items-center",
          open ? "justify-between" : "justify-center"
        )}
      >
        {open && (
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src="/placeholder-user.jpg" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">User</span>
          </div>
        )}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/logout">
                <Button variant="ghost" size="icon" className={cn(!open && "w-full")}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side={open ? "top" : "right"}>Logout</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

const Sidebar: React.FC<{
  open: boolean
  setOpen: (open: boolean) => void
  animate?: boolean
  activities: ActivityItem[]
  onSummarizeChat?: () => void
}> = ({ open, setOpen, animate = true, activities, onSummarizeChat }) => {
  const [isHovered, setIsHovered] = useState(false)
  const effectiveOpen = open || isHovered
  const variants = {
    open: {
      width: animate ? 288 : "auto",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    closed: {
      width: animate ? 68 : "auto",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  }
  useEffect(() => {}, [open, isHovered])
  return (
    <motion.div
      layout
      initial={false}
      animate={effectiveOpen ? "open" : "closed"}
      variants={variants}
      className={cn(
        "h-full relative z-30 flex flex-col",
        effectiveOpen ? "shadow-lg" : "",
        open ? "flex" : "hidden md:flex"
      )}
      onMouseEnter={() => {
        if (!open) setIsHovered(true)
      }}
      onMouseLeave={() => {
        if (!open) setIsHovered(false)
      }}
    >
      <div
        className={cn(
          "h-full overflow-hidden",
          effectiveOpen ? "w-72" : "w-[68px]"
        )}
      >
        <SidebarContent
          open={effectiveOpen}
          activities={activities}
          onSummarizeChat={onSummarizeChat}
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-1/2 -right-4 transform -translate-y-1/2 bg-card border rounded-full h-8 w-8 z-40 shadow-md hover:bg-muted",
          !open && isHovered
            ? "opacity-100"
            : open
            ? "opacity-100"
            : "opacity-0"
        )}
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
    </motion.div>
  )
}

function ChatPageContent() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const [progress, setProgress] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: "s1",
      type: "message",
      timestamp: new Date(Date.now() - 3600000 * 3),
      user: "AI Assistant",
      title: "Chat Started",
      description: "Initial conversation with AI Assistant began.",
      details: 'Responded to "Project Setup Query"',
    },
    {
      id: "s2",
      type: "event",
      timestamp: new Date(Date.now() - 3600000 * 2),
      user: "System",
      title: "User Logged In",
      description: "User successfully authenticated to the platform.",
    },
  ])

  const [aiSettings, setAiSettings] = useState<AISettings>({
    model: "gemini-1.5-pro-latest",
    temperature: 0.7,
    maxTokens: 2048,
  })

  // Voice input state
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  
  // Camera/Image state
  const [showWebcamModal, setShowWebcamModal] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Video Learning Modal state
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [videoUrl, setVideoUrl] = useState("")

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])
  
  const addActivity = (activity: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    setActivities(prev => [{ ...activity, id: Date.now().toString(), timestamp: new Date() }, ...prev]);
  };

  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || input
    if (!content.trim() && !capturedImage && !uploadedImage) return

    setIsLoading(true)
    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, newUserMessage])
    setInput("")

    // Add activity
    addActivity({
      type: 'message',
      title: 'You sent a message',
      description: content.substring(0, 30) + '...',
      user: 'User'
    });

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          history: messages,
          settings: aiSettings,
          image: capturedImage || uploadedImage,
        }),
      })

      if (!response.ok || !response.body) {
        throw new Error("Failed to get response from server.")
      }
      
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantResponse = ""
      let dataItems: DataItem[] = []

      const streamInProgress = true
      while (streamInProgress) {
        const { done, value } = await reader.read()
        if (done) {
          addActivity({
            type: 'complete',
            title: 'AI finished responding',
            user: 'AI Assistant',
            status: 'completed'
          });
          break
        }
        
        const chunk = decoder.decode(value, { stream: true })
        assistantResponse += chunk
        
        // Simple parsing for structured data, can be improved
        if (assistantResponse.includes("<<DATA>>")) {
            const parts = assistantResponse.split("<<DATA>>");
            assistantResponse = parts[0]; // The text part
            const dataPart = parts[1].split("<</DATA>>")[0];
            try {
                const parsedData = JSON.parse(dataPart);
                dataItems = parseDataFromText(JSON.stringify(parsedData));
            } catch (e) {
                console.error("Error parsing data from stream:", e)
            }
        }


        setMessages(prev => {
          const lastMessage = prev[prev.length - 1]
          if (lastMessage?.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              { ...lastMessage, content: assistantResponse, dataItems },
            ]
          }
          return [
            ...prev,
            {
              id: Date.now().toString() + "-ai",
              role: "assistant",
              content: assistantResponse,
              timestamp: new Date().toISOString(),
              dataItems,
            },
          ]
        })
      }
    } catch (error) {
      console.error("Error sending message:", error)
      const errorContent = error instanceof Error ? error.message : "An unknown error occurred."
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString() + "-error",
          role: "assistant",
          content: `Error: ${errorContent}`,
          timestamp: new Date().toISOString(),
        },
      ])
      addActivity({
        type: 'error',
        title: 'Error in AI response',
        description: errorContent,
        user: 'System'
      });
    } finally {
      setIsLoading(false)
      setCapturedImage(null)
      setUploadedImage(null)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader()
      reader.onload = event => {
        setUploadedImage(event.target?.result as string)
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const clearImages = () => {
    setCapturedImage(null)
    setUploadedImage(null)
  }
  
  const handleSummarizeChat = async () => {
    addActivity({
      type: 'summarizing_chat',
      title: 'Summarizing chat...',
      user: 'System',
      status: 'in_progress',
    });
    // Placeholder for summarization logic
    setTimeout(() => {
       addActivity({
        type: 'complete',
        title: 'Chat summarized',
        description: 'A summary of the conversation has been generated.',
        user: 'System',
        status: 'completed'
      });
    }, 2000);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <TooltipProvider>
        <Sidebar open={isSidebarOpen} setOpen={setIsSidebarOpen} activities={activities} onSummarizeChat={handleSummarizeChat} />

        <main className="flex-1 flex flex-col h-screen">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-4">
               <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  <MenuIcon className="h-6 w-6" />
                </Button>
              <h1 className="text-xl font-bold">AI Chat</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                aria-label="Toggle Theme"
                checked={theme === 'dark'}
                onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              />
              <Sun className={cn("h-5 w-5", { "text-yellow-500": theme === 'light' })} />
              <Moon className={cn("h-5 w-5", { "text-blue-500": theme === 'dark' })} />
              <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)}>
                <Settings2 className="h-5 w-5" />
              </Button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4">
            <ScrollArea className="h-full">
              <div className="space-y-6">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex items-start gap-4",
                      message.role === "user" && "justify-end"
                    )}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder-logo.svg" alt="AI" />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "max-w-prose p-4 rounded-lg shadow-md",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <ErrorBoundary>
                        <DynamicDataRenderer content={message.content} />
                      </ErrorBoundary>
                      {message.dataItems && message.dataItems.length > 0 && (
                        <div className="mt-4 border-t pt-4">
                          {message.dataItems.map((item, index) => (
                            <DynamicDataRenderer key={index} content={item} />
                          ))}
                        </div>
                      )}
                    </div>
                    {message.role === "user" && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder-user.jpg" alt="User" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>
          </div>

          <div className="p-4 border-t">
            {(capturedImage || uploadedImage) && (
              <div className="relative w-32 h-32 mb-2">
                <img
                  src={capturedImage || uploadedImage || ''}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={clearImages}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="relative">
              <Textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your message, or paste a YouTube URL..."
                className="pr-24"
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
              <div className="absolute top-1/2 right-3 transform -translate-y-1/2 flex space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                      <Paperclip className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Attach file</TooltipContent>
                </Tooltip>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageUpload}
                  accept="image/*"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setShowWebcamModal(true)}>
                      <CameraIcon className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Use Camera</TooltipContent>
                </Tooltip>
                <Tooltip>
                   <TooltipTrigger asChild>
                     <Button variant="ghost" size="icon" onClick={() => setShowVoiceModal(true)}>
                       <Mic className="h-5 w-5" />
                     </Button>
                   </TooltipTrigger>
                   <TooltipContent>Use Voice</TooltipContent>
                 </Tooltip>
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </TooltipProvider>

      {/* Modals */}
      <VoiceInputModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onTranscriptChange={setInput}
        onFinalTranscript={handleSendMessage}
      />
      <WebcamModal
        isOpen={showWebcamModal}
        onClose={() => setShowWebcamModal(false)}
        onCapture={setCapturedImage}
      />
       <VideoLearningModal 
         isOpen={!!videoUrl} 
         onClose={() => setVideoUrl("")} 
         videoUrl={videoUrl} 
       />
    </div>
  )
}

export default function ChatPage() {
  return (
    <ErrorBoundary>
      <ChatPageContent />
    </ErrorBoundary>
  );
}

