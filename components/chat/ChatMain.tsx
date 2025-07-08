import type React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessage } from "./ChatMessage"
import { LoadingMessage } from "./LoadingMessage"
import { WelcomeScreen } from "./WelcomeScreen"

interface ChatMainProps {
  handleExampleClick: (example: string) => void
  isLoading: boolean
  messages: any[] // Replace 'any' with the actual type of your messages
  viewportRef: React.RefObject<HTMLDivElement>
}

export function ChatMain({ handleExampleClick, isLoading, messages, viewportRef }: ChatMainProps) {
  return (
    <main className="flex-1 overflow-hidden">
      <ScrollArea
        className="h-full"
        viewportRef={viewportRef}
        aria-live="polite" // Add this line for accessibility
      >
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 && !isLoading && <WelcomeScreen onExampleClick={handleExampleClick} />}
          <div className="space-y-6">
            {messages.map((m, index) => (
              <ChatMessage key={m.id} message={m} />
            ))}
            {isLoading && <LoadingMessage />}
          </div>
        </div>
      </ScrollArea>
    </main>
  )
}
