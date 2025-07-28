import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ksmxqswuzrmdgckwxkvn.supabase.co"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  try {
    console.log('Applying migration...')
    
    // Create the table
    console.log('Creating lead_search_results table...')
    const { error: createError } = await supabase.rpc('exec_sql', { 
      sql: `
        CREATE TABLE IF NOT EXISTS lead_search_results (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          lead_id UUID REFERENCES lead_summaries(id) ON DELETE CASCADE,
          source TEXT NOT NULL,
          url TEXT NOT NULL,
          title TEXT,
          snippet TEXT,
          raw JSONB,
          created_at TIMESTAMPTZ DEFAULT now()
        );
      `
    })
    
    if (createError) {
      console.error('Table creation failed:', createError)
    } else {
      console.log('Table created successfully!')
    }
    
    // Create indexes
    console.log('Creating indexes...')
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_lead_search_results_lead_id ON lead_search_results(lead_id);',
      'CREATE INDEX IF NOT EXISTS idx_lead_search_results_source ON lead_search_results(source);',
      'CREATE INDEX IF NOT EXISTS idx_lead_search_results_created_at ON lead_search_results(created_at);'
    ]
    
    for (const indexSQL of indexes) {
      const { error } = await supabase.rpc('exec_sql', { sql: indexSQL })
      if (error) {
        console.error('Index creation failed:', error)
      }
    }
    
    // Enable RLS
    console.log('Enabling RLS...')
    const { error: rlsError } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE lead_search_results ENABLE ROW LEVEL SECURITY;'
    })
    
    if (rlsError) {
      console.error('RLS enable failed:', rlsError)
    }
    
    // Create policies
    console.log('Creating RLS policies...')
    const policies = [
      `CREATE POLICY "service_role full access" 
        ON lead_search_results FOR ALL 
        USING (auth.role() = 'service_role') 
        WITH CHECK (auth.role() = 'service_role');`,
      `CREATE POLICY "auth read own" 
        ON lead_search_results FOR SELECT 
        USING (true);`
    ]
    
    for (const policySQL of policies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policySQL })
      if (error) {
        console.error('Policy creation failed:', error)
      }
    }
    
    console.log('Migration completed!')
    
    // Test the table exists
    const { data, error: testError } = await supabase
      .from('lead_search_results')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('Table test failed:', testError)
    } else {
      console.log('✅ Table test successful - lead_search_results table exists!')
    }
    
  } catch (error) {
    console.error('Migration script error:', error)
    process.exit(1)
  }
}

applyMigration()
