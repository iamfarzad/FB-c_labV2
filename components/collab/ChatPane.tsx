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
import { Sources, SourcesTrigger, SourcesContent, Source } from "@/components/ai-elements/source"
import { GroundedCitation } from "@/components/ai-elements/inline-citation"
import { Actions, Action } from "@/components/ai-elements/actions"
import { CodeBlock, CodeBlockCopyButton } from "@/components/ai-elements/code-block"
import { BottomDock } from "@/components/collab/BottomDock"
import useChat from "@/hooks/chat/useChat"

interface ChatPaneProps {
  className?: string
  sessionId?: string | null
  onAfterSend?: (text: string) => void
}

export function ChatPane({ className, sessionId, onAfterSend }: ChatPaneProps) {
  const { messages, input, setInput, isLoading, sendMessage, clearMessages, reload, deleteMessage, stop } = useChat({ data: { enableLeadGeneration: false, sessionId: sessionId ?? undefined } })
  const [compact, setCompact] = useState(false)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [attachedFile, setAttachedFile] = useState<string | null>(null)

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
            className="btn-minimal px-2 py-1 min-h-11 min-w-11"
            onClick={() => setCompact(v => !v)}
          >
            {compact ? 'Density: Compact' : 'Density: Comfortable'}
          </button>
        </div>
        <Conversation className="h-full">
          <ConversationContent ref={contentRef} className={`w-full max-w-4xl mx-auto ${compact ? 'space-y-2 p-3' : 'space-y-3 p-5'}`}>
            {uiMessages.length === 0 && !isLoading && (
              <div className="text-center text-sm text-muted-foreground py-10">Start the conversation below</div>
            )}
            {uiMessages.map(m => {
              const codeMatch = typeof m.text === 'string' ? m.text.match(/```(\w+)?\n([\s\S]*?)```/) : null
              const codeLang = codeMatch?.[1] || 'text'
              const codeBody = codeMatch?.[2]
              const nonCodeText = codeMatch ? m.text.replace(codeMatch[0], '').trim() : m.text
              return (
              <Message key={m.id} from={m.role}>
                <MessageContent>
                  {m.role === 'assistant' && isLoading && m.id === latestAssistantId ? (
                    <Reasoning defaultOpen={false} isStreaming={true} duration={3}>
                      <ReasoningTrigger>Thinking…</ReasoningTrigger>
                      <ReasoningContent>Processing your input</ReasoningContent>
                    </Reasoning>
                  ) : null}
                  {codeBody ? (
                    <div className="space-y-2">
                      {nonCodeText && <Response>{nonCodeText}</Response>}
                      <CodeBlock code={codeBody} language={codeLang}>
                        <CodeBlockCopyButton aria-label="Copy code" />
                      </CodeBlock>
                    </div>
                  ) : (
                    !!m.text && <Response>{m.text}</Response>
                  )}
                  {Array.isArray(m.sources) && m.sources.length > 0 ? (
                    <div className="mt-2">
                      <Sources>
                        <SourcesTrigger count={m.sources.length} />
                        <SourcesContent>
                          {m.sources.map((s: any, i: number) => (
                            <Source key={`${m.id}-src-${i}`} href={s.url} title={s.title || s.url} />
                          ))}
                        </SourcesContent>
                      </Sources>
                    </div>
                  ) : null}
                  {Array.isArray(m.citations) && m.citations.length > 0 ? (
                    <div className="mt-1">
                      <GroundedCitation citations={m.citations as any} />
                    </div>
                  ) : null}
                  <Actions className="mt-2 text-[10px]">
                    <Action label="Copy message" tooltip="Copy" onClick={() => { try { navigator.clipboard.writeText(m.text || '') } catch {} }} />
                    <Action label="Translate" tooltip="Translate" onClick={() => { /* design-only */ }} />
                    {m.role === 'user' && (
                      <Action label="Delete" tooltip="Delete" onClick={() => deleteMessage(m.id)} />
                    )}
                    {m.role === 'assistant' && m.id === latestAssistantId && (
                      <Action label="Regenerate" tooltip="Regenerate" onClick={() => reload()} />
                    )}
                  </Actions>
                  {m.timestamp ? (
                    <div className="mt-1 text-[10px] text-muted-foreground">
                      <time dateTime={new Date(m.timestamp).toISOString()}>
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </time>
                    </div>
                  ) : null}
                </MessageContent>
              </Message>
            )})}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      <div className="mt-1">
        <BottomDock
          value={input}
          onChange={setInput}
          onSend={() => {
            const text = (input || '').trim()
            if (!text) return
            sendMessage(text)
            if (onAfterSend) onAfterSend(text)
          }}
          quick={[
            { id: 'attach', label: 'Attach', onClick: () => fileInputRef.current?.click() },
            { id: 'clear', label: 'Clear', onClick: () => clearMessages() }
          ]}
          status={isLoading ? 'streaming' : undefined}
          rightArea={isLoading ? (
            <button type="button" className="btn-minimal" onClick={() => stop()} aria-label="Stop streaming">Stop</button>
          ) : null}
        />
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          onChange={e => {
            const f = e.target.files && e.target.files[0]
            setAttachedFile(f ? f.name : null)
          }}
        />
        {attachedFile ? (
          <div role="status" aria-live="polite" className="px-1 pt-1 text-[10px] text-muted-foreground">Attached: {attachedFile}</div>
        ) : null}
      </div>
    </div>
  )
}


