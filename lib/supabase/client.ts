import { createClient } from "@supabase/supabase-js"

// Use environment variables for security
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env.local file contains:\n" +
      "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url\n" +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key",
  )
}

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
