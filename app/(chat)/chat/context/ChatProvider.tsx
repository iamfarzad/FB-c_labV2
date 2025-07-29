"use client"

import type React from "react"

import type { ReactNode } from "react"
import { createContext, useContext, useState, useCallback } from "react"
import type { Message } from "@/app/(chat)/chat/types/chat"
import type { Activity } from "@/app/(chat)/chat/types/activity"
import { useApiRequest } from "@/hooks/use-api-request"
import { useToast } from "@/hooks/use-toast"

interface ChatContextType {
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  addMessage: (message: Message) => void
  isLoading: boolean
  error: string | null
  handleSendMessage: (content: string, options?: { isRetry?: boolean }) => Promise<void>
  onRetry: () => void
  activities: Activity[]
  addActivity: (activity: Activity) => void
  isScreenShareOpen: boolean
  openScreenShare: () => void
  closeScreenShare: () => void
  isVideo2AppOpen: boolean
  openVideo2App: () => void
  closeVideo2App: () => void
  isVoiceInputOpen: boolean
  openVoiceInput: () => void
  closeVoiceInput: () => void
  isWebcamOpen: boolean
  openWebcam: () => void
  closeWebcam: () => void
  handleDownloadSummary: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const { toast } = useToast()

  const {
    isLoading,
    error,
    execute: postMessage,
  } = useApiRequest<any>({
    showErrorToast: true,
    errorMessage: "Failed to get response from AI",
  })

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message])
  }, [])

  const addActivity = useCallback((activity: Activity) => {
    setActivities((prev) => [activity, ...prev])
  }, [])

  const handleSendMessage = useCallback(
    async (content: string, options?: { isRetry?: boolean }) => {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
        createdAt: new Date(),
      }

      if (!options?.isRetry) {
        addMessage(userMessage)
      }

      const response = await postMessage("/api/chat", {
        method: "POST",
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      })

      if (response) {
        const aiMessage: Message = {
          id: response.id || (Date.now() + 1).toString(),
          role: "assistant",
          content: response.content,
          createdAt: new Date(),
        }
        addMessage(aiMessage)
      }
    },
    [addMessage, postMessage, messages],
  )

  const onRetry = useCallback(() => {
    const lastUserMessage = messages.findLast((m) => m.role === "user")
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.content, { isRetry: true })
    }
  }, [messages, handleSendMessage])

  // Modal states
  const [isScreenShareOpen, setIsScreenShareOpen] = useState(false)
  const [isVideo2AppOpen, setIsVideo2AppOpen] = useState(false)
  const [isVoiceInputOpen, setIsVoiceInputOpen] = useState(false)
  const [isWebcamOpen, setIsWebcamOpen] = useState(false)

  // Modal handlers
  const openScreenShare = useCallback(() => setIsScreenShareOpen(true), [])
  const closeScreenShare = useCallback(() => setIsScreenShareOpen(false), [])
  const openVideo2App = useCallback(() => setIsVideo2AppOpen(true), [])
  const closeVideo2App = useCallback(() => setIsVideo2AppOpen(false), [])
  const openVoiceInput = useCallback(() => setIsVoiceInputOpen(true), [])
  const closeVoiceInput = useCallback(() => setIsVoiceInputOpen(false), [])
  const openWebcam = useCallback(() => setIsWebcamOpen(true), [])
  const closeWebcam = useCallback(() => setIsWebcamOpen(false), [])

  const { execute: downloadSummary } = useApiRequest<Blob>({
    showErrorToast: true,
    errorMessage: "Failed to download summary",
  })

  const handleDownloadSummary = useCallback(async () => {
    const blob = await downloadSummary("/api/export-summary", {
      method: "POST",
      body: JSON.stringify({ messages }),
    })

    if (blob) {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "chat-summary.txt"
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast({ title: "Success", description: "Chat summary downloaded." })
    }
  }, [messages, downloadSummary, toast])

  const value = {
    messages,
    setMessages,
    addMessage,
    isLoading,
    error,
    handleSendMessage,
    onRetry,
    activities,
    addActivity,
    isScreenShareOpen,
    openScreenShare,
    closeScreenShare,
    isVideo2AppOpen,
    openVideo2App,
    closeVideo2App,
    isVoiceInputOpen,
    openVoiceInput,
    closeVoiceInput,
    isWebcamOpen,
    openWebcam,
    closeWebcam,
    handleDownloadSummary,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChatContext = () => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider")
  }
  return context
}
