"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Bot, User, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Message } from "../types"

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  return (
    <div className="space-y-6">
      <AnimatePresence>
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn("flex items-start gap-4", message.role === "user" && "justify-end")}
          >
            {message.role === "assistant" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Bot className="h-5 w-5" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[75%] rounded-xl px-4 py-3 text-sm",
                message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
              )}
            >
              {message.content}
            </div>
            {message.role === "user" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </motion.div>
        ))}
        {isLoading && (
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex items-start gap-4"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Bot className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-muted px-4 py-3 text-sm">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Thinking...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
