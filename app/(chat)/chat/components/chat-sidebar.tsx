import { Plus, MessageSquare, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ChatSidebar() {
  const conversations = [
    { id: 1, name: "Q3 Sales Analysis", active: true },
    { id: 2, name: "Marketing Strategy Brainstorm" },
    { id: 3, name: "Competitor Research" },
  ]

  return (
    <div className="flex h-full w-full flex-col bg-muted/50 p-4">
      <div className="flex items-center justify-between pb-4">
        <h1 className="text-xl font-bold">Chats</h1>
        <Button variant="ghost" size="icon">
          <Plus className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto">
        {conversations.map((convo) => (
          <Button
            key={convo.id}
            variant={convo.active ? "secondary" : "ghost"}
            className="w-full justify-start gap-3 px-3"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="truncate">{convo.name}</span>
          </Button>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-user.jpg" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">User</span>
        </div>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
