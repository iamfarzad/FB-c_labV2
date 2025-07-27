import type React from "react"
import { ChatProvider } from "./context/ChatProvider"
import { ClientErrorBoundary } from "@/components/error-boundary-client"

// Debug component to check environment variables
function EnvDebug() {
  if (process.env.NODE_ENV === "development") {
    console.log("Environment variables check:", {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    })
  }
  return null
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <EnvDebug />
      <ClientErrorBoundary>
        <ChatProvider>
          {children}
        </ChatProvider>
      </ClientErrorBoundary>
    </>
  )
}
