// Lead management types for Supabase integration

export interface LeadSummary {
  id: string;
  user_id: string;
  name: string;
  email: string;
  company_name?: string;
  role?: string;
  interests?: string;
  conversation_summary: string;
  consultant_brief: string;
  lead_score?: number;
  ai_capabilities_shown?: string[];
  created_at: string;
  updated_at: string;
}

export interface LeadSearchResult {
  id: string;
  lead_id: string;
  source: string;
  url: string;
  title?: string;
  snippet?: string;
  raw?: any;
  created_at: string;
}

export interface CreateLeadData {
  name: string;
  email: string;
  company_name?: string;
  role?: string;
  interests?: string;
  conversation_summary: string;
  consultant_brief: string;
  lead_score?: number;
  ai_capabilities_shown?: string[];
  user_id?: string; // Optional - will be set from auth context
}

export interface UpdateLeadData {
  name?: string;
  email?: string;
  company_name?: string;
  role?: string;
  interests?: string;
  conversation_summary?: string;
  consultant_brief?: string;
  lead_score?: number;
  ai_capabilities_shown?: string[];
} 