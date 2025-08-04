import { createClient } from "@supabase/supabase-js"

// Validate environment variables at runtime
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development'
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
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isDevelopment && enableMocking) {
      console.warn('🔧 Development mode: Using mock Supabase client due to missing environment variables')
      return createMockSupabaseClient()
    } else {
      throw new Error('Supabase environment variables are missing. Please check SUPABASE_URL and SUPABASE_ANON_KEY.')
    }
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
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
    try {
      supabaseInstance = getSupabase()
    } catch (error) {
      if (isDevelopment && enableMocking) {
        console.warn('🔧 Fallback to mock Supabase client')
        supabaseInstance = createMockSupabaseClient()
      } else {
        throw error
      }
    }
  }
  return supabaseInstance
})()
