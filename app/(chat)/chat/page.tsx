"use client"

import { useState } from "react"
import { ChatHeader } from "./components/ChatHeader"
import { ActivityPanel } from "./components/ActivityPanel"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ChatProvider } from "./context/ChatProvider" // Import ChatProvider
import { ChatInterface } from "./components/ChatInterface" // Import ChatInterface

export default function ChatPage() {
  // The state for toggling the activity panel can remain here as it's a UI-specific state for this page
  const [isActivityPanelOpen, setIsActivityPanelOpen] = useState(true)

  const toggleActivityPanel = () => {
    setIsActivityPanelOpen(!isActivityPanelOpen)
  }

  return (
    <ChatProvider>
      {" "}
      {/* Wrap the entire chat layout with ChatProvider */}
      <div className="flex flex-col h-screen bg-background text-foreground">
        {/* ChatHeader will now consume ChatContext for activities */}
        <ChatHeader onToggleActivityPanel={toggleActivityPanel} />
        <main className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={100}>
              {/* ChatPanel will now consume ChatContext for messages, loading, etc. */}
              <ChatInterface /> {/* Render the ChatInterface component */}
            </ResizablePanel>
            {isActivityPanelOpen && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={25} maxSize={30} minSize={20} className="hidden md:block">
                  {/* ActivityPanel will now consume ChatContext for activities */}
                  <ActivityPanel />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </main>
      </div>
    </ChatProvider>
  )
}
