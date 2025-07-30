"use client"

import { useChat } from "./hooks/useChat"
import { ChatHeader } from "./components/ChatHeader"
import { ChatPanel } from "./components/ChatPanel"
import { ActivityPanel } from "./components/ActivityPanel"

export default function ChatPage() {
  const { messages, input, setInput, isLoading, isTyping, currentActivity, activities, sendMessage, handleToolClick } =
    useChat()

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">
        <ChatHeader activities={activities} />
        <ChatPanel
          messages={messages}
          isTyping={isTyping}
          currentActivity={currentActivity}
          sendMessage={sendMessage}
          handleToolClick={handleToolClick}
        />
      </div>

      {/* Optional: Persistent Activity Panel for larger screens */}
      <aside className="hidden lg:flex flex-col w-80 border-l bg-muted/20">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Recent Activities</h2>
        </div>
        <ActivityPanel activities={activities} />
      </aside>
    </div>
  )
}
