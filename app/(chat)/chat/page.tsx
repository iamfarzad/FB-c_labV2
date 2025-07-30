"use client"

import { useChat } from "./hooks/useChat"
import { ChatHeader } from "./components/ChatHeader"
import { ChatPanel } from "./components/ChatPanel"
import { ActivityPanel } from "./components/ActivityPanel"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

export default function ChatPage() {
  const {
    messages,
    activities,
    isTyping,
    currentActivity,
    isActivityPanelOpen,
    sendMessage,
    handleToolClick,
    toggleActivityPanel,
  } = useChat()

  return (
    <div className="flex h-screen w-full flex-col bg-muted/40">
      <ChatHeader isActivityPanelOpen={isActivityPanelOpen} toggleActivityPanel={toggleActivityPanel} />
      <main className="flex flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
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
              <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
                <ActivityPanel activities={activities} />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </main>
    </div>
  )
}
