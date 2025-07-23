export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      lead_summaries: {
        Row: {
          id: string
          user_id: string | null
          name: string
          email: string
          company_name: string | null
          role: string | null
          interests: string | null
          conversation_summary: string
          consultant_brief: string
          lead_score: number | null
          ai_capabilities_shown: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          email: string
          company_name?: string | null
          role?: string | null
          interests?: string | null
          conversation_summary: string
          consultant_brief: string
          lead_score?: number | null
          ai_capabilities_shown?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          email?: string
          company_name?: string | null
          role?: string | null
          interests?: string | null
          conversation_summary?: string
          consultant_brief?: string
          lead_score?: number | null
          ai_capabilities_shown?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_summaries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      lead_search_results: {
        Row: {
          id: string
          lead_id: string
          source: string
          url: string
          title: string | null
          snippet: string | null
          raw: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          source: string
          url: string
          title?: string | null
          snippet?: string | null
          raw?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          source?: string
          url?: string
          title?: string | null
          snippet?: string | null
          raw?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_search_results_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "lead_summaries"
            referencedColumns: ["id"]
          }
        ]
      }
      activities: {
        Row: {
          id: string
          type: string
          title: string
          description: string | null
          status: string
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: string
          title: string
          description?: string | null
          status: string
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: string
          title?: string
          description?: string | null
          status?: string
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
