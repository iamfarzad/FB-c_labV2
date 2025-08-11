import { createClient } from '@supabase/supabase-js'

export interface ConversationContext {
  session_id: string
  email: string
  name?: string
  company_url?: string
  company_context?: any
  person_context?: any
  role?: string
  role_confidence?: number
  intent_data?: any
  ai_capabilities_shown?: string[]
  tool_outputs?: Record<string, any>
  created_at?: string
  updated_at?: string
}

export class ContextStorage {
  private supabase: any

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  async store(sessionId: string, payload: Partial<ConversationContext>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('conversation_contexts')
        .upsert({
          session_id: sessionId,
          ...payload,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error storing context:', error)
        throw error
      }
    } catch (error) {
      console.error('Context storage failed:', error)
      throw error
    }
  }

  async get(sessionId: string): Promise<ConversationContext | null> {
    try {
      const { data, error } = await this.supabase
        .from('conversation_contexts')
        .select('*')
        .eq('session_id', sessionId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error retrieving context:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Context retrieval failed:', error)
      return null
    }
  }

  async update(sessionId: string, patch: Partial<ConversationContext>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('conversation_contexts')
        .update({
          ...patch,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)

      if (error) {
        console.error('Error updating context:', error)
        throw error
      }
    } catch (error) {
      console.error('Context update failed:', error)
      throw error
    }
  }

  async delete(sessionId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('conversation_contexts')
        .delete()
        .eq('session_id', sessionId)

      if (error) {
        console.error('Error deleting context:', error)
        throw error
      }
    } catch (error) {
      console.error('Context deletion failed:', error)
      throw error
    }
  }
}
