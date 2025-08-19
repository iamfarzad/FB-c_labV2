"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users } from "lucide-react"
import { useUsers } from "@/contexts/app-context"

export function UserPresence() {
  const { users, currentUser } = useUsers()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-emerald-500"
      case "away":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  const getFeatureBadge = (feature?: string) => {
    if (!feature || feature === "dashboard") return null

    const colors = {
      chat: "bg-blue-100 text-blue-700",
      canvas: "bg-purple-100 text-purple-700",
      webcam: "bg-green-100 text-green-700",
      screenshare: "bg-orange-100 text-orange-700",
      workshop: "bg-emerald-100 text-emerald-700",
    }

    return (
      <Badge
        variant="secondary"
        className={`text-xs ${colors[feature as keyof typeof colors] || "bg-slate-100 text-slate-700"}`}
      >
        {feature}
      </Badge>
    )
  }

  const allUsers = [currentUser, ...users]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5 text-emerald-600" />
          Online Users ({allUsers.filter((u) => u.status === "online").length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {allUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                <div className="relative">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(user.status)} rounded-full border-2 border-white`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {user.name} {user.id === currentUser.id && "(You)"}
                    </p>
                    {getFeatureBadge(user.currentFeature)}
                  </div>
                  <p className="text-xs text-slate-500 capitalize">{user.status}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
