// components/AIShowcase.tsx
"use client"
import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  audioData?: string
  sources?: any[]
}

interface ConversationState {
  sessionId: string
  name?: string
  email?: string
  companyInfo?: any
  stage: string
  messages: Message[]
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

    if (newState.stage === 'greeting' && !newState.name) {
      newState.name = message
      newState.stage = 'email_request'
    } else if (newState.stage === 'email_request' && message.includes('@')) {
      newState.email = message
      newState.stage = 'email_collected'
    }

    setConversationState(newState)

    try {
      // Send to AI API
      const response = await fetch('/api/gemini-proxy?action=conversationalFlow', { // Ensure correct API endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: message,
          conversationState: newState,
          userInfo: {
            name: newState.name,
            email: newState.email,
            companyInfo: newState.companyInfo
          },
          messageCount: newState.messages.length,
          sessionId: newState.sessionId,
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
      'code_execution': 'Calculate ROI for implementing AI in my business',
      'url_analysis': 'Analyze my company website for AI opportunities'
    }

    if (demos[capability]) {
      // Call the appropriate API endpoint for the capability
      let action = '';
      let body: any = { prompt: demos[capability], sessionId: conversationState.sessionId };

      switch (capability) {
        case 'image_generation':
          action = 'generateImage';
          break;
        case 'video_analysis':
          action = 'analyzeVideo';
          // Extract URL for video analysis
          const videoUrlMatch = demos[capability].match(/https:\/\/[^\s]+/);
          if (videoUrlMatch) {
            body.videoUrl = videoUrlMatch[0];
            body.prompt = demos[capability].replace(videoUrlMatch[0], '').trim();
          }
          break;
        case 'document_analysis':
          action = 'analyzeDocument';
          // For document analysis, you'd typically have a file upload mechanism.
          // This is a placeholder for how you might trigger it.
          // You'll need to handle documentData and mimeType.
          body.documentData = "base64_encoded_document_data_placeholder"; // Placeholder
          body.mimeType = "application/pdf"; // Placeholder
          break;
        case 'code_execution':
          action = 'executeCode';
          body.businessContext = "General business calculation";
          break;
        case 'url_analysis':
          action = 'analyzeURL';
           const urlMatch = demos[capability].match(/https:\/\/[^\s]+/);
          if (urlMatch) {
            body.urlContext = urlMatch[0];
            body.prompt = demos[capability].replace(urlMatch[0], '').trim();
          }
          break;
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
          body: JSON.stringify(body)
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
    if (!conversationState.name || !conversationState.email) return

    setIsLoading(true); // Set loading true
    try {
      const response = await fetch('/api/gemini-proxy?action=leadCapture', { // Ensure correct API endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: conversationState.messages,
          userInfo: {
            name: conversationState.name,
            email: conversationState.email,
            companyInfo: conversationState.companyInfo
          },
          action: 'generate_summary' // This action is handled within leadCapture in the backend
        })
      })

      const result = await response.json()

      if (result.success && result.data) { // Check for result.data
        // Show completion message with booking CTA
        const completionMessage: Message = {
          id: Date.now().toString(),
          text: `Perfect! I've created your personalized AI consultation summary and sent it to ${conversationState.email}.

Your AI readiness score: ${result.data.leadScore}/100

Ready to implement these AI solutions in your business? Let's schedule your free strategy session to create a custom roadmap for your success!

[Book Your Free Consultation] 📅`, // Make sure this link is replaced or handled
          sender: 'ai',
          timestamp: new Date()
        }

        setConversationState(prev => ({
          ...prev,
          messages: [...prev.messages, completionMessage],
          stage: 'completed'
        }))
      } else {
        throw new Error(result.error || "Failed to complete showcase");
      }
    } catch (error) {
      console.error('Error completing showcase:', error)
      const errMessage: Message = { // Add error message to chat
          id: Date.now().toString(),
          text: "Sorry, I couldn't complete the showcase and generate your summary at this time. Please try again.",
          sender: 'ai',
          timestamp: new Date(),
        };
        setConversationState(prev => ({ ...prev, messages: [...prev.messages, errMessage] }));
    } finally {
        setIsLoading(false); // Set loading false
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - AI Activity Monitor */}
      <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto"> {/* Added overflow-y-auto */}
        <h3 className="font-bold text-lg mb-4">🤖 AI Activity Monitor</h3>

        {/* Capabilities Demonstrated */}
        <div className="mb-6">
          <h4 className="font-semibold mb-2">Capabilities Showcased:</h4>
          <div className="space-y-1">
            {conversationState.capabilitiesShown.map((capability, index) => (
              <div key={index} className="text-sm text-green-600 flex items-center">
                ✅ {capability}
              </div>
            ))}
          </div>
        </div>

        {/* Current Activity */}
        {sidebarActivity && (
          <div className="mb-6 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">Current Activity:</h4>
            <div className="text-sm text-blue-800">
              {sidebarActivity.message}
              {sidebarActivity.progress && ( // Display progress if available
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-1">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${sidebarActivity.progress}%` }}></div>
                </div>
              )}
            </div>
            <div className="mt-2 text-xs text-blue-600">
              {new Date(sidebarActivity.timestamp).toLocaleTimeString()}
            </div>
          </div>
        )}

        {/* Quick Capability Demos */}
        <div className="mb-6">
          <h4 className="font-semibold mb-2">Try AI Capabilities:</h4>
          <div className="space-y-2">
            <button
              onClick={() => triggerCapabilityDemo('image_generation')}
              className="w-full text-left text-sm p-2 bg-purple-50 hover:bg-purple-100 rounded disabled:opacity-50"
              disabled={isLoading || conversationState.stage === 'completed'}
            >
              🎨 Image Generation
            </button>
            <button
              onClick={() => triggerCapabilityDemo('video_analysis')}
              className="w-full text-left text-sm p-2 bg-red-50 hover:bg-red-100 rounded disabled:opacity-50"
              disabled={isLoading || conversationState.stage === 'completed'}
            >
              🎥 Video Analysis
            </button>
            <button
              onClick={() => triggerCapabilityDemo('document_analysis')}
              className="w-full text-left text-sm p-2 bg-green-50 hover:bg-green-100 rounded disabled:opacity-50"
              disabled={isLoading || conversationState.stage === 'completed'}
            >
              📄 Document Processing
            </button>
            <button
              onClick={() => triggerCapabilityDemo('code_execution')}
              className="w-full text-left text-sm p-2 bg-yellow-50 hover:bg-yellow-100 rounded disabled:opacity-50"
              disabled={isLoading || conversationState.stage === 'completed'}
            >
              ⚡ Code Execution
            </button>
            <button
              onClick={() => triggerCapabilityDemo('url_analysis')}
              className="w-full text-left text-sm p-2 bg-indigo-50 hover:bg-indigo-100 rounded disabled:opacity-50"
              disabled={isLoading || conversationState.stage === 'completed'}
            >
              🌐 Website Analysis
            </button>
          </div>
        </div>

        {/* Complete Showcase Button */}
        {conversationState.name && conversationState.email && conversationState.messages.length > 2 && conversationState.stage !== 'completed' && ( // Adjusted messages.length condition
          <button
            onClick={completeShowcase}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading}
          >
            🎯 Complete AI Showcase & Get Summary
          </button>
        )}
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
