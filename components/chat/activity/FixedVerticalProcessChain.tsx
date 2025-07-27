"use client"

import React from 'react'
import { VerticalProcessChain } from './VerticalProcessChain'
import type { ActivityItem } from "@/app/(chat)/chat/types/chat"

interface FixedVerticalProcessChainProps {
  activities: ActivityItem[]
  onActivityClick?: (activity: ActivityItem) => void
}

export function FixedVerticalProcessChain({ activities, onActivityClick }: FixedVerticalProcessChainProps) {
  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        <VerticalProcessChain 
          activities={activities} 
          onActivityClick={onActivityClick}
          className="min-w-[48px]"
        />
      </div>
    </div>
  )
} 