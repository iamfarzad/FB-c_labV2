import { MessageList } from "./MessageList"
import { ChatComposer } from "./ChatComposer"
import type { Message } from "@/types/chat"

interface ChatPanelProps {
  messages: Message[]
  isTyping: boolean
  onSendMessage: (message: string) => void
  onToolClick: (tool: string) => void
}

export function ChatPanel({ messages, isTyping, onSendMessage, onToolClick }: ChatPanelProps) {
  return (
    <main className="flex-1 flex flex-col h-screen">
      <div className="border-b border-border/60 bg-background/95 backdrop-blur-sm flex-shrink-0">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <h1 className="text-foreground/90 text-sm tracking-wide font-semibold">F.B/c AI Consultation</h1>
            </div>
            <div className="text-xs text-muted-foreground tracking-wider uppercase">Powered by Gemini 2.5</div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} isTyping={isTyping} />
      </div>
      <ChatComposer onSendMessage={onSendMessage} onToolClick={onToolClick} isTyping={isTyping} />
    </main>
  )
}
