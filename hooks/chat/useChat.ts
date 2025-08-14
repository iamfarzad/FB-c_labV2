import { useState, useCallback, useRef, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  imageUrl?: string
  sources?: Array<{ title: string; url: string }>
  citations?: Array<{ uri: string; title?: string }>
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
  enableLeadGeneration?: boolean
}

interface UseChatProps {
  initialMessages?: Message[]
  data?: ChatData
  onFinish?: (message: Message) => void
  onError?: (error: Error) => void
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
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
  const [usedCapabilities, setUsedCapabilities] = useState<Set<string>>(new Set())
  const abortControllerRef = useRef<AbortController | null>(null)
  const lastCallTimeRef = useRef<number>(0)
  const currentSessionIdRef = useRef<string | null>(null)
  const DEBOUNCE_DELAY = 1000 // 1 second debounce

  // Reset messages when session changes
  useEffect(() => {
    if (data.sessionId && data.sessionId !== currentSessionIdRef.current) {
      console.info('🔄 Session changed, resetting messages:', {
        oldSession: currentSessionIdRef.current,
        newSession: data.sessionId
      })
      setMessages([])
      setInput('')
      setError(null)
      currentSessionIdRef.current = data.sessionId
    }
  }, [data.sessionId])

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

    // 🚫 RATE LIMITING: Prevent rapid successive calls
    const now = Date.now()
    if (now - lastCallTimeRef.current < DEBOUNCE_DELAY) {
      console.info('🚫 Rate limited: Skipping rapid call', {
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

      console.info('📤 Sending message:', {
        contentLength: content.length,
        sessionId: data.sessionId,
        leadContext: data.leadContext,
        timestamp: new Date().toISOString()
      })

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-intelligence-session-id': data.sessionId || 'anonymous'
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
            userId: data.userId,
            // Keep enhanced flags aligned with the current chat page implementation
            conversationSessionId: data.sessionId || undefined,
            enableLeadGeneration: data.enableLeadGeneration ?? false
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
      // Track any structured metadata coming from the server during SSE
      let assistantSources: Array<{ title?: string; url: string }> | undefined

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
              // Track suggested/used capabilities if the server emits hints
              if (data.capabilityUsed && typeof data.capabilityUsed === 'string') {
                setUsedCapabilities(prev => new Set(prev).add(data.capabilityUsed))
                try {
                  window.dispatchEvent(new CustomEvent('chat-capability-used', { detail: { name: data.capabilityUsed } }))
                } catch {}
              }
              if (data.nextBest && typeof data.nextBest === 'string') {
                try {
                  window.dispatchEvent(new CustomEvent('chat-coach-suggestion', { detail: { nextBest: data.nextBest } }))
                } catch {}
              }
              // Allow server to push sources/metadata during stream
              if (data.sources && Array.isArray(data.sources)) {
                assistantSources = data.sources
                updateMessage(assistantMessage.id, {
                  sources: assistantSources
                } as any)
              }
              // Surface server-side conversation updates to the caller if they care
              if (data.conversationStage || data.leadData) {
                // no-op in this hook; expose via custom event on window for now to avoid breaking API
                // Advanced consumers can listen on this channel
                try {
                  window.dispatchEvent(new CustomEvent('chat-server-event', { detail: data }))
                } catch (_) {
                  // ignore SSR/windowless
                }
              }
              
              if (data.done) {
                // Streaming complete
                const finalMessage = {
                  ...assistantMessage,
                  content: assistantContent,
                  timestamp: new Date()
                }
                
                console.info('✅ Message completed:', {
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
              console.warn('Failed to parse streaming data:', parseError)
            }
          }
        }
      }
      
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to send message')
      setError(errorObj)
      
      console.error('❌ Message error:', {
        error: errorObj.message,
        timestamp: new Date().toISOString()
      })
      
      // Update assistant message with error
      updateMessage(assistantMessage.id, {
        content: 'I\'m having trouble processing your request right now. Please try again in a moment.',
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
    debouncedSendMessage, // Add debounced version
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
