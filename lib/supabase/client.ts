import { createClient } from "@supabase/supabase-js"

// IMPORTANT: These values are hardcoded for v0 preview demonstration ONLY.
// In a real application, always use environment variables (e.g., process.env.NEXT_PUBLIC_SUPABASE_URL)
// configured in your Vercel project settings for security and flexibility.
const supabaseUrl = "https://ksmxqswuzrmdgckwxkvn.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzbXhxc3d1enJtZGdja3d4a3ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3ODUyNjIsImV4cCI6MjA1NzM2MTI2Mn0.YKz7fKPbl7pbvEMN08lFOPm1SSg59R4lu8tzV8Kkz2E"

// Create a singleton instance to prevent multiple clients
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: "fb-ai-auth",
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  }
  return supabaseInstance
})()

// Export a function to get the client (for consistency)
export const getSupabaseClient = () => supabase
