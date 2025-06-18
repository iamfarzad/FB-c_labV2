"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from "next-themes";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { User, Bot, Sun, Moon, Mic, Video as VideoIcon, Paperclip, PlusIcon, Loader, MessageSquareText, Download } from 'lucide-react'; // Added MessageSquareText, Download

import { VoiceInputModal } from "@/components/voice-input-modal";
import { WebcamModal } from "@/components/webcam-modal";
// Removed ChatSidePanel import
import { Progress } from "@/components/ui/progress"; // For activity progress
import { Badge } from "@/components/ui/badge"; // For activity tags/status
import { ExternalLink, MessageCircle, Zap, Image as ImageIcon, AlertTriangle, CheckCircle, ListChecks, Video, Sparkles, Edit3, Users, Settings as SettingsIcon, LogOut, FileText, ChevronLeft, ChevronRight } from 'lucide-react'; // More icons for sidebar. Note: Download was added above.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils"; // For conditional classes
import { motion } from "framer-motion"; // Import motion

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

  // Speech Recognition state
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [currentTranscription, setCurrentTranscription] = useState("");
  const [aiVoiceState, setAiVoiceState] = useState<"listening" | "processing" | "idle" | "error">("idle");

  // Webcam state
  const [showWebcamModal, setShowWebcamModal] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [currentCameraFrame, setCurrentCameraFrame] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // File/Image Upload State
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tools Menu State
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  // const [generatingImage, setGeneratingImage] = useState(false); // This state seems specific to old image gen. Let's use a more generic 'isToolProcessing' or 'isLoading' for side panel actions.
  // Removed showSidePanel state, other side panel states (summaryData, isSummaryLoading, summaryError) are kept as per instruction.
  const [summaryData, setSummaryData] = useState<any>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // New Sidebar State & Activity State (assuming activities state should exist or be created)
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default to open for desktop
  const [isMobile, setIsMobile] = useState(false); // For responsive sidebar

  // Define ActivityItem interface as per typical requirements for a mixed activity log
  interface ActivityItem {
    id: string;
    type: 'video_processing' | 'image_generation' | 'chat_summary' | 'ai_thinking' | 'error' | 'user_action' | 'system_message' | 'event' | 'image' | 'analyzing_video' | 'analyzing' | 'generating' | 'processing' | 'complete';
    title: string;
    description?: string;
    timestamp: number;
    user?: string;
    progress?: number; // 0-100
    isLiveProcessing?: boolean; // For AI thinking logs
    isPerMessageLog?: boolean; // To differentiate AI thinking from other tasks
    sourceMessageId?: string; // Link AI thinking to a specific message
    link?: string; // e.g., link to a generated video app
    icon?: React.ElementType; // Optional custom icon
    status?: 'pending' | 'in_progress' | 'completed' | 'failed';
    details?: string; // Could be used as title if title is too generic
  }
  const [activities, setActivities] = useState<ActivityItem[]>([
    // Adapted from user's snippet to fit ActivityItem interface
    {
      id: 's1',
      type: 'system_message', // Mapped 'message' type to 'system_message' or 'ai_thinking'
      timestamp: Date.now() - 3600000 * 3,
      user: 'AI Assistant',
      title: 'Chat Started',
      description: 'Initial conversation with AI Assistant began. Responded to "Project Setup Query".', // Combined description and details
      status: 'complete',
    },
    {
      id: 's2',
      type: 'event', // Mapped 'event' type
      timestamp: Date.now() - 3600000 * 2,
      user: 'System',
      title: 'User Logged In',
      description: 'User successfully authenticated to the platform.',
      status: 'complete',
    },
    // Keeping one more complex example from previous state for variety during verification
    { id: 'prev_1', type: 'video_processing', title: 'Analyzing "Old Video Example"', description: 'Extracting key concepts.', timestamp: Date.now() - 1000000, progress: 30, status: 'in_progress', user: 'System' },
  ]);

  // Function to add new activities (if not already present)
  const addActivity = useCallback((newActivity: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    setActivities(prevActivities => [
      { ...newActivity, id: Date.now().toString() + Math.random(), timestamp: Date.now() },
      ...prevActivities
    ]);
  }, []);


  // Speech Recognition setup
  const SpeechRecognition = typeof window !== "undefined" ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null;
  const isSpeechSupported = !!SpeechRecognition;
  const recognition = useRef<any>(null);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Speech Recognition Setup Effect
  useEffect(() => {
    if (!isSpeechSupported || typeof window === "undefined") {
      return;
    }

    recognition.current = new SpeechRecognition();
    recognition.current.continuous = false; // Set to true if you want it to keep listening
    recognition.current.interimResults = true;
    recognition.current.lang = "en-US";

    recognition.current.onstart = () => {
      setAiVoiceState("listening");
      setCurrentTranscription("");
    };

    recognition.current.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      setCurrentTranscription(interimTranscript || finalTranscript);

      if (finalTranscript) {
        // Option 1: Append to input
        // setInputValue((prev) => (prev ? prev + " " : "") + finalTranscript);
        // Option 2: Directly set input - might be better if modal is primary input method
        setInputValue(finalTranscript);
      }
    };

    recognition.current.onend = () => {
      setAiVoiceState("processing"); // Transition state
      // Automatically send message if there's transcription
      // Check currentTranscription directly as inputValue might not have updated yet due to state batching
      if (currentTranscription.trim()) {
        // Ensure handleSendMessage uses the latest transcription or inputValue
        // Consider passing the transcribed text directly if inputValue is not yet updated
        handleSendMessage(currentTranscription.trim());
      } else {
         // If no transcription, just hide modal and reset state
        setShowVoiceModal(false);
        setAiVoiceState("idle");
      }
    };

    recognition.current.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setAiVoiceState("error");
      // Optionally hide modal after a delay
      setTimeout(() => {
        setShowVoiceModal(false);
        setAiVoiceState("idle");
      }, 2000);
    };

    // Cleanup function
    return () => {
      if (recognition.current) {
        recognition.current.stop();
        recognition.current.onstart = null;
        recognition.current.onresult = null;
        recognition.current.onend = null;
        recognition.current.onerror = null;
      }
    };
  // IMPORTANT: Decide dependencies.
  }, [isSpeechSupported, SpeechRecognition, handleSendMessage]);


  // Side Panel Action Handlers
  const handleDownloadTranscript = () => {
    const transcript = messages.map((msg) => {
      const sender = msg.role === 'user' ? 'User' : 'Assistant';
      const time = msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `${sender} (${time}): ${msg.content}`;
    }).join("\n\n");

    const blob = new Blob([transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "chat-transcript.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSummarizeChat = async () => {
    const activityId = `summ-${Date.now()}`;
    const initialSummaryActivity: ActivityItem = {
      id: activityId,
      type: "chat_summary", // New type for in-progress summarization
      title: "Summarizing Conversation",
      description: "Processing chat history...",
      timestamp: Date.now(),
      progress: 30, // Indeterminate or initial progress
      isPerMessageLog: false,
      status: 'in_progress',
    };
    setActivities(prevActivities => [initialSummaryActivity, ...prevActivities]);

    setIsSummaryLoading(true); // Keep for button state if needed
    setSummaryError(null);     // Keep for other UI if needed
    setSummaryData(null);      // Clear old summary data

    try {
      const apiMessages = messages.map(m => ({ role: m.role, content: m.content }));
      if (apiMessages.length === 0) {
        setActivities(prevActivities =>
          prevActivities.map(act =>
            act.id === activityId
              ? {
                  ...act,
                  type: "system_message", // Or 'event'
                  progress: 100,
                  description: "No messages in chat to summarize.",
                  title: "Summarization Skipped",
                  status: 'complete',
                }
              : act
          )
        );
        // setSummaryData({ summary: "No messages in chat to summarize." }); // Old state
        setIsSummaryLoading(false);
        return;
      }

      const response = await fetch("/api/gemini-proxy?action=summarizeChat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const result = await response.json(); // Try to parse JSON regardless of response.ok for error messages

      if (!response.ok) {
        // Use error from API response if available, otherwise use generic error
        const errorMessage = result?.error || `API Error: ${response.status}`;
        throw new Error(errorMessage);
      }

      if (result.summary) {
        const formattedSummary = `Summary: ${result.summary}\nKey Points: ${(result.keyPoints || []).join(', ')}\nAction Items: ${(result.actionItems || []).join(', ')}`;
        setActivities(prevActivities =>
          prevActivities.map(act =>
            act.id === activityId
              ? {
                  ...act,
                  type: "complete",
                  progress: 100,
                  description: result.summary.substring(0, 200) + (result.summary.length > 200 ? "..." : ""), // Truncate for display
                  title: "Chat Summary Ready",
                  status: 'complete',
                  details: result.summary, // Store full summary if needed elsewhere
                }
              : act
          )
        );
        // setSummaryData({ summary: result.summary, keyPoints: result.keyPoints || [], actionItems: result.actionItems || [] }); // Old state
      } else {
        throw new Error("Summary not found in API response.");
      }
    } catch (error) {
      console.error("Error in handleSummarizeChat:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setActivities(prevActivities =>
        prevActivities.map(act =>
          act.id === activityId
            ? {
                ...act,
                type: "error",
                progress: undefined,
                description: errorMessage,
                title: "Summarization Failed",
                status: 'failed',
              }
            : act
        )
      );
      // setSummaryError(errorMessage); // Old state
      // setSummaryData(null); // Old state
    } finally {
      setIsSummaryLoading(false); // Keep for button state
    }
  };

  // Quick Tools Actions (simplified from old page)
  const portGenerateImageDescription = async (prompt: string) => {
    setShowToolsMenu(false);
    setGeneratingImage(true); // For loading indicator if needed

    const toolMessage = `Describe an image based on the following prompt: "${prompt}". Provide a detailed visual description as if you were describing it to someone who cannot see it. Include elements like subject, setting, colors, mood, and composition.`;

    await handleSendMessage(toolMessage); // Send this as a regular message to the chat API

    setGeneratingImage(false);
    // The main handleSendMessage will handle the API call and response.
    // No separate dataItems or direct image rendering here for now.
  };

  const portHandleToolClick = async (toolName: string) => {
    setShowToolsMenu(false);
    const currentPrompt = inputValue.trim() || "something generic"; // Use inputValue from current page

    let llmPrompt = "";

    switch (toolName) {
      case "search_web":
        llmPrompt = `Act as a web search engine. Provide a concise summary of the top search results for "${currentPrompt}". Include 3-5 bullet points of key information.`;
        break;
      case "run_deep_research":
        llmPrompt = `Perform a deep research on "${currentPrompt}". Provide a detailed, multi-paragraph overview with key findings, insights, and potential implications.`;
        break;
      case "think_longer":
        llmPrompt = `Elaborate on the topic "${currentPrompt}" by providing a more detailed and expansive thought process. Break down the concept, discuss its nuances, and offer multiple perspectives.`;
        break;
      case "brainstorm_ideas":
        llmPrompt = `Brainstorm 5-7 creative and distinct ideas related to "${currentPrompt}". Present them as a numbered list, with a brief explanation for each.`;
        break;
      default:
        return;
    }

    await handleSendMessage(llmPrompt); // Send this as a regular message to the chat API
    // inputValue will be cleared by handleSendMessage
  };


  // File Upload Handlers
  const handlePaperclipClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUploadedImageBase64(base64String.split(",")[1]); // Store only the base64 part
        // Optionally, display a thumbnail or file name, or send a message indicating file is ready
        setMessages(prevMessages => [...prevMessages, {
          id: Date.now().toString(),
          role: 'user',
          content: `[Image selected: ${file.name}] Ready to send.`,
          timestamp: new Date(),
        }]);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      // Handle non-image file selections if needed in the future
      console.warn("Non-image file selected. This feature currently supports images only.");
      setMessages(prevMessages => [...prevMessages, {
        id: Date.now().toString(),
        role: 'assistant', // Or 'system'
        content: `Selected file "${file.name}" is not an image. Please select an image file.`,
        timestamp: new Date(),
      }]);
    }
    // Reset file input value to allow selecting the same file again
    if (event.target) {
      event.target.value = "";
    }
  };

  // Webcam Functions
  const captureFrame = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) return;

      // Set canvas dimensions to video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (canvas.width === 0 || canvas.height === 0) return; // Avoids error if video not loaded

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8); // Get base64 string
      setCurrentCameraFrame(imageDataUrl.split(",")[1]); // Send only the base64 part
    }
  }, []);

  const startCamera = useCallback(async () => {
    setShowWebcamModal(true); // Show modal first
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play(); // Ensure play is awaited
        setIsCameraActive(true);
        // Start capturing frames at intervals
        if (captureIntervalRef.current) clearInterval(captureIntervalRef.current); // Clear existing interval
        captureIntervalRef.current = setInterval(captureFrame, 2000); // Capture every 2s
      }
    } catch (error) {
      console.error("Error accessing webcam:", error);
      setIsCameraActive(false);
      setShowWebcamModal(false); // Hide modal if error
    }
  }, [captureFrame]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setCurrentCameraFrame(null);
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    setShowWebcamModal(false); // Hide modal when stopping camera
  }, []);


  const handleMicButtonClick = useCallback(() => {
    if (!isSpeechSupported) {
      console.warn("Speech recognition is not supported in this browser.");
      return;
    }

    if (aiVoiceState === "listening" || aiVoiceState === "processing") {
      if (recognition.current) {
        recognition.current.stop(); // This will trigger 'onend' which handles state changes
      }
      setShowVoiceModal(false); // Explicitly hide modal
      // setAiVoiceState("idle"); // onend should ideally handle this transition
    } else {
      setCurrentTranscription("");
      setShowVoiceModal(true); // Show modal before starting
      // setAiVoiceState("listening"); // This is set in onstart
      try {
        recognition.current?.start();
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        setAiVoiceState("error");
      }
    }
  }, [isSpeechSupported, aiVoiceState, recognition]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = textToSend || inputValue.trim();
    // Ensure message is sent if there's text, an uploaded image, or an active camera frame
    if (messageContent === '' && !currentCameraFrame && !uploadedImageBase64) {
      if (showVoiceModal && aiVoiceState !== "listening") {
        setShowVoiceModal(false);
        setAiVoiceState("idle");
      }
      return;
    }

    let userMessageContent = messageContent;
    if (uploadedImageBase64 && !userMessageContent) {
      userMessageContent = "[Uploaded Image]";
    } else if (currentCameraFrame && !userMessageContent) {
      userMessageContent = "[Webcam Image]";
    } else if (uploadedImageBase64 && userMessageContent) {
      userMessageContent = `${userMessageContent} [Image Attached]`;
    }


    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessageContent,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    const currentInputForApi = messageContent;
    setInputValue('');
    setCurrentTranscription('');
    setIsLoading(true);
    if (showVoiceModal && aiVoiceState !== "listening") {
        setShowVoiceModal(false);
        setAiVoiceState("idle");
    }

    const frameToSend = currentCameraFrame;
    // setCurrentCameraFrame(null); // Clear after preparing for send? Let's clear after API call.

    const imageToSend = uploadedImageBase64;
    // setUploadedImageBase64(null); // Clear after preparing for send? Let's clear after API call.


    const assistantMessageId = (Date.now() + Math.random()).toString();

    try {
      const apiRequestBody: { messages: ApiMessage[], imageData?: string, cameraFrame?: string } = {
        messages: [{ role: 'user', parts: [{ text: currentInputForApi || (frameToSend ? "[Webcam Image]" : "") || (imageToSend ? "[Uploaded Image]" : "")}] }],
        ...(imageToSend && { imageData: imageToSend }),
        ...(frameToSend && { cameraFrame: frameToSend }),
      };

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: assistantMessageId,
          role: 'assistant',
          content: "...",
          timestamp: new Date(),
        },
      ]);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRequestBody),
      });

      // Clear uploaded image and camera frame AFTER successful request preparation (or after response)
      // For now, let's clear them immediately after preparing the body.
      // This means they are single-use for now.
      if (imageToSend) setUploadedImageBase64(null);
      if (frameToSend) setCurrentCameraFrame(null); // If webcam is meant to be persistent, this should be handled differently

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error JSON" }));
        throw new Error(errorData.error || `API Error: ${response.status}`);
      }

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantResponseContent = '';
        let firstChunkProcessed = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonData = line.substring('data: '.length);
              if (jsonData.trim() === '[DONE]') {
                break;
              }
              try {
                const parsedData = JSON.parse(jsonData);
                if (parsedData.content) {
                  assistantResponseContent += parsedData.content;
                  setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: assistantResponseContent, timestamp: new Date() }
                        : msg
                    )
                  );
                  firstChunkProcessed = true;
                }
              } catch (e) {
                console.error('Error parsing stream data chunk:', e, 'Chunk:', jsonData);
              }
            }
          }
        }

        if (!firstChunkProcessed && assistantResponseContent.trim() === '') {
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: "Assistant responded with empty content.", timestamp: new Date() }
                : msg
            )
          );
        }
      } else {
        throw new Error('Response body is null');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === assistantMessageId && msg.content === "..."
            ? { ...msg, content: `Error: ${error instanceof Error ? error.message : String(error)}`, timestamp: new Date() }
            : msg
        )
      );
      setMessages(prev => {
        const errorExists = prev.some(m => m.id === assistantMessageId && m.content.startsWith("Error:"));
        if (!errorExists) {
          return [...prev, {
            id: assistantMessageId,
            role: 'assistant',
            content: `Error: ${error instanceof Error ? error.message : String(error)}`,
            timestamp: new Date()
          }];
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Placeholder for getActivityIcon and getActivityColor - these would be defined based on ActivityItem.type
  const getActivityIcon = (type: ActivityItem['type']): React.ElementType => {
    switch (type) {
      case 'video_processing': return Video;
      case 'analyzing_video': return Video;
      case 'image_generation': return ImageIcon;
      case 'image': return ImageIcon;
      case 'chat_summary': return ListChecks;
      case 'ai_thinking': return Sparkles;
      case 'error': return AlertTriangle;
      case 'user_action': return Edit3;
      case 'system_message': return MessageCircle;
      case 'event': return Zap;
      case 'complete': return CheckCircle;
      default: return Zap;
    }
  };
  const getActivityColor = (type: ActivityItem['type']): string => {
    switch (type) {
      case 'video_processing': return 'text-blue-500';
      case 'analyzing_video': return 'text-blue-400';
      case 'image_generation': return 'text-purple-500';
      case 'image': return 'text-purple-400';
      case 'chat_summary': return 'text-green-500';
      case 'ai_thinking': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      case 'complete': return 'text-green-600';
      default: return 'text-gray-500';
    }
  };


  // New Sidebar Component Definitions
  const SidebarContent: React.FC<{
    activities: ActivityItem[],
    currentPath: string,
    className?: string,
    open?: boolean; // Added 'open' prop
    onSummarizeChat?: () => void; // Added 'onSummarizeChat' prop
  }> = ({ activities, currentPath, className, open, onSummarizeChat }) => {
    const navLinks = [
      // { href: "/chat", label: "Current Chat", icon: MessageCircle }, // Current chat is the main view
      { href: "/threads", label: "Threads", icon: ListChecks }, // "Threads" is now the title for the activity list area
      { href: "/shared-with-me", label: "Shared With Me", icon: Users },
      { href: "/settings", label: "Settings", icon: SettingsIcon },
    ];

    return (
      <div className={cn("flex flex-col h-full bg-card text-card-foreground border-r", className)}>
        <div className="p-4 border-b">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
              <Bot size={20} className="text-primary-foreground" />
            </div>
            <h2 className="text-lg font-semibold">AI Platform</h2>
          </Link>
        </div>

        <nav className="flex-grow px-4 py-2 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                currentPath === link.href
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-muted hover:text-foreground"
              )}
            >
              <link.icon size={18} />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Summarize Chat Button - Added as per user's snippet */}
        {onSummarizeChat && open && (
          <div className="mt-2 mb-2 px-4">
            <Button variant="outline" size="sm" className="w-full" onClick={onSummarizeChat} disabled={isSummaryLoading}>
              {isSummaryLoading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <MessageSquareText className="w-4 h-4 mr-2" />}
              Summarize Chat
            </Button>
          </div>
        )}

        <div className="px-4 mt-auto mb-4"> {/* This Log Out button was part of the original new sidebar */}
          <Button variant="outline" className="w-full justify-start space-x-3">
            <LogOut size={18} />
            <span>Log Out</span>
          </Button>
        </div>

        <div className="flex-shrink-0 border-t p-4">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground px-2">Threads</h3> {/* Title for activity list */}
          <ScrollArea className="h-[250px]"> {/* Adjust height as needed */}
            {activities.length === 0 && (
              <p className="text-xs text-muted-foreground p-2">No recent activity.</p>
            )}
            {activities.map((activity) => (
              // This is the loop to be verified by the subtask
              <div key={activity.id} className="text-xs mb-1">
                {activity.isPerMessageLog ? (
                  activity.isLiveProcessing ? (
                    // Live Process state for per-message AI thinking
                    <div className="p-2 border border-border rounded-md bg-muted/30 hover:bg-muted/60 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground truncate flex items-center">
                          <Sparkles size={14} className={`mr-1.5 ${getActivityColor(activity.type)} animate-pulse`} />
                          {activity.title || activity.details || "Processing..."}
                        </span>
                        {/* Placeholder for source icons if needed */}
                      </div>
                      {activity.description && <p className="text-muted-foreground truncate">{activity.description}</p>}
                    </div>
                  ) : (
                    // Process Summary state for per-message AI thinking
                    <div className="flex items-center p-1.5 rounded-md hover:bg-muted/60 transition-colors cursor-pointer">
                       <Sparkles size={14} className={`mr-1.5 ${getActivityColor(activity.type)} flex-shrink-0`} />
                      <span className="text-muted-foreground truncate">{activity.title || activity.details || "Processed"}</span>
                      {/* Placeholder for source icons if needed */}
                    </div>
                  )
                ) : (
                  // Standard display for longer-running tasks
                  <div className="flex items-start mb-2 p-2 rounded-md hover:bg-muted transition-colors">
                    {React.createElement(activity.icon || getActivityIcon(activity.type), { size: 18, className: `mr-2.5 mt-0.5 flex-shrink-0 ${getActivityColor(activity.type)}` })}
                    <div className="flex-grow truncate">
                      <div className="font-medium text-foreground truncate">{activity.title || activity.details}</div>
                      {activity.description && <p className="text-muted-foreground truncate">{activity.description}</p>}
                      {typeof activity.progress === 'number' && activity.progress < 100 && (
                        <Progress value={activity.progress} className="h-1.5 mt-1" />
                      )}
                       {activity.link && activity.status === 'completed' && (
                         <Link href={activity.link} target="_blank" className="text-primary hover:underline text-xs flex items-center mt-0.5">
                           View Details <ExternalLink size={12} className="ml-1" />
                         </Link>
                       )}
                      <p className="text-muted-foreground/80 text-xs mt-0.5">
                        {activity.user || 'System'} - {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>
    );
  };

  const DesktopSidebar: React.FC<{
    activities: ActivityItem[],
    currentPath: string,
    className?: string,
    onSummarizeChat?: () => void;
    open: boolean; // Added open prop for pinning
    setOpen: (open: boolean) => void; // Added setOpen prop for pinning
  }> = ({ activities, currentPath, className, onSummarizeChat, open, setOpen }) => {
    const [isHovered, setIsHovered] = useState(false);
    const effectiveOpen = open || isHovered;

    return (
      <motion.div
        animate={{ width: effectiveOpen ? "288px" : "68px" }} // w-72 is 288px, w-[68px] for collapsed
        className={cn("h-full relative z-30 hidden md:flex flex-col", className)} // Keep flex-col
        onMouseEnter={() => { if (!open) setIsHovered(true); }}
        onMouseLeave={() => { if (!open) setIsHovered(false); }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        <SidebarContent
          activities={activities}
          currentPath={currentPath}
          // className is applied by the motion.div wrapper
          onSummarizeChat={onSummarizeChat}
          open={effectiveOpen} // Pass effectiveOpen to SidebarContent
        />
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-1/2 -right-4 transform -translate-y-1/2 bg-card border rounded-full h-8 w-8 z-40 shadow-md hover:bg-muted",
            "transition-opacity duration-300",
            effectiveOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100" // Show on hover of parent if collapsed
          )}
          onClick={() => setOpen(!open)}
        >
          {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </motion.div>
    );
  };

  const MobileSidebarSheet: React.FC<{
    open: boolean,
    onOpenChange: (open: boolean) => void,
    activities: ActivityItem[],
    currentPath: string,
    onSummarizeChat?: () => void; // Added prop
  }> = ({ open, onOpenChange, activities, currentPath, onSummarizeChat }) => {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => onOpenChange(false)}>
        <div className="fixed inset-y-0 left-0 w-72 bg-card shadow-xl z-50" onClick={e => e.stopPropagation()}>
           <SidebarContent activities={activities} currentPath={currentPath} className="border-r" onSummarizeChat={onSummarizeChat} open={open} />
        </div>
      </div>
    );
  };


  return (
    <div className="flex h-screen bg-background">
      <DesktopSidebar
        activities={activities}
        currentPath={usePathname()}
        // className="w-72" // Width is now controlled by motion.div
        onSummarizeChat={handleSummarizeChat}
        open={sidebarOpen} // Pass ChatPage's sidebarOpen state
        setOpen={setSidebarOpen} // Pass ChatPage's setSidebarOpen function
      />
      <MobileSidebarSheet
        open={isMobile && sidebarOpen}
        onOpenChange={setSidebarOpen}
        activities={activities}
        currentPath={usePathname()}
        onSummarizeChat={handleSummarizeChat}
      />

      {/* Main Chat Area - This structure allows sidebar to be fixed on left, chat area takes remaining space */}
      <div className="flex-1 flex flex-col h-full p-0 md:p-4 justify-center items-center overflow-hidden">
        <Card className="w-full h-full flex flex-col shadow-lg rounded-none md:rounded-lg">
          <CardHeader className="border-b flex flex-row justify-between items-center">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </Button>
              <h1 className="text-xl font-semibold text-foreground">AI Chat Assistant</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadTranscript}>
                <Download className="w-4 h-4 mr-2" />
                Export Summary
              </Button>
              {/* Removed Side Panel Toggle Button that was here previously */}
            </div>
          </CardHeader>
          <CardContent className="flex-grow p-0">
            <ScrollArea className="h-[calc(100vh-14rem)] p-6"> {/* Adjusted height slightly */}
              {messages.map((msg) => (
                <div key={msg.id} className={`mb-4 flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <Avatar className="w-8 h-8 border">
                    <AvatarFallback><Bot size={18} /></AvatarFallback>
                  </Avatar>
                )}
                <div className={`p-3 rounded-lg max-w-[70%] shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground self-end'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs text-opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {msg.role === 'user' && (
                  <Avatar className="w-8 h-8 border">
                    <AvatarFallback><User size={18} /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 border-t">
          <div className="flex w-full items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleMicButtonClick}
              disabled={!isSpeechSupported || isLoading || isCameraActive} // Disable mic if camera is active
              aria-label={aiVoiceState === "listening" ? "Stop listening" : "Start listening"}
              className="shrink-0"
            >
              <Mic className={`h-5 w-5 ${aiVoiceState === "listening" || aiVoiceState === "processing" ? "text-destructive animate-pulse" : ""}`} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={isCameraActive ? stopCamera : startCamera}
              disabled={isLoading || aiVoiceState === "listening"}
              aria-label={isCameraActive ? "Stop camera" : "Start camera"}
              className={`shrink-0 ${isCameraActive ? "text-destructive animate-pulse" : ""}`}
            >
              <VideoIcon className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => setShowToolsMenu(!showToolsMenu)}
              aria-label="Toggle tools menu"
              disabled={isLoading}
            >
              <PlusIcon className={`h-5 w-5 transition-transform duration-200 ${showToolsMenu ? "rotate-45" : ""}`} />
            </Button>
            <Button variant="outline" size="icon" className="shrink-0"
              onClick={handlePaperclipClick}
              disabled={isLoading || isCameraActive || aiVoiceState === "listening"}
              aria-label="Attach image"
            >
              <Paperclip className={`h-5 w-5 ${uploadedImageBase64 ? "text-green-500" : ""}`} />
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            <Input
              type="text"
              placeholder={
                aiVoiceState === "listening" ? "Listening..." :
                isCameraActive ? "Webcam active. Add a message or send frame." :
                "Type your message or use the mic..."
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
              className="flex-grow"
              disabled={isLoading || aiVoiceState === "listening" || aiVoiceState === "processing"}
            />
            <Button onClick={() => handleSendMessage()} disabled={isLoading || inputValue.trim() === ''}>
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </CardFooter>
      </Card>
      {/* VoiceInputModal Integration */}
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
          theme={resolvedTheme === "dark" ? "dark" : "light"}
        />
      )}
      {showWebcamModal && (
        <WebcamModal
          videoRef={videoRef}
          canvasRef={canvasRef}
          isCameraActive={isCameraActive}
          onStopCamera={stopCamera}
          theme={resolvedTheme === "dark" ? "dark" : "light"}
        />
      )}
      {/* Basic Tools Menu Placeholder */}
      {showToolsMenu && (
        <div className="absolute bottom-20 left-4 mb-2 w-72 bg-background border rounded-lg shadow-xl p-4 z-20">
          <h3 className="text-sm font-semibold mb-2">Quick Tools</h3>
          <Button variant="ghost" className="w-full justify-start mb-1" onClick={() => portGenerateImageDescription(inputValue || "a beautiful sunset")}>
            Describe Image
          </Button>
          <Button variant="ghost" className="w-full justify-start mb-1" onClick={() => portHandleToolClick("search_web")}>
            Knowledge Search
          </Button>
          <Button variant="ghost" className="w-full justify-start mb-1" onClick={() => portHandleToolClick("run_deep_research")}>
            Deep Analysis
          </Button>
          <Button variant="ghost" className="w-full justify-start mb-1" onClick={() => portHandleToolClick("think_longer")}>
            Extended Thinking
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => portHandleToolClick("brainstorm_ideas")}>
            Brainstorm Ideas
          </Button>
           {generatingImage && ( // Reverted to generatingImage for this specific tool's context
            <div className="mt-2 flex items-center text-sm text-muted-foreground">
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Processing tool action...
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

// Removed the placeholder handleMicButtonClick from outside the component
// Imports for PlusIcon and Loader are now at the top.
