"use client"

import { PageShell } from "@/components/page-shell"
import { AIEChat } from "@/components/chat/AIEChat"

export default function TestCollabChatPage() {
  return (
    <PageShell variant="fullscreen">
      <div className="h-[100dvh]">
        <AIEChat />
      </div>
    </PageShell>
  )
}


