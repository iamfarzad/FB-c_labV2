"use client"

import { ChatPageLayout } from "./components/new-ui/ChatPageLayout"
import { ChatSidebar } from "./components/new-ui/ChatSidebar"
import { ChatPanel } from "./components/new-ui/ChatPanel"
import { ChatModals } from "./components/ChatModals"
import { useChatContext } from "@/app/(chat)/chat/context/ChatProvider"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"

export default function ChatPage() {
  const { handleNewChat, handleDownloadSummary, openModal, activities, addMessage } = useChatContext()

  const handleTransferToChat = (content: string) => {
    addMessage({
      id: Date.now().toString(),
      role: "user",
      content: `Data from modal: ${content}`,
      createdAt: new Date(),
    })
  }

  useKeyboardShortcuts({
    onNewChat: handleNewChat,
    onExportSummary: handleDownloadSummary,
    onToggleSidebar: () => {},
    onFocusInput: () => {},
    onOpenVoice: () => openModal("voiceInput"),
    onOpenCamera: () => openModal("webcam"),
    onOpenScreenShare: () => openModal("screenShare"),
  })

  return (
    <>
      <ChatPageLayout
        sidebar={<ChatSidebar activities={activities} onNewChat={handleNewChat} />}
        chatPanel={<ChatPanel />}
      />
      <ChatModals
        onTransferToChat={handleTransferToChat}
        onCapture={(data) => console.log("Capture data:", data)}
        onAnalysis={(analysis) => console.log("Analysis:", analysis)}
      />
    </>
  )
}
