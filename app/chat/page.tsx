"use client"

import { useState, useRef } from "react"
import { ChatProvider, useChatContext } from "./context/ChatProvider"
import { ChatHeader } from "@/components/chat/layout/ChatHeader"
import { ChatMain } from "@/components/chat/layout/ChatMain"
import { ChatFooter } from "@/components/chat/layout/ChatFooter"
import { TimelineActivityLog } from "@/components/chat/activity/TimelineActivityLog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { ChatInput } from "@/components/chat/chat/ChatInput"
import { ChatMessages } from "@/components/chat/chat/ChatMessages"
import { sampleTimelineActivities } from "@/components/chat/Sidebar/sampleTimelineData"
import { useChat } from "@/app/chat/hooks/useChat"

function ChatPageContent() {
  const {
    messages,
    input,
    isLoading,
    activities,
    setInput,
    sendMessage,
    addActivity,
  } = useChatContext()
  
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleSendMessage = async () => {
    if (!input.trim()) return
    await sendMessage(input)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Handle download summary
  const handleDownloadSummary = () => {
    addActivity({
      type: 'generating',
      title: 'Summary Export',
      description: 'Generating PDF summary of chat conversation',
      status: 'in_progress'
    })
    
    // Simulate export process
    setTimeout(() => {
      addActivity({
        type: 'complete',
        title: 'Summary Downloaded',
        description: 'Chat summary has been exported successfully',
        status: 'completed'
      })
    }, 2000)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Header - Full width */}
      <div className="flex flex-col flex-1">
        <ChatHeader 
          onDownloadSummary={handleDownloadSummary}
        />
        
        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Chat content */}
          <div className="flex-1 flex flex-col">
            <ChatMain 
              messages={messages} 
              isLoading={isLoading} 
              messagesEndRef={messagesEndRef}
            />
            
            <ChatFooter
              input={input}
              setInput={setInput}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              onKeyPress={handleKeyPress}
            />
          </div>

          {/* Activity Sidebar - Right side */}
          <div
            className={cn(
              "relative border-l bg-background transition-all duration-300 overflow-hidden",
              sidebarOpen ? "w-[360px]" : "w-0"
            )}
          >
            {/* Sidebar content with activity log */}
            <div className={cn("w-[360px]", !sidebarOpen && "hidden")}>
              <TimelineActivityLog activities={activities} />
            </div>
          </div>

          {/* Sidebar Toggle Button - Attached to the edge */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(
              "absolute right-0 top-20 h-8 w-8 rounded-l-full rounded-r-none bg-background border border-r-0 shadow-md z-10",
              "hover:bg-accent hover:text-accent-foreground transition-colors"
            )}
          >
            {sidebarOpen ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <ChatProvider>
      <ChatPageContent />
    </ChatProvider>
  )
} 