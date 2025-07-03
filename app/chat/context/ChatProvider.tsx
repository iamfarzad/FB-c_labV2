"use client"

import { createContext, useContext, useCallback, useReducer, type ReactNode } from "react"
import type { Message, ActivityItem } from "../types/chat"

interface ChatState {
  messages: Message[]
  input: string
  isLoading: boolean
  activities: ActivityItem[]
}

type ChatAction =
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "SET_MESSAGES"; payload: Message[] }
  | { type: "SET_INPUT"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "ADD_ACTIVITY"; payload: ActivityItem }
  | { type: "UPDATE_ACTIVITY"; payload: { id: string; updates: Partial<ActivityItem> } }
  | { type: "SET_ACTIVITIES"; payload: ActivityItem[] }

const initialState: ChatState = {
  messages: [],
  input: "",
  isLoading: false,
  activities: [],
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] }
    case "SET_MESSAGES":
      return { ...state, messages: action.payload }
    case "SET_INPUT":
      return { ...state, input: action.payload }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "ADD_ACTIVITY":
      return { ...state, activities: [action.payload, ...state.activities] }
    case "UPDATE_ACTIVITY":
      return {
        ...state,
        activities: state.activities.map((act) =>
          act.id === action.payload.id ? { ...act, ...action.payload.updates } : act,
        ),
      }
    case "SET_ACTIVITIES":
      return { ...state, activities: action.payload }
    default:
      return state
  }
}

interface ChatContextType {
  messages: Message[]
  input: string
  isLoading: boolean
  activities: ActivityItem[]
  setInput: (input: string) => void
  sendMessage: (content: string) => Promise<void>
  addActivity: (activity: Omit<ActivityItem, "id" | "timestamp">) => void
  updateActivity: (id: string, updates: Partial<ActivityItem>) => void
  uploadFile: (file: File) => Promise<void>
  uploadMedia: (file: File) => Promise<string | undefined>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

interface ChatProviderProps {
  children: ReactNode
  initialMessages?: Message[]
  initialActivities?: ActivityItem[]
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, initialState)

  const setInput = useCallback((input: string) => {
    dispatch({ type: "SET_INPUT", payload: input })
  }, [])

  const addActivity = useCallback((activity: Omit<ActivityItem, "id" | "timestamp">) => {
    const newActivity: ActivityItem = {
      ...activity,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    }
    dispatch({ type: "ADD_ACTIVITY", payload: newActivity })
  }, [])

  const updateActivity = useCallback((id: string, updates: Partial<ActivityItem>) => {
    dispatch({ type: "UPDATE_ACTIVITY", payload: { id, updates } })
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        role: "user",
        timestamp: new Date(),
      }

      dispatch({ type: "ADD_MESSAGE", payload: userMessage })
      dispatch({ type: "SET_LOADING", payload: true })

      // Add activity for message sent
      addActivity({
        type: "user_action",
        title: "Message sent",
        description: content.substring(0, 50) + (content.length > 50 ? "..." : ""),
        status: "completed",
      })

      try {
        // Add activity for AI processing
        const processingActivityId = `processing_${Date.now()}`
        const processingActivity: ActivityItem = {
          id: processingActivityId,
          type: "ai_thinking",
          title: "AI is processing",
          description: "Analyzing your message and generating response",
          timestamp: Date.now(),
          status: "in_progress",
          progress: 0,
        }
        dispatch({ type: "ADD_ACTIVITY", payload: processingActivity })

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          dispatch({
            type: "UPDATE_ACTIVITY",
            payload: {
              id: processingActivityId,
              updates: {
                progress: Math.min((processingActivity.progress || 0) + 20, 90),
              },
            },
          })
        }, 500)

        const allMessages = [...state.messages, userMessage]
        const lastMessageContent = userMessage.content

        // Check if the message is a URL
        const urlRegex = /^(https?:\/\/[^\s]+)/
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/
        const codeRegex = /(\b(calculate|what is|show me the code)\b|^\s*\?)/i

        const isUrl = urlRegex.test(lastMessageContent)
        const isYoutubeUrl = youtubeRegex.test(lastMessageContent)
        const isCodeQuery = codeRegex.test(lastMessageContent)

        let action = "conversationalFlow"
        if (isCodeQuery) {
          action = "executeCode"
        } else if (isYoutubeUrl) {
          action = "analyzeVideo"
        } else if (isUrl) {
          action = "analyzeURL"
        }

        const body: Record<string, any> = {
          messageCount: allMessages.length,
          includeAudio: false,
        }

        const endpoint = `/api/ai?action=${action}`

        if (action === "executeCode") {
          body.prompt = lastMessageContent
        } else if (action === "analyzeVideo") {
          body.videoUrl = lastMessageContent
          body.prompt = `Analyze this YouTube video: ${lastMessageContent}`
        } else if (action === "analyzeURL") {
          body.url = lastMessageContent
          body.prompt = `Analyze this URL: ${lastMessageContent}`
        } else {
          // Regular chat - use conversationalFlow action
          body.message = lastMessageContent
          body.conversationState = {
            messages: allMessages.map((msg) => ({
              role: msg.role === "assistant" ? "model" : "user",
              parts: [{ text: msg.content }],
            })),
          }
        }

        console.log("Sending request to:", endpoint)
        console.log("Request body:", body)

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(body),
        })

        clearInterval(progressInterval)

        console.log("Response status:", response.status)
        console.log("Response headers:", response.headers)

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Response error:", errorText)
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }

        const data = await response.json()
        console.log("Response data:", data)

        if (!data.success) {
          throw new Error(data.error || "Failed to get response from AI service")
        }

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.data.text || "I received your message but couldn't generate a proper response.",
          role: "assistant",
          timestamp: new Date(),
        }

        dispatch({ type: "ADD_MESSAGE", payload: aiMessage })

        // Update processing activity to completed
        updateActivity(processingActivityId, {
          status: "completed",
          progress: 100,
          description: "Response generated successfully",
        })
      } catch (error) {
        console.error("Error sending message:", error)

        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please check the console for details.`,
          role: "assistant",
          timestamp: new Date(),
        }

        dispatch({ type: "ADD_MESSAGE", payload: errorMessage })

        // Add error activity
        addActivity({
          type: "error",
          title: "Error occurred",
          description: `Failed to process the message: ${error instanceof Error ? error.message : "Unknown error"}`,
          status: "failed",
        })
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    },
    [state.messages, addActivity, updateActivity],
  )

  const uploadFile = useCallback(
    async (file: File) => {
      dispatch({ type: "SET_LOADING", payload: true })
      addActivity({
        type: "document_analysis",
        title: `Uploading ${file.name}`,
        description: "Preparing file for analysis...",
        status: "in_progress",
      })

      try {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = async () => {
          const base64Data = (reader.result as string).split(",")[1]

          addActivity({
            type: "ai_thinking",
            title: `Analyzing ${file.name}`,
            description: "AI is processing the document...",
            status: "in_progress",
          })

          const response = await fetch("/api/ai?action=analyzeDocument", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              documentData: base64Data,
              mimeType: file.type,
              prompt: `Analyze this document named ${file.name}`,
            }),
          })

          if (!response.ok) {
            throw new Error("Failed to analyze document")
          }

          const result = await response.json()

          if (!result.success) {
            throw new Error(result.error || "Document analysis failed")
          }

          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: result.data.text,
            role: "assistant",
            timestamp: new Date(),
          }

          dispatch({ type: "ADD_MESSAGE", payload: aiMessage })
          addActivity({
            type: "complete",
            title: "Analysis Complete",
            description: `${file.name} has been analyzed.`,
            status: "completed",
          })
        }
        reader.onerror = (error) => {
          throw error
        }
      } catch (error) {
        console.error("Error analyzing document:", error)
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `Sorry, I couldn't analyze the document: ${file.name}. Please try again.`,
          role: "assistant",
          timestamp: new Date(),
        }
        dispatch({ type: "ADD_MESSAGE", payload: errorMessage })
        addActivity({
          type: "error",
          title: "Analysis Failed",
          description: `Could not process ${file.name}`,
          status: "failed",
        })
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    },
    [addActivity, dispatch],
  )

  const uploadMedia = useCallback(
    async (file: File): Promise<string | undefined> => {
      try {
        addActivity({
          type: "processing",
          title: "Uploading file",
          description: file.name,
          status: "in_progress",
        })

        // Simulate file upload
        return new Promise((resolve) => {
          setTimeout(() => {
            const url = URL.createObjectURL(file)

            addActivity({
              type: "complete",
              title: "File uploaded",
              description: file.name,
              status: "completed",
            })

            resolve(url)
          }, 1500)
        })
      } catch (error) {
        console.error("Error uploading media:", error)

        addActivity({
          type: "error",
          title: "Upload failed",
          description: "Failed to upload file",
          status: "failed",
        })

        return undefined
      }
    },
    [addActivity],
  )

  const value: ChatContextType = {
    messages: state.messages,
    input: state.input,
    isLoading: state.isLoading,
    activities: state.activities,
    setInput,
    sendMessage,
    addActivity,
    updateActivity,
    uploadFile,
    uploadMedia,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider")
  }
  return context
}

export default ChatProvider
