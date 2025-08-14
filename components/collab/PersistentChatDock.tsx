"use client"

import { useEffect, useMemo } from "react"
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation"
import { Message, MessageContent } from "@/components/ai-elements/message"
import { Response } from "@/components/ai-elements/response"
import { Sources, SourcesTrigger, SourcesContent, Source } from "@/components/ai-elements/source"
import { PromptInput, PromptInputToolbar, PromptInputTools, PromptInputTextarea, PromptInputSubmit } from "@/components/ai-elements/prompt-input"
import useChat from "@/hooks/chat/useChat"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Video, Monitor, Camera } from "@/lib/icon-mapping"

type FeatureType = "home" | "chat" | "webcam" | "screenshare" | "workshop" | "pdf" | "learning"

interface PersistentChatDockProps {
  currentFeature: string
  onOpenFeature?: (feature: FeatureType) => void
}

export function PersistentChatDock({ currentFeature, onOpenFeature }: PersistentChatDockProps) {
  const { messages, input, setInput, isLoading, handleSubmit, handleInputChange, clearMessages } = useChat({})

  const uiMessages = useMemo(() => messages.map(m => ({
    id: m.id,
    role: m.role,
    text: m.content,
    sources: m.sources,
    citations: m.citations,
  })), [messages])

  // Optional: react to feature change with a system note
  useEffect(() => {
    // no-op; upstream AIEChat handles richer context announcements
  }, [currentFeature])

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col">
        <Conversation className="relative h-full">
          <ConversationContent className="mx-auto w-full max-w-3xl space-y-2 p-4 pb-24">
            {uiMessages.map(m => (
              <Message key={m.id} from={m.role as any}>
                <MessageContent>
                  {!!m.text && <Response>{m.text}</Response>}
                  {!!m.sources?.length && (
                    <div className="mt-2">
                      <Sources>
                        <SourcesTrigger count={m.sources.length} />
                        <SourcesContent>
                          {m.sources.map((s, i) => (
                            <Source key={`${m.id}-src-${i}`} href={s.url} title={s.title || s.url} />
                          ))}
                        </SourcesContent>
                      </Sources>
                    </div>
                  )}
                </MessageContent>
              </Message>
            ))}
          </ConversationContent>
          <ConversationScrollButton className="bg-background/80 backdrop-blur z-50" />
        </Conversation>

        <div className="sticky bottom-0 z-10 mx-auto w-full max-w-3xl bg-gradient-to-t from-background via-background/90 to-transparent px-4 pb-4 pt-2">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputToolbar>
              <PromptInputTools>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button aria-label="Open Webcam" className="text-muted-foreground hover:text-foreground" onClick={() => onOpenFeature?.('webcam')}>
                      <Camera className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Webcam</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button aria-label="Share Screen" className="text-muted-foreground hover:text-foreground" onClick={() => onOpenFeature?.('screenshare')}>
                      <Monitor className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Screen Share</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button aria-label="Learning" className="text-muted-foreground hover:text-foreground" onClick={() => onOpenFeature?.('learning')}>
                      <Video className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Learning</TooltipContent>
                </Tooltip>
                <button className="ml-2 text-xs underline text-muted-foreground" type="button" onClick={() => clearMessages()}>Reset</button>
              </PromptInputTools>
            </PromptInputToolbar>
            <PromptInputTextarea
              placeholder="Message F.B/c…"
              className="min-h-[56px] md:min-h-[64px]"
              value={input}
              onChange={handleInputChange as any}
            />
            <div className="flex items-center justify-end p-1">
              <PromptInputSubmit status={isLoading ? 'submitted' : undefined} className="rounded-full" />
            </div>
          </PromptInput>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default PersistentChatDock


