"use client"

import { Plus, Trash2, MessageSquare, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ActivityList } from "@/components/chat/sidebar/components/ActivityList"
import type { ActivityItem } from "../../types/chat"

interface ChatSidebarProps {
  activities: ActivityItem[]
  onNewChat: () => void
}

export function ChatSidebar({ activities, onNewChat }: ChatSidebarProps) {
  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-r border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-logo.svg" alt="Uniq AI" />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
              AI
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Uniq AI</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Business Assistant</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewChat}
          className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">New Chat</span>
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="p-4 space-y-2">
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-3 h-10 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
        >
          <MessageSquare className="h-4 w-4" />
          New Conversation
        </Button>
      </div>

      <Separator className="mx-4" />

      {/* Chat History */}
      <div className="flex flex-1 flex-col min-h-0">
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Recent Chats</h3>
            <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-700">
              0
            </Badge>
          </div>
          <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-8">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No conversations yet</p>
            <p className="text-xs mt-1">Start a new chat to begin</p>
          </div>
        </div>

        <Separator className="mx-4" />

        {/* Live Activity */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Live Activity</h3>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-600 dark:text-green-400">Live</span>
            </div>
          </div>
          <ScrollArea className="h-full">
            <ActivityList activities={activities} />
          </ScrollArea>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-slate-200 dark:border-slate-700 p-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start gap-2 h-8 text-slate-600 dark:text-slate-400"
          >
            <Settings className="h-3 w-3" />
            Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start gap-2 h-8 text-slate-600 dark:text-slate-400"
          >
            <User className="h-3 w-3" />
            Profile
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs bg-transparent border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          <Trash2 className="mr-2 h-3 w-3" />
          Clear History
        </Button>
      </div>
    </div>
  )
}
