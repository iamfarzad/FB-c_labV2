import { useState, useCallback, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  imageUrl?: string
  sources?: Array<{ title: string; url: string }>
}

interface ChatData {
  leadContext?: {
    name?: string
    company?: string
    role?: string
    interests?: string
  }
  sessionId?: string
  userId?: string
}

interface UseChatProps {
  initialMessages?: Message[]
  data?: ChatData
  onFinish?: (message: Message) => void
  onError?: (error: Error) => void
}

export function useChat({ 
  initialMessages = [],
  data = {},
  onFinish,
  onError
}: UseChatProps = {}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: uuidv4(),
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, newMessage])
    return newMessage
  }, [])

  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setMessages(prev =>
      prev.map(msg => (msg.id === id ? { ...msg, ...updates } : msg))
    )
  }, [])

  const append = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    return addMessage(message)
  }, [addMessage])

  const sendMessage = useCallback(async (content: string, imageUrl?: string) => {
    if (!content.trim()) return

    // Add user message
    const userMessage = addMessage({
      role: 'user',
      content: content.trim(),
      imageUrl
    })

    setInput('')
    setIsLoading(true)
    setError(null)

    // Create assistant message placeholder
    const assistantMessage = addMessage({
      role: 'assistant',
      content: '',
    })

    try {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController()

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
            imageUrl: msg.imageUrl
          })),
          data: {
            leadContext: data.leadContext,
            sessionId: data.sessionId || uuidv4(),
            userId: data.userId
          }
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      
      if (!reader) {
        throw new Error('No reader available')
      }

      let assistantContent = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.content) {
                assistantContent += data.content
                updateMessage(assistantMessage.id, {
                  content: assistantContent
                })
              }
              
              if (data.done) {
                // Streaming complete
                const finalMessage = {
                  ...assistantMessage,
                  content: assistantContent,
                  timestamp: new Date()
                }
                
                if (onFinish) {
                  onFinish(finalMessage)
                }
                
                setIsLoading(false)
                return
              }
              
              if (data.error) {
                throw new Error(data.error)
              }
            } catch (parseError) {
              console.warn('Failed to parse streaming data:', parseError)
            }
          }
        }
      }
      
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to send message')
      setError(errorObj)
      
      // Update assistant message with error
      updateMessage(assistantMessage.id, {
        content: 'Sorry, I encountered an error processing your message. Please try again.',
      })
      
      if (onError) {
        onError(errorObj)
      }
      
      console.error('Error sending message:', err)
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }, [messages, addMessage, updateMessage, data, onFinish, onError])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    await sendMessage(input)
  }, [input, sendMessage])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  const deleteMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id))
  }, [])

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsLoading(false)
  }, [])

  const reload = useCallback(() => {
    if (messages.length > 0) {
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()
      if (lastUserMessage) {
        // Remove the last assistant message if it exists
        const lastAssistantIndex = messages.findLastIndex(m => m.role === 'assistant')
        if (lastAssistantIndex !== -1) {
          setMessages(prev => prev.slice(0, lastAssistantIndex))
        }
        
        // Resend the last user message
        sendMessage(lastUserMessage.content, lastUserMessage.imageUrl)
      }
    }
  }, [messages, sendMessage])

  return {
    // State
    messages,
    input,
    setInput,
    isLoading,
    error,
    
    // Actions
    sendMessage,
    handleSubmit,
    handleInputChange,
    append,
    addMessage,
    updateMessage,
    deleteMessage,
    clearMessages,
    stop,
    reload,
  }
}

export default useChat
