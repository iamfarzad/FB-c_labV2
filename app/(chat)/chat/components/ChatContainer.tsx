"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCompletion } from "ai/react"
import { toast } from "sonner"

import { ChatHeader } from "./ChatHeader"
import { ChatInput } from "./ChatInput"
import { ChatMessages } from "./ChatMessages"
import { LeadCaptureFlow } from "./LeadCaptureFlow"

export type EngagementType = "demo" | "free-trial" | "sales-call"

export const ChatContainer = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("query") || ""
  const engagementType = (searchParams.get("engagement_type") as EngagementType) || "demo"

  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    {
      role: "assistant",
      content: `Hi there! How can I help you with ${engagementType} today?`,
    },
  ])
  const [showLeadCapture, setShowLeadCapture] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const { complete, completion, isLoading, stop } = useCompletion({
    api: "/api/chat",
    initialInput: initialQuery,
    onFinish: (completion) => {
      setMessages((prevMessages) => [...prevMessages, { role: "assistant", content: completion }])
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  useEffect(() => {
    if (initialQuery) {
      handleSend(initialQuery)
    }
  }, [initialQuery])

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (message: string) => {
    setMessages((prevMessages) => [...prevMessages, { role: "user", content: message }])

    const response = await complete(message)

    if (engagementType !== "demo") {
      setShowLeadCapture(true)
    }

    return response
  }

  const onLeadCaptureComplete = () => {
    setShowLeadCapture(false)
    router.push("/thank-you")
  }

  return (
    <div className="flex flex-col h-screen">
      <ChatHeader engagementType={engagementType} />

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4">
        <ChatMessages messages={messages} />
      </div>

      <ChatInput onSend={handleSend} isLoading={isLoading} stop={stop} engagementType={engagementType} />

      {showLeadCapture && (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <LeadCaptureFlow
            isVisible={showLeadCapture}
            onComplete={onLeadCaptureComplete}
            engagementType={engagementType}
            initialQuery={initialQuery}
          />
        </div>
      )}
    </div>
  )
}
