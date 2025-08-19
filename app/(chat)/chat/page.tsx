"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { DemoSessionProvider } from "@/components/demo-session-manager"
import { PageShell } from "@/components/page-shell"
import { UnifiedChatInterface } from "@/components/chat/unified/UnifiedChatInterface"
import useChat from "@/hooks/chat/useChat"
import { useConversationalIntelligence } from "@/hooks/useConversationalIntelligence"
import { useCanvas } from "@/components/providers/canvas-provider"
import { CanvasOrchestrator } from "@/components/chat/CanvasOrchestrator"
import type { UnifiedMessage } from "@/components/chat/unified/UnifiedChatInterface"

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    const sid = window.localStorage.getItem('intelligence-session-id')
    return sid || null
  })

  // Persist session id
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionId && window.localStorage.getItem('intelligence-session-id') !== sessionId) {
      window.localStorage.setItem('intelligence-session-id', sessionId)
    }
  }, [sessionId])

  // Conversational Intelligence
  const { 
    context, 
    isLoading: contextLoading, 
    fetchContextFromLocalSession, 
    clearContextCache, 
    generatePersonalizedGreeting 
  } = useConversationalIntelligence()

  const leadContextData = useMemo(() => {
    if (!context) return undefined
    return {
      name: context?.person?.fullName || context?.lead?.name,
      email: context?.lead?.email,
      company: context?.company?.name,
      role: context?.role,
      industry: context?.company?.industry,
    }
  }, [context])

  // Chat hook with lead context
  const { 
    messages, 
    input, 
    setInput, 
    isLoading, 
    error, 
    sendMessage, 
    handleSubmit, 
    handleInputChange, 
    clearMessages, 
    addMessage 
  } = useChat({
    data: { 
      sessionId: sessionId ?? undefined, 
      enableLeadGeneration: false, 
      leadContext: leadContextData 
    }
  })

  // Canvas for tools
  const { openCanvas } = useCanvas()

  // Transform messages to UnifiedMessage format
  const unifiedMessages: UnifiedMessage[] = useMemo(() => {
    return messages.map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
      type: 'default' as const,
      metadata: {
        timestamp: msg.timestamp,
        citations: msg.citations,
        sources: msg.sources,
        imageUrl: msg.imageUrl
      },
      rendering: {
        format: 'markdown' as const,
        theme: 'default' as const
      }
    }))
  }, [messages])

  // Handle sending messages
  const handleSendMessage = useCallback((message: string) => {
    sendMessage(message)
  }, [sendMessage])

  // Handle tool actions
  const handleToolAction = useCallback((tool: string, data?: any) => {
    switch(tool) {
      case 'document':
        openCanvas('pdf')
        break
      case 'image':
      case 'webcam':
        openCanvas('webcam')
        break
      case 'screen':
        openCanvas('screenshare')
        break
      case 'roi':
        openCanvas('roi')
        break
      case 'video':
        openCanvas('video2app')
        break
      default:
        console.log('Tool action:', tool, data)
    }
  }, [openCanvas])

  // Handle clearing messages
  const handleClearMessages = useCallback(() => {
    clearMessages()
    clearContextCache()
    // Generate new session ID
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`
    setSessionId(newSessionId)
  }, [clearMessages, clearContextCache])

  return (
    <DemoSessionProvider>
      <PageShell variant="fullscreen">
        <div className="h-[100dvh] relative">
          <UnifiedChatInterface
            messages={unifiedMessages}
            isLoading={isLoading || contextLoading}
            sessionId={sessionId}
            mode="full"
            onSendMessage={handleSendMessage}
            onClearMessages={handleClearMessages}
            onToolAction={handleToolAction}
          />
          <CanvasOrchestrator />
        </div>
      </PageShell>
    </DemoSessionProvider>
  )
}
