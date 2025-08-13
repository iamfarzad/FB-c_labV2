import { createClient } from '@supabase/supabase-js'
import { Database } from '../database.types'

// Validate environment variables - only use client-safe variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if we're in a browser environment and have the required variables
const isClient = typeof window !== 'undefined'
const hasRequiredVars = supabaseUrl && supabaseAnonKey

if (!hasRequiredVars) {
  console.error('Missing required Supabase environment variables:', {
    url: !!supabaseUrl,
    anonKey: !!supabaseAnonKey,
    isClient
  })
}

// Create a safe Supabase client that handles missing environment variables
function createSafeSupabaseClient() {
  if (!hasRequiredVars) {
    // Return a mock client for development/testing/build time
    console.warn('🔧 Fallback to mock Supabase client due to missing environment variables')
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signIn: async () => ({ data: { user: null }, error: null }),
        signOut: async () => ({ error: null }),
      },
      channel: () => ({
        on: () => ({ subscribe: () => {} }),
        subscribe: () => {},
      }),
      removeChannel: () => {},
      from: (table: string) => ({
        select: (columns?: string) => ({
          eq: (column: string, value: any) => ({
            single: () => ({ data: null, error: null }),
            order: (column: string, options?: any) => ({ data: [], error: null }),
            gte: (column: string, value: any) => ({
              order: (column: string, options?: any) => ({ data: [], error: null })
            })
          }),
          gte: (column: string, value: any) => ({
            order: (column: string, options?: any) => ({ data: [], error: null })
          }),
          order: (column: string, options?: any) => ({ data: [], error: null }),
          data: [],
          error: null
        }),
        insert: (data: any) => ({
          select: (columns?: string) => ({
            single: () => ({ data: null, error: null })
          })
        }),
      }),
    } as any
  }

  return createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  })
}

// Improved Supabase Client Setup with TypeScript types and error handling
export const supabase = createSafeSupabaseClient()

// Service Role Client for API operations (bypasses RLS) - only available server-side
export const supabaseService = (() => {
  // Check if we're in server environment and have required variables
  if (typeof window === 'undefined' && hasRequiredVars && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createClient<Database>(supabaseUrl!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  
  // Fallback to the mock client if service key is missing or on client-side
  console.warn('⚠️ Using mock Supabase client - environment variables missing')
  return createSafeSupabaseClient()
})()

// Safe authentication utility for server-side API routes
export async function getSafeUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error: null }
  } catch (error) {
    // Handle AuthSessionMissingError gracefully - this is expected in server-side API routes
    if (error && typeof error === 'object' && 'name' in error && (error as any).name === 'AuthSessionMissingError') {
      // This is expected behavior in server-side API routes
      return { user: null, error: null }
    }
    return { user: null, error }
  }
}

// Type-safe Lead Creation Function
export async function createLeadSummary(
  leadData: Database['public']['Tables']['lead_summaries']['Insert']
) {
  // Get current authenticated user safely
  const { user, error: userError } = await getSafeUser()
  
  if (userError) {
    console.error('Auth error:', userError)
  }

  if (!user) {
    console.info('No authenticated user found, using service role for lead creation')
  }

  // Automatically set user_id if not provided
  const finalLeadData = {
    ...leadData,
    user_id: leadData.user_id || user?.id || null
  }

  // Use service role client for API operations (bypasses RLS)
  const { data, error } = await supabaseService
    .from('lead_summaries')
    .insert(finalLeadData)
    .select()
    .single()
  
  if (error) {
    console.error('Lead creation error:', error)
    throw error
  }
  
  return data
}

// Comprehensive Error Handling
export function handleSupabaseError(error: any) {
  const errorMap: Record<string, string> = {
    'PGRST116': 'Permission denied. Check user authentication.',
    'PGRST000': 'Database operation failed',
    '23505': 'Unique constraint violation',
    '23503': 'Foreign key constraint violation',
    '42501': 'Row-level security policy violation',
    '42P01': 'Table does not exist'
  }

  const errorMessage = errorMap[error.code] || 'Unexpected database error'
  
  console.error({
    message: errorMessage,
    code: error.code,
    details: error.message,
    context: error
  })

  return {
    message: errorMessage,
    code: error.code,
    details: error.message
  }
}

// Type-safe search results creation
export async function createSearchResults(
  leadId: string,
  results: Array<{ url: string; title?: string; snippet?: string; source: string }>
) {
  if (results.length === 0) {
    console.info('No search results to store')
    return []
  }

  const searchRecords = results.map(result => ({
    lead_id: leadId,
    source: result.source,
    url: result.url,
    title: result.title || '',
    snippet: result.snippet || '',
    raw: result
  }))

  const { data, error } = await supabaseService
    .from('lead_search_results')
    .insert(searchRecords)
    .select()

  if (error) {
    console.error('Failed to store search results:', error)
    throw error
  }

  console.info(`Stored ${results.length} search results for lead ${leadId}`)
  return data || []
}

// Get search results for a lead
export async function getSearchResults(leadId: string) {
  const { data, error } = await supabaseService
    .from('lead_search_results')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch search results:', error)
    throw error
  }

  return data || []
}

// Get leads for the current user
export async function getUserLeads() {
  const { data, error } = await supabase
    .from('lead_summaries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Get user leads error:', error)
    throw error
  }

  return data || []
}

// Get a specific lead by ID
export async function getLeadById(id: string) {
  const { data, error } = await supabaseService
    .from('lead_summaries')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Lead not found
    }
    console.error('Get lead error:', error)
    throw error
  }

  return data
}
