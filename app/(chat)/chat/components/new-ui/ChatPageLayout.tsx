"use client"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ChatSidebar } from "./ChatSidebar"
import { ChatPanel } from "./ChatPanel"

export function ChatPageLayout() {
  return (
    <div className="dark">
      <ResizablePanelGroup direction="horizontal" className="h-screen w-full bg-dark-900">
        <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
          <ChatSidebar />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75}>
          <ChatPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
