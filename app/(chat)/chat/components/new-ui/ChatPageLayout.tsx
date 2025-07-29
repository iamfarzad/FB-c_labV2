"use client"

import type React from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

interface ChatPageLayoutProps {
  sidebar: React.ReactNode
  chatPanel: React.ReactNode
}

export function ChatPageLayout({ sidebar, chatPanel }: ChatPageLayoutProps) {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full w-full">
      <ResizablePanel defaultSize={25} minSize={20} maxSize={30} className="hidden md:block">
        {sidebar}
      </ResizablePanel>
      <ResizableHandle withHandle className="hidden md:flex" />
      <ResizablePanel defaultSize={75}>{chatPanel}</ResizablePanel>
    </ResizablePanelGroup>
  )
}
