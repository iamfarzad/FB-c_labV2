"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, MessageSquare, ArrowLeft, Mic, Camera, Image, Menu, X, Play, BookOpen,
  CornerDownLeft, Paperclip, Settings2, Square, Triangle, Moon, Sun,
  Youtube, Camera as CameraIcon, FileUp, Film, ScreenShare,
  Sparkles, ImageIcon, Search as SearchIcon, Lightbulb, Video as VideoIconLucide, Code2, FileText as FileTextIcon, Loader2 as Loader,
  Newspaper, Users, Settings as SettingsIconLucide, LogOut, ChevronLeft, ChevronRight, MoreVertical, Menu as MenuIcon, MessageSquareText, AlertTriangle, Download
} from 'lucide-react';

import Link from "next/link"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { DynamicDataRenderer } from "@/components/dynamic-data-renderer"
import { parseDataFromText } from "@/lib/data-parser"
import type { DataItem } from "@/lib/data-types"
import { VoiceInputModal } from "@/components/voice-input-modal"
import { WebcamModal } from "@/components/webcam-modal"
import { ChatSidePanel } from "@/components/chat-side-panel"
import { VideoLearningModal } from "@/components/video-learning-modal"

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  dataItems?: DataItem[]
}

interface Message {
  id: string;
  type: 'user' | 'ai' | 'systemInfo';
  content: string | React.ReactNode;
  avatarSrc?: string;
  timestamp?: string;
}

interface ActivityItem {
  id: string;
  type:
    | 'message'
    | 'file'
    | 'image'
    | 'video_processing'
    | 'video_complete'
    | 'event'
    | 'analyzing_video'
    | 'generating_image'
    | 'summarizing_chat'
    | 'error';
  timestamp: Date;
  user?: string;
  details?: string;
  avatar?: string;
  title?: string;
  description?: string;
  progress?: number;
  link?: string;
}

interface AISettings {
  model: string;
  temperature: number;
  maxTokens: number;
}

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'message': return <SearchIcon className="w-4 h-4" />;
    case 'file': return <FileUp className="w-4 h-4" />;
    case 'image': return <ImageIcon className="w-4 h-4" />;
    case 'analyzing_video': return <Film className="w-4 h-4 text-yellow-500 animate-pulse" />;
    case 'video_processing': return <Loader className="w-4 h-4 animate-spin" />;
    case 'video_complete': return <Youtube className="w-4 h-4 text-red-500" />;
    case 'event': return <Sparkles className="w-4 h-4" />;
    case 'generating_image': return <ImageIcon className="w-4 h-4 text-purple-500 animate-pulse" />;
    case 'summarizing_chat': return <MessageSquareText className="w-4 h-4 text-teal-500" />;
    case 'error': return <AlertTriangle className="w-4 h-4" />;
    default: return <FileTextIcon className="w-4 h-4" />;
  }
};

const getActivityColor = (type: ActivityItem['type']) => {
  switch (type) {
    case 'message': return 'text-blue-500';
    case 'file': return 'text-green-500';
    case 'image': return 'text-purple-500';
    case 'analyzing_video': return 'text-yellow-500';
    case 'video_processing': return 'text-orange-500';
    case 'video_complete': return 'text-red-500';
    case 'event': return 'text-yellow-500';
    case 'generating_image': return 'text-fuchsia-600';
    case 'summarizing_chat': return 'text-teal-600';
    case 'error': return 'text-red-500';
    default: return 'text-gray-500';
  }
};

const SidebarContent: React.FC<{ open: boolean; activities: ActivityItem[]; onSummarizeChat?: () => void; }> = ({ open, activities, onSummarizeChat }) => {
  return (
    <div className={cn("h-full flex flex-col bg-card/50 backdrop-blur-lg border-r", open ? "p-4" : "p-2 items-center")}>
      <div className={cn("flex items-center mb-6", open ? "justify-between" : "justify-center")}>
        {open && <h1 className="text-xl font-bold gradient-text">AI Hub</h1>}
      </div>
      <nav className="flex-grow">
        {[
          { icon: Newspaper, label: 'Threads', id: 'threads' },
          { icon: Users, label: 'Shared With Me', id: 'shared' },
          { icon: SettingsIconLucide, label: 'Settings', id: 'settings_nav' },
        ].map(item => (
          <TooltipProvider key={item.id} delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" className={cn("w-full flex items-center mb-2", open ? "justify-start" : "justify-center")}>
                  <item.icon className={cn("h-5 w-5", open && "mr-3")} />
                  {open && <span className="text-sm">{item.label}</span>}
                </Button>
              </TooltipTrigger>
              {!open && <TooltipContent side="right">{item.label}</TooltipContent>}
            </Tooltip>
          </TooltipProvider>
        ))}
      </nav>
      {open && (
        <div className="mt-auto">
          <h2 className="text-sm font-semibold mb-2 text-muted-foreground">Recent Activity</h2>
          <ScrollArea className="h-[200px]">
            {activities.map(activity => (
              <div key={activity.id} className="flex items-start mb-3 p-2 rounded-md hover:bg-muted transition-colors">
                <div className={cn("mr-3 mt-1", getActivityColor(activity.type))}>
                  {getActivityIcon(activity.type)}
                </div>
                <div>
                  <p className="text-xs font-medium">{activity.title || activity.details}</p>
                  {activity.description && <p className="text-xs text-muted-foreground">{activity.description}</p>}
                  {typeof activity.progress === 'number' && activity.progress < 100 && (
                    <Progress value={activity.progress} className="h-1 w-full mt-1" />
                  )}
                   <p className="text-xs text-muted-foreground">
                    {activity.user || 'System'} - {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {activity.link && activity.type === 'video_complete' && (
                     <a href={activity.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">Open App</a>
                  )}
                </div>
              </div>
            ))}
          </ScrollArea>
          {onSummarizeChat && open && (
            <div className="mt-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" className="w-full" onClick={onSummarizeChat}>
                <MessageSquareText className="w-4 h-4 mr-2" />
                Summarize Chat
              </Button>
            </div>
          )}
        </div>
      )}
      <Separator className={cn("my-4", !open && "my-2")} />
      <div className={cn("flex items-center", open ? "justify-between" : "justify-center")}>
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
              <Button variant="ghost" size="icon" className={cn(!open && "w-full")}>
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={open ? "top" : "right"}>Logout</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

const Sidebar: React.FC<{ open: boolean; setOpen: (open: boolean) => void; animate?: boolean; activities: ActivityItem[]; onSummarizeChat?: () => void; }> = ({ open, setOpen, animate = true, activities, onSummarizeChat }) => {
  const [isHovered, setIsHovered] = useState(false);
  const effectiveOpen = open || isHovered;
  const variants = { open: { width: animate ? 288 : 'auto', transition: { type: "spring", stiffness: 300, damping: 30 } }, closed: { width: animate ? 68 : 'auto', transition: { type: "spring", stiffness: 300, damping: 30 } }, };
  useEffect(() => {}, [open, isHovered]);
  return (
    <motion.div layout initial={false} animate={effectiveOpen ? "open" : "closed"} variants={variants} className={cn("h-full relative z-30 flex flex-col", effectiveOpen ? "shadow-lg" : "", open ? "flex" : "hidden md:flex" )} onMouseEnter={() => { if (!open) setIsHovered(true); }} onMouseLeave={() => { if (!open) setIsHovered(false); }}>
      <div className={cn("h-full overflow-hidden", effectiveOpen ? "w-72" : "w-[68px]")}>
        <SidebarContent open={effectiveOpen} activities={activities} onSummarizeChat={onSummarizeChat} />
      </div>
      <Button variant="ghost" size="icon" className={cn("absolute top-1/2 -right-4 transform -translate-y-1/2 bg-card border rounded-full h-8 w-8 z-40 shadow-md hover:bg-muted", !open && isHovered ? "opacity-100" : open ? "opacity-100" : "opacity-0" )} onClick={() => setOpen(!open)}>
        {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>
    </motion.div>
  );
};

function ChatPageContent() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Enhanced state for advanced features
  const [progress, setProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: 's1', type: 'message', timestamp: new Date(Date.now() - 3600000 * 3), user: 'AI Assistant', title: 'Chat Started', description: 'Initial conversation with AI Assistant began.', details: 'Responded to "Project Setup Query"' },
    { id: 's2', type: 'event', timestamp: new Date(Date.now() - 3600000 * 2), user: 'System', title: 'User Logged In', description: 'User successfully authenticated to the platform.' },
  ]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiSettings, setAiSettings] = useState<AISettings>({ model: 'gemini-1.5-pro-latest', temperature: 0.7, maxTokens: 1024 });

  // Voice input state
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [currentTranscription, setCurrentTranscription] = useState("")
  const [aiVoiceState, setAiVoiceState] = useState<"listening" | "processing" | "idle" | "error">("idle")
  const recognition = useRef<SpeechRecognition | null>(null)
  const isSpeechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  // Camera/Image state
  const [showWebcamModal, setShowWebcamModal] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Side panel state
  const [showSidePanel, setShowSidePanel] = useState(false)

  // Video learning state
  const [showVideoModal, setShowVideoModal] = useState(false)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Initialize speech recognition
  useEffect(() => {
    if (isSpeechSupported && typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognition.current = new SpeechRecognition()
      recognition.current.continuous = false
      recognition.current.interimResults = false
      
      recognition.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setCurrentTranscription(transcript)
        setAiVoiceState('idle')
        setShowVoiceModal(false)
      }
      
      recognition.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error)
        setAiVoiceState('error')
        setTimeout(() => {
          setAiVoiceState('idle')
          setShowVoiceModal(false)
        }, 2000)
      }
      
      recognition.current.onend = () => {
        setAiVoiceState(currentState => {
          if (currentState === 'listening') {
            setShowVoiceModal(false)
            return 'idle'
          }
          return currentState
        })
      }
    }
    
    return () => {
      if (recognition.current) {
        recognition.current.stop()
      }
    }
  }, [isSpeechSupported])

  // Initialize camera when webcam modal opens
  useEffect(() => {
    if (showWebcamModal && videoRef.current) {
      console.log("Initializing camera...")
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          console.log("Camera stream obtained")
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            setIsCameraActive(true)
          }
        })
        .catch((error) => {
          console.error("Camera access denied or failed:", error)
          setShowWebcamModal(false)
          alert("Camera access denied. Please allow camera permissions and try again.")
        })
    }

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
        setIsCameraActive(false)
      }
    }
  }, [showWebcamModal])

  // Enhanced activity tracking functions
  const addActivity = (activity: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    const newActivity: ActivityItem = {
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep last 10 activities
  };

  const handleTriggerSummarization = async () => {
    if (messages.length === 0) return;
    
    addActivity({
      type: 'summarizing_chat',
      title: 'Generating Chat Summary',
      description: 'AI is analyzing the conversation...',
      user: 'System',
      progress: 0
    });

    // Simulate progress
    let progressValue = 0;
    const progressInterval = setInterval(() => {
      progressValue += 10;
      setActivities(prev => prev.map(activity => 
        activity.type === 'summarizing_chat' && activity.progress !== undefined
          ? { ...activity, progress: progressValue }
          : activity
      ));
      
      if (progressValue >= 100) {
        clearInterval(progressInterval);
        setActivities(prev => prev.map(activity => 
          activity.type === 'summarizing_chat'
            ? { ...activity, title: 'Chat Summary Complete', description: 'Summary generated successfully', progress: 100 }
            : activity
        ));
      }
    }, 200);
  };

  const startVideoProcessingActivity = (videoUrl: string, title: string) => {
    addActivity({
      type: 'video_processing',
      title: `Processing: ${title}`,
      description: 'Generating interactive learning app...',
      user: 'AI Assistant',
      progress: 0
    });

    // Simulate video processing
    setTimeout(() => {
      setActivities(prev => prev.map(activity => 
        activity.type === 'video_processing'
          ? { 
              ...activity, 
              type: 'video_complete',
              title: `Learning App Ready: ${title}`,
              description: 'Interactive learning experience generated',
              progress: 100,
              link: `/video-learning-tool?videoUrl=${encodeURIComponent(videoUrl)}`
            }
          : activity
      ));
    }, 3000);
  };

  const detectYouTubeUrl = (text: string): string | null => {
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = text.match(youtubeRegex);
    return match ? match[0] : null;
  };

  const getVideoTitle = async (url: string): Promise<string> => {
    // Simplified title extraction
    return `Video from ${url.substring(0, 30)}...`;
  };

  const toggleTheme = () => setTheme(prev => (prev === "light" ? "dark" : "light"));

  const exportSummary = () => {
    if (messages.length === 0) return
    const transcript = messages.map(msg => {
      const timestamp = msg.timestamp || new Date().toLocaleTimeString()
      const sender = msg.role === "user" ? "User" : "AI"
      return `[${timestamp}] ${sender}: ${msg.content}`
    }).join('\n\n')
    const blob = new Blob([transcript], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'chat-transcript.txt'
    a.click()
    URL.revokeObjectURL(url)
    
    addActivity({
      type: 'file',
      title: 'Transcript Downloaded',
      description: 'Chat conversation exported to file',
      user: 'System'
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("=== FORM SUBMIT DEBUG ===")
    console.log("Form submitted with input:", input)
    
    if (!input.trim()) {
      console.log("Empty input, returning early")
      return
    }

    // Check for YouTube URL
    const youtubeUrl = detectYouTubeUrl(input);
    if (youtubeUrl) {
      const title = await getVideoTitle(youtubeUrl);
      startVideoProcessingActivity(youtubeUrl, title);
      setInput("");
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Add activity for new message
    addActivity({
      type: 'message',
      title: 'New Message Sent',
      description: input.substring(0, 50) + (input.length > 50 ? '...' : ''),
      user: 'User'
    });

    try {
      const currentImageData = getCurrentImage()
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          imageData: currentImageData,
          cameraFrame: null,
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No reader available")

      let assistantMessage = ""
      const assistantMessageId = (Date.now() + 1).toString()

      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split("\n").filter(line => line.trim())

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.content) {
                assistantMessage += data.content
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: assistantMessage }
                    : msg
                ))
              }
            } catch (error) {
              console.error("Error parsing JSON:", error)
            }
          }
        }
      }

      // Parse data items from the final response
      const dataItems = parseDataFromText(assistantMessage)
      if (dataItems.length > 0) {
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, dataItems }
            : msg
        ))
      }

      // Add activity for AI response
      addActivity({
        type: 'message',
        title: 'AI Response Received',
        description: assistantMessage.substring(0, 50) + (assistantMessage.length > 50 ? '...' : ''),
        user: 'AI Assistant'
      });

    } catch (error) {
      console.error("Error sending message:", error)
      
      addActivity({
        type: 'error',
        title: 'Message Failed',
        description: 'Failed to send message to AI',
        user: 'System'
      });
    } finally {
      setIsLoading(false)
      clearImages()
    }
  }

  const toggleVoiceInput = () => {
    if (!isSpeechSupported) {
      alert("Speech recognition is not supported in this browser.")
      return
    }

    if (aiVoiceState === "listening") {
      recognition.current?.stop()
      setAiVoiceState("idle")
      setShowVoiceModal(false)
    } else {
      setShowVoiceModal(true)
      setAiVoiceState("listening")
      setCurrentTranscription("")
      
      try {
        recognition.current?.start()
      } catch (error) {
        console.error("Error starting speech recognition:", error)
        setAiVoiceState("error")
        setShowVoiceModal(false)
      }
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64String = e.target?.result as string
        setUploadedImage(base64String)
        
        addActivity({
          type: 'image',
          title: 'Image Uploaded',
          description: `Uploaded: ${file.name}`,
          user: 'User'
        });
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL('image/jpeg', 0.8)
        setCapturedImage(imageData)
        setShowWebcamModal(false)
        
        // Stop camera stream
        if (video.srcObject) {
          const stream = video.srcObject as MediaStream
          stream.getTracks().forEach(track => track.stop())
        }
        setIsCameraActive(false)
        
        addActivity({
          type: 'image',
          title: 'Photo Captured',
          description: 'Camera photo taken successfully',
          user: 'User'
        });
      }
    }
  }

  const clearImages = () => {
    setCapturedImage(null)
    setUploadedImage(null)
  }

  const getCurrentImage = () => capturedImage || uploadedImage

  return (
    <TooltipProvider>
      {/* Voice Input Modal */}
      {showVoiceModal && (
        <VoiceInputModal
          isListening={aiVoiceState === "listening"}
          currentTranscription={currentTranscription}
          aiState={aiVoiceState}
          onClose={() => {
            setShowVoiceModal(false)
            setAiVoiceState("idle")
            if (recognition.current) {
              recognition.current.stop()
            }
          }}
          theme="light"
        />
      )}

      {/* Webcam Modal */}
      {showWebcamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Take Photo</h2>
              <button
                onClick={() => {
                  setShowWebcamModal(false)
                  setIsCameraActive(false)
                  if (videoRef.current?.srcObject) {
                    const stream = videoRef.current.srcObject as MediaStream
                    stream.getTracks().forEach(track => track.stop())
                  }
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="relative">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full rounded-lg"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {!isCameraActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                  <p>Initializing camera...</p>
                </div>
              )}
            </div>
            
            {isCameraActive && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleCameraCapture}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  📸 Capture Photo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video Learning Modal */}
      {showVideoModal && (
        <VideoLearningModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          theme="light"
        />
      )}

      {/* Main Chat Interface with Advanced Sidebar */}
      <div className={cn("flex h-[calc(100vh-4rem)] w-full bg-background text-foreground")}>
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} animate={true} activities={activities} onSummarizeChat={handleTriggerSummarization} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b bg-background">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-logo.svg" alt="AI Avatar" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">F.B/c AI Chat</p>
                <Badge variant="outline" className={isLoading ? "text-orange-500 border-orange-500" : "text-green-500 border-green-500"}>
                  {isLoading ? 'Responding...' : 'Online'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={exportSummary}>
                    <Download className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download Transcript</TooltipContent>
              </Tooltip>
              <Button variant="ghost" size="icon" onClick={() => setShowVideoModal(true)}>
                <Play className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                <div className="relative">
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute top-0 left-0 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </div>
              </Button>
            </div>
          </header>

          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-20">
                <MessageSquare size={48} className="mx-auto mb-4 text-orange-500" />
                <h2 className="text-xl font-bold mb-2">Welcome to F.B/c AI</h2>
                <p>Start a conversation with your AI assistant.</p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex mb-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`rounded-lg p-3 max-w-[70%] ${
                    msg.role === "user"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {msg.role === "assistant" && msg.dataItems ? (
                    <DynamicDataRenderer data={msg.dataItems} theme="light" />
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                    <span>AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </ScrollArea>

          {(isLoading) && <Progress value={progress} className="w-full h-1" />}
          
          <form onSubmit={handleSendMessage} className="p-4 border-t">
            {getCurrentImage() && (
              <div className="mb-3 relative inline-block">
                <img 
                  src={getCurrentImage()!} 
                  alt="Selected" 
                  className="w-20 h-20 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={clearImages}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            )}
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="Upload Image"
              >
                <Image size={20} />
              </button>
              
              <button
                type="button"
                onClick={() => setShowWebcamModal(true)}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="Take Photo"
              >
                <Camera size={20} />
              </button>
              
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`p-2 transition-colors ${
                  aiVoiceState === "listening" 
                    ? "text-red-500 hover:text-red-600" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
                title={aiVoiceState === "listening" ? "Stop Recording" : "Voice Input"}
              >
                <Mic size={20} />
              </button>
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message... (or paste a YouTube URL)"
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                disabled={isLoading}
              />
              
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </TooltipProvider>
  )
}

export default function ChatPage() {
  return (
    <ErrorBoundary>
      <ChatPageContent />
    </ErrorBoundary>
  )
}
