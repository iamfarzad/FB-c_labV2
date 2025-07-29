"use client"

import { useState } from "react"
import { Plus, Search, Settings, History, Star, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ChatSession {
  id: string
  title: string
  timestamp: string
  messageCount: number
  isStarred?: boolean
  category: "analysis" | "strategy" | "review" | "prep" | "general"
  emoji: string
}

const mockChatSessions: ChatSession[] = [
  {
    id: "1",
    title: "ROI Analysis for Q4 Campaign",
    timestamp: "2 hours ago",
    messageCount: 12,
    isStarred: true,
    category: "analysis",
    emoji: "🇮🇹", // Note: This was in the screenshot, might be a placeholder
  },
  {
    id: "2",
    title: "Lead Generation Strategy Discussion",
    timestamp: "Yesterday",
    messageCount: 8,
    category: "strategy",
    emoji: "🎯",
  },
  {
    id: "3",
    title: "Market Research Report Review",
    timestamp: "2 days ago",
    messageCount: 15,
    isStarred: true,
    category: "review",
    emoji: "📈",
  },
  {
    id: "4",
    title: "Client Meeting Preparation",
    timestamp: "3 days ago",
    messageCount: 6,
    category: "prep",
    emoji: "✅",
  },
  {
    id: "5",
    title: "General Business Questions",
    timestamp: "1 week ago",
    messageCount: 4,
    category: "general",
    emoji: "💡",
  },
]

const categoryColors: Record<ChatSession["category"], string> = {
  analysis: "bg-purple-500",
  strategy: "bg-blue-500",
  review: "bg-purple-500",
  prep: "bg-green-500",
  general: "bg-teal-500",
}

export function ChatSidebar() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<"all" | "starred" | "business">("all")

  const filteredSessions = mockChatSessions.filter((session) => {
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase())
    if (selectedFilter === "all") return matchesSearch
    if (selectedFilter === "starred") return matchesSearch && session.isStarred
    if (selectedFilter === "business") return matchesSearch // Assuming 'business' is a category group
    return matchesSearch
  })

  return (
    <div className="bg-dark-800 text-white flex flex-col h-full border-r border-dark-700">
      {/* Header */}
      <div className="p-4 flex items-center justify-between h-20 border-b border-dark-700">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
          <h2 className="font-semibold text-lg">Chat History</h2>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold h-9">
          <Plus className="h-4 w-4 mr-2" />
          New
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="px-4 py-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-600" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-dark-900 border-dark-700 h-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setSelectedFilter("all")}
            className={`h-8 px-3 text-sm font-semibold transition-all rounded-md ${
              selectedFilter === "all"
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                : "bg-dark-700 text-gray-300 hover:bg-dark-600"
            }`}
          >
            All <Badge className="ml-2 bg-dark-600 text-gray-300 px-1.5">5</Badge>
          </Button>
          <Button
            onClick={() => setSelectedFilter("starred")}
            className={`h-8 px-3 text-sm font-semibold transition-all rounded-md ${
              selectedFilter === "starred"
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                : "bg-dark-700 text-gray-300 hover:bg-dark-600"
            }`}
          >
            Starred <Badge className="ml-2 bg-dark-600 text-gray-300 px-1.5">2</Badge>
          </Button>
          <Button
            onClick={() => setSelectedFilter("business")}
            className={`h-8 px-3 text-sm font-semibold transition-all rounded-md ${
              selectedFilter === "business"
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                : "bg-dark-700 text-gray-300 hover:bg-dark-600"
            }`}
          >
            Business <Badge className="ml-2 bg-dark-600 text-gray-300 px-1.5">2</Badge>
          </Button>
        </div>
      </div>

      {/* Chat Sessions */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {filteredSessions.map((session) => (
            <div key={session.id} className="space-y-2 cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 ${categoryColors[session.category]} rounded-full`} />
                  <h3 className="font-medium text-sm text-gray-200 group-hover:text-white transition-colors">
                    {session.title} {session.emoji}
                  </h3>
                  {session.isStarred && <Star className="h-3.5 w-3.5 text-yellow-400 fill-current" />}
                </div>
              </div>
              <div className="flex items-center justify-between pl-5">
                <div className="flex items-center gap-2 text-xs text-dark-600">
                  <Clock className="h-3 w-3" />
                  <span>{session.timestamp}</span>
                </div>
                <Badge className="bg-dark-700 text-gray-300 text-xs font-normal border border-dark-600 px-2 py-0.5">
                  {session.messageCount} messages
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-2 border-t border-dark-700">
        <Button variant="ghost" className="w-full justify-start gap-3 text-gray-300 hover:text-white hover:bg-dark-700">
          <History className="h-4 w-4" />
          <span className="text-sm">View All History</span>
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3 text-gray-300 hover:text-white hover:bg-dark-700">
          <Settings className="h-4 w-4" />
          <span className="text-sm">Settings</span>
        </Button>
      </div>
    </div>
  )
}
