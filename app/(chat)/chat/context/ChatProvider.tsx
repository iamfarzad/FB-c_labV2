'use client'

import React, { createContext, useContext, useMemo, useState } from 'react'
import type { ActivityItem } from '@/app/(chat)/chat/types/chat'

type ChatContextValue = {
  activityLog: ActivityItem[]
  addActivity: (item: Omit<ActivityItem, 'id' | 'timestamp'> & Partial<Pick<ActivityItem, 'id' | 'timestamp'>>) => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [activityLog, setActivityLog] = useState<ActivityItem[]>([])

  const addActivity: ChatContextValue['addActivity'] = (item) => {
    const newItem: ActivityItem = {
      id: item.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: item.timestamp || Date.now(),
      type: item.type as ActivityItem['type'],
      title: (item as any).title || (item as any).content || 'Activity',
      description: (item as any).description || (item as any).content || '',
      status: (item as any).status || 'completed',
      metadata: (item as any).metadata || {},
    }
    setActivityLog((prev) => [newItem, ...prev].slice(0, 50))
  }

  const value = useMemo(() => ({ activityLog, addActivity }), [activityLog])

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChatContext = () => {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChatContext must be used within ChatProvider')
  return ctx
}


