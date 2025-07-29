"use client"

import { ChatPageLayout } from "./components/new-ui/ChatPageLayout"
import { ChatSidebar } from "./components/new-ui/ChatSidebar"
import { ChatPanel } from "./components/new-ui/ChatPanel"
import { ChatModals } from "./components/ChatModals"
import { useChatContext } from "@/app/(chat)/chat/context/ChatProvider"

export default function ChatPage() {
  const { handleNewChat, activities } = useChatContext()

  return (
    <>
      <ChatPageLayout
        sidebar={<ChatSidebar activities={activities} onNewChat={handleNewChat} />}
        chatPanel={<ChatPanel />}
      />
      <ChatModals />
    </>
  )
}
