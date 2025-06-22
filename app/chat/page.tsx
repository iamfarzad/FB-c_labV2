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
import { analyzeVideoForLearning } from '@/lib/video-analysis';
import { generateText } from '@/lib/text-generation';
import { parseDataFromText, createDataItem } from '@/lib/data-parser';
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
  
  // Integrated Video Learning Panel State
  const [videoLearningData, setVideoLearningData] = useState<{
    videoUrl: string;
    title: string;
    learningModules: any[];
    currentModule: any;
    progress: number;
    isActive: boolean;
  } | null>(null);
  
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

  // Add AI Showcase state and functionality (this IS the AI model, not a toggle)
  const [leadCaptureState, setLeadCaptureState] = useState({
    name: '',
    email: '',
    stage: 'greeting',
    capabilitiesShown: [] as string[],
    isPersonalized: false
  });

  // AI Showcase capabilities (core AI functions)
  const showcaseCapabilities = [
    { id: 'image_generation', label: 'Image Generation', icon: ImageIcon, color: 'text-purple-600' },
    { id: 'video_analysis', label: 'Video Analysis', icon: Video, color: 'text-red-600' },
    { id: 'video_learning', label: 'Video to Learning App', icon: Youtube, color: 'text-blue-600' },
    { id: 'document_analysis', label: 'Document Processing', icon: FileText, color: 'text-green-600' },
    { id: 'code_execution', label: 'Code Execution', icon: Code, color: 'text-yellow-600' },
    { id: 'url_analysis', label: 'Website Analysis', icon: Globe, color: 'text-blue-600' },
  ];

  // Enhanced AI with contact research and personalization
  const enhancedHandleSendMessage = async (messageContent?: string) => {
    const contentToSend = messageContent ?? input;
    if (!contentToSend.trim() && attachments.length === 0) return;

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
      // Check if we need to collect contact info for personalization
      if (!leadCaptureState.isPersonalized && leadCaptureState.name && leadCaptureState.email) {
        // Trigger contact research and personalization
        addActivity({
          type: 'analyzing',
          title: '🔍 Researching Contact Information',
          description: `Gathering background information about ${leadCaptureState.name}...`,
          status: 'in_progress'
        });

        // Use the enhanced AI model with contact research
        const response = await fetch('/api/gemini?action=enhancedPersonalization', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: leadCaptureState.name,
            email: leadCaptureState.email,
            userMessage: contentToSend,
            conversationHistory: updatedMessages
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          const personalizedGreeting: Message = {
            id: (Date.now() + 1).toString(),
            content: `Hi ${leadCaptureState.name}! ${data.data.personalizedResponse}`,
            role: 'assistant',
            timestamp: new Date(),
            audioData: data.data.audioData,
          };
          
          setMessages(prev => [...prev, personalizedGreeting]);
          setLeadCaptureState(prev => ({ ...prev, isPersonalized: true }));
          
          addActivity({
            type: 'complete',
            title: '✅ Contact Research Complete',
            description: `Personalized conversation ready for ${leadCaptureState.name}`,
            status: 'completed'
          });
        }
      } else {
        // Regular AI conversation with showcase capabilities
        const apiMessages = updatedMessages.map((msg) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }));

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            messages: apiMessages,
            includeAudio: true,
            leadCaptureState: leadCaptureState
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
          audioData: data.audioData,
        };
        setMessages((prev) => [...prev, aiResponse]);

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

  const triggerShowcaseCapability = async (capability: string) => {
    const demos: { [key: string]: string } = {
      'image_generation': 'Generate a business visualization for my industry',
      'video_analysis': 'Analyze this YouTube video for business insights: https://youtube.com/watch?v=example',
      'video_learning': 'Create an interactive learning app from this YouTube video: https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'document_analysis': 'Analyze a business document for optimization opportunities',
      'code_execution': 'Calculate the potential ROI for implementing an AI solution in my business.',
      'url_analysis': 'Analyze my company website for AI opportunities',
    };

    if (demos[capability]) {
      setInput(demos[capability]);
      await enhancedHandleSendMessage(demos[capability]);
      
      // Track capability shown
      setLeadCaptureState(prev => ({
        ...prev,
        capabilitiesShown: [...new Set([...prev.capabilitiesShown, capability])]
      }));
    }
  };

  const completeShowcase = async () => {
    if (!leadCaptureState.name || !leadCaptureState.email) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/gemini?action=leadCapture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currentConversationState: {
            ...leadCaptureState,
            messages: messages.map(m => ({ text: m.content, sender: m.role })),
            sessionId: `showcase_${Date.now()}`
          }
        })
      });
      
      const result = await response.json();
      if (result.success) {
        const completionMessage = {
          id: Date.now().toString(),
          content: `Perfect! I've created your personalized AI consultation summary and sent it to ${leadCaptureState.email}.\n\nYour AI readiness score: ${result.data.leadScore}/100\n\nReady to implement these AI solutions? Let's schedule your free strategy session!`,
          role: 'assistant' as const,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, completionMessage]);
      }
    } catch (error) {
      console.error("Error completing showcase:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (messageContent?: string) => {
    // Use the enhanced AI showcase functionality
    return enhancedHandleSendMessage(messageContent);
  };

  const originalHandleSendMessage = async (messageContent?: string) => {
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
    recognition.current.continuous = false; 
    recognition.current.interimResults = true; 
    recognition.current.lang = "en-US";
    
    recognition.current.onstart = () => { 
      setAiVoiceState("listening"); 
      setCurrentTranscription(""); 
      addActivity({
        type: 'analyzing',
        title: '🎤 Voice Recording Started',
        description: 'Listening for voice input...',
        status: 'in_progress'
      });
    };
    
    recognition.current.onresult = (event: any) => {
      let interim = "", final = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      const currentText = interim || final;
      setCurrentTranscription(currentText);
      
      // Update activity with live transcription
      if (currentText.trim()) {
        setActivities(prev => prev.map(act => 
          act.title.includes('Voice Recording') ? 
          { ...act, description: `Transcribing: "${currentText.substring(0, 50)}${currentText.length > 50 ? '...' : ''}"` } : act
        ));
      }
      
      if (final) setInput(final);
    };
    
    recognition.current.onend = () => {
      setAiVoiceState("processing");
      const finalTranscript = currentTranscription.trim();
      
      if (finalTranscript) {
        // Update activity with completion
        setActivities(prev => prev.map(act => 
          act.title.includes('Voice Recording') ? 
          { ...act, status: 'completed' as const, description: `Voice transcribed: "${finalTranscript.substring(0, 100)}${finalTranscript.length > 100 ? '...' : ''}"` } : act
        ));
        
        // Add transcript summary to activity
        addActivity({
          type: 'complete',
          title: '📝 Voice Transcript Complete',
          description: `"${finalTranscript.substring(0, 80)}${finalTranscript.length > 80 ? '...' : ''}"`,
          status: 'completed',
          details: finalTranscript
        });
        
        // Send the message
        handleSendMessage(finalTranscript);
        
                 // Close modal after brief delay
         setTimeout(() => {
           setShowVoiceModal(false);
           setAiVoiceState("idle");
           setIsRecording(false);
         }, 1000);
      } else {
        // No transcript captured
        setActivities(prev => prev.map(act => 
          act.title.includes('Voice Recording') ? 
          { ...act, status: 'failed' as const, description: 'No voice input detected' } : act
        ));
        setShowVoiceModal(false);
        setAiVoiceState("idle");
      }
    };
    
    recognition.current.onerror = (event: any) => {
      console.error("Speech error:", event.error);
      setAiVoiceState("error");
      
      // Update activity with error
      setActivities(prev => prev.map(act => 
        act.title.includes('Voice Recording') ? 
        { ...act, status: 'failed' as const, description: `Voice recognition error: ${event.error}` } : act
      ));
      
             setTimeout(() => { 
         setShowVoiceModal(false); 
         setAiVoiceState("idle"); 
         setIsRecording(false);
       }, 2000);
    };
    
    return () => { if (recognition.current) recognition.current.stop(); };
  }, [isSpeechSupported, SpeechRecognition, handleSendMessage, addActivity]);

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

  // Helper function to parse AI response into learning modules
  const parseAIResponseToModules = (aiContent: string, videoTitle: string): any[] => {
    const modules: any[] = [];
    
    // Try to extract structured content from AI response
    const sections = aiContent.split(/(?:Module|Section|Chapter)\s*\d+/i);
    
    sections.forEach((section, index) => {
      if (section.trim() && index > 0) { // Skip first empty section
        const lines = section.trim().split('\n');
        const title = lines[0]?.replace(/[:#-]/g, '').trim() || `Module ${index}`;
        const content = lines.slice(1).join('\n').trim();
        
        // Determine module type based on content
        let type = 'reading';
        if (content.toLowerCase().includes('quiz') || content.toLowerCase().includes('question')) {
          type = 'quiz';
        } else if (content.toLowerCase().includes('video') || content.toLowerCase().includes('timestamp')) {
          type = 'video_segment';
        }
        
        // Extract quiz questions if it's a quiz module
        const questions: any[] = [];
        if (type === 'quiz') {
          const questionMatches = content.match(/\d+\.\s*(.+?)(?=\d+\.|$)/g);
          if (questionMatches) {
            questions.push(...questionMatches.map((q, qIndex) => ({
              id: `q${qIndex + 1}`,
              question: q.trim(),
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correctAnswer: 0,
              explanation: 'AI-generated explanation for this question.'
            })));
          }
        }
        
        modules.push({
          id: `module-${index}`,
          title,
          type,
          completed: false,
          content: content || `Detailed content for ${title}`,
          questions: questions.length > 0 ? questions : undefined,
          startTime: index * 120,
          endTime: (index + 1) * 120,
          keyPoints: content.split('\n').filter(line => 
            line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().startsWith('•')
          ).map(point => point.replace(/^[-*•]\s*/, '').trim()).slice(0, 3)
        });
      }
    });
    
    // If no modules were parsed, create some based on content analysis
    if (modules.length === 0) {
      const contentParts = aiContent.split('\n\n').filter(part => part.trim().length > 50);
      contentParts.forEach((part, index) => {
        modules.push({
          id: `ai-module-${index}`,
          title: `Learning Module ${index + 1}`,
          type: index === contentParts.length - 1 ? 'quiz' : 'reading',
          completed: false,
          content: part.trim(),
          startTime: index * 90,
          endTime: (index + 1) * 90
        });
      });
    }
    
    return modules.length > 0 ? modules : getDefaultLearningModules(videoTitle);
  };

  // Helper function for default learning modules
  const getDefaultLearningModules = (videoTitle: string) => {
    return [
      {
        id: 'intro',
        title: 'Video Introduction',
        type: 'video_segment',
        completed: false,
        content: `Welcome to the learning experience for "${videoTitle}". This module provides an overview of what you'll learn.`,
        startTime: 0,
        endTime: 120,
        keyPoints: ['Overview of main topics', 'Learning objectives', 'What to expect']
      },
      {
        id: 'concepts',
        title: 'Key Concepts & Ideas',
        type: 'reading',
        completed: false,
        content: `This module covers the fundamental concepts presented in "${videoTitle}". Take your time to understand these core ideas as they form the foundation for more advanced topics.`,
        keyPoints: ['Core principles', 'Important definitions', 'Foundational knowledge']
      },
      {
        id: 'quiz',
        title: 'Knowledge Assessment',
        type: 'quiz',
        completed: false,
        content: 'Test your understanding with this interactive quiz.',
        questions: [
          {
            id: 'q1',
            question: 'What is the main topic of this video?',
            options: ['Concept A', 'Concept B', 'Concept C', 'All of the above'],
            correctAnswer: 3,
            explanation: 'The video covers multiple interconnected concepts.'
          }
        ]
      },
      {
        id: 'practice',
        title: 'Practical Application',
        type: 'interactive_exercise',
        completed: false,
        content: 'Apply what you\'ve learned with practical exercises and real-world examples.',
        keyPoints: ['Hands-on practice', 'Real-world applications', 'Skill reinforcement']
      }
    ];
  };

  const startVideoLearningAppProcessing = async (detectedUrl: string, videoTitle: string) => {
    const activityId = `vid-${Date.now()}`;
    setIsGeneratingVideoApp(true);

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
    setActivities(prevActivities => [initialActivity, ...prevActivities]);

    // Simulate Progress and generate learning content
    let currentProgress = 0;
    const steps = [
      { progress: 25, description: "Analyzing video content...", type: "analyzing_video" },
      { progress: 50, description: "Extracting key concepts...", type: "video_processing" },
      { progress: 75, description: "Generating learning modules...", type: "video_processing" },
      { progress: 100, description: "Creating interactive learning experience...", type: "video_processing" },
    ];

    const progressInterval = setInterval(async () => {
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
        
        // Generate real AI-powered learning modules
        let learningModules: any[] = [];
        
        try {
          const analysisResponse = await fetch('/api/gemini?action=analyzeVideo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              videoUrl: detectedUrl,
              analysisType: 'learning_modules',
              prompt: `Create a comprehensive learning app from this YouTube video. Generate:
              
              1. **Learning Modules**: Break the video into logical segments with clear learning objectives
              2. **Interactive Content**: Create detailed explanations, key concepts, and practical examples
              3. **Quiz Questions**: Generate multiple-choice questions to test understanding
              4. **Reading Materials**: Provide supplementary content that expands on the video topics
              5. **Timestamps**: Identify key moments in the video for each module
              
              Make this a complete interactive learning experience with rich, detailed content.`,
              generateQuizzes: true,
              generateReadingMaterials: true,
              targetAudience: 'intermediate'
            })
          });

          const analysisResult = await analysisResponse.json();
          
          if (analysisResult.success && analysisResult.data?.text) {
            // Parse AI response to extract learning modules
            const aiContent = analysisResult.data.text;
            
            // Try to extract structured content from AI response
            learningModules = parseAIResponseToModules(aiContent, videoTitle);
          } else {
            // Fallback to default modules if AI fails
            learningModules = getDefaultLearningModules(videoTitle);
          }
          
        } catch (error) {
          console.error('Failed to generate AI learning modules:', error);
          learningModules = getDefaultLearningModules(videoTitle);
        }

        // Set up the integrated learning panel
        setVideoLearningData({
          videoUrl: detectedUrl,
          title: videoTitle || 'Untitled Video',
          learningModules,
          currentModule: learningModules[0],
          progress: 0,
          isActive: true
        });

        setActivities(prevActivities =>
          prevActivities.map(act =>
            act.id === activityId
              ? {
                  ...act,
                  type: "video_complete",
                  progress: 100,
                  title: `Learning App Ready: ${videoTitle || 'Untitled Video'}`,
                  description: "Interactive learning modules are now available in the sidebar.",
                  status: 'completed',
                }
              : act
          )
        );

        const completionMessage: Message = {
          id: `learning-${Date.now()}`,
          role: 'assistant',
          content: `🎉 **Learning App Created!**\n\nI've generated an interactive learning experience for "${videoTitle || 'Untitled Video'}" with the following features:\n\n✅ **Learning Modules:**\n- Video segments with key timestamps\n- Interactive quizzes\n- Reading materials\n- Progress tracking\n\n📚 **Your learning modules are now available in the sidebar!** Click on any module to start learning.\n\nYou can track your progress and complete modules at your own pace.`,
          timestamp: new Date(),
        };
        setMessages(prevMessages => [...prevMessages, completionMessage]);

        addActivity({
          type: 'complete',
          title: '🎉 Interactive Learning Ready!',
          description: `Learning modules for "${videoTitle || 'Untitled Video'}" are available in sidebar`,
          status: 'completed'
        });

        setIsGeneratingVideoApp(false);
      }
    }, 1500);
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
    if (!isSpeechSupported) { 
      addActivity({
        type: 'error',
        title: '❌ Voice Not Supported',
        description: 'Speech recognition is not supported in this browser. Try Chrome or Edge.',
        status: 'failed'
      });
      return; 
    }
    
    // Check for HTTPS requirement
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      addActivity({
        type: 'error',
        title: '❌ HTTPS Required',
        description: 'Voice input requires HTTPS connection for security',
        status: 'failed'
      });
      return;
    }
    
    if (aiVoiceState === "listening" || aiVoiceState === "processing") {
      // Stop current recording
      if (recognition.current) recognition.current.stop();
      setShowVoiceModal(false);
      setAiVoiceState("idle");
      
      // Update activity to show cancellation
      setActivities(prev => prev.map(act => 
        act.title.includes('Voice Recording') ? 
        { ...act, status: 'failed' as const, description: 'Voice recording cancelled by user' } : act
      ));
    } else {
      // Start new recording
      setCurrentTranscription(""); 
      setShowVoiceModal(true);
      setIsRecording(true);
      
      // Add helpful activity message
      addActivity({
        type: 'analyzing',
        title: '🎤 Voice Recording Starting',
        description: 'Grant microphone permission when prompted by browser',
        status: 'in_progress'
      });
      
      try { 
        recognition.current?.start(); 
      } catch (e) { 
        console.error('Voice recognition start error:', e); 
        setAiVoiceState("error");
        setIsRecording(false);
        addActivity({
          type: 'error',
          title: '❌ Voice Recording Failed',
          description: 'Could not start voice recognition. Check browser permissions.',
          status: 'failed'
        });
      }
    }
  }, [isSpeechSupported, aiVoiceState, recognition, addActivity]);

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
    return (
      <div className={cn("flex flex-col h-full bg-card overflow-hidden", className)}>
        {/* Header */}
        <div className="p-4 border-b border-border flex-shrink-0">
          <h2 className={cn(
            "text-lg font-semibold flex items-center gap-2 transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0"
          )}>
            <Activity className="w-5 h-5 text-primary" />
            {open && "AI Activity Monitor"}
          </h2>
        </div>

        <ScrollArea className="flex-1 p-4" onMouseDown={(e) => e.stopPropagation()}>
          {/* Contact Collection for AI Personalization */}
          <div className="mb-6">
            <h3 className={cn(
              "font-semibold text-sm text-muted-foreground mb-3 transition-opacity duration-200",
              open ? "opacity-100" : "opacity-0"
            )}>
              {open ? "AI Personalization" : ""}
            </h3>
            {!leadCaptureState.isPersonalized ? (
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-xs text-muted-foreground mb-3">
                  Provide your contact info for personalized AI assistance
                </p>
                <div className="space-y-3">
                  <Input
                    placeholder="Your name"
                    value={leadCaptureState.name}
                    onChange={(e) => setLeadCaptureState(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    type="email"
                    placeholder="Your email"
                    value={leadCaptureState.email}
                    onChange={(e) => setLeadCaptureState(prev => ({ ...prev, email: e.target.value }))}
                  />
                  {leadCaptureState.name && leadCaptureState.email && (
                    <p className="text-xs text-green-600">
                      ✓ Ready for personalized AI assistance
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300">
                  ✓ Personalized for {leadCaptureState.name}
                </p>
              </div>
            )}
          </div>

          {/* Capabilities Showcased */}
          {leadCaptureState.capabilitiesShown.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-sm text-muted-foreground mb-3">Capabilities Showcased</h3>
              <div className="space-y-2">
                {leadCaptureState.capabilitiesShown.map((capability, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 text-sm"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="capitalize">{capability.replace('_', ' ')}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* AI Capability Demos */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm text-muted-foreground mb-3">AI Capabilities</h3>
            <div className="space-y-2">
              {showcaseCapabilities.map((cap) => {
                const Icon = cap.icon;
                const isShown = leadCaptureState.capabilitiesShown.includes(cap.id);
                
                return (
                  <Button
                    key={cap.id}
                    variant={isShown ? "secondary" : "outline"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => triggerShowcaseCapability(cap.id)}
                    disabled={isLoading}
                  >
                    <Icon className={cn("w-4 h-4 mr-2", cap.color)} />
                    {cap.label}
                    {isShown && <CheckCircle className="w-3 h-3 ml-auto text-green-500" />}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Complete Showcase Button */}
          {leadCaptureState.name && leadCaptureState.email && leadCaptureState.capabilitiesShown.length > 0 && (
            <div className="mb-6">
              <Button
                onClick={completeShowcase}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Complete AI Showcase & Get Summary
              </Button>
            </div>
          )}

          {/* Video Learning Panel */}
          {videoLearningData?.isActive && (
            <div className="mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Video className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-sm">Learning Modules</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto h-6 w-6"
                    onClick={() => setVideoLearningData(prev => prev ? { ...prev, isActive: false } : null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-2">{videoLearningData.title}</p>
                  <Progress value={videoLearningData.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round(videoLearningData.progress)}% Complete
                  </p>
                </div>

                <div className="space-y-2">
                  {videoLearningData.learningModules.map((module, index) => (
                    <div
                      key={module.id}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-all",
                        module.completed 
                          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700",
                        videoLearningData.currentModule?.id === module.id && "ring-2 ring-blue-500"
                      )}
                      onClick={() => {
                        setVideoLearningData(prev => prev ? { ...prev, currentModule: module } : null);
                        
                        // Create rich module content based on type
                        let moduleContent = `📚 **${module.title}**\n\n`;
                        
                        if (module.type === 'quiz' && module.questions?.length > 0) {
                          moduleContent += `🧠 **Interactive Quiz**\n\n`;
                          module.questions.slice(0, 2).forEach((q: any, idx: number) => {
                            moduleContent += `**Question ${idx + 1}:** ${q.question}\n`;
                            q.options?.forEach((option: string, optIdx: number) => {
                              moduleContent += `${String.fromCharCode(65 + optIdx)}. ${option}\n`;
                            });
                            moduleContent += `\n`;
                          });
                          moduleContent += `💡 *Click "Mark Complete" when you've answered the questions!*`;
                        } else if (module.type === 'video_segment') {
                          moduleContent += module.content || `🎥 **Video Segment Analysis**\n\nThis module focuses on a specific part of the video with key insights and explanations.`;
                          if (module.startTime !== undefined) {
                            moduleContent += `\n\n⏰ **Video timestamp:** ${Math.floor(module.startTime / 60)}:${String(module.startTime % 60).padStart(2, '0')}`;
                          }
                          if (module.keyPoints?.length > 0) {
                            moduleContent += `\n\n🔑 **Key Points:**\n`;
                            module.keyPoints.forEach((point: string) => {
                              moduleContent += `• ${point}\n`;
                            });
                          }
                        } else {
                          moduleContent += module.content || `📖 **Reading Material**\n\nDetailed explanations and concepts for this learning module.`;
                          if (module.keyPoints?.length > 0) {
                            moduleContent += `\n\n🔑 **Key Takeaways:**\n`;
                            module.keyPoints.forEach((point: string) => {
                              moduleContent += `• ${point}\n`;
                            });
                          }
                        }
                        
                        // Add module interaction to chat
                        const moduleMessage: Message = {
                          id: `module-${Date.now()}`,
                          role: 'assistant',
                          content: moduleContent,
                          timestamp: new Date(),
                        };
                        setMessages(prev => [...prev, moduleMessage]);
                        
                        // Add activity log
                        addActivity({
                          type: 'processing',
                          title: `📚 Module: ${module.title}`,
                          description: `Opened ${module.type.replace('_', ' ')} module`,
                          status: 'completed'
                        });
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {module.type === 'video_segment' && <Video className="w-4 h-4 text-blue-500" />}
                          {module.type === 'quiz' && <ListChecks className="w-4 h-4 text-purple-500" />}
                          {module.type === 'reading' && <FileText className="w-4 h-4 text-green-500" />}
                          <span className="text-sm font-medium">{module.title}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {module.completed && <CheckCircle className="w-4 h-4 text-green-500" />}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              const updatedModules = videoLearningData.learningModules.map(m =>
                                m.id === module.id ? { ...m, completed: !m.completed } : m
                              );
                              const completedCount = updatedModules.filter(m => m.completed).length;
                              const newProgress = (completedCount / updatedModules.length) * 100;
                              
                              setVideoLearningData(prev => prev ? {
                                ...prev,
                                learningModules: updatedModules,
                                progress: newProgress
                              } : null);
                            }}
                          >
                            {module.completed ? 
                              <CheckCircle className="w-3 h-3 text-green-500" /> : 
                              <CheckCircle className="w-3 h-3 text-gray-400" />
                            }
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">
                        {module.type.replace('_', ' ')}
                      </p>
                    </div>
                  ))}
                </div>

                {videoLearningData.progress === 100 && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                        Learning Complete! 🎉
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activity Log */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">Recent Activity</h3>
            <AnimatePresence>
              {activities.slice(0, 10).map((activity, index) => {
                const Icon = getActivityIcon(activity.type);
                const color = getActivityColor(activity.type);
                
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="p-3 bg-card border border-border rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={cn("w-4 h-4 mt-0.5", color)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.title}</p>
                        {activity.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {activity.description}
                          </p>
                        )}
                        {activity.progress !== undefined && (
                          <Progress value={activity.progress} className="mt-2 h-1" />
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>
    );
  };

  const DesktopSidebar: React.FC<{ activities: ActivityItem[], currentPath: string, className?: string, open?: boolean; setOpen: (open: boolean) => void; }> = ({ activities, currentPath, className, open, setOpen }) => {
    return (
      <motion.div 
        animate={{ width: open ? "288px" : "68px" }} 
        className={cn("h-full relative z-30 hidden md:flex flex-col border-r border-border", className)} 
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
      >
        <SidebarContent activities={activities} currentPath={currentPath} open={open} />
        
        {/* Fixed Toggle Button - Always Visible */}
        <div className="absolute top-4 -right-3 z-50">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "bg-background border border-border rounded-full h-6 w-6 shadow-sm hover:bg-muted",
              "transition-all duration-200 hover:scale-110"
            )} 
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(!open);
            }}
          >
            {open ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
        </div>
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
        <div className="flex-1 flex flex-col" onMouseDown={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="border-b border-border/50 p-4 flex items-center justify-between bg-card/95 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="md:hidden hover:bg-muted/80 transition-colors"
              >
                <Menu className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm">
                  <Bot size={20} className="text-white" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-lg font-semibold text-foreground">AI Assistant</h1>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-muted-foreground">Online • Ready to help</span>
                  </div>
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
                          await startVideoLearningAppProcessing(url, videoTitle);
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
