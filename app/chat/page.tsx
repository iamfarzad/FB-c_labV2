'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  CornerDownLeft, Mic, Paperclip, Settings2, Square, Triangle, Moon, Sun,
  Youtube, Camera as CameraIcon, FileUp, Film, ScreenShare,
  Sparkles, ImageIcon, Search as SearchIcon, Lightbulb, Video as VideoIconLucide, Code2, FileText as FileTextIcon, Loader2 as Loader,
  Newspaper, Users, Settings as SettingsIconLucide, LogOut, ChevronLeft, ChevronRight, MoreVertical, Menu as MenuIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Keep if settings panel uses it
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch'; // Keep if settings panel uses it
import { Progress } from '@/components/ui/progress'; // For activity item progress
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion'; // AnimatePresence not directly used in provided Sidebar code, but motion is.
import { WebcamModal } from '@/components/webcam-modal';
// VideoLearningModal is removed from this flow, progress shown in sidebar.
// import { VideoLearningModal } from '@/components/video-learning-modal';
// VideoLearningCard is removed as YouTube processing directly creates a sidebar activity.
// import { VideoLearningCard } from '@/components/video-learning-card';


interface Message {
  id: string;
  type: 'user' | 'ai' | 'systemInfo';
  content: string | React.ReactNode;
  avatarSrc?: string;
  timestamp?: string;
}

// Updated ActivityItem interface for more detailed activities including progress
interface ActivityItem {
  id: string;
  type: 'message' | 'file' | 'image' | 'video_processing' | 'video_complete' | 'event' | 'analyzing_video';
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

// Sidebar Components defined within ChatPage scope or imported
const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'message': return <SearchIcon className="w-4 h-4" />;
    case 'file': return <FileUp className="w-4 h-4" />;
    case 'image': return <ImageIcon className="w-4 h-4" />;
    case 'analyzing_video': return <Film className="w-4 h-4 text-yellow-500 animate-pulse" />;
    case 'video_processing': return <Loader className="w-4 h-4 animate-spin" />;
    case 'video_complete': return <Youtube className="w-4 h-4 text-red-500" />;
    case 'event': return <Sparkles className="w-4 h-4" />;
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
    default: return 'text-gray-500';
  }
};

const SidebarContent: React.FC<{ open: boolean; activities: ActivityItem[] }> = ({ open, activities }) => {
  return (
    <div className={cn("h-full flex flex-col bg-card/50 backdrop-blur-lg border-r", open ? "p-4" : "p-2 items-center")}>
      <div className={cn("flex items-center mb-6", open ? "justify-between" : "justify-center")}>
        {open && <h1 className="text-xl font-bold gradient-text">AI Hub</h1>}
      </div>
      <nav className="flex-grow">
        {[
          { icon: Newspaper, label: 'Threads', id: 'threads' },
          { icon: Users, label: 'Shared With Me', id: 'shared' },
          { icon: SettingsIconLucide, label: 'Settings', id: 'settings_nav' }, // Renamed id to avoid conflict
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

const Sidebar: React.FC<{ open: boolean; setOpen: (open: boolean) => void; animate?: boolean; activities: ActivityItem[] }> = ({ open, setOpen, animate = true, activities }) => {
  const [isHovered, setIsHovered] = useState(false);
  const effectiveOpen = open || isHovered;

  const variants = {
    open: { width: animate ? 288 : 'auto', transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { width: animate ? 68 : 'auto', transition: { type: "spring", stiffness: 300, damping: 30 } },
  };

  useEffect(() => {
    // Effect for hover logic if needed, but CSS handles much of it
  }, [open, isHovered]);

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
      onMouseEnter={() => { if (!open) setIsHovered(true); }}
      onMouseLeave={() => { if (!open) setIsHovered(false); }}
    >
      <div className={cn("h-full overflow-hidden", effectiveOpen ? "w-72" : "w-[68px]")}>
        <SidebarContent open={effectiveOpen} activities={activities} />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-1/2 -right-4 transform -translate-y-1/2 bg-card border rounded-full h-8 w-8 z-40 shadow-md hover:bg-muted",
          !open && isHovered ? "opacity-100" : open ? "opacity-100" : "opacity-0"
        )}
        onClick={() => setOpen(!open)}
      >
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
  const [activities, setActivities] = useState<ActivityItem[]>([ // Initial static activities
    { id: 's1', type: 'message', timestamp: new Date(Date.now() - 3600000 * 3), user: 'AI Assistant', title: 'Chat Started', description: 'Initial conversation started.' },
    { id: 's2', type: 'event', timestamp: new Date(Date.now() - 3600000 * 2), title: 'User Logged In', description: 'User successfully authenticated.', user: 'System' },
  ]);

  // Voice Input State
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [currentTranscription, setCurrentTranscription] = useState("");
  const [aiVoiceState, setAiVoiceState] = useState<"listening" | "processing" | "idle" | "error">("idle");
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const recognition = useRef<any>(null);

  // Webcam State
  const [showWebcamModal, setShowWebcamModal] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [currentCameraFrame, setCurrentCameraFrame] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // YouTube Video State - these are now transient for initiating activity
  // const [showVideoLearning, setShowVideoLearning] = useState(false); // Modal not opened from this flow anymore
  // const [detectedVideoUrl, setDetectedVideoUrl] = useState<string | null>(null); // Not needed as state if processed immediately
  // const [videoTitle, setVideoTitle] = useState<string>(""); // Not needed as state if processed immediately
  // const [isGeneratingVideoApp, setIsGeneratingVideoApp] = useState(false); // Activity progress handles this

  // Uploaded File State
  const [uploadedFileContent, setUploadedFileContent] = useState<{ name: string, type: string, content: string | ArrayBuffer | null } | null>(null);
  const [showUploadOptionsMenu, setShowUploadOptionsMenu] = useState(false);

  // Quick Tools State
  const [generatingImage, setGeneratingImage] = useState(false);
  const [showQuickToolsMenu, setShowQuickToolsMenu] = useState(false);

  // New Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(true);


  const [aiSettings, setAiSettings] = useState<AISettings>({
    model: 'gemini-1.5-pro-latest',
    temperature: 0.7,
    maxTokens: 1024,
  });

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    setIsSpeechSupported(typeof window !== "undefined" && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window));
  }, []);

  // YouTube URL Detection Effect & Video Processing Trigger
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlInInput = detectYouTubeUrl(inputValue);
      if (urlInInput) {
        setInputValue(''); // Clear input immediately as we are processing this URL
        // No need to setDetectedVideoUrl or setVideoTitle state here, pass directly
        getVideoTitle(urlInInput).then(title => {
          startVideoProcessingActivity(urlInInput, title || "Untitled Video");
        });
      }
    }
  }, [inputValue]); // Effect only depends on inputValue

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!isSpeechSupported || typeof window === 'undefined') return;
    const SpeechRecognitionAPI = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      console.warn("Browser does not support SpeechRecognition.");
      setIsSpeechSupported(false);
      return;
    }
    recognition.current = new SpeechRecognitionAPI();
    recognition.current.continuous = false;
    recognition.current.interimResults = true;
    recognition.current.lang = "en-US";
    recognition.current.onstart = () => { setAiVoiceState("listening"); setCurrentTranscription(""); };
    recognition.current.onresult = (event: any) => {
      let interim = "", final = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        event.results[i].isFinal ? final += event.results[i][0].transcript : interim += event.results[i][0].transcript;
      }
      setCurrentTranscription(interim || final);
      if (final) setInputValue((prev) => (prev ? prev + " " : "") + final.trim());
    };
    recognition.current.onend = () => {
      setAiVoiceState("processing");
      const transcript = inputValue.trim() || currentTranscription.trim();
      if (transcript) handleSendMessage(transcript);
      setShowVoiceModal(false); setAiVoiceState("idle"); setCurrentTranscription("");
    };
    recognition.current.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setAiVoiceState("error"); setCurrentTranscription(prev => prev + ` Error: ${event.error}.`);
      setTimeout(() => { setShowVoiceModal(false); setAiVoiceState("idle"); setCurrentTranscription(""); }, 3000);
    };
    return () => { if (recognition.current) recognition.current.stop(); };
  }, [isSpeechSupported]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const startVideoProcessingActivity = (videoUrl: string, title: string) => {
    const newActivityId = `video-${Date.now().toString()}`;
    const initialActivity: ActivityItem = {
      id: newActivityId,
      type: "analyzing_video",
      title: `Video: ${title}`,
      description: "Preparing analysis...",
      progress: 0,
      timestamp: new Date(),
    };
    setActivities(prev => [initialActivity, ...prev]);
    // setDetectedVideoUrl(null); // Clear after starting, to allow new detections

    let currentProgress = 0;
    const intervalId = setInterval(() => {
      currentProgress += 20;
      if (currentProgress <= 100) {
        setActivities(prev => prev.map(act =>
          act.id === newActivityId ? {
            ...act,
            progress: currentProgress,
            description: `Generating learning app... ${currentProgress}%`,
            type: "video_processing"
          } : act
        ));
      } else {
        clearInterval(intervalId);
        setActivities(prev => prev.map(act =>
          act.id === newActivityId ? {
            ...act,
            progress: 100,
            type: "video_complete",
            description: "Learning app ready!",
            link: `/video-learning-tool?videoUrl=${encodeURIComponent(videoUrl)}`
          } : act
        ));

        const linkMessage: Message = {
          id: Date.now().toString(),
          type: "ai",
          content: (
            <span>
              Your learning app for "<strong>{title}</strong>" is ready!{' '}
              <a href={`/video-learning-tool?videoUrl=${encodeURIComponent(videoUrl)}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                Click here to open
              </a>.
            </span>
          ),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          avatarSrc: '/placeholder-logo.svg',
        };
        setMessages(prevMessages => [...prevMessages, linkMessage]);
      }
    }, 700);
  };

  const portGenerateImage = async (prompt: string) => {
    setShowQuickToolsMenu(false); setGeneratingImage(true);
    const userPromptMessage: Message = {
      id: Date.now().toString() + '-user-img-prompt', type: 'user',
      content: `Generate an image based on: "${prompt}"`,
      avatarSrc: '/placeholder-user.jpg', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userPromptMessage]); setInputValue('');
    try {
      const response = await fetch("/api/gemini-proxy?action=generateImage", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }),
      });
      const result = await response.json();
      if (result.success && result.data) {
        const aiImageResponse: Message = {
          id: Date.now().toString(), type: 'ai',
          content: ( <div> <p>Image generation request for: "{prompt}" (Processing complete)</p> <p><strong>Description:</strong> {result.data.description || "No description provided."}</p> {result.data.note && <p><em>Note: {result.data.note}</em></p>} </div> ),
          avatarSrc: '/placeholder-logo.svg', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiImageResponse]);
      } else { throw new Error(result.error || "Failed to generate image details."); }
    } catch (error) {
      console.error("Error generating image:", error);
      const errorMsgText = error instanceof Error ? error.message : "Sorry, image generation failed.";
      const errorMsg: Message = {
        id: Date.now().toString() + '-error', type: 'ai', content: errorMsgText,
        avatarSrc: '/placeholder-logo.svg', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally { setGeneratingImage(false); }
  };

  const portHandleToolClick = async (toolName: string) => {
    setShowQuickToolsMenu(false); const currentInputForTool = inputValue.trim() || "something generic";
    let llmPrompt = "";
    switch (toolName) {
      case "search_web": llmPrompt = `Act as a web search engine... for "${currentInputForTool}". ...`; break;
      case "brainstorm_ideas": llmPrompt = `Brainstorm ... related to "${currentInputForTool}". ...`; break;
      default: console.warn("Unknown tool:", toolName); return;
    }
    setInputValue(''); handleSendMessage(llmPrompt);
  };

  const startCamera = async () => { /* ... as before ... */ };
  const stopCamera = useCallback(() => { /* ... as before ... */ }, []);
  const captureFrame = useCallback(() => { /* ... as before ... */ }, []);
  const detectYouTubeUrl = (text: string): string | null => { /* ... as before ... */ };
  const getVideoTitle = async (url: string): Promise<string> => { /* ... as before ... */ };
  // Old handleGenerateVideoApp function is removed as its logic is now in startVideoProcessingActivity or useEffect

  const toggleTheme = () => setTheme(prev => (prev === "light" ? "dark" : "light"));

  const handleSendMessage = async (messageContent?: string) => { /* ... as before ... */ };
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value);
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && !e.shiftKey && !isLoading) { e.preventDefault(); handleSendMessage(); } };
  const handleMicButtonClick = () => { /* ... as before ... */ };
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => { /* ... as before ... */ };

  const uploadOptions = [ /* ... as before ... */ ];
  const quickTools = [ /* ... as before ... */ ];
  const handleQuickToolSelect = (toolId: string) => { /* ... as before ... */ };

  return (
    <TooltipProvider>
      {showVoiceModal && <VoiceInputModal onClose={() => { if (recognition.current) { recognition.current.stop(); } setShowVoiceModal(false); setAiVoiceState("idle"); setCurrentTranscription(""); }} theme={theme} isListening={aiVoiceState === "listening"} currentTranscription={currentTranscription} aiState={aiVoiceState}/>}
      {showWebcamModal && <WebcamModal videoRef={videoRef} canvasRef={canvasRef} isCameraActive={isCameraActive} onStopCamera={stopCamera} theme={theme}/>}
      {/* VideoLearningModal and its state showVideoLearning are fully removed */}

      <div className={cn("flex h-[calc(100vh-4rem)] w-full bg-background text-foreground")}>
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} animate={true} activities={activities} />

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
              <Button variant="ghost" size="icon" onClick={toggleTheme}> <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" /> <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" /> <span className="sr-only">Toggle theme</span> </Button>
              <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)}> <Settings2 className="h-5 w-5" /> <span className="sr-only">Settings</span> </Button>
            </div>
          </header>

          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4 max-w-3xl mx-auto w-full">
              {messages.map((message) => (
                <Card key={message.id} className={`w-fit max-w-[85%] ${message.type === 'user' ? 'ml-auto bg-primary text-primary-foreground' : message.type === 'ai' ? 'mr-auto bg-card' : 'mx-auto bg-transparent text-xs text-muted-foreground border-none shadow-none'}`}>
                  { message.type !== 'systemInfo' && ( <CardHeader className="flex flex-row items-start gap-3 p-3"> {message.type === 'ai' && ( <Avatar className="h-8 w-8"> <AvatarImage src={message.avatarSrc} alt={message.type} /> <AvatarFallback>{message.type === 'user' ? 'U' : 'AI'}</AvatarFallback> </Avatar> )} <div className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}> <p className="text-xs text-muted-foreground mb-0.5"> {message.type === 'user' ? 'You' : 'AI Assistant'} - {message.timestamp} </p> <div className={`p-3 rounded-lg ${message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}> {typeof message.content === 'string' ? <p className="whitespace-pre-wrap">{message.content}</p> : message.content} </div> </div> {message.type === 'user' && ( <Avatar className="h-8 w-8"> <AvatarImage src={message.avatarSrc} alt={message.type} /> <AvatarFallback>{message.type === 'user' ? 'U' : 'AI'}</AvatarFallback> </Avatar> )} </CardHeader> )}
                  { message.type === 'systemInfo' && ( <CardContent className="p-1 text-center"> <p>{message.content} - {message.timestamp}</p> </CardContent> )}
                </Card>
              ))}
              {generatingImage && ( <Card className="w-fit max-w-[85%] mr-auto bg-card"> <CardHeader className="flex flex-row items-start gap-3 p-3"> <Avatar className="h-8 w-8"><AvatarImage src="/placeholder-logo.svg" alt="AI" /><AvatarFallback>AI</AvatarFallback></Avatar> <div className="p-3 rounded-lg bg-muted flex items-center">Generating image... <Loader className="inline animate-spin ml-2 h-4 w-4" /></div> </CardHeader> </Card> )}
            </div>
          </ScrollArea>
           {showSettings && ( <aside className="absolute top-0 right-0 h-full w-80 border-l bg-background p-4 space-y-4 overflow-y-auto z-20 md:relative">
              {/* Settings Content as before. For brevity, not repeating full card structure here. */}
              <Card><CardHeader><CardTitle>AI Settings</CardTitle>{/* ... */}</CardHeader><CardContent>{/* ... */}</CardContent><CardFooter>{/* ... */}</CardFooter></Card>
              <Separator/>
              <Card><CardHeader><CardTitle>Session Info</CardTitle>{/* ... */}</CardHeader><CardContent>{/* ... */}</CardContent></Card>
            </aside>
          )}
          {(isLoading || generatingImage) && <Progress value={progress} className="w-full h-1" />}
          {/* VideoLearningCard rendering is removed */}
          {/* Input Area: Ensure the closing div for flex-1 flex-col is before the parent div's closing tag */}
          <div className="relative border-t bg-background p-4">
            {/* Input Textarea and buttons as before */}
            <Textarea ref={inputRef} value={inputValue} onChange={handleInputChange} onKeyPress={handleKeyPress} placeholder="Type your message or press '/' for commands..." className="min-h-[48px] w-full rounded-2xl resize-none p-4 pr-28 border shadow-sm bg-input" rows={1} disabled={isLoading}/>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {/* All buttons Mic, Paperclip, QuickTools, Send as before */}
              <Tooltip><TooltipTrigger asChild><Button type="button" size="icon" variant="ghost" onClick={handleMicButtonClick} disabled={isLoading || !isSpeechSupported}>{(aiVoiceState === "listening" || aiVoiceState === "processing") ? <Square className="h-5 w-5 text-red-500" /> : <Mic className="h-5 w-5" />}<span className="sr-only">{(aiVoiceState === "listening" || aiVoiceState === "processing") ? 'Stop Recording' : 'Start Recording'}</span></Button></TooltipTrigger><TooltipContent>{(aiVoiceState === "listening" || aiVoiceState === "processing") ? 'Stop Recording' : (isSpeechSupported ? 'Start Recording' : 'Voice not supported')}</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button type="button" size="icon" variant="ghost" onClick={() => setShowUploadOptionsMenu(prev => !prev)} disabled={isLoading || generatingImage}><Paperclip className="h-5 w-5" /><span className="sr-only">Attach File / Open Options</span></Button></TooltipTrigger><TooltipContent>Attach File / Options</TooltipContent></Tooltip>
              <input type="file" id="file-upload" ref={fileInputRef} className="hidden" onChange={handleFileUpload} disabled={isLoading} />
              {showUploadOptionsMenu && (<div className="absolute bottom-full left-4 mb-2 w-60 bg-background border rounded-lg shadow-lg p-2 z-10">{uploadOptions.map((option) => (<Button key={option.name} variant="ghost" className="w-full justify-start mb-1" onClick={option.action}><option.icon className="h-4 w-4 mr-2" />{option.name}</Button>))}</div>)}
              <Tooltip><TooltipTrigger asChild><Button type="button" size="icon" variant="ghost" onClick={() => setShowQuickToolsMenu(prev => !prev)} disabled={isLoading || generatingImage}><Sparkles className="h-5 w-5" /><span className="sr-only">Quick Tools</span></Button></TooltipTrigger><TooltipContent>Quick Tools</TooltipContent></Tooltip>
              {showQuickToolsMenu && (<div className="absolute bottom-full right-10 mb-2 w-72 bg-background border rounded-lg shadow-lg p-2 z-10">{quickTools.map((tool) => (<Tooltip key={tool.id}><TooltipTrigger asChild><Button variant="ghost" className="w-full justify-start mb-1" onClick={() => handleQuickToolSelect(tool.id)}><tool.icon className="h-4 w-4 mr-2" /> {tool.name}</Button></TooltipTrigger><TooltipContent side="left" align="start">{tool.description}</TooltipContent></Tooltip>))}</div>)}
              <Button type="submit" size="icon" onClick={() => handleSendMessage()} disabled={(inputValue.trim() === '' && !currentCameraFrame && !uploadedFileContent) || isLoading || generatingImage}><CornerDownLeft className="h-5 w-5" /><span className="sr-only">Send</span></Button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ChatPage;
