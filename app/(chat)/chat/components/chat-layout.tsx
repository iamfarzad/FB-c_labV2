import type * as React from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

interface ChatLayoutProps {
  sidebar: React.ReactNode
  chatPanel: React.ReactNode
}

export function ChatLayout({ sidebar, chatPanel }: ChatLayoutProps) {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full max-h-screen w-full items-stretch">
      <ResizablePanel defaultSize={265} minSize={20} maxSize={30} className="hidden md:block">
        {sidebar}
      </ResizablePanel>
      <ResizableHandle withHandle className="hidden md:flex" />
      <ResizablePanel defaultSize={1000}>{chatPanel}</ResizablePanel>
    </ResizablePanelGroup>
  )
}
