"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface ChatLayoutProps {
  children: React.ReactNode
  className?: string
}

export function ChatLayout({ children, className }: ChatLayoutProps) {
  return <div className={cn("h-screen flex flex-col bg-background", className)}>{children}</div>
}
