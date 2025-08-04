import { createClient } from "@supabase/supabase-js"
import { config, isDevelopment } from "../config"
import type { Database } from "../database.types"

// Check if mocking is enabled
const enableMocking = process.env.ENABLE_GEMINI_MOCKING === 'true'

// Mock Supabase client for development when environment variables are missing
const createMockSupabaseClient = () => {
  console.warn('⚠️ Using mock Supabase client - environment variables missing')
  
  const mockClient = {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: new Error('Mock client - no auth') }),
      signInWithPassword: () => Promise.resolve({ data: { user: null }, error: new Error('Mock client') }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: (table: string) => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: new Error('Mock client - insert not available') }),
      update: () => ({ data: null, error: new Error('Mock client - update not available') }),
      delete: () => ({ data: null, error: new Error('Mock client - delete not available') }),
      eq: function(column: string, value: any) { return this },
      order: function(column: string, options?: any) { return this },
      limit: function(count: number) { return this },
      single: function() { return Promise.resolve({ data: null, error: new Error('Mock client') }) }
    }),
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: new Error('Mock client - storage not available') }),
        download: () => Promise.resolve({ data: null, error: new Error('Mock client - storage not available') })
      })
    }
  }
  
  return mockClient as any
}

// Server-side client factory
export const getSupabase = () => {
  // Check if environment variables are available
  if (!config.supabase.url || !config.supabase.anonKey) {
    if (isDevelopment || enableMocking) {
      console.warn('🔧 Development mode: Using mock Supabase client due to missing environment variables')
      return createMockSupabaseClient()
    } else {
      console.error('❌ Supabase environment variables are missing. Please check SUPABASE_URL and SUPABASE_ANON_KEY.')
      return null
    }
  }

  return createClient<Database>(config.supabase.url, config.supabase.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

// Export default instance for backward compatibility
let supabaseInstance: any = null

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = getSupabase()
    
    // If getSupabase returns null (missing env vars in production), use mock client
    if (!supabaseInstance) {
      console.warn('🔧 Fallback to mock Supabase client due to missing environment variables')
      supabaseInstance = createMockSupabaseClient()
    }
  }
  return supabaseInstance
})()
