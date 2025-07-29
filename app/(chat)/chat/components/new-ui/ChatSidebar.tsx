"use client"

import { useState } from "react"
import {
  MessageSquare,
  Plus,
  Search,
  Settings,
  History,
  Archive,
  Trash2,
  MoreHorizontal,
  Clock,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ChatSidebarProps {
  isCollapsed?: boolean
}

interface ChatSession {
  id: string
  title: string
  timestamp: string
  messageCount: number
  isStarred?: boolean
  category: "business" | "analysis" | "general"
}

const mockChatSessions: ChatSession[] = [
  {
    id: "1",
    title: "ROI Analysis for Q4 Campaign 📊",
    timestamp: "2 hours ago",
    messageCount: 12,
    isStarred: true,
    category: "analysis",
  },
  {
    id: "2",
    title: "Lead Generation Strategy Discussion 🎯",
    timestamp: "Yesterday",
    messageCount: 8,
    category: "business",
  },
  {
    id: "3",
    title: "Market Research Report Review 📈",
    timestamp: "2 days ago",
    messageCount: 15,
    isStarred: true,
    category: "analysis",
  },
  {
    id: "4",
    title: "Client Meeting Preparation ✅",
    timestamp: "3 days ago",
    messageCount: 6,
    category: "business",
  },
  {
    id: "5",
    title: "General Business Questions 💡",
    timestamp: "1 week ago",
    messageCount: 4,
    category: "general",
  },
]

export function ChatSidebar({ isCollapsed = false }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<"all" | "starred" | "business" | "analysis">("all")

  const filteredSessions = mockChatSessions.filter((session) => {
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "starred" && session.isStarred) ||
      session.category === selectedFilter
    return matchesSearch && matchesFilter
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "business":
        return "from-blue-500 to-indigo-600"
      case "analysis":
        return "from-purple-500 to-violet-600"
      case "general":
        return "from-emerald-500 to-teal-600"
      default:
        return "from-slate-500 to-slate-600"
    }
  }

  if (isCollapsed) {
    return (
      <div className="w-16 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col items-center py-4 gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>New Chat</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Recent Chats</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    )
  }

  return (
    <div className="w-80 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Chat History</h2>
          </div>
          <Button
            size="sm"
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: "all", label: "All", count: mockChatSessions.length },
            { key: "starred", label: "Starred", count: mockChatSessions.filter((s) => s.isStarred).length },
            {
              key: "business",
              label: "Business",
              count: mockChatSessions.filter((s) => s.category === "business").length,
            },
            {
              key: "analysis",
              label: "Analysis",
              count: mockChatSessions.filter((s) => s.category === "analysis").length,
            },
          ].map((filter) => (
            <Button
              key={filter.key}
              variant={selectedFilter === filter.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(filter.key as any)}
              className={`shrink-0 text-xs h-7 ${
                selectedFilter === filter.key
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                  : "bg-white dark:bg-slate-800"
              }`}
            >
              {filter.label}
              <Badge variant="secondary" className="ml-1 text-xs px-1">
                {filter.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Chat Sessions */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className="group relative p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className={`w-3 h-3 rounded-full bg-gradient-to-r ${getCategoryColor(session.category)} shrink-0`}
                  ></div>
                  <h3 className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">{session.title}</h3>
                  {session.isStarred && <Star className="h-3 w-3 text-yellow-500 fill-current shrink-0" />}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem className="gap-2">
                      <Star className="h-3 w-3" />
                      {session.isStarred ? "Unstar" : "Star"}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Archive className="h-3 w-3" />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-red-600">
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{session.timestamp}</span>
                </div>
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  {session.messageCount} messages
                </Badge>
              </div>
            </div>
          ))}

          {filteredSessions.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations found</p>
              <p className="text-xs mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="flex-1 justify-start gap-2">
            <History className="h-4 w-4" />
            <span className="text-sm">View All History</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
