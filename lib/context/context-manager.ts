import { getSupabase } from '@/lib/supabase/server'
import { ContextSnapshotSchema, type ContextSnapshot } from './context-schema'

export async function getContextSnapshot(sessionId: string): Promise<ContextSnapshot | null> {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('conversation_contexts')
    .select('*')
    .eq('session_id', sessionId)
    .maybeSingle()

  if (!data) return null

  const snapshot: ContextSnapshot = {
    lead: { email: data.email, name: data.name || '' },
    company: data.company_context || undefined,
    person: data.person_context || undefined,
    role: data.role || undefined,
    roleConfidence: data.role_confidence || undefined,
    intent: data.intent_data || undefined,
    capabilities: data.ai_capabilities_shown || [],
  }

  return ContextSnapshotSchema.parse(snapshot)
}

export async function updateContext(sessionId: string, patch: Partial<ContextSnapshot>) {
  const supabase = getSupabase()
  const { data: existing } = await supabase
    .from('conversation_contexts')
    .select('*')
    .eq('session_id', sessionId)
    .maybeSingle()

  const merged = {
    email: existing?.email,
    name: existing?.name,
    company_context: patch.company ?? existing?.company_context ?? null,
    person_context: patch.person ?? existing?.person_context ?? null,
    role: patch.role ?? existing?.role ?? null,
    role_confidence: patch.roleConfidence ?? existing?.role_confidence ?? null,
    intent_data: patch.intent ?? existing?.intent_data ?? null,
    ai_capabilities_shown: patch.capabilities ?? existing?.ai_capabilities_shown ?? [],
    updated_at: new Date().toISOString(),
  }

  await supabase.from('conversation_contexts').update(merged).eq('session_id', sessionId)
}


