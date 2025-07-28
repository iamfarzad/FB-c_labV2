import { useState, useCallback, useRef, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { debounce } from 'lodash'

export interface AdminMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface UseAdminChatProps {
  initialMessages?: AdminMessage[]
  onFinish?: (message: AdminMessage) => void
  onError?: (error: Error) => void
}

export interface UseAdminChatReturn {
  messages: AdminMessage[]
  input: string
  setInput: (input: string) => void
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  isLoading: boolean
  error: Error | null
  append: (message: Omit<AdminMessage, 'id' | 'timestamp'>) => AdminMessage
  clearMessages: () => void
  deleteMessage: (id: string) => void
  stop: () => void
  sendMessage: (content: string) => Promise<void>
}

export function useAdminChat({ 
  initialMessages = [],
  onFinish,
  onError
}: UseAdminChatProps = {}): UseAdminChatReturn {
  const [messages, setMessages] = useState<AdminMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const lastCallTimeRef = useRef<number>(0)
  const DEBOUNCE_DELAY = 1000 // 1 second debounce

  const addMessage = useCallback((message: Omit<AdminMessage, 'id' | 'timestamp'>) => {
    const newMessage: AdminMessage = {
      ...message,
      id: uuidv4(),
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, newMessage])
    return newMessage
  }, [])

  const updateMessage = useCallback((id: string, updates: Partial<AdminMessage>) => {
    setMessages(prev =>
      prev.map(msg => (msg.id === id ? { ...msg, ...updates } : msg))
    )
  }, [])

  const append = useCallback((message: Omit<AdminMessage, 'id' | 'timestamp'>) => {
    return addMessage(message)
  }, [addMessage])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    // 🚫 RATE LIMITING: Prevent rapid successive calls
    const now = Date.now()
    if (now - lastCallTimeRef.current < DEBOUNCE_DELAY) {
      console.log('🚫 Rate limited: Skipping rapid admin chat call', {
        timeSinceLastCall: now - lastCallTimeRef.current,
        content: content.substring(0, 50)
      })
      return
    }
    lastCallTimeRef.current = now

    // Add user message
    const userMessage = addMessage({
      role: 'user',
      content: content.trim(),
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

      console.log('📤 Sending admin chat message:', {
        contentLength: content.length,
        timestamp: new Date().toISOString()
      })

      const response = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
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
                
                console.log('✅ Admin chat message completed:', {
                  responseLength: assistantContent.length,
                  timestamp: new Date().toISOString()
                })
                
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
              console.warn('Failed to parse admin chat streaming data:', parseError)
            }
          }
        }
      }
      
    } catch (err: any) {
      const errorObj = err instanceof Error ? err : new Error('Failed to send admin chat message')
      setError(errorObj)
      
      console.error('❌ Admin chat message error:', {
        error: errorObj.message,
        timestamp: new Date().toISOString()
      })
      
      // Update assistant message with error
      updateMessage(assistantMessage.id, {
        content: 'Sorry, I encountered an error processing your admin request. Please try again.',
      })
      
      if (onError) {
        onError(errorObj)
      }
      
      console.error('Error sending admin chat message:', err)
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }, [messages, addMessage, updateMessage, onFinish, onError])

  // Debounced version of sendMessage
  const debouncedSendMessage = useCallback(
    debounce(sendMessage, DEBOUNCE_DELAY),
    [sendMessage]
  )

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    await sendMessage(input)
  }, [input, sendMessage])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setInput('')
    setError(null)
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

  return {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    append,
    clearMessages,
    deleteMessage,
    stop,
    sendMessage
  }
}
