import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ksmxqswuzrmdgckwxkvn.supabase.co"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Testing lead creation...')
console.log('Service role key length:', supabaseServiceKey?.length)

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not found')
  process.exit(1)
}

const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testLeadCreation() {
  try {
    console.log('Attempting to create test lead...')
    
    const testLead = {
      name: "Test User",
      email: "test@example.com",
      conversation_summary: "Test conversation",
      consultant_brief: "Test brief",
      lead_score: 50,
      ai_capabilities_shown: ["chat"]
    }
    
    const { data, error } = await supabaseService
      .from('lead_summaries')
      .insert(testLead)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating lead:', error)
      return
    }
    
    console.log('Successfully created lead:', data)
    
    // Now try to read it back
    const { data: readData, error: readError } = await supabaseService
      .from('lead_summaries')
      .select('*')
      .eq('email', 'test@example.com')
      .single()
    
    if (readError) {
      console.error('Error reading lead:', readError)
      return
    }
    
    console.log('Successfully read lead:', readData)
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

testLeadCreation()
