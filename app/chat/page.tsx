"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { VoiceInputModal } from "@/components/voice-input-modal"
import { WebcamModal } from "@/components/webcam-modal"
import { ChatSidePanel } from "@/components/chat-side-panel"
import { DynamicDataRenderer } from "@/components/dynamic-data-renderer"
import { parseDataFromText, createDataItem } from "@/lib/data-parser"
import type { DataItem } from "@/lib/data-types"
import {
  Send,
  Plus,
  Sun,
  Moon,
  ImageIcon,
  Search,
  Brain,
  Loader,
  Mic,
  Video,
  MessageSquare,
  Lightbulb,
  Copy,
  PanelRightOpen,
  PanelRightClose,
  ArrowLeft,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import { VideoLearningModal } from "@/components/video-learning-modal"
import { VideoLearningCard } from "@/components/video-learning-card"
import Link from "next/link"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  imageUrl?: string
  dataItems?: DataItem[]
  isError?: boolean
  isWelcome?: boolean
}

// Main chat component with error boundary
const ChatPageWithErrorBoundary = () => (
  <ErrorBoundary
    fallback={
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
        <Alert variant="destructive" className="max-w-2xl">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Chat Unavailable</AlertTitle>
          <AlertDescription>
            We're having trouble loading the chat. This could be due to high demand or temporary service issues.
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/contact">Contact Support</a>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    }
  >
    <ChatPage />
  </ErrorBoundary>
)

// Main chat component
function ChatPage() {
  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">("light")

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Try to load messages from session storage
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('chatMessages')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Tools menu state
  const [showToolsMenu, setShowToolsMenu] = useState(false)

  // Speech Recognition state
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [currentTranscription, setCurrentTranscription] = useState("")
  const [aiVoiceState, setAiVoiceState] = useState<"listening" | "processing" | "idle" | "error">("idle")

  // Speech Recognition setup
  const isSpeechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const recognition = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (isSpeechSupported && typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      
      recognition.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setCurrentTranscription(transcript);
        setAiVoiceState('idle');
      };
      
      recognition.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setError('Error with speech recognition. Please try again.');
        setAiVoiceState('error');
      };
    }
    
    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, [isSpeechSupported]);

  // Speech Synthesis state
  const [audioQueue, setAudioQueue] = useState<string[]>([])
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  // Webcam state
  const [showWebcamModal, setShowWebcamModal] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [currentCameraFrame, setCurrentCameraFrame] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Side panel state
  const [showSidePanel, setShowSidePanel] = useState(false)
  const [summaryData, setSummaryData] = useState<any>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  // Image generation state
  const [generatingImage, setGeneratingImage] = useState(false)

  // Video Learning state
  const [showVideoLearning, setShowVideoLearning] = useState(false)

  // Video URL detection state
  const [detectedVideoUrl, setDetectedVideoUrl] = useState<string | null>(null)
  const [videoTitle, setVideoTitle] = useState<string>("")
  const [isGeneratingVideoApp, setIsGeneratingVideoApp] = useState(false)

  // Scroll to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Handle initial query parameter
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const params = new URLSearchParams(window.location.search);
      const query = params.get("q");
      if (query) {
        setInput(query);
        // Remove the query parameter to avoid resubmission on refresh
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (error) {
      console.error('Error handling query parameters:', error);
    }
  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-save messages to session storage
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('chatMessages', JSON.stringify(messages))
    }
  }, [messages])

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome-1',
        role: 'assistant',
        content: "Hi! I'm here to help you explore the power of AI. How can I assist you today?",
        timestamp: new Date().toISOString(),
        isWelcome: true
      }
      setMessages([welcomeMessage])
    }
  }, [])

  // Theme toggle
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
  }

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(theme)
  }, [theme])

  // Speech Recognition Setup
  useEffect(() => {
    if (isSpeechSupported && typeof window !== "undefined") {
      recognition.current = new SpeechRecognition()
      recognition.current.continuous = false
      recognition.current.interimResults = true
      recognition.current.lang = "en-US"

      recognition.current.onstart = () => {
        setAiVoiceState("listening")
        setCurrentTranscription("")
      }

      recognition.current.onresult = (event: any) => {
        let interimTranscript = ""
        let finalTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }

        setCurrentTranscription(interimTranscript || finalTranscript)

        if (finalTranscript) {
          setInput((prev) => (prev ? prev + " " : "") + finalTranscript)
        }
      }

      recognition.current.onend = () => {
        setAiVoiceState("processing")
        if (input.trim() || currentTranscription.trim()) {
          handleSendMessage()
        } else {
          setShowVoiceModal(false)
          setAiVoiceState("idle")
        }
      }

      recognition.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setAiVoiceState("error")
        setTimeout(() => setShowVoiceModal(false), 2000)
      }
    }

    return () => {
      if (recognition.current) {
        recognition.current.stop()
      }
    }
  }, [isSpeechSupported, input, currentTranscription])

  // Speech Synthesis
  const speakMessage = useCallback((text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setAudioQueue((prev) => [...prev, text])
    }
  }, [])

  useEffect(() => {
    const handleSpeak = () => {
      if (audioQueue.length > 0 && !isPlayingAudio && typeof window !== "undefined") {
        setIsPlayingAudio(true)
        const textToSpeak = audioQueue[0]
        const utterance = new SpeechSynthesisUtterance(textToSpeak)

        utterance.onend = () => {
          setIsPlayingAudio(false)
          setAudioQueue((prev) => prev.slice(1))
        }

        utterance.onerror = () => {
          setIsPlayingAudio(false)
          setAudioQueue((prev) => prev.slice(1))
        }

        window.speechSynthesis.speak(utterance)
      }
    }

    handleSpeak()

    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel()
      }
    }
  }, [audioQueue, isPlayingAudio])

  // Webcam functions
  const startCamera = async () => {
    setShowWebcamModal(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsCameraActive(true)
        captureIntervalRef.current = setInterval(captureFrame, 2000)
      }
    } catch (error) {
      console.error("Error accessing webcam:", error)
      setIsCameraActive(false)
      setShowWebcamModal(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const tracks = stream.getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setIsCameraActive(false)
      setCurrentCameraFrame(null)
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current)
      }
    }
    setShowWebcamModal(false)
  }

  const captureFrame = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (!context) return

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      if (canvas.width === 0 || canvas.height === 0) return

      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8)
      setCurrentCameraFrame(imageDataUrl.split(",")[1])
    }
  }, [])

  // Generate image function
  const generateImage = async (prompt: string) => {
    setShowToolsMenu(false)
    setGeneratingImage(true)

    try {
      const response = await fetch("/api/gemini-proxy?action=generateImage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      const result = await response.json()

      if (result.success && result.data) {
        const dataItems = [
          createDataItem("text", {
            text: `I've created a detailed description for your image request: "${prompt}"`,
            format: "markdown",
          }),
          createDataItem("text", {
            text: result.data.description,
            format: "markdown",
          }),
          createDataItem("text", {
            text: result.data.note,
            format: "markdown",
          }),
        ]

        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: `I've created a detailed description for your image request: "${prompt}"\n\n${result.data.description}\n\n${result.data.note}`,
          timestamp: new Date().toISOString(),
          dataItems,
        }
        setMessages((prev) => [...prev, newMessage])
      }
    } catch (error) {
      console.error("Error generating image description:", error)
      const errorDataItem = createDataItem("error", {
        message: "Sorry, I encountered an error while creating the image description. Please try again.",
      })

      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, I encountered an error while creating the image description. Please try again.",
        timestamp: new Date().toISOString(),
        dataItems: [errorDataItem],
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setGeneratingImage(false)
    }
  }

  // Handle send message with Gemini API
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const messageToSend = input.trim() || currentTranscription.trim();
    
    if (!messageToSend) {
      if (showVoiceModal) {
        setShowVoiceModal(false);
        setAiVoiceState("idle");
      }
      return;
    }
    
    setError(null);
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: messageToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setCurrentTranscription("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          imageData: null,
          cameraFrame: isCameraActive ? currentCameraFrame : null,
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No reader available")

      let assistantMessage = ""
      const assistantMessageId = (Date.now() + 1).toString()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                assistantMessage += data.content

                // Parse the message content into data items
                const dataItems = parseDataFromText(assistantMessage)

                setMessages((prev) => {
                  const newMessages = [...prev]
                  const existingIndex = newMessages.findIndex((m) => m.id === assistantMessageId)

                  if (existingIndex >= 0) {
                    newMessages[existingIndex] = {
                      ...newMessages[existingIndex],
                      content: assistantMessage,
                      dataItems,
                    }
                  } else {
                    newMessages.push({
                      id: assistantMessageId,
                      role: "assistant",
                      content: assistantMessage,
                      timestamp: new Date().toISOString(),
                      dataItems,
                    })
                  }

                  return newMessages
                })
              }
            } catch (e) {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }

      if (assistantMessage) {
        speakMessage(assistantMessage)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setError("Failed to send message. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle voice input
  const toggleVoiceInput = () => {
    if (!isSpeechSupported || !recognition.current) {
      setError("Speech recognition is not supported in your browser");
      return;
    }

    try {
      if (aiVoiceState === "listening") {
        recognition.current.stop();
        setAiVoiceState("idle");
      } else {
        setAiVoiceState("listening");
        setCurrentTranscription("");
        recognition.current.start();
      }
    } catch (error) {
      console.error('Error with speech recognition:', error);
      setError('Failed to access microphone. Please check permissions.');
      setAiVoiceState('error');
    }
  }

  // Download/copy functions
  const handleDownload = (content: string, type: "text" | "image") => {
    if (type === "text" && typeof window !== "undefined") {
      navigator.clipboard
        .writeText(content)
        .then(() => {
          console.log("Text copied to clipboard")
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err)
        })
    }
  }

  // Code execution handler
  const handleCodeExecute = (code: string, language: string) => {
    console.log(`Executing ${language} code:`, code)
    // Here you could implement actual code execution
    // For now, just log it
  }

  // Side panel functions
  const handleSummarizeChat = async () => {
    setSummaryLoading(true)
    setSummaryError(null)

    try {
      const response = await fetch("/api/gemini-proxy?action=summarizeChat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationHistory: messages }),
      })

      const result = await response.json()

      if (result.success) {
        setSummaryData(result.data)
      } else {
        setSummaryError(result.error || "Failed to generate summary")
      }
    } catch (error) {
      setSummaryError("Failed to generate summary")
    } finally {
      setSummaryLoading(false)
    }
  }

  const handleDownloadTranscript = () => {
    const transcript = messages.map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`).join("\n\n")

    const blob = new Blob([transcript], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "chat-transcript.txt"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // YouTube URL detection
  const detectYouTubeUrl = (text: string): string | null => {
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    const match = text.match(youtubeRegex)
    return match ? match[0] : null
  }

  const getVideoTitle = async (url: string): Promise<string> => {
    try {
      const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
      const response = await fetch(oEmbedUrl)
      if (response.ok) {
        const data = await response.json()
        return data.title || "YouTube Video"
      }
    } catch (error) {
      console.error("Failed to fetch video title:", error)
    }
    return "YouTube Video"
  }

  const handleGenerateVideoApp = async (videoUrl: string) => {
    setIsGeneratingVideoApp(true)
    setShowVideoLearning(true)
    // The video learning modal will handle the generation
    setIsGeneratingVideoApp(false)
  }

  // Detect YouTube URLs in input
  useEffect(() => {
    const detectedUrl = detectYouTubeUrl(input)
    if (detectedUrl && detectedUrl !== detectedVideoUrl) {
      setDetectedVideoUrl(detectedUrl)
      getVideoTitle(detectedUrl).then(setVideoTitle)
    } else if (!detectedUrl && detectedVideoUrl) {
      setDetectedVideoUrl(null)
      setVideoTitle("")
    }
  }, [input, detectedVideoUrl])

  return (
    <div
      className="flex flex-col h-screen font-sans"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      {/* Voice Input Modal */}
      {showVoiceModal && (
        <VoiceInputModal
          isListening={aiVoiceState === "listening"}
          currentTranscription={currentTranscription}
          aiState={aiVoiceState}
          onClose={handleMicButtonClick}
          theme={theme}
        />
      )}

      {/* Webcam Input Modal */}
      {showWebcamModal && (
        <WebcamModal
          videoRef={videoRef}
          canvasRef={canvasRef}
          isCameraActive={isCameraActive}
          onStopCamera={stopCamera}
          theme={theme}
        />
      )}

      {/* Video Learning Modal */}
      <VideoLearningModal isOpen={showVideoLearning} onClose={() => setShowVideoLearning(false)} theme={theme} />

      <div className="flex h-full">
        {/* Main Chat Container */}
        <div className={`flex flex-col h-full transition-all duration-300 ${showSidePanel ? "w-2/3" : "w-full"}`}>
          {/* Header */}
          <header className="flex items-center justify-between p-6 glassmorphism shadow-lg relative z-10 border-b border-[var(--glass-border)]">
            <div className="flex items-center space-x-3">
              <Link
                href="/"
                className="p-2 rounded-xl glassmorphism hover:surface-glow transition-all duration-300 text-[var(--text-primary)] group"
                aria-label="Back to home"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              </Link>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] flex items-center justify-center shadow-lg">
                <MessageSquare size={16} className="text-white" />
              </div>
              <h1 className="text-xl font-bold gradient-text">F.B/c AI Chat</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSidePanel(!showSidePanel)}
                className="p-3 rounded-xl glassmorphism hover:surface-glow transition-all duration-300 text-[var(--text-primary)] group"
                aria-label="Toggle side panel"
              >
                {showSidePanel ? (
                  <PanelRightClose size={20} className="group-hover:scale-110 transition-transform" />
                ) : (
                  <PanelRightOpen size={20} className="group-hover:scale-110 transition-transform" />
                )}
              </button>
              <button
                onClick={() => setShowVideoLearning(!showVideoLearning)}
                className="p-3 rounded-xl glassmorphism hover:surface-glow transition-all duration-300 text-[var(--text-primary)] group"
                aria-label="Toggle video learning"
              >
                <Video size={20} className="group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={toggleTheme}
                className="p-3 rounded-xl glassmorphism hover:surface-glow transition-all duration-300 text-[var(--text-primary)] group"
                aria-label="Toggle theme"
              >
                {theme === "light" ? (
                  <Moon size={20} className="group-hover:rotate-12 transition-transform" />
                ) : (
                  <Sun size={20} className="group-hover:rotate-12 transition-transform" />
                )}
              </button>
            </div>
          </header>

          {/* Main Chat Area */}
          <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-32 no-scrollbar">
            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="flex justify-center items-center h-full">
                <div className="text-center space-y-4 max-w-md">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] flex items-center justify-center mx-auto shadow-lg">
                    <MessageSquare size={32} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold gradient-text">Welcome to F.B/c AI</h2>
                  <p className="text-[var(--text-primary)] opacity-70">
                    Start a conversation with your intelligent assistant. Use voice, text, or camera input.
                  </p>
                </div>
              </div>
            )}

            {/* Video Learning Card */}
            {detectedVideoUrl && (
              <div className="mb-4 fade-in">
                <VideoLearningCard
                  videoUrl={detectedVideoUrl}
                  videoTitle={videoTitle}
                  onGenerateApp={handleGenerateVideoApp}
                  theme={theme}
                  isGenerating={isGeneratingVideoApp}
                />
              </div>
            )}

            {/* Messages */}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`rounded-2xl p-4 max-w-[80%] md:max-w-[60%] chat-bubble transition-all duration-300 fade-in ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] text-[var(--color-text-on-orange)] rounded-br-md ml-auto"
                      : "glassmorphism text-[var(--text-primary)] rounded-bl-md"
                  }`}
                >
                  {/* Use Dynamic Data Renderer for assistant messages with data items */}
                  {msg.role === "assistant" && msg.dataItems ? (
                    <DynamicDataRenderer data={msg.dataItems} theme={theme} onCodeExecute={handleCodeExecute} />
                  ) : msg.imageUrl ? (
                    <>
                      <p className="text-sm mb-2">{msg.content}</p>
                      <img
                        src={msg.imageUrl || "/placeholder.svg"}
                        alt="Generated content"
                        className="rounded-lg max-w-full h-auto mb-2"
                      />
                    </>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}

                  {msg.role === "assistant" && (
                    <div className="flex justify-end gap-2 text-sm mt-2">
                      <button
                        onClick={() => handleDownload(msg.content, "text")}
                        className="flex items-center bg-[var(--color-orange-accent)] text-[var(--color-text-on-orange)] hover:bg-[var(--color-orange-accent-hover)] rounded-full px-3 py-1 text-xs transition-colors duration-200"
                      >
                        <Copy size={14} className="mr-1" /> Copy
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-xl p-3 glassmorphism text-[var(--text-primary)] rounded-bl-none shadow-lg">
                  <div className="flex items-center space-x-2">
                    <Loader size={20} className="animate-spin text-[var(--color-orange-accent)]" />
                    <span>AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {generatingImage && (
              <div className="flex justify-start">
                <div className="rounded-xl p-3 glassmorphism text-[var(--text-primary)] rounded-bl-none shadow-lg">
                  <div className="flex items-center space-x-2">
                    <ImageIcon size={20} className="animate-pulse text-[var(--color-orange-accent)]" />
                    <span>Generating image...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </main>

          {/* Input Bar */}
          <div className="p-6 glassmorphism shadow-2xl flex items-center space-x-3 z-10 border-t border-[var(--glass-border)]">
            <button
              onClick={() => setShowToolsMenu(!showToolsMenu)}
              className="p-3 rounded-xl glass-button text-[var(--color-text-on-orange)] focus:outline-none focus:ring-4 focus:ring-[var(--color-orange-accent)]/30 transition-all duration-300"
              aria-label="Toggle tools menu"
            >
              <Plus size={24} />
            </button>

            <button
              onClick={handleMicButtonClick}
              className={`p-3 rounded-xl transition-all duration-300 ${
                aiVoiceState === "listening" || aiVoiceState === "processing"
                  ? "glass-button text-[var(--color-text-on-orange)] pulse-glow"
                  : "glassmorphism text-[var(--text-primary)] hover:surface-glow"
              } focus:outline-none focus:ring-4 focus:ring-[var(--color-orange-accent)]/30`}
              disabled={!isSpeechSupported}
              aria-label={aiVoiceState === "listening" ? "Stop listening" : "Start listening"}
            >
              <Mic size={24} />
            </button>

            <button
              onClick={() => {
                if (isCameraActive) stopCamera()
                else startCamera()
              }}
              className={`p-3 rounded-xl transition-all duration-300 ${
                isCameraActive
                  ? "glass-button text-[var(--color-text-on-orange)] pulse-glow"
                  : "glassmorphism text-[var(--text-primary)] hover:surface-glow"
              } focus:outline-none focus:ring-4 focus:ring-[var(--color-orange-accent)]/30`}
              aria-label={isCameraActive ? "Stop camera" : "Start camera"}
            >
              <Video size={24} />
            </button>

            <div className="flex-1 flex space-x-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Start typing a prompt or speak..."
                rows={1}
                className="flex-1 p-4 rounded-xl glassmorphism focus:ring-4 focus:ring-[var(--color-orange-accent)]/30 focus:surface-glow resize-none overflow-hidden max-h-32 text-[var(--text-primary)] placeholder-[var(--text-primary)]/50 transition-all duration-300"
                style={{ minHeight: "56px" }}
              />
              <button
                onClick={handleSendMessage}
                className="p-4 rounded-xl glass-button text-[var(--color-text-on-orange)] focus:outline-none focus:ring-4 focus:ring-[var(--color-orange-accent)]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  isLoading ||
                  generatingImage ||
                  (input.trim() === "" && currentTranscription.trim() === "" && !isCameraActive)
                }
                aria-label="Send message"
              >
                <Send size={24} />
              </button>
            </div>
          </div>

          {/* Tools Menu Overlay */}
          {showToolsMenu && (
            <div className="fixed bottom-32 left-6 w-72 glassmorphism rounded-2xl shadow-2xl p-6 z-20 flex flex-col space-y-3 slide-in border border-[var(--glass-border)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2 gradient-text">AI Tools</h3>
              <button
                onClick={() => generateImage(input || "a beautiful landscape")}
                className="flex items-center p-4 rounded-xl glassmorphism hover:surface-glow transition-all duration-300 text-left w-full text-[var(--text-primary)] group"
                disabled={generatingImage}
              >
                <div className="p-2 rounded-lg bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] mr-4">
                  <ImageIcon size={18} className="text-white" />
                </div>
                <div>
                  <div className="font-medium">Describe an image</div>
                  <div className="text-xs opacity-70">AI-powered visual description</div>
                </div>
              </button>
              <button
                onClick={() => handleToolClick("search_web")}
                className="flex items-center p-4 rounded-xl glassmorphism hover:surface-glow transition-all duration-300 text-left w-full text-[var(--text-primary)] group"
              >
                <div className="p-2 rounded-lg bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] mr-4">
                  <Search size={18} className="text-white" />
                </div>
                <div>
                  <div className="font-medium">Knowledge search</div>
                  <div className="text-xs opacity-70">Search AI knowledge base</div>
                </div>
              </button>
              <button
                onClick={() => handleToolClick("run_deep_research")}
                className="flex items-center p-4 rounded-xl glassmorphism hover:surface-glow transition-all duration-300 text-left w-full text-[var(--text-primary)] group"
              >
                <div className="p-2 rounded-lg bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] mr-4">
                  <Brain size={18} className="text-white" />
                </div>
                <div>
                  <div className="font-medium">Deep analysis</div>
                  <div className="text-xs opacity-70">Comprehensive research</div>
                </div>
              </button>
              <button
                onClick={() => handleToolClick("think_longer")}
                className="flex items-center p-4 rounded-xl glassmorphism hover:surface-glow transition-all duration-300 text-left w-full text-[var(--text-primary)] group"
              >
                <div className="p-2 rounded-lg bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] mr-4">
                  <Loader size={18} className="text-white" />
                </div>
                <div>
                  <div className="font-medium">Extended thinking</div>
                  <div className="text-xs opacity-70">Detailed elaboration</div>
                </div>
              </button>
              <button
                onClick={() => handleToolClick("brainstorm_ideas")}
                className="flex items-center p-4 rounded-xl glassmorphism hover:surface-glow transition-all duration-300 text-left w-full text-[var(--text-primary)] group"
              >
                <div className="p-2 rounded-lg bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] mr-4">
                  <Lightbulb size={18} className="text-white" />
                </div>
                <div>
                  <div className="font-medium">Brainstorm Ideas</div>
                  <div className="text-xs opacity-70">Creative concept generation</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Side Panel */}
        {showSidePanel && (
          <div className="w-1/3 h-full">
            <ChatSidePanel
              theme={theme}
              onClose={() => setShowSidePanel(false)}
              chatHistory={messages}
              onDownloadTranscript={handleDownloadTranscript}
              onSummarizeChat={handleSummarizeChat}
              onGenerateFollowUpBrief={handleSummarizeChat}
              summaryData={summaryData}
              isLoading={summaryLoading}
              summaryError={summaryError}
            />
          </div>
        )}
      </div>
    </div>
  )
}
