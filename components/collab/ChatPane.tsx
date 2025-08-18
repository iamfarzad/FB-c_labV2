"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
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
  const { messages, input, setInput, isLoading, sendMessage, clearMessages, reload, deleteMessage } = useChat({ data: { enableLeadGeneration: false, sessionId: sessionId ?? undefined } })
  const [compact, setCompact] = useState(false)
  const contentRef = useRef<HTMLDivElement | null>(null)

  const uiMessages = useMemo(() => messages.map(m => ({ id: m.id, role: m.role, text: m.content, timestamp: m.timestamp, sources: (m as any).sources, citations: (m as any).citations })), [messages])
  const latestAssistantId = useMemo(() => {
    const last = [...messages].reverse().find(m => m.role === 'assistant')
    return last?.id
  }, [messages])

  // Subtle scroll anchoring: if near bottom when a new message arrives, keep anchored to bottom
  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight)
    const isNearBottom = distanceFromBottom < 80
    if (isNearBottom) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }
  }, [uiMessages.length])

  return (
    <div className={className}>
      <div className="h-[58vh] md:h-[60vh] rounded-xl border bg-card overflow-hidden">
        <div className="flex items-center justify-end p-2 text-xs">
          <button
            type="button"
            aria-pressed={compact}
            className="btn-minimal px-2 py-1"
            onClick={() => setCompact(v => !v)}
          >
            {compact ? 'Density: Compact' : 'Density: Comfortable'}
          </button>
        </div>
        <Conversation className="h-full">
          <ConversationContent ref={contentRef} className={`w-full max-w-3xl mx-auto ${compact ? 'space-y-2 p-3' : 'space-y-3 p-4'}`}>
            {uiMessages.length === 0 && !isLoading && (
              <div className="text-center text-sm text-muted-foreground py-10">Start the conversation below</div>
            )}
            {uiMessages.map(m => (
              <Message key={m.id} from={m.role}>
                <MessageContent>
                  {m.role === 'assistant' && isLoading && m.id === latestAssistantId ? (
                    <Reasoning defaultOpen={false} isStreaming={true} duration={3}>
                      <ReasoningTrigger>Thinking…</ReasoningTrigger>
                      <ReasoningContent>Processing your input</ReasoningContent>
                    </Reasoning>
                  ) : null}
                  {!!m.text && <Response>{m.text}</Response>}
                  {Array.isArray(m.sources) && m.sources.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {m.sources.map((s: any, i: number) => (
                        <a
                          key={`${m.id}-src-${i}`}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-full border px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:border-[var(--color-orange-accent)]/40"
                          aria-label={`Source: ${s.title || s.url}`}
                        >
                          {s.title || s.url}
                        </a>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <button
                      type="button"
                      className="btn-minimal px-2 py-1"
                      aria-label="Copy message"
                      onClick={() => { try { navigator.clipboard.writeText(m.text || '') } catch {} }}
                    >
                      Copy
                    </button>
                    <button
                      type="button"
                      className="btn-minimal px-2 py-1"
                      aria-label="Translate message"
                      onClick={() => { /* design-only */ }}
                    >
                      Translate
                    </button>
                    {m.role === 'user' ? (
                      <button
                        type="button"
                        className="btn-minimal px-2 py-1"
                        aria-label="Delete message"
                        onClick={() => deleteMessage(m.id)}
                      >
                        Delete
                      </button>
                    ) : null}
                    {m.role === 'assistant' && m.id === latestAssistantId ? (
                      <button
                        type="button"
                        className="btn-minimal px-2 py-1"
                        aria-label="Regenerate response"
                        onClick={() => reload()}
                      >
                        Regenerate
                      </button>
                    ) : null}
                  </div>
                  {m.timestamp ? (
                    <div className="mt-1 text-[10px] text-muted-foreground">
                      <time dateTime={new Date(m.timestamp).toISOString()}>
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </time>
                    </div>
                  ) : null}
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


