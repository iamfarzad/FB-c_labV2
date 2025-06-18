// components/AIShowcase.tsx
"use client"
import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  audioData?: string
  sources?: any[]
}

interface CompanyInfo {
  name?: string;
  domain?: string;
  analysis?: string;
}

interface ConversationState {
  sessionId: string
  name?: string
  email?: string
  companyInfo?: CompanyInfo
  stage: string
  messages: Message[]
  messagesInStage: number;
  aiGuidance?: string;
  sidebarActivity?: string;
  isLimitReached?: boolean;
  showBooking?: boolean;
  capabilitiesShown: string[]
}

interface SidebarActivity {
  activity: string
  message: string
  timestamp: number
  progress?: number
}

export default function AIShowcase() {
  const [conversationState, setConversationState] = useState<ConversationState>(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem('aiShowcase') : null; // Check for window
    return saved ? JSON.parse(saved) : {
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      stage: 'greeting',
      messages: [],
      messagesInStage: 0,
      capabilitiesShown: []
    }
  })

  const [sidebarActivity, setSidebarActivity] = useState<SidebarActivity | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [supabase] = useState(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))

  // Auto-save session state
  useEffect(() => {
    if (typeof window !== 'undefined') { // Check for window
      sessionStorage.setItem('aiShowcase', JSON.stringify(conversationState))
    }
  }, [conversationState])

  // Supabase realtime subscription
  useEffect(() => {
    const channel = supabase.channel('ai-showcase')

    channel.on('broadcast', { event: 'ai-response' }, (payload) => {
      const { text, audioData, sources, sidebarActivity, conversationState: newState } = payload.payload

      // Add AI message
      const aiMessage: Message = {
        id: Date.now().toString(),
        text,
        sender: 'ai',
        timestamp: new Date(),
        audioData,
        sources
      }

      setConversationState(prev => ({
        ...prev,
        ...newState,
        messages: [...prev.messages, aiMessage]
      }))

      // Play audio if available
      if (audioData) {
        const audio = new Audio(`data:audio/mpeg;base64,${audioData}`)
        audio.play()
      }

      setIsLoading(false)
    })

    channel.on('broadcast', { event: 'sidebar-update' }, (payload) => {
      setSidebarActivity(payload.payload)
    })

    channel.subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [supabase]) // Added supabase to dependency array

  // Initial AI greeting
  useEffect(() => {
    if (conversationState.messages.length === 0) {
      const greeting: Message = {
        id: '1',
        text: "Hi! I'm here to showcase how AI can transform your business. What's your name?",
        sender: 'ai',
        timestamp: new Date()
      }
      setConversationState(prev => ({
        ...prev,
        messages: [greeting]
      }))
    }
  }, []) // Removed conversationState from dependency array to avoid re-triggering

  const handleSendMessage = async (message: string) => {
    setIsLoading(true)

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    }

    // Update conversation state based on message
    let newState = { ...conversationState }
    newState.messages = [...newState.messages, userMessage]
    newState.messagesInStage = (newState.messagesInStage || 0) + 1;

    if (newState.stage === 'greeting' && !newState.name) {
      newState.name = message
      newState.stage = 'email_request'
    } else if (newState.stage === 'email_request' && message.includes('@')) {
      newState.email = message
      newState.stage = 'email_collected'
    }

    setConversationState(newState)

    try {
      // Send to AI API - ALIGNED WITH NEW BACKEND
      const response = await fetch('/api/gemini-proxy?action=conversationalFlow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: message,
          currentConversationState: newState,
          messageCount: newState.messages.length,
          includeAudio: true
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'API request failed') // Added default error message
      }

      // Response handled via Supabase realtime

    } catch (error) {
      console.error('Error sending message:', error)
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble processing your message. Please try again.",
        sender: 'ai',
        timestamp: new Date()
      }
      setConversationState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage]
      }))
      setIsLoading(false)
    }
  }

  const triggerCapabilityDemo = async (capability: string) => {
    const demos: { [key: string]: string } = { // Added index signature
      'image_generation': 'Generate a business visualization for my industry',
      'video_analysis': 'Analyze this YouTube video for business insights: https://youtube.com/watch?v=example',
      'document_analysis': 'Analyze a business document for optimization opportunities',
      'code_execution': 'Calculate the potential ROI for implementing an AI solution in my business.',
      'url_analysis': 'Analyze my company website for AI opportunities',
      'screen_analysis': 'Screen analysis'
    }

    if (demos[capability]) {
      // Call the appropriate API endpoint for the capability
      let action = '';
      let body: any = { prompt: demos[capability], sessionId: conversationState.sessionId };

      switch (capability) {
        case 'image_generation':
          action = 'generateImage';
          body.prompt = 'Generate a compelling business visualization for my industry.';
          break;
        case 'video_analysis': {
          // Extract URL for video analysis
          const videoUrlMatch = demos[capability].match(/https:\/\/[^\s]+/);
          if (videoUrlMatch) {
            const videoUrl = videoUrlMatch[0];
            body.videoUrl = videoUrl;
            body.prompt = `Analyze this YouTube video for business insights: ${videoUrl}`;
          }
          break;
        }
        case 'document_analysis':
          // For document analysis, you'd typically have a file upload mechanism.
          // This is a placeholder for how you might trigger it.
          // You'll need to handle documentData and mimeType.
          body.documentData = "base64_encoded_document_data_placeholder"; // Placeholder
          body.mimeType = "application/pdf"; // Placeholder
          break;
        case 'code_execution':
          action = 'executeCode';
          body.prompt = 'Calculate the potential ROI for implementing an AI solution in my business.';
          body.businessContext = "General business calculation";
          break;
        case 'url_analysis':
          action = 'analyzeURL';
          const urlToAnalyze = prompt("Please enter your company's website URL to analyze:", "https://www.google.com");
          if (!urlToAnalyze) {
              setIsLoading(false);
              return;
          }
          body.urlContext = urlToAnalyze;
          body.prompt = `Analyze ${urlToAnalyze} for AI opportunities.`;
          break;
        case 'screen_analysis':
            // Placeholder for screen analysis logic
            console.log("Screen analysis triggered");
            // You would add screen capture logic here
            return;
        default:
          // Fallback to conversational flow if action is not specific
          await handleSendMessage(demos[capability]);
          return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/gemini-proxy?action=${action}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...body, currentConversationState: conversationState })
        });
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || `Failed to trigger ${capability}`);
        }
        // AI response (including sidebar updates) will be handled by Supabase broadcast
      } catch (error) {
        console.error(`Error triggering ${capability}:`, error);
        const errMessage: Message = {
          id: Date.now().toString(),
          text: `Sorry, I couldn't demonstrate ${capability} right now.`,
          sender: 'ai',
          timestamp: new Date(),
        };
        setConversationState(prev => ({ ...prev, messages: [...prev.messages, errMessage] }));
        setIsLoading(false);
      }
    }
  };


  const completeShowcase = async () => {
    // Logic to send final conversation state for lead capture
    setIsLoading(true);
    try {
        const response = await fetch('/api/gemini-proxy?action=leadCapture', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentConversationState: conversationState })
        });
        const result = await response.json();
        if (result.success) {
            // The backend now sends a final message via Supabase, so we just wait for it.
            console.log("Lead capture initiated successfully.");
        } else {
            throw new Error(result.error || "Failed to complete showcase.");
        }
    } catch (error) {
        console.error("Error completing showcase:", error);
        alert("There was an error completing the showcase. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar - AI Activity Monitor */}
      <div className="w-1/4 bg-gray-200 dark:bg-gray-800 p-4 overflow-y-auto">
        <Sidebar
          capabilities={['image_generation', 'video_analysis', 'document_analysis', 'code_execution', 'url_analysis', 'screen_analysis']}
          onCapabilityClick={triggerCapabilityDemo}
          activity={sidebarActivity}
        />
        <button
            onClick={completeShowcase}
            disabled={isLoading}
            className="mt-4 w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-400"
        >
            Complete Showcase & Send Summary
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4">
          <h1 className="text-xl font-bold">F.B/c AI Showcase</h1>
          <p className="text-sm text-gray-600">Experience the future of business AI in real-time</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversationState.messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-md ${ // Added shadow
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-800' // Adjusted AI message style
              }`}>
                <div className="text-sm whitespace-pre-wrap">{message.text}</div>

                {/* Audio playback */}
                {message.audioData && (
                  <audio controls className="mt-2 w-full h-10"> {/* Adjusted audio player size */}
                    <source src={`data:audio/mpeg;base64,${message.audioData}`} type="audio/mpeg"/> {/* Added type */}
                  </audio>
                )}

                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-2 text-xs">
                    <div className="font-semibold mb-1">Sources:</div> {/* Added mb-1 */}
                    {message.sources.map((source, index) => (
                      <a key={index} href={source.url} target="_blank" rel="noopener noreferrer"
                         className="text-blue-700 hover:underline block truncate"> {/* Adjusted link color and added truncate */}
                        {source.title || source.url} {/* Show URL if title is missing */}
                      </a>
                    ))}
                  </div>
                )}

                <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'}`}> {/* Adjusted timestamp color */}
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-md">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <ChatInput onSend={handleSendMessage} disabled={isLoading || conversationState.stage === 'completed'} />
      </div>
    </div>
  )
}

// Chat Input Component
interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage('')
    }
  }

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={disabled ? "Showcase completed. Thank you!" : "Type your message..."} // Updated placeholder
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-150" // Added transition
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed" // Added focus styles and transition
        >
          Send
        </button>
      </form>
    </div>
  )
}
