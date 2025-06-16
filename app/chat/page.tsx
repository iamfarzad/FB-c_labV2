'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  CornerDownLeft, Mic, Paperclip, Settings2, Square, Triangle, Moon, Sun,
  Youtube, Camera as CameraIcon, FileUp, Film, ScreenShare,
  Sparkles, ImageIcon, Search as SearchIcon, Lightbulb, Video as VideoIconLucide, Code2, FileText as FileTextIcon, Loader2 as Loader,
  Newspaper, Users, Settings as SettingsIconLucide, LogOut, ChevronLeft, ChevronRight, MoreVertical, Menu as MenuIcon, MessageSquareText, AlertTriangle, Download
} from 'lucide-react';

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
import { WebcamModal } from '@/components/webcam-modal';

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
        {open && ( <div className="flex items-center"> <Avatar className="h-8 w-8 mr-2"> <AvatarImage src="/placeholder-user.jpg" alt="User" /> <AvatarFallback>U</AvatarFallback> </Avatar> <span className="text-sm font-medium">User</span> </div> )}
        <TooltipProvider delayDuration={0}> <Tooltip> <TooltipTrigger asChild> <Button variant="ghost" size="icon" className={cn(!open && "w-full")}> <LogOut className="h-5 w-5" /> </Button> </TooltipTrigger> <TooltipContent side={open ? "top" : "right"}>Logout</TooltipContent> </Tooltip> </TooltipProvider>
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

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', type: 'ai', content: 'Hello! How can I assist you today?', avatarSrc: '/placeholder-logo.svg', timestamp: '10:00 AM' },
    { id: '2', type: 'user', content: 'I need help with setting up my new project.', avatarSrc: '/placeholder-user.jpg', timestamp: '10:01 AM' },
    { id: '3', type: 'systemInfo', content: 'AI model changed to Gemini Pro.', timestamp: '10:01 AM'},
    { id: '4', type: 'ai', content: 'Sure, I can help with that! What kind of project is it?', avatarSrc: '/placeholder-logo.svg', timestamp: '10:02 AM' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: 's1', type: 'message', timestamp: new Date(Date.now() - 3600000 * 3), user: 'AI Assistant', title: 'Chat Started', description: 'Initial conversation with AI Assistant began.', details: 'Responded to "Project Setup Query"' },
    { id: 's2', type: 'event', timestamp: new Date(Date.now() - 3600000 * 2), user: 'System', title: 'User Logged In', description: 'User successfully authenticated to the platform.' },
  ]);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [currentTranscription, setCurrentTranscription] = useState("");
  const [aiVoiceState, setAiVoiceState] = useState<"listening" | "processing" | "idle" | "error">("idle");
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const recognition = useRef<any>(null);
  const [showWebcamModal, setShowWebcamModal] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [currentCameraFrame, setCurrentCameraFrame] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [uploadedFileContent, setUploadedFileContent] = useState<{ name: string, type: string, content: string | ArrayBuffer | null } | null>(null);
  const [showUploadOptionsMenu, setShowUploadOptionsMenu] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [showQuickToolsMenu, setShowQuickToolsMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiSettings, setAiSettings] = useState<AISettings>({ model: 'gemini-1.5-pro-latest', temperature: 0.7, maxTokens: 1024 });
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setIsSpeechSupported(typeof window !== "undefined" && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)); }, []);
  useEffect(() => { if (typeof window !== 'undefined') { const urlInInput = detectYouTubeUrl(inputValue); if (urlInInput) { setInputValue(''); getVideoTitle(urlInInput).then(title => startVideoProcessingActivity(urlInInput, title || "Untitled Video")); } } }, [inputValue]);
  const scrollToBottom = useCallback(() => { if (scrollAreaRef.current) scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight; }, []);
  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);
  useEffect(() => { /* Speech Recognition Setup */ if (!isSpeechSupported || typeof window === 'undefined') return; const SpeechRecognitionAPI = window.SpeechRecognition || (window as any).webkitSpeechRecognition; if (!SpeechRecognitionAPI) { console.warn("Browser does not support SpeechRecognition."); setIsSpeechSupported(false); return; } recognition.current = new SpeechRecognitionAPI(); Object.assign(recognition.current, { continuous: false, interimResults: true, lang: "en-US" }); recognition.current.onstart = () => { setAiVoiceState("listening"); setCurrentTranscription(""); }; recognition.current.onresult = (event: any) => { let i = "", f = ""; for (let j = event.resultIndex; j < event.results.length; ++j) event.results[j].isFinal ? f += event.results[j][0].transcript : i += event.results[j][0].transcript; setCurrentTranscription(i || f); if (f) setInputValue(p => (p ? p + " " : "") + f.trim()); }; recognition.current.onend = () => { setAiVoiceState("processing"); const t = inputValue.trim() || currentTranscription.trim(); if (t) handleSendMessage(t); setShowVoiceModal(false); setAiVoiceState("idle"); setCurrentTranscription(""); }; recognition.current.onerror = (e: any) => { console.error("SR error:", e.error); setAiVoiceState("error"); setCurrentTranscription(p => p + ` Err: ${e.error}.`); setTimeout(() => { setShowVoiceModal(false); setAiVoiceState("idle"); setCurrentTranscription(""); }, 3000); }; return () => { if (recognition.current) recognition.current.stop(); }; }, [isSpeechSupported]);
  useEffect(() => { document.documentElement.classList.toggle("dark", theme === "dark"); }, [theme]);

  const handleTriggerSummarization = async () => { /* ... as implemented ... */ };
  const startVideoProcessingActivity = (videoUrl: string, title: string) => { /* ... as implemented ... */ };
  const portGenerateImage = async (prompt: string) => { /* ... as implemented ... */ };
  const portHandleToolClick = async (toolName: string) => { /* ... as implemented ... */ };
  const startCamera = async () => { /* ... (rest of the function body remains unchanged) ... */ };
  const stopCamera = useCallback(() => { /* ... (rest of the function body remains unchanged) ... */ }, []);
  const captureFrame = useCallback(() => { /* ... (rest of the function body remains unchanged) ... */ }, []);
  const detectYouTubeUrl = (text: string): string | null => { /* ... (rest of the function body remains unchanged) ... */ };
  const getVideoTitle = async (url: string): Promise<string> => { /* ... (rest of the function body remains unchanged) ... */ };
  const toggleTheme = () => setTheme(prev => (prev === "light" ? "dark" : "light"));

  const exportSummary = () => {
    if (!messages || messages.length === 0) {
      console.warn("No messages to export for transcript.");
      return;
    }
    const transcriptString = messages
      .map(message => {
        const senderName = message.type === "user" ? "User" : message.type === "ai" ? "AI" : "System";
        const time = message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let contentText = "";
        if (typeof message.content === 'string') {
          contentText = message.content;
        } else if (message.content && typeof message.content === 'object') {
          const nodeContent = message.content as any;
          if (nodeContent.props && typeof nodeContent.props.children === 'string') {
            contentText = nodeContent.props.children;
          } else if (typeof (message.content as any).text === 'string') {
             contentText = (message.content as any).text;
          } else {
            try {
              contentText = JSON.stringify(message.content, null, 2);
            } catch (e) {
              contentText = "[Unsupported or circular content structure]";
            }
          }
        } else {
          contentText = String(message.content);
        }
        return `[${time}] ${senderName}: ${contentText}`;
      })
      .join("\n\n");

    if (!transcriptString.trim()) {
      console.warn("Generated transcript string is empty.");
      return;
    }
    const blob = new Blob([transcriptString], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "chat-transcript.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSendMessage = async (messageContent?: string) => { /* ... (rest of the function body remains unchanged) ... */ };
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value);
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && !e.shiftKey && !isLoading) { e.preventDefault(); handleSendMessage(); } };
  const handleMicButtonClick = () => { /* ... (rest of the function body remains unchanged) ... */ };
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => { /* ... (rest of the function body remains unchanged) ... */ };
  const uploadOptions = [ /* ... (rest of the function body remains unchanged) ... */ ];
  const quickTools = [ /* ... (rest of the function body remains unchanged) ... */ ];
  const handleQuickToolSelect = (toolId: string) => { /* ... (rest of the function body remains unchanged) ... */ };

  return (
    <TooltipProvider>
      {showVoiceModal && <VoiceInputModal onClose={() => { if (recognition.current) { recognition.current.stop(); } setShowVoiceModal(false); setAiVoiceState("idle"); setCurrentTranscription(""); }} theme={theme} isListening={aiVoiceState === "listening"} currentTranscription={currentTranscription} aiState={aiVoiceState}/>}
      {showWebcamModal && <WebcamModal videoRef={videoRef} canvasRef={canvasRef} isCameraActive={isCameraActive} onStopCamera={stopCamera} theme={theme}/>}

      <div className={cn("flex h-[calc(100vh-4rem)] w-full bg-background text-foreground")}>
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} animate={true} activities={activities} onSummarizeChat={handleTriggerSummarization} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b bg-background">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <MenuIcon className="h-5 w-5" /> <span className="sr-only">Toggle Sidebar</span>
              </Button>
              <Avatar className="h-8 w-8"> <AvatarImage src="/placeholder-logo.svg" alt="AI Avatar" /> <AvatarFallback>AI</AvatarFallback> </Avatar>
              <div> <p className="text-sm font-medium">AI Chatbot</p> <Badge variant="outline" className={isLoading ? "text-orange-500 border-orange-500" : "text-green-500 border-green-500"}> {isLoading ? 'Responding...' : 'Online'} </Badge> </div>
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
              <Button variant="ghost" size="icon" onClick={toggleTheme}> <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" /> <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" /> <span className="sr-only">Toggle theme</span> </Button>
              {/*
              <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)}>
                <Settings2 className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
              */}
            </div>
          </header>

          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}> {/* Main chat messages */} </ScrollArea>
           {showSettings && (
            <aside className="absolute top-0 right-0 h-full w-80 border-l bg-background p-4 space-y-4 overflow-y-auto z-20 md:relative">
              <Card>
                <CardHeader><CardTitle>AI Settings</CardTitle><CardDescription>Configure the AI model behavior.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><label htmlFor="model" className="text-sm font-medium">Model</label><select id="model" value={aiSettings.model} onChange={(e) => setAiSettings(prev => ({...prev, model: e.target.value}))} className="w-full p-2 border rounded-md bg-input text-foreground"><option value="gemini-1.5-pro-latest">Gemini 1.5 Pro</option><option value="gemini-1.0-pro">Gemini 1.0 Pro</option><option value="gpt-4-turbo">GPT-4 Turbo</option><option value="claude-3-opus">Claude 3 Opus</option></select></div>
                  <div className="space-y-2"><label htmlFor="temperature" className="text-sm font-medium">Temperature: {aiSettings.temperature.toFixed(1)}</label><Input id="temperature" type="range" min="0" max="1" step="0.1" value={aiSettings.temperature} onChange={(e) => setAiSettings(prev => ({...prev, temperature: parseFloat(e.target.value)}))} className="bg-input"/></div>
                  <div className="space-y-2"><label htmlFor="maxTokens" className="text-sm font-medium">Max Tokens: {aiSettings.maxTokens}</label><Input id="maxTokens" type="number" step="64" value={aiSettings.maxTokens} onChange={(e) => setAiSettings(prev => ({...prev, maxTokens: parseInt(e.target.value)}))} className="bg-input"/></div>
                  <div className="flex items-center justify-between"><label htmlFor="some-toggle" className="text-sm font-medium">Some Setting</label><Switch id="some-toggle" /></div>
                </CardContent>
                <CardFooter><Button className="w-full" onClick={() => { const systemMessage: Message = { id: Date.now().toString() + '-settings', type: 'systemInfo', content: `Settings updated: Model: ${aiSettings.model}, Temp: ${aiSettings.temperature}, Tokens: ${aiSettings.maxTokens}`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), }; setMessages(prev => [...prev, systemMessage]); setShowSettings(false); }}>Apply Settings</Button></CardFooter>
              </Card>
              <Separator/>
              <Card>
                <CardHeader><CardTitle>Session Info</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">Session ID: <Badge variant="secondary">xyz-123-abc</Badge></p>
                  <p className="text-sm text-muted-foreground">Messages in session: {messages.length}</p>
                </CardContent>
              </Card>
            </aside>
          )}
          {(isLoading || generatingImage) && <Progress value={progress} className="w-full h-1" />}
          <div className="relative border-t bg-background p-4">  {/* Input Area */} </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ChatPage;
