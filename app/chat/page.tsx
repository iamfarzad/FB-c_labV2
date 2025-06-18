"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from "next-themes";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { User, Bot, Sun, Moon, Mic, Video as VideoIcon, Paperclip, PlusIcon, Loader, MessageSquareText, Download, FileUp, Youtube } from 'lucide-react';

import { VoiceInputModal } from "@/components/voice-input-modal";
import { WebcamModal } from "@/components/webcam-modal";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, MessageCircle, Zap, Image as ImageIcon, AlertTriangle, CheckCircle, ListChecks, Video, Sparkles, Edit3, Users, Settings as SettingsIcon, LogOut, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { detectYouTubeUrl, getVideoTitle } from '@/lib/youtube';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ApiMessagePart {
  text: string;
}
interface ApiMessage {
  role: 'user' | 'assistant';
  parts: ApiMessagePart[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [currentTranscription, setCurrentTranscription] = useState("");
  const [aiVoiceState, setAiVoiceState] = useState<"listening" | "processing" | "idle" | "error">("idle");

  const [showWebcamModal, setShowWebcamModal] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [currentCameraFrame, setCurrentCameraFrame] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);

  const [showUploadOptions, setShowUploadOptions] = useState(false);

  const [summaryData, setSummaryData] = useState<any>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  interface ActivityItem {
    id: string;
    type: 'video_processing' | 'image_generation' | 'chat_summary' | 'ai_thinking' | 'error' | 'user_action' | 'system_message' | 'event' | 'image' | 'analyzing_video' | 'analyzing' | 'generating' | 'processing' | 'complete' | 'video_complete'; // Added video_complete
    title: string;
    description?: string;
    timestamp: number; // Changed from Date to number for consistency with Date.now()
    user?: string;
    progress?: number;
    isLiveProcessing?: boolean;
    isPerMessageLog?: boolean;
    sourceMessageId?: string;
    link?: string;
    icon?: React.ElementType;
    status?: 'pending' | 'in_progress' | 'completed' | 'failed';
    details?: string;
  }
  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: 's1', type: 'system_message', timestamp: Date.now() - 3600000 * 3, user: 'AI Assistant', title: 'Chat Started', description: 'Initial conversation with AI Assistant began. Responded to "Project Setup Query".', status: 'complete'},
    { id: 's2', type: 'event', timestamp: Date.now() - 3600000 * 2, user: 'System', title: 'User Logged In', description: 'User successfully authenticated to the platform.', status: 'complete'},
    { id: 'prev_1', type: 'video_processing', title: 'Analyzing "Old Video Example"', description: 'Extracting key concepts.', timestamp: Date.now() - 1000000, progress: 30, status: 'in_progress', user: 'System' },
  ]);

  const addActivity = useCallback((newActivity: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    setActivities(prevActivities => [
      { ...newActivity, id: Date.now().toString() + Math.random(), timestamp: Date.now() } as ActivityItem, // Cast to ensure all props match
      ...prevActivities
    ]);
  }, []);

  const SpeechRecognition = typeof window !== "undefined" ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null;
  const isSpeechSupported = !!SpeechRecognition;
  const recognition = useRef<any>(null);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if (!isSpeechSupported || typeof window === "undefined") return;
    recognition.current = new SpeechRecognition();
    recognition.current.continuous = false; recognition.current.interimResults = true; recognition.current.lang = "en-US";
    recognition.current.onstart = () => { setAiVoiceState("listening"); setCurrentTranscription(""); };
    recognition.current.onresult = (event: any) => {
      let interim = "", final = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript; else interim += event.results[i][0].transcript;
      }
      setCurrentTranscription(interim || final); if (final) setInputValue(final);
    };
    recognition.current.onend = () => {
      setAiVoiceState("processing");
      if (currentTranscription.trim()) handleSendMessage(currentTranscription.trim());
      else { setShowVoiceModal(false); setAiVoiceState("idle"); }
    };
    recognition.current.onerror = (event: any) => {
      console.error("Speech error:", event.error); setAiVoiceState("error");
      setTimeout(() => { setShowVoiceModal(false); setAiVoiceState("idle"); }, 2000);
    };
    return () => { if (recognition.current) recognition.current.stop(); };
  }, [isSpeechSupported, SpeechRecognition, handleSendMessage]);

  const handleDownloadTranscript = () => {
    const transcript = messages.map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'} (${msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}): ${msg.content}`).join("\n\n");
    const blob = new Blob([transcript], { type: "text/plain" }); const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = "chat-transcript.txt";
    document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const handleSummarizeChat = async () => {
    const activityId = `summ-${Date.now()}`;
    addActivity({ type: "chat_summary", title: "Summarizing Conversation", description: "Processing chat history...", progress: 30, status: 'in_progress', isPerMessageLog: false });
    setIsSummaryLoading(true); setSummaryError(null); setSummaryData(null);
    try {
      const apiMessages = messages.map(m => ({ role: m.role, content: m.content }));
      if (apiMessages.length === 0) {
        setActivities(prev => prev.map(act => act.id === activityId ? { ...act, type: "system_message", progress: 100, description: "No messages to summarize.", title: "Summarization Skipped", status: 'complete' } : act));
        setIsSummaryLoading(false); return;
      }
      const response = await fetch("/api/gemini-proxy?action=summarizeChat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: apiMessages }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || `API Error: ${response.status}`);
      if (result.summary) {
        setActivities(prev => prev.map(act => act.id === activityId ? { ...act, type: "complete", progress: 100, description: result.summary.substring(0, 200) + (result.summary.length > 200 ? "..." : ""), title: "Chat Summary Ready", status: 'complete', details: result.summary } : act));
      } else throw new Error("Summary not found in API response.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setActivities(prev => prev.map(act => act.id === activityId ? { ...act, type: "error", progress: undefined, description: errorMessage, title: "Summarization Failed", status: 'failed' } : act));
    } finally { setIsSummaryLoading(false); }
  };

  const portGenerateImageDescription = async (prompt: string) => {
    setShowToolsMenu(false); setGeneratingImage(true);
    await handleSendMessage(`Describe an image based on the following prompt: "${prompt}". Provide a detailed visual description...`);
    setGeneratingImage(false);
  };

  const portHandleToolClick = async (toolName: string) => {
    setShowToolsMenu(false); const currentPrompt = inputValue.trim() || "something generic"; let llmPrompt = "";
    switch (toolName) {
      case "search_web": llmPrompt = `Act as a web search engine... for "${currentPrompt}".`; break;
      case "run_deep_research": llmPrompt = `Perform a deep research on "${currentPrompt}".`; break;
      case "think_longer": llmPrompt = `Elaborate on the topic "${currentPrompt}"...`; break;
      case "brainstorm_ideas": llmPrompt = `Brainstorm 5-7 creative ideas related to "${currentPrompt}".`; break;
      default: return;
    }
    await handleSendMessage(llmPrompt);
  };

  const handleYouTubeVideoOptionClick = () => {
    const systemMessage: Message = { id: `sys-${Date.now()}`, role: 'assistant', content: "Please paste a YouTube URL in the chat input to process a video.", timestamp: new Date() };
    setMessages(prevMessages => [...prevMessages, systemMessage]);
    setShowUploadOptions(false);
  };

  const uploadMenuItems = [
    { id: "image_upload", label: "Upload Image", icon: FileUp, action: () => { fileInputRef.current?.click(); setShowUploadOptions(false); } },
    { id: "youtube_video", label: "YouTube Video", icon: Youtube, action: handleYouTubeVideoOptionClick }
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUploadedImageBase64(base64String.split(",")[1]);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: `[Image selected: ${file.name}] Ready to send.`, timestamp: new Date() }]);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `Selected file "${file.name}" is not an image. Please select an image file.`, timestamp: new Date() }]);
    }
    if (event.target) event.target.value = "";
  };

  const startVideoLearningAppProcessing = async (detectedUrl: string, videoTitle: string) => {
    const activityId = `vid-${Date.now()}`;

    const initialActivity: ActivityItem = {
      id: activityId,
      type: "analyzing_video",
      title: `Processing Video: ${videoTitle || 'Untitled Video'}`,
      description: "Initializing video analysis...",
      progress: 0,
      timestamp: Date.now(), // Corrected to use Date.now()
      isPerMessageLog: false,
      status: 'in_progress',
    };
    // Use the callback form of setActivities to ensure it gets the latest state if called rapidly
    setActivities(prevActivities => [initialActivity, ...prevActivities]);

    // Simulate Progress
    let currentProgress = 0;
    const steps = [
      { progress: 25, description: "Analyzing video content...", type: "analyzing_video" },
      { progress: 50, description: "Extracting key concepts...", type: "video_processing" },
      { progress: 75, description: "Generating learning modules...", type: "video_processing" },
    ];

    const progressInterval = setInterval(() => {
      if (currentProgress < 100 && steps.length > 0) {
        const nextStep = steps.shift();
        if (nextStep) {
          currentProgress = nextStep.progress;
          setActivities(prevActivities =>
            prevActivities.map(act =>
              act.id === activityId
                ? {
                    ...act,
                    progress: currentProgress,
                    type: nextStep.type as ActivityItem['type'],
                    description: nextStep.description,
                  }
                : act
            )
          );
        }
      } else {
        clearInterval(progressInterval);
        currentProgress = 100;

        setActivities(prevActivities =>
          prevActivities.map(act =>
            act.id === activityId
              ? {
                  ...act,
                  type: "video_complete",
                  progress: 100,
                  title: `Learning App Ready: ${videoTitle || 'Untitled Video'}`,
                  description: "Your learning app is ready to view.",
                  link: `/video-learning-tool?videoUrl=${encodeURIComponent(detectedUrl)}`,
                  status: 'completed',
                }
              : act
          )
        );

        const linkCardMessage: Message = {
          id: `linkcard-${Date.now()}`,
          role: 'assistant',
          content: `Your learning app for "${videoTitle || 'Untitled Video'}" is ready! [Click here to open](/video-learning-tool?videoUrl=${encodeURIComponent(detectedUrl)})`,
          timestamp: new Date(),
        };
        setMessages(prevMessages => [...prevMessages, linkCardMessage]);
      }
    }, 1000);
  };

  const captureFrame = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current; const canvas = canvasRef.current; const context = canvas.getContext("2d");
      if (!context || video.videoWidth === 0 || video.videoHeight === 0) return;
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      setCurrentCameraFrame(canvas.toDataURL("image/jpeg", 0.8).split(",")[1]);
    }
  }, []);

  const startCamera = useCallback(async () => {
    setShowWebcamModal(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream; await videoRef.current.play(); setIsCameraActive(true);
        if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = setInterval(captureFrame, 2000);
      }
    } catch (error) { console.error("Error accessing webcam:", error); setIsCameraActive(false); setShowWebcamModal(false); }
  }, [captureFrame]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false); setCurrentCameraFrame(null);
    if (captureIntervalRef.current) { clearInterval(captureIntervalRef.current); captureIntervalRef.current = null; }
    setShowWebcamModal(false);
  }, []);

  const handleMicButtonClick = useCallback(() => {
    if (!isSpeechSupported) { console.warn("Speech recognition not supported."); return; }
    if (aiVoiceState === "listening" || aiVoiceState === "processing") {
      if (recognition.current) recognition.current.stop();
      setShowVoiceModal(false);
    } else {
      setCurrentTranscription(""); setShowVoiceModal(true);
      try { recognition.current?.start(); } catch (e) { console.error(e); setAiVoiceState("error");}
    }
  }, [isSpeechSupported, aiVoiceState, recognition]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = textToSend || inputValue.trim();
    if (messageContent === '' && !currentCameraFrame && !uploadedImageBase64) {
      if (showVoiceModal && aiVoiceState !== "listening") { setShowVoiceModal(false); setAiVoiceState("idle"); }
      return;
    }

    let userMessageContent = messageContent;
    if (uploadedImageBase64 && !userMessageContent) userMessageContent = "[Uploaded Image]";
    else if (currentCameraFrame && !userMessageContent) userMessageContent = "[Webcam Image]";
    else if (uploadedImageBase64 && userMessageContent) userMessageContent = `${userMessageContent} [Image Attached]`;

    const userMessage: Message = { id: `user-${Date.now()}`, role: 'user', content: userMessageContent, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);

    const imageToSendForThisMessage = uploadedImageBase64;
    const frameToSendForThisMessage = currentCameraFrame;

    const detectedUrlInMessage = detectYouTubeUrl(userMessage.content);
    if (detectedUrlInMessage && !imageToSendForThisMessage && !frameToSendForThisMessage) {
      (async () => {
        try {
          const title = await getVideoTitle(detectedUrlInMessage);
          await startVideoLearningAppProcessing(detectedUrlInMessage, title);
        } catch (error) {
          console.error("Error processing YouTube URL in background:", error);
        }
      })();
    }

    const currentInputForApi = messageContent;
    setInputValue(''); setCurrentTranscription(''); setIsLoading(true);
    if (showVoiceModal && aiVoiceState !== "listening") { setShowVoiceModal(false); setAiVoiceState("idle"); }

    const assistantMessageId = `asst-${Date.now()}`;
    try {
      const apiRequestBody: any = { messages: [{ role: 'user', parts: [{ text: currentInputForApi || (frameToSendForThisMessage ? "[Webcam Image]" : "") || (imageToSendForThisMessage ? "[Uploaded Image]" : "")}] }] };
      if (imageToSendForThisMessage) apiRequestBody.imageData = imageToSendForThisMessage;
      if (frameToSendForThisMessage) apiRequestBody.cameraFrame = frameToSendForThisMessage;

      setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: "...", timestamp: new Date() }]);
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(apiRequestBody) });

      if (imageToSendForThisMessage) setUploadedImageBase64(null);
      if (frameToSendForThisMessage) setCurrentCameraFrame(null);

      if (!response.ok) { const errData = await response.json().catch(() => ({})); throw new Error(errData.error || `API Error: ${response.status}`); }
      if (!response.body) throw new Error('Response body is null');

      const reader = response.body.getReader(); const decoder = new TextDecoder();
      let assistantResponseContent = ''; let firstChunkProcessed = false;
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonData = line.substring('data: '.length); if (jsonData.trim() === '[DONE]') break;
            try {
              const parsedData = JSON.parse(jsonData);
              if (parsedData.content) {
                assistantResponseContent += parsedData.content;
                setMessages(prev => prev.map(msg => msg.id === assistantMessageId ? { ...msg, content: assistantResponseContent, timestamp: new Date() } : msg));
                firstChunkProcessed = true;
              }
            } catch (e) { console.error('Error parsing stream data chunk:', e, 'Chunk:', jsonData); }
          }
        }
      }
      if (!firstChunkProcessed && assistantResponseContent.trim() === '') {
        setMessages(prev => prev.map(msg => msg.id === assistantMessageId ? { ...msg, content: "Assistant responded with empty content.", timestamp: new Date() } : msg));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      setMessages(prev => prev.map(msg => msg.id === assistantMessageId && msg.content === "..." ? { ...msg, content: `Error: ${errorMsg}`, timestamp: new Date() } : msg));
      setMessages(prev => {
        if (!prev.some(m => m.id === assistantMessageId && m.content.startsWith("Error:"))) {
          return [...prev, { id: assistantMessageId, role: 'assistant', content: `Error: ${errorMsg}`, timestamp: new Date() }];
        } return prev;
      });
    } finally { setIsLoading(false); }
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getActivityIcon = (type: ActivityItem['type']): React.ElementType => {
    switch (type) {
      case 'video_processing': case 'analyzing_video': return Video;
      case 'image_generation': case 'image': return ImageIcon;
      case 'chat_summary': return ListChecks;
      case 'ai_thinking': return Sparkles;
      case 'error': return AlertTriangle;
      case 'user_action': return Edit3;
      case 'system_message': return MessageCircle;
      case 'event': return Zap;
      case 'complete': case 'video_complete': return CheckCircle; // Added video_complete
      default: return Zap;
    }
  };
  const getActivityColor = (type: ActivityItem['type']): string => {
    switch (type) {
      case 'video_processing': case 'analyzing_video': return 'text-blue-500';
      case 'image_generation': case 'image': return 'text-purple-500';
      case 'chat_summary': return 'text-green-500';
      case 'ai_thinking': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      case 'complete': case 'video_complete': return 'text-green-600'; // Added video_complete
      default: return 'text-gray-500';
    }
  };

  const SidebarContent: React.FC<{ activities: ActivityItem[], currentPath: string, className?: string, open?: boolean; onSummarizeChat?: () => void; }> = ({ activities, currentPath, className, open, onSummarizeChat }) => {
    const navLinks = [ { href: "/threads", label: "Threads", icon: ListChecks }, { href: "/shared-with-me", label: "Shared With Me", icon: Users }, { href: "/settings", label: "Settings", icon: SettingsIcon }, ];
    return (
      <div className={cn("flex flex-col h-full bg-card text-card-foreground border-r", className)}>
        <div className="p-4 border-b"><Link href="/" className="flex items-center space-x-2"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center"><Bot size={20} className="text-primary-foreground" /></div><h2 className="text-lg font-semibold">AI Platform</h2></Link></div>
        <nav className="flex-grow px-4 py-2 space-y-1">{navLinks.map((link) => (<Link key={link.label} href={link.href} className={cn("flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors", currentPath === link.href ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted hover:text-foreground")}><link.icon size={18} /><span>{link.label}</span></Link>))}</nav>
        {onSummarizeChat && open && (<div className="mt-2 mb-2 px-4"><Button variant="outline" size="sm" className="w-full" onClick={onSummarizeChat} disabled={isSummaryLoading}>{isSummaryLoading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <MessageSquareText className="w-4 h-4 mr-2" />}Summarize Chat</Button></div>)}
        <div className="px-4 mt-auto mb-4"><Button variant="outline" className="w-full justify-start space-x-3"><LogOut size={18} /><span>Log Out</span></Button></div>
        <div className="flex-shrink-0 border-t p-4"><h3 className="text-sm font-semibold mb-3 text-muted-foreground px-2">Threads</h3><ScrollArea className="h-[250px]">{activities.length === 0 && (<p className="text-xs text-muted-foreground p-2">No recent activity.</p>)}{activities.map((activity) => (<div key={activity.id} className="text-xs mb-1">{activity.isPerMessageLog ? (activity.isLiveProcessing ? (<div className="p-2 border border-border rounded-md bg-muted/30 hover:bg-muted/60 transition-colors"><div className="flex items-center justify-between mb-1"><span className="font-medium text-foreground truncate flex items-center"><Sparkles size={14} className={`mr-1.5 ${getActivityColor(activity.type)} animate-pulse`} /> {activity.title || activity.details || "Processing..."}</span></div>{activity.description && <p className="text-muted-foreground truncate">{activity.description}</p>}</div>) : (<div className="flex items-center p-1.5 rounded-md hover:bg-muted/60 transition-colors cursor-pointer"><Sparkles size={14} className={`mr-1.5 ${getActivityColor(activity.type)} flex-shrink-0`} /><span className="text-muted-foreground truncate">{activity.title || activity.details || "Processed"}</span></div>)) : (<div className="flex items-start mb-2 p-2 rounded-md hover:bg-muted transition-colors">{React.createElement(activity.icon || getActivityIcon(activity.type), { size: 18, className: `mr-2.5 mt-0.5 flex-shrink-0 ${getActivityColor(activity.type)}` })}<div className="flex-grow truncate"><div className="font-medium text-foreground truncate">{activity.title || activity.details}</div>{activity.description && <p className="text-muted-foreground truncate">{activity.description}</p>}{typeof activity.progress === 'number' && activity.progress < 100 && (<Progress value={activity.progress} className="h-1.5 mt-1" />)}{activity.link && activity.status === 'completed' && (<Link href={activity.link} target="_blank" className="text-primary hover:underline text-xs flex items-center mt-0.5">View Details <ExternalLink size={12} className="ml-1" /></Link>)}<p className="text-muted-foreground/80 text-xs mt-0.5">{activity.user || 'System'} - {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div></div>)}</div>))}</ScrollArea></div>
      </div>);
  };

  const DesktopSidebar: React.FC<{ activities: ActivityItem[], currentPath: string, className?: string, onSummarizeChat?: () => void; open: boolean; setOpen: (open: boolean) => void; }> = ({ activities, currentPath, className, onSummarizeChat, open, setOpen }) => {
    const [isHovered, setIsHovered] = useState(false); const effectiveOpen = open || isHovered;
    return (<motion.div animate={{ width: effectiveOpen ? "288px" : "68px" }} className={cn("h-full relative z-30 hidden md:flex flex-col", className)} onMouseEnter={() => { if (!open) setIsHovered(true); }} onMouseLeave={() => { if (!open) setIsHovered(false); }} transition={{ type: "spring", stiffness: 200, damping: 25 }}><SidebarContent activities={activities} currentPath={currentPath} onSummarizeChat={onSummarizeChat} open={effectiveOpen} /><Button variant="ghost" size="icon" className={cn("absolute top-1/2 -right-4 transform -translate-y-1/2 bg-card border rounded-full h-8 w-8 z-40 shadow-md hover:bg-muted", "transition-opacity duration-300", effectiveOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100" )} onClick={() => setOpen(!open)}>{open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</Button></motion.div>);
  };

  const MobileSidebarSheet: React.FC<{ open: boolean, onOpenChange: (open: boolean) => void, activities: ActivityItem[], currentPath: string, onSummarizeChat?: () => void; }> = ({ open, onOpenChange, activities, currentPath, onSummarizeChat }) => {
    if (!open) return null;
    return (<div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => onOpenChange(false)}><div className="fixed inset-y-0 left-0 w-72 bg-card shadow-xl z-50" onClick={e => e.stopPropagation()}><SidebarContent activities={activities} currentPath={currentPath} className="border-r" onSummarizeChat={onSummarizeChat} open={open} /></div></div>);
  };

  return (
    <div className="flex h-screen bg-background">
      <DesktopSidebar activities={activities} currentPath={usePathname()} onSummarizeChat={handleSummarizeChat} open={sidebarOpen} setOpen={setSidebarOpen} />
      <MobileSidebarSheet open={isMobile && sidebarOpen} onOpenChange={setSidebarOpen} activities={activities} currentPath={usePathname()} onSummarizeChat={handleSummarizeChat} />
      <div className="flex-1 flex flex-col h-full p-0 md:p-4 justify-center items-center overflow-hidden">
        <Card className="w-full h-full flex flex-col shadow-lg rounded-none md:rounded-lg">
          <CardHeader className="border-b flex flex-row justify-between items-center">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}</Button>
              <h1 className="text-xl font-semibold text-foreground">AI Chat Assistant</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme"><Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" /><Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" /><span className="sr-only">Toggle theme</span></Button>
              <Button variant="outline" size="sm" onClick={handleDownloadTranscript}><Download className="w-4 h-4 mr-2" />Export Summary</Button>
            </div>
          </CardHeader>
          <CardContent className="flex-grow p-0">
            <ScrollArea className="h-[calc(100vh-14rem)] p-6">{messages.map((msg) => (<div key={msg.id} className={`mb-4 flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>{msg.role === 'assistant' && (<Avatar className="w-8 h-8 border"><AvatarFallback><Bot size={18} /></AvatarFallback></Avatar>)}<div className={`p-3 rounded-lg max-w-[70%] shadow-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground self-end' : 'bg-muted text-muted-foreground'}`}><p className="text-sm whitespace-pre-wrap">{msg.content}</p><p className="text-xs text-opacity-70 mt-1">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div>{msg.role === 'user' && (<Avatar className="w-8 h-8 border"><AvatarFallback><User size={18} /></AvatarFallback></Avatar>)}</div>))}{<div ref={messagesEndRef} />}</ScrollArea>
          </CardContent>
          <CardFooter className="p-4 border-t relative">
            <div className="flex w-full items-center space-x-2">
              <Button variant="outline" size="icon" onClick={handleMicButtonClick} disabled={!isSpeechSupported || isLoading || isCameraActive} aria-label={aiVoiceState === "listening" ? "Stop listening" : "Start listening"} className="shrink-0"><Mic className={`h-5 w-5 ${aiVoiceState === "listening" || aiVoiceState === "processing" ? "text-destructive animate-pulse" : ""}`} /></Button>
              <Button variant="outline" size="icon" onClick={isCameraActive ? stopCamera : startCamera} disabled={isLoading || aiVoiceState === "listening"} aria-label={isCameraActive ? "Stop camera" : "Start camera"} className={`shrink-0 ${isCameraActive ? "text-destructive animate-pulse" : ""}`}><VideoIcon className="h-5 w-5" /></Button>
              <Button variant="outline" size="icon" className="shrink-0" onClick={() => setShowToolsMenu(!showToolsMenu)} aria-label="Toggle tools menu" disabled={isLoading}><PlusIcon className={`h-5 w-5 transition-transform duration-200 ${showToolsMenu ? "rotate-45" : ""}`} /></Button>
              <Button variant="outline" size="icon" className="shrink-0"
                onClick={() => setShowUploadOptions(prev => !prev)}
                disabled={isLoading || isCameraActive || aiVoiceState === "listening"}
                aria-label="Attach file or media"
              ><Paperclip className={`h-5 w-5 ${uploadedImageBase64 ? "text-green-500" : ""}`} /></Button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              <Input type="text" placeholder={aiVoiceState === "listening" ? "Listening..." : isCameraActive ? "Webcam active. Add a message or send frame." : "Type your message or use the mic..."} value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()} className="flex-grow" disabled={isLoading || aiVoiceState === "listening" || aiVoiceState === "processing"}/>
              <Button onClick={() => handleSendMessage()} disabled={isLoading || inputValue.trim() === ''}>{isLoading ? 'Sending...' : 'Send'}</Button>
            </div>
          </CardFooter>
        </Card>
        {showVoiceModal && (<VoiceInputModal isListening={aiVoiceState === "listening"} currentTranscription={currentTranscription} aiState={aiVoiceState} onClose={() => { if (recognition.current) { recognition.current.stop(); } setShowVoiceModal(false); setAiVoiceState("idle"); }} theme={resolvedTheme === "dark" ? "dark" : "light"}/>)}
        {showWebcamModal && (<WebcamModal videoRef={videoRef} canvasRef={canvasRef} isCameraActive={isCameraActive} onStopCamera={stopCamera} theme={resolvedTheme === "dark" ? "dark" : "light"}/>)}
        {showToolsMenu && (<div className="absolute bottom-20 left-4 mb-2 w-72 bg-background border rounded-lg shadow-xl p-4 z-20"><h3 className="text-sm font-semibold mb-2">Quick Tools</h3><Button variant="ghost" className="w-full justify-start mb-1" onClick={() => portGenerateImageDescription(inputValue || "a beautiful sunset")}>Describe Image</Button><Button variant="ghost" className="w-full justify-start mb-1" onClick={() => portHandleToolClick("search_web")}>Knowledge Search</Button><Button variant="ghost" className="w-full justify-start mb-1" onClick={() => portHandleToolClick("run_deep_research")}>Deep Analysis</Button><Button variant="ghost" className="w-full justify-start mb-1" onClick={() => portHandleToolClick("think_longer")}>Extended Thinking</Button><Button variant="ghost" className="w-full justify-start" onClick={() => portHandleToolClick("brainstorm_ideas")}>Brainstorm Ideas</Button>{generatingImage && (<div className="mt-2 flex items-center text-sm text-muted-foreground"><Loader className="mr-2 h-4 w-4 animate-spin" />Processing tool action...</div>)}</div>)}
        {showUploadOptions && (
          <div
              className="absolute bottom-full left-[100px] mb-1 w-56 bg-card border rounded-lg shadow-xl p-2 z-30"
              style={{ transform: 'translateX(-50%)', left: 'calc(3 * (2.5rem + 0.5rem) + 1.25rem)' }}
          >
            {uploadMenuItems.map(item => (
              <Button
                key={item.id}
                variant="ghost"
                className="w-full justify-start mb-1"
                onClick={item.action}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
[end of app/chat/page.tsx]
