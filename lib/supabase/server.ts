import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://ksmxqswuzrmdgckwxkvn.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzbXhxc3d1enJtZGdja3d4a3ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3ODUyNjIsImV4cCI6MjA1NzM2MTI2Mn0.YKz7fKPbl7pbvEMN08lFOPm1SSg59R4lu8tzV8Kkz2E"

// Server-side client (no auth persistence needed)
export const getSupabase = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

// Export default instance for backward compatibility
export const supabase = getSupabase()
