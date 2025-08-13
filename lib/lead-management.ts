import { supabase, createLeadSummary as createLead, getSearchResults, getUserLeads, getLeadById, createSearchResults, handleSupabaseError } from './supabase/client'
import type { Database } from './database.types'

export class LeadManagementService {
  /**
   * Create a new lead summary
   */
  async createLeadSummary(leadData: Database['public']['Tables']['lead_summaries']['Insert']): Promise<Database['public']['Tables']['lead_summaries']['Row']> {
    try {
      return await createLead(leadData)
    } catch (error) {
      console.error('Lead creation failed:', error)
      throw error
    }
  }

  /**
   * Get leads for the current user
   */
  async getUserLeads(): Promise<Database['public']['Tables']['lead_summaries']['Row'][]> {
    try {
      return await getUserLeads()
    } catch (error) {
      console.error('Get user leads failed:', error)
      throw error
    }
  }

  /**
   * Get a specific lead by ID
   */
  async getLeadById(id: string): Promise<Database['public']['Tables']['lead_summaries']['Row'] | null> {
    try {
      return await getLeadById(id)
    } catch (error) {
      console.error('Get lead failed:', error)
      throw error
    }
  }

  /**
   * Update a lead summary
   */
  async updateLeadSummary(id: string, updates: Partial<Database['public']['Tables']['lead_summaries']['Update']>): Promise<Database['public']['Tables']['lead_summaries']['Row']> {
    try {
      const { data, error } = await supabase
        .from('lead_summaries')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Update lead error:', error)
        throw new Error(`Failed to update lead: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Update lead failed:', error)
      throw error
    }
  }

  /**
   * Delete a lead summary
   */
  async deleteLeadSummary(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('lead_summaries')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Delete lead error:', error)
        throw new Error(`Failed to delete lead: ${error.message}`)
      }
    } catch (error) {
      console.error('Delete lead failed:', error)
      throw error
    }
  }

  /**
   * Get search results for a lead
   */
  async getLeadSearchResults(leadId: string): Promise<Database['public']['Tables']['lead_search_results']['Row'][]> {
    try {
      return await getSearchResults(leadId)
    } catch (error) {
      console.error('Get search results failed:', error)
      throw error
    }
  }

  /**
   * Store search results for a lead
   */
  async storeSearchResults(leadId: string, results: Array<{ url: string; title?: string; snippet?: string; source: string }>): Promise<void> {
    try {
      if (results.length === 0) {
        console.info('No search results to store')
        return
      }

      // Use the new client function
      await createSearchResults(leadId, results)
    } catch (error) {
      console.error('Store search results failed:', error)
      throw error
    }
  }
}
