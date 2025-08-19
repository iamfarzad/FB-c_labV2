"use client"

import { PageShell } from "@/components/page-shell"
import { UnifiedChatInterface } from "@/components/chat/unified/UnifiedChatInterface"

export default function TestCollabChatPage() {
  return (
    <PageShell variant="fullscreen">
      <div className="h-[100dvh]">
        <UnifiedChatInterface messages={[]} isLoading={false} sessionId={null} mode="full" />
      </div>
    </PageShell>
  )
}


