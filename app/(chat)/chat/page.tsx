"use client"

import { useState } from "react"
import { useChat } from "../hooks/useChat"
import { ChatHeader } from "./components/ChatHeader"
import { ChatPanel } from "./components/ChatPanel"
import { ActivityPanel } from "./components/ActivityPanel"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

export default function ChatPage() {
  const { messages, activities, isTyping, currentActivity, sendMessage, handleToolClick } = useChat()
  const [isActivityPanelOpen, setIsActivityPanelOpen] = useState(true)

  const toggleActivityPanel = () => {
    setIsActivityPanelOpen(!isActivityPanelOpen)
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <ChatHeader activities={activities} onToggleActivityPanel={toggleActivityPanel} />
      <main className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={100}>
            <ChatPanel
              messages={messages}
              isTyping={isTyping}
              currentActivity={currentActivity}
              sendMessage={sendMessage}
              handleToolClick={handleToolClick}
            />
          </ResizablePanel>
          {isActivityPanelOpen && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={25} maxSize={30} minSize={20} className="hidden md:block">
                <ActivityPanel activities={activities} />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </main>
    </div>
  )
}
