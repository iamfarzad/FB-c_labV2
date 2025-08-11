import { supabase } from '@/lib/supabase/server'

export async function recordCapabilityUsed(sessionId: string, capabilityName: string, usageData?: any) {
  const supabaseClient = supabase
  
  try {
    // 1. Record individual usage
    await supabaseClient
      .from('capability_usage')
      .insert({
        session_id: sessionId,
        capability_name: capabilityName,
        usage_data: usageData || {}
      })

    // 2. Update conversation_contexts.ai_capabilities_shown (deduplicated)
    const { data: context } = await supabaseClient
      .from('conversation_contexts')
      .select('ai_capabilities_shown')
      .eq('session_id', sessionId)
      .single()

    if (context) {
      const currentCapabilities = context.ai_capabilities_shown || []
      const updatedCapabilities = [...new Set([...currentCapabilities, capabilityName])]
      
      await supabaseClient
        .from('conversation_contexts')
        .update({ 
          ai_capabilities_shown: updatedCapabilities,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)
    }

    console.log(`✅ Recorded capability usage: ${capabilityName} for session: ${sessionId}`)
  } catch (error) {
    console.error(`❌ Failed to record capability usage: ${capabilityName}`, error)
  }
}

export async function getCapabilitiesUsed(sessionId: string): Promise<string[]> {
  const supabaseClient = supabase
  
  try {
    const { data: context } = await supabaseClient
      .from('conversation_contexts')
      .select('ai_capabilities_shown')
      .eq('session_id', sessionId)
      .single()

    return context?.ai_capabilities_shown || []
  } catch (error) {
    console.error(`❌ Failed to get capabilities for session: ${sessionId}`, error)
    return []
  }
}
