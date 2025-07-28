"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import type { Message } from "@/app/(chat)/chat/types/chat"

interface UseChatStateOptions {
  sessionId?: string
  onMessageAdd?: (message: Message) => void
  onError?: (error: Error) => void
}

interface ChatState {
  messages: Message[]
  isLoading: boolean
  error: Error | null
  input: string
  isTyping: boolean
}

export function useChatState(options: UseChatStateOptions = {}) {
  const { sessionId, onMessageAdd, onError } = options
  const { toast } = useToast()
  const abortControllerRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    input: "",
    isTyping: false,
  })

  const setMessages = useCallback((messages: Message[] | ((prev: Message[]) => Message[])) => {
    setState((prev) => ({
      ...prev,
      messages: typeof messages === "function" ? messages(prev.messages) : messages,
    }))
  }, [])

  const setIsLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }))
  }, [])

  const setError = useCallback(
    (error: Error | null) => {
      setState((prev) => ({ ...prev, error }))
      if (error) {
        onError?.(error)
        toast({
          title: "Chat Error",
          description: error.message,
          variant: "destructive",
        })
      }
    },
    [onError, toast],
  )

  const setInput = useCallback((input: string) => {
    setState((prev) => ({ ...prev, input }))
  }, [])

  const setIsTyping = useCallback((isTyping: boolean) => {
    setState((prev) => ({ ...prev, isTyping }))
  }, [])

  const addMessage = useCallback(
    (message: Omit<Message, "id" | "createdAt">) => {
      const newMessage: Message = {
        ...message,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, newMessage])
      onMessageAdd?.(newMessage)
      return newMessage
    },
    [setMessages, onMessageAdd],
  )

  const updateMessage = useCallback(
    (id: string, updates: Partial<Message>) => {
      setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg)))
    },
    [setMessages],
  )

  const removeMessage = useCallback(
    (id: string) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== id))
    },
    [setMessages],
  )

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [setMessages, setError])

  const sendMessage = useCallback(
    async (
      content: string,
      options?: {
        imageUrl?: string
        fileData?: string
        context?: Record<string, any>
      },
    ) => {
      if (!content.trim()) return

      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Add user message
      const userMessage = addMessage({
        role: "user",
        content: content.trim(),
        imageUrl: options?.imageUrl,
      })

      setInput("")
      setIsLoading(true)
      setError(null)

      try {
        // Create new abort controller
        abortControllerRef.current = new AbortController()

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content.trim(),
            sessionId,
            imageUrl: options?.imageUrl,
            fileData: options?.fileData,
            context: options?.context,
            messages: state.messages,
          }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        // Add assistant response
        addMessage({
          role: "assistant",
          content: data.content || data.message || "I apologize, but I couldn't generate a response.",
          sources: data.sources,
        })
      } catch (error: any) {
        if (error.name === "AbortError") {
          return // Request was cancelled
        }

        console.error("Chat error:", error)
        setError(new Error(error.message || "Failed to send message"))

        // Remove the user message on error
        removeMessage(userMessage.id)
      } finally {
        setIsLoading(false)
        abortControllerRef.current = null
      }
    },
    [state.messages, sessionId, addMessage, removeMessage, setInput, setIsLoading, setError],
  )

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsLoading(false)
    }
  }, [setIsLoading])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [state.messages])

  return {
    ...state,
    setMessages,
    setIsLoading,
    setError,
    setInput,
    setIsTyping,
    addMessage,
    updateMessage,
    removeMessage,
    clearMessages,
    sendMessage,
    cancelRequest,
    messagesEndRef,
  }
}
