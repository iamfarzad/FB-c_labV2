"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Settings, LogOut, RefreshCw, User } from "lucide-react"

export function AdminHeader() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      })
      
      if (response.ok) {
        router.push("/admin/login")
      } else {
        console.error("Logout failed")
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <header className="glass-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-accent to-accent/80 rounded-lg flex items-center justify-center shadow-md">
                <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-foreground">F.B/c AI Admin</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Business Intelligence Dashboard</p>
              </div>
            </div>
            <Separator orientation="vertical" className="h-6 sm:h-8 hidden md:block" />
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Live
              </Badge>
              <span className="text-sm text-muted-foreground">Production Ready</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">farzad@farzadbayat.com</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="btn-minimal gap-2" 
              onClick={handleRefresh}
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="btn-minimal gap-2 hidden sm:flex"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">Settings</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="btn-minimal gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30" 
              onClick={handleLogout}
              disabled={isLoading}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{isLoading ? "Logging out..." : "Logout"}</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
