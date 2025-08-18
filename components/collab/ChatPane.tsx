"use client"

import React, { useMemo } from "react"
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import { Message, MessageContent } from "@/components/ai-elements/message"
import { Response } from "@/components/ai-elements/response"
import { Reasoning, ReasoningTrigger, ReasoningContent } from "@/components/ai-elements/reasoning"
import { BottomDock } from "@/components/collab/BottomDock"
import useChat from "@/hooks/chat/useChat"

interface ChatPaneProps {
  className?: string
  sessionId?: string | null
  onAfterSend?: (text: string) => void
}

export function ChatPane({ className, sessionId, onAfterSend }: ChatPaneProps) {
  const { messages, input, setInput, isLoading, sendMessage, clearMessages } = useChat({ data: { enableLeadGeneration: false, sessionId: sessionId ?? undefined } })

  const uiMessages = useMemo(() => messages.map(m => ({ id: m.id, role: m.role, text: m.content })), [messages])

  return (
    <div className={className}>
      <div className="h-[58vh] md:h-[60vh] rounded-xl border bg-card overflow-hidden">
        <Conversation className="h-full">
          <ConversationContent className="w-full max-w-3xl mx-auto space-y-3 p-4">
            {uiMessages.length === 0 && !isLoading && (
              <div className="text-center text-sm text-muted-foreground py-10">Start the conversation below</div>
            )}
            {uiMessages.map(m => (
              <Message key={m.id} from={m.role}>
                <MessageContent>
                  {m.role === 'assistant' && isLoading ? (
                    <Reasoning defaultOpen={false} isStreaming={true} duration={3}>
                      <ReasoningTrigger>Thinking…</ReasoningTrigger>
                      <ReasoningContent>Processing your input</ReasoningContent>
                    </Reasoning>
                  ) : null}
                  {!!m.text && <Response>{m.text}</Response>}
                </MessageContent>
              </Message>
            ))}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      <div className="mt-2">
        <BottomDock
          value={input}
          onChange={setInput}
          onSend={() => {
            const text = (input || '').trim()
            if (!text) return
            sendMessage(text)
            if (onAfterSend) onAfterSend(text)
          }}
          quick={[{ id: 'clear', label: 'Clear', onClick: () => clearMessages() }]}
        />
      </div>
    </div>
  )
}


