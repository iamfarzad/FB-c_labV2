import { createClient } from '@supabase/supabase-js'
import { Database } from '../database.types'

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required Supabase environment variables:', {
    url: !!supabaseUrl,
    anonKey: !!supabaseAnonKey
  })
}

// Improved Supabase Client Setup with TypeScript types and error handling
export const supabase = createClient<Database>(
  supabaseUrl || '', 
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
)

// Service Role Client for API operations (bypasses RLS)
export const supabaseService = createClient<Database>(
  supabaseUrl || '',
  supabaseServiceKey || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Type-safe Lead Creation Function
export async function createLeadSummary(
  leadData: Database['public']['Tables']['lead_summaries']['Insert']
) {
  // Get current authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError) {
    console.error('Auth error:', userError)
    // Don't throw error, just log it and continue
  }

  if (!user) {
    console.warn('No authenticated user found, using service role for lead creation')
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
    console.log('No search results to store')
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

  console.log(`Stored ${results.length} search results for lead ${leadId}`)
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
