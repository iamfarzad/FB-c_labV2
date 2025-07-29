"use client"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ChatSidebar } from "./ChatSidebar"
import { ChatPanel } from "./ChatPanel"
import { useChatContext } from "../../context/ChatProvider"

export function ChatPageLayout() {
  const { activities, handleNewChat } = useChatContext()

  return (
    <div className="h-screen w-screen bg-background text-foreground overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
          <ChatSidebar activities={activities} onNewChat={handleNewChat} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75}>
          <ChatPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
