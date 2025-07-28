import type React from "react"
import { ChatProvider } from "./context/ChatProvider"
import { ClientErrorBoundary } from "@/components/error-boundary-client"

// Debug component to check environment variables - only client-safe ones
function EnvDebug() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === "development") {
    console.log("Environment variables check:", {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
