"use client"

import { useChatContext } from "../../context/ChatProvider"
import { MessageList } from "../MessageList"
import { ChatComposer } from "./ChatComposer"

export function ChatPanel() {
  const { messages, addMessage } = useChatContext()

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={messages} />
      </div>
      <div className="border-t p-4">
        <ChatComposer
          onSend={(content) => {
            addMessage({
              id: Date.now().toString(),
              role: "user",
              content,
              createdAt: new Date(),
            })
          }}
        />
      </div>
    </div>
  )
}
