"use client"

import React, { useState, useEffect, useRef, useCallback, useTransition } from 'react';
import { useTheme } from "next-themes";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  User, Bot, Sun, Moon, Mic, Video as VideoIcon, Paperclip, Plus as PlusIcon, Loader,
  MessageSquare as MessageSquareIcon, Download, FileUp, Youtube, Send, Search, Brain,
  Lightbulb, ArrowLeft, MessageSquare, PanelRightClose, PanelRightOpen, Video, Copy,
  Image as ImageIcon, X, ListChecks, Sparkles, AlertTriangle, Edit3, MessageCircle, Zap,
  CheckCircle, Users, Settings as SettingsIcon, LogOut, ChevronLeft, ChevronRight, ExternalLink,
  MessageSquareText, Menu, MoreHorizontal, ArrowDown, MicOff, Camera, Upload, FileText, Code,
  Globe, Share, Monitor, Eye, ThumbsUp, ThumbsDown, Activity, Loader2, Clock, Phone, Mail,
  Calendar, ScreenShare, StopCircle
} from 'lucide-react';
import { VoiceInputModal } from "@/components/voice-input-modal";
import { WebcamModal } from "@/components/webcam-modal";
import { VideoLearningModal } from "@/components/video-learning-modal";
import { VideoLearningCard } from "@/components/video-learning-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { detectYouTubeUrl, getVideoTitle } from '@/lib/youtube';
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  dataItems?: any[];
  audioData?: string;
  sources?: any[];
}

interface CompanyInfo {
  name?: string;
  domain?: string;
  analysis?: string;
}

interface ConversationState {
  sessionId: string;
  name?: string;
  email?: string;
  companyInfo?: CompanyInfo;
  stage: string;
  messages: Message[];
  messagesInStage: number;
  aiGuidance?: string;
  sidebarActivity?: string;
  isLimitReached?: boolean;
  showBooking?: boolean;
  capabilitiesShown: string[];
}

interface ActivityItem {
  id: string;
  type: 'video_processing' | 'image_generation' | 'chat_summary' | 'ai_thinking' | 'error' | 'user_action' | 'system_message' | 'event' | 'image' | 'analyzing_video' | 'analyzing' | 'generating' | 'processing' | 'complete' | 'video_complete';
  title: string;
  description?: string;
  timestamp: number;
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

interface UploadOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  action: () => void;
}

export default function ChatPage() {
  const { theme: themeValue, setTheme } = useTheme();
  const theme = themeValue === 'dark' ? 'dark' as const : 'light' as const;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>(() => ({
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    stage: 'greeting',
    messages: [],
    messagesInStage: 0,
    capabilitiesShown: []
  }));

  // Voice state managed in the Audio and Voice State section below

  const [showWebcamModal, setShowWebcamModal] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [currentCameraFrame, setCurrentCameraFrame] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const anyFileInputRef = useRef<HTMLInputElement>(null);

  // UI State
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Mobile state with proper SSR check
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  // Summary State
  const [summaryData, setSummaryData] = useState<any>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Speech Recognition State
  const isSpeakingRef = useRef(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // UI state only

  // Video Learning State
  const [videoLearningUrl, setVideoLearningUrl] = useState<string>('');
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [showVideoLearningModal, setShowVideoLearningModal] = useState(false);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [videoProcessingProgress, setVideoProcessingProgress] = useState(0);
  const [videoProcessingMessage, setVideoProcessingMessage] = useState('');
  const [detectedVideoUrl, setDetectedVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideoApp, setIsGeneratingVideoApp] = useState(false);
  
  // Camera analysis timing
  const lastCameraAnalysisRef = useRef<number>(0);

  // Audio and Voice State
  const [aiVoiceState, setAiVoiceState] = useState<'idle' | 'listening' | 'processing' | 'error'>('idle');
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [currentTranscription, setCurrentTranscription] = useState('');

  // Message State - using the declarations from the component start
  // messagesEndRef is already declared at the component start

  // ActivityItem interface defined once
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addActivity = useCallback((newActivity: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    setActivities(prevActivities => [
      { ...newActivity, id: Date.now().toString() + Math.random(), timestamp: Date.now() } as ActivityItem, // Cast to ensure all props match
      ...prevActivities
    ]);
  }, []);

  const SpeechRecognition = typeof window !== "undefined" ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null;
  const isSpeechSupported = !!SpeechRecognition;
  const recognition = useRef<any>(null);

  const [isPending, startTransition] = useTransition();
  const [attachments, setAttachments] = useState<string[]>([]);

  const handleSendMessage = async (messageContent?: string) => {
    const contentToSend = messageContent ?? input;
    if (!contentToSend.trim() && attachments.length === 0) return;

    // Check for YouTube URL
    const youtubeUrl = detectYouTubeUrl(contentToSend);
    if (youtubeUrl) {
      setDetectedVideoUrl(youtubeUrl);
      const title = await getVideoTitle(youtubeUrl);
      setVideoTitle(title);
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      content: contentToSend,
      role: 'user',
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);

    setInput('');
    setAttachments([]);
    setIsLoading(true);

    try {
      // Map frontend message format to backend Content format
      const apiMessages = updatedMessages.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: apiMessages,
          includeAudio: true // Request audio response
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.reply,
        role: 'assistant',
        timestamp: new Date(),
        audioData: data.audioData, // Add audio data from response
      };
      setMessages((prev) => [...prev, aiResponse]);

      // Play audio if available
      if (data.audioData) {
        try {
          const audio = new Audio(`data:audio/mpeg;base64,${data.audioData}`);
          audio.play();
          
          addActivity({
            type: 'ai_thinking',
            title: '🔊 Voice Response Generated',
            description: 'AI response includes synthesized voice',
            status: 'completed'
          });
        } catch (error) {
          console.error('Audio playback failed:', error);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I couldn't get a response. Please try again.",
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };

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
      setCurrentTranscription(interim || final); if (final) setInput(final);
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
    setSummaryLoading(true); setSummaryError(null); setSummaryData(null);
    try {
      const apiMessages = messages.map(m => ({ role: m.role, content: m.content }));
      if (apiMessages.length === 0) {
        setActivities(prev => prev.map(act => act.id === activityId ? { ...act, type: "system_message", progress: 100, description: "No messages to summarize.", title: "Summarization Skipped", status: 'completed' } : act));
        setSummaryLoading(false); return;
      }
      const response = await fetch("/api/gemini-proxy?action=summarizeChat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: apiMessages }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || `API Error: ${response.status}`);
      if (result.summary) {
        setActivities(prev => prev.map(act => act.id === activityId ? { ...act, type: "chat_summary", progress: 100, description: result.summary.substring(0, 200) + (result.summary.length > 200 ? "..." : ""), title: "Chat Summary Ready", status: 'completed', details: result.summary } : act));
      } else throw new Error("Summary not found in API response.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setActivities(prev => prev.map(act => act.id === activityId ? { ...act, type: "error", progress: undefined, description: errorMessage, title: "Summarization Failed", status: 'failed' } : act));
    } finally { setSummaryLoading(false); }
  };

  const portGenerateImageDescription = async (prompt: string) => {
    setShowToolsMenu(false); setGeneratingImage(true);
    await handleSendMessage(`Describe an image based on the following prompt: "${prompt}". Provide a detailed visual description...`);
    setGeneratingImage(false);
  };

  const portHandleToolClick = async (toolName: string) => {
    setShowToolsMenu(false); const currentPrompt = input.trim() || "something generic"; let llmPrompt = "";
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

  const handleURLAnalysis = async () => {
    const url = prompt("Enter a website URL to analyze for AI opportunities:", "https://");
    if (!url || !url.startsWith('http')) {
      return;
    }
    
    setShowUploadOptions(false);
    
    // Add processing activity
    addActivity({
      type: 'analyzing',
      title: `🌐 Analyzing Website: ${url}`,
      description: 'Extracting business intelligence and AI opportunities...',
      status: 'in_progress'
    });

    try {
      const response = await fetch('/api/gemini?action=analyzeURL', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urlContext: url,
          analysisType: 'business_analysis',
          prompt: `Analyze this website for AI implementation opportunities and business insights.`
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Update activity
        setActivities(prev => prev.map(act => 
          act.title.includes(url) ? 
          { ...act, status: 'completed' as const, description: 'Website analysis complete' } : act
        ));
        
        // Add analysis result
        const analysisMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `🌐 **Website Analysis Complete: ${url}**\n\n${result.data.text}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, analysisMessage]);
      } else {
        throw new Error(result.error || 'URL analysis failed');
      }
    } catch (error) {
      console.error('URL analysis error:', error);
      setActivities(prev => prev.map(act => 
        act.title.includes(url) ? 
        { ...act, status: 'failed' as const, description: 'Website analysis failed' } : act
      ));
    }
  };

  const handleImageGeneration = async () => {
    const prompt = window.prompt("Describe the business image you want to generate:", "A professional business meeting with AI technology");
    if (!prompt) return;
    
    setShowUploadOptions(false);
    
    addActivity({
      type: 'image_generation',
      title: '🎨 Generating Image Description',
      description: `Creating visual description for: ${prompt}`,
      status: 'in_progress'
    });

    try {
      const response = await fetch('/api/gemini?action=generateImage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          businessContext: 'Professional business visualization'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setActivities(prev => prev.map(act => 
          act.title.includes('Generating Image') ? 
          { ...act, status: 'completed' as const, description: 'Image description generated' } : act
        ));
        
        const imageMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `🎨 **Image Description Generated**\n\n${result.data.text}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, imageMessage]);
      } else {
        throw new Error(result.error || 'Image generation failed');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      setActivities(prev => prev.map(act => 
        act.title.includes('Generating Image') ? 
        { ...act, status: 'failed' as const, description: 'Image generation failed' } : act
      ));
    }
  };

  const uploadMenuItems: Array<{id: string, label: string, icon: React.ElementType, action: () => void}> = [
    { id: "image_upload", label: "Upload Image", icon: ImageIcon, action: () => { fileInputRef.current?.click(); setShowUploadOptions(false); } },
    { id: "file_upload", label: "Upload File/Document", icon: FileText, action: () => { anyFileInputRef.current?.click(); setShowUploadOptions(false); } },
    { id: "youtube_video", label: "YouTube Video", icon: Youtube, action: handleYouTubeVideoOptionClick },
    { id: "url_analysis", label: "Analyze Website", icon: Globe, action: handleURLAnalysis },
    { id: "image_generation", label: "Generate Image Description", icon: ImageIcon, action: handleImageGeneration }
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



  const handleAnyFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileSize = (file.size / 1024 / 1024).toFixed(2); // Size in MB
      const fileType = file.type || 'unknown';
      
      // Check if it's a document that can be analyzed
      const isAnalyzableDocument = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/rtf',
        'application/vnd.oasis.opendocument.text'
      ].includes(file.type);

      if (isAnalyzableDocument) {
        // Use document analysis for supported formats
        const reader = new FileReader();
        reader.onloadend = async () => {
          const arrayBuffer = reader.result as ArrayBuffer;
          const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          
          // Add processing activity
          addActivity({
            type: 'analyzing',
            title: `Analyzing Document: ${file.name}`,
            description: `Processing ${fileSize}MB document for business insights...`,
            status: 'in_progress'
          });
          
          try {
            // Call document analysis API
            const response = await fetch('/api/gemini?action=analyzeDocument', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                documentData: base64String,
                mimeType: file.type,
                prompt: `Analyze this business document and provide insights, opportunities, and recommendations.`
              })
            });

            const result = await response.json();
            
            if (result.success) {
              // Update activity to completed
              setActivities(prev => prev.map(act => 
                act.title.includes(file.name) ? 
                { ...act, status: 'completed' as const, description: 'Document analysis complete' } : act
              ));
              
              // Add AI response with analysis
              const analysisMessage: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: `📄 **Document Analysis Complete: ${file.name}**\n\n${result.data.text}`,
                timestamp: new Date(),
              };
              setMessages(prev => [...prev, analysisMessage]);
            } else {
              throw new Error(result.error || 'Document analysis failed');
            }
          } catch (error) {
            console.error('Document analysis error:', error);
            setActivities(prev => prev.map(act => 
              act.title.includes(file.name) ? 
              { ...act, status: 'failed' as const, description: 'Document analysis failed' } : act
            ));
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        // Handle other file types (images, etc.)
        addActivity({
          type: 'processing',
          title: `File Uploaded: ${file.name}`,
          description: `Processing ${fileSize}MB ${fileType} file...`,
          status: 'completed'
        });
        
        setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: 'user', 
          content: `[File uploaded: ${file.name} (${fileSize}MB, ${fileType})] Please analyze this file.`, 
          timestamp: new Date() 
        }]);
      }
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
      timestamp: Date.now(),
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
          content: `🎉 **Learning App Complete!**\n\nYour interactive learning app for "${videoTitle || 'Untitled Video'}" has been successfully generated!\n\n✅ **Features Created:**\n- Interactive video segments\n- Automated quizzes\n- Progress tracking\n- Key concept extraction\n- Learning objectives\n\n**[🚀 Open Learning App](/video-learning-tool?videoUrl=${encodeURIComponent(detectedUrl)})**`,
          timestamp: new Date(),
        };
        setMessages(prevMessages => [...prevMessages, linkCardMessage]);

        // Add completion notification to activity feed
        addActivity({
          type: 'complete',
          title: '🎉 Video Learning App Ready!',
          description: `Interactive learning app for "${videoTitle || 'Untitled Video'}" is now available`,
          link: `/video-learning-tool?videoUrl=${encodeURIComponent(detectedUrl)}`,
          status: 'completed'
        });
      }
    }, 1000);
  };

  const captureFrame = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current; const canvas = canvasRef.current; const context = canvas.getContext("2d");
      if (!context || video.videoWidth === 0 || video.videoHeight === 0) return;
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/jpeg", 0.8);
      setCurrentCameraFrame(imageData.split(",")[1]);
      
      // Add real-time analysis every 10 seconds
      const now = Date.now();
      if (!lastCameraAnalysisRef.current || now - lastCameraAnalysisRef.current > 10000) {
        lastCameraAnalysisRef.current = now;
        
        // Add camera analysis message
        const cameraMessage: Message = {
          id: `camera-${now}`,
          role: 'user',
          content: '📷 **Live Camera Analysis**\n\nPlease analyze what you see from my camera and provide insights.',
          timestamp: new Date(),
          imageUrl: imageData
        };
        setMessages(prev => [...prev, cameraMessage]);
        
        addActivity({
          type: 'analyzing',
          title: '📷 Camera Frame Analyzed',
          description: 'AI analyzing live camera feed...',
          status: 'completed'
        });
      }
    }
  }, [setMessages, addActivity]);

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

  // Audio queue state management with refs
  const audioQueueRef = useRef<string[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false); // UI state only

  // Mobile detection effect
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
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
      case 'complete': case 'video_complete': return CheckCircle;
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
      case 'complete': case 'video_complete': return 'text-green-600';
      default: return 'text-gray-500';
    }
  };

  const SidebarContent: React.FC<{ activities: ActivityItem[], currentPath: string, className?: string, open?: boolean; }> = ({ activities, currentPath, className, open }) => {
    const navLinks = [ { href: "/threads", label: "Threads", icon: ListChecks } ];
    return (
      <div className={cn("flex flex-col h-full bg-card text-card-foreground border-r", className)}>
        <div className="p-4 border-b"><Link href="/" className="flex items-center space-x-2"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center"><Bot size={20} className="text-primary-foreground" /></div>{open && <h2 className="text-lg font-semibold">F.B/c Consulting</h2>}</Link></div>
        {open && (
          <>
            <nav className="px-4 py-2 space-y-1">{navLinks.map((link) => (<Link key={link.label} href={link.href} className={cn("flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors", currentPath === link.href ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted hover:text-foreground")}><link.icon size={18} /><span>{link.label}</span></Link>))}</nav>
            <div className="flex-grow border-t p-4"><h3 className="text-sm font-semibold mb-3 text-muted-foreground px-2">Activity</h3><ScrollArea className="h-[400px]">{activities.length === 0 && (<p className="text-xs text-muted-foreground p-2">No recent activity.</p>)}{activities.map((activity) => (<div key={activity.id} className="text-xs mb-1">{activity.isPerMessageLog ? (activity.isLiveProcessing ? (<div className="p-2 border border-border rounded-md bg-muted/30 hover:bg-muted/60 transition-colors"><div className="flex items-center justify-between mb-1"><span className="font-medium text-foreground truncate flex items-center"><Sparkles size={14} className={`mr-1.5 ${getActivityColor(activity.type)} animate-pulse`} /> {activity.title || activity.details || "Processing..."}</span></div>{activity.description && <p className="text-muted-foreground truncate">{activity.description}</p>}</div>) : (<div className="flex items-center p-1.5 rounded-md hover:bg-muted/60 transition-colors cursor-pointer"><Sparkles size={14} className={`mr-1.5 ${getActivityColor(activity.type)} flex-shrink-0`} /><span className="text-muted-foreground truncate">{activity.title || activity.details || "Processed"}</span></div>)) : (<div className="flex items-start mb-2 p-2 rounded-md hover:bg-muted transition-colors">{React.createElement(activity.icon || getActivityIcon(activity.type), { size: 18, className: `mr-2.5 mt-0.5 flex-shrink-0 ${getActivityColor(activity.type)}` })}<div className="flex-grow truncate"><div className="font-medium text-foreground truncate">{activity.title || activity.details}</div>{activity.description && <p className="text-muted-foreground truncate">{activity.description}</p>}{typeof activity.progress === 'number' && activity.progress < 100 && (<Progress value={activity.progress} className="h-1.5 mt-1" />)}{activity.link && activity.status === 'completed' && (<Link href={activity.link} target="_blank" className="text-primary hover:underline text-xs flex items-center mt-0.5">View Details <ExternalLink size={12} className="ml-1" /></Link>)}<p className="text-muted-foreground/80 text-xs mt-0.5">{activity.user || 'System'} - {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div></div>)}</div>))}</ScrollArea></div>
          </>
        )}
      </div>);
  };

  const DesktopSidebar: React.FC<{ activities: ActivityItem[], currentPath: string, className?: string, open: boolean; setOpen: (open: boolean) => void; }> = ({ activities, currentPath, className, open, setOpen }) => {
    const [isHovered, setIsHovered] = useState(false); 
    const effectiveOpen = open || isHovered;
    
    return (
      <motion.div 
        animate={{ width: effectiveOpen ? "288px" : "68px" }} 
        className={cn("h-full relative z-30 hidden md:flex flex-col", className)} 
        onMouseEnter={() => { if (!open) setIsHovered(true); }} 
        onMouseLeave={() => { if (!open) setIsHovered(false); }} 
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        <SidebarContent activities={activities} currentPath={currentPath} open={effectiveOpen} />
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "absolute top-1/2 -right-4 transform -translate-y-1/2 bg-card border rounded-full h-8 w-8 z-40 shadow-md hover:bg-muted",
            "transition-opacity duration-300",
            effectiveOpen ? "opacity-100" : "opacity-0"
          )} 
          onClick={() => setOpen(!open)}
        >
          {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </motion.div>
    );
  };

  const MobileSidebarSheet: React.FC<{ open: boolean, onOpenChange: (open: boolean) => void, activities: ActivityItem[], currentPath: string }> = ({ open, onOpenChange, activities, currentPath }) => {
    if (!open) return null;
    return (<div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => onOpenChange(false)}><div className="fixed inset-y-0 left-0 w-72 bg-card shadow-xl z-50" onClick={e => e.stopPropagation()}><SidebarContent activities={activities} currentPath={currentPath} className="border-r" open={open} /></div></div>);
  };

  const speakMessage = useCallback((text: string): void => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      audioQueueRef.current = [...audioQueueRef.current, text];
      processAudioQueue();
    }
  }, []);

  const processAudioQueue = useCallback((): void => {
    if (audioQueueRef.current.length > 0 && !isSpeakingRef.current && typeof window !== "undefined") {
      isSpeakingRef.current = true;
      setIsPlayingAudio(true);

      const textToSpeak = audioQueueRef.current[0];
      const utterance = new SpeechSynthesisUtterance(textToSpeak);

      utterance.onend = () => {
        isSpeakingRef.current = false;
        audioQueueRef.current = audioQueueRef.current.slice(1);
        setIsPlayingAudio(false);

        // Process next in queue if any
        if (audioQueueRef.current.length > 0) {
          processAudioQueue();
        }
      };

      utterance.onerror = () => {
        isSpeakingRef.current = false;
        audioQueueRef.current = audioQueueRef.current.slice(1);
        setIsPlayingAudio(false);

        // Process next in queue if any
        if (audioQueueRef.current.length > 0) {
          processAudioQueue();
        }
      };

      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // YouTube URL detection in input
  useEffect(() => {
    const detectedUrl = detectYouTubeUrl(input);
    if (detectedUrl && detectedUrl !== detectedVideoUrl) {
      setDetectedVideoUrl(detectedUrl);
      getVideoTitle(detectedUrl).then(setVideoTitle);
    } else if (!detectedUrl && detectedVideoUrl) {
      setDetectedVideoUrl(null);
      setVideoTitle("");
    }
  }, [input, detectedVideoUrl]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return (): void => {
      if (typeof window !== "undefined" && window.speechSynthesis?.speaking) {
        window.speechSynthesis.cancel();
        isSpeakingRef.current = false;
        setIsPlayingAudio(false);
      }
    };
  }, []);

  return (
    <TooltipProvider>
      <div className={cn("flex h-screen bg-background text-foreground")}>
        {/* Desktop Sidebar */}
        <DesktopSidebar 
          activities={activities} 
          currentPath="/chat" 
          open={sidebarOpen}
          setOpen={setSidebarOpen}
        />

        {/* Mobile Sidebar */}
        <MobileSidebarSheet
          open={mobileSidebarOpen}
          onOpenChange={setMobileSidebarOpen}
          activities={activities}
          currentPath="/chat"
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="md:hidden"
              >
                <Menu className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="font-semibold">AI Assistant</h1>
                  <p className="text-xs text-muted-foreground">Online • Ready to help</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadTranscript}>
                <Download className="w-4 h-4 mr-2" />
                Export Summary
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="icon">
                <SettingsIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-hidden">
            <div className="relative w-full h-full">
              <ScrollArea className="h-full">
                <div className="flex flex-col gap-6 p-4">
                  {/* Video Learning Card */}
                  {detectedVideoUrl && (
                    <div className="mb-4">
                      <VideoLearningCard
                        videoUrl={detectedVideoUrl}
                        videoTitle={videoTitle}
                        onGenerateApp={async (url) => {
                          setIsGeneratingVideoApp(true);
                          await startVideoLearningAppProcessing(url, videoTitle);
                          setIsGeneratingVideoApp(false);
                        }}
                        theme={theme === "dark" ? "dark" : "light"}
                        isGenerating={isGeneratingVideoApp}
                      />
                    </div>
                  )}

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3 max-w-[80%]",
                        message.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                      )}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={message.role === "user" ? undefined : "/ai-avatar.png"} />
                        <AvatarFallback>{message.role === "user" ? "U" : "AI"}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-2">
                        <div className={cn(
                          "rounded-2xl px-4 py-3 max-w-md",
                          message.role === "user" 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted text-muted-foreground"
                        )}>
                          {message.content}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{message.timestamp.toLocaleTimeString()}</span>
                          {message.role === "assistant" && (
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="w-6 h-6">
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="w-6 h-6">
                                <ThumbsUp className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="w-6 h-6">
                                <ThumbsDown className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className={cn("flex gap-3 max-w-[80%] mr-auto")}>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="/ai-avatar.png" />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-2xl px-4 py-3 max-w-xs">
                        <div className="flex items-center gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 bg-muted-foreground/50 rounded-full"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-border p-4">
            {/* Input Form */}
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message... (Use / for commands)"
                  className="min-h-[60px] max-h-[200px] resize-none pr-24"
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowUploadOptions(!showUploadOptions)}
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={startCamera}
                    className={cn(
                      "transition-colors",
                      isCameraActive && "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                    )}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      try {
                        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                        
                        addActivity({
                          type: 'analyzing',
                          title: '🖥️ Screen Sharing Active',
                          description: 'Capturing and analyzing screen content...',
                          status: 'in_progress'
                        });

                        // Create video element to capture frame
                        const video = document.createElement('video');
                        video.srcObject = stream;
                        video.play();

                        // Wait for video to load and capture frame
                        video.onloadedmetadata = () => {
                          setTimeout(() => {
                            const canvas = document.createElement('canvas');
                            canvas.width = video.videoWidth;
                            canvas.height = video.videoHeight;
                            const ctx = canvas.getContext('2d');
                            ctx?.drawImage(video, 0, 0);
                            
                            const imageData = canvas.toDataURL('image/jpeg', 0.8);
                            const base64Data = imageData.split(',')[1];
                            
                            // Add screen analysis message
                            const screenMessage: Message = {
                              id: Date.now().toString(),
                              role: 'user',
                              content: '🖥️ **Screen Captured for Analysis**\n\nPlease analyze what you see on my screen and provide insights.',
                              timestamp: new Date(),
                              imageUrl: imageData
                            };
                            setMessages(prev => [...prev, screenMessage]);
                            
                            // Stop the stream
                            stream.getTracks().forEach(track => track.stop());
                            
                            // Update activity
                            setActivities(prev => prev.map(act => 
                              act.title.includes('Screen Sharing') ? 
                              { ...act, status: 'completed' as const, description: 'Screen captured and ready for analysis' } : act
                            ));
                          }, 1000);
                        };
                      } catch (err) {
                        console.error('Screen sharing failed:', err);
                        addActivity({
                          type: 'error',
                          title: '❌ Screen Sharing Failed',
                          description: 'Could not access screen sharing permissions',
                          status: 'failed'
                        });
                      }
                    }}
                  >
                    <Monitor className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleMicButtonClick}
                    disabled={!isSpeechSupported}
                    className={cn(
                      "transition-colors",
                      isRecording && "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                    )}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <Button
                onClick={() => handleSendMessage()}
                disabled={(!input.trim()) || isLoading}
                className="h-[60px] px-6"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Upload Options Dropdown */}
            {showUploadOptions && (
              <div className="absolute bottom-16 right-4 bg-popover border rounded-md shadow-md p-1 z-50 min-w-[160px]">
                {uploadMenuItems.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 h-8 px-2 py-1.5 text-sm font-normal hover:bg-accent hover:text-accent-foreground"
                    onClick={item.action}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </Button>
                ))}
              </div>
            )}

            {/* Footer Info */}
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span>AI can make mistakes. Verify important information.</span>
            </div>
          </div>
        </div>

        {/* Voice Input Modal */}
        {showVoiceModal && (
          <VoiceInputModal
            isListening={aiVoiceState === "listening"}
            currentTranscription={currentTranscription}
            aiState={aiVoiceState}
            onClose={() => {
              if (recognition.current) {
                recognition.current.stop();
              }
              setShowVoiceModal(false);
              setAiVoiceState("idle");
            }}
            theme={theme === "dark" ? "dark" : "light"}
          />
        )}

        {/* Webcam Modal */}
        {showWebcamModal && (
          <WebcamModal
            videoRef={videoRef}
            canvasRef={canvasRef}
            isCameraActive={isCameraActive}
            onStopCamera={stopCamera}
            theme={theme === "dark" ? "dark" : "light"}
          />
        )}

        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        <input
          type="file"
          ref={anyFileInputRef}
          onChange={handleAnyFileChange}
          className="hidden"
        />
      </div>
    </TooltipProvider>
  );
}
