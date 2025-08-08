"use client"

import { DemoSessionProvider } from "@/components/demo-session-manager"
import { PageShell } from "@/components/page-shell"
import { AIEChat } from "@/components/chat/AIEChat"

export default function ChatPage() {
  return (
    <DemoSessionProvider>
      <PageShell variant="fullscreen">
        <div className="h-[100dvh]">
          <AIEChat />
        </div>
      </PageShell>
    </DemoSessionProvider>
  )
}
