"use client"

import { useState } from "react"
import { ChatSidebar } from "./new-ui/ChatSidebar"
import { ChatPanel } from "./new-ui/ChatPanel"
import { ChatModals } from "./ChatModals"
import { useModalManager } from "../hooks/useModalManager"
import { useChatController } from "../hooks/useChatController"
import type { ActivityItem } from "../types/chat"

export function ChatInterface() {
  const { messages, isLoading, sendMessage, newChat } = useChatController()
  const { modals, openModal, closeModal } = useModalManager()

  // Mock activities - replace with real data
  const [activities] = useState<ActivityItem[]>([
    {
      id: "1",
      type: "lead_research",
      title: "Lead Research: Tech Startup",
      status: "completed",
      timestamp: new Date(),
      details: "Researched 15 potential leads in the tech sector",
    },
    {
      id: "2",
      type: "roi_calculation",
      title: "ROI Analysis: Q4 Campaign",
      status: "in_progress",
      timestamp: new Date(),
      details: "Calculating returns for marketing campaign",
    },
  ])

  const handleToolClick = (tool: string) => {
    switch (tool) {
      case "roi-calc":
        openModal("roi")
        break
      case "research":
        openModal("research")
        break
      case "analysis":
        openModal("analysis")
        break
      case "leads":
        openModal("leads")
        break
      case "meeting":
        openModal("meeting")
        break
      case "upload":
        openModal("upload")
        break
      case "screen":
        openModal("screen")
        break
      default:
        console.log(`Tool clicked: ${tool}`)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="w-80 shrink-0">
        <ChatSidebar activities={activities} onNewChat={newChat} />
      </div>

      <div className="flex-1">
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          onSendMessage={sendMessage}
          onToolClick={handleToolClick}
        />
      </div>

      <ChatModals modals={modals} onClose={closeModal} />
    </div>
  )
}
