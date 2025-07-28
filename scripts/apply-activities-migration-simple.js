import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// You'll need to replace [YOUR-PASSWORD] with your actual database password
const supabaseUrl = "https://ksmxqswuzrmdgckwxkvn.supabase.co"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  console.log('📋 Get it from: https://supabase.com/dashboard/project/ksmxqswuzrmdgckwxkvn/settings/api')
  console.log('🔑 Then run: export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyActivitiesMigration() {
  try {
    console.log('🚀 Applying activities table migration...')
    
    // Check if activities table already exists
    const { data: existingTable, error: checkError } = await supabase
      .from('activities')
      .select('*')
      .limit(1)
    
    if (checkError && checkError.message.includes('relation "public.activities" does not exist')) {
      console.log('📋 Activities table does not exist, creating it...')
    } else if (existingTable) {
      console.log('✅ Activities table already exists!')
      return
    }
    
    // Read the migration SQL
    const migrationSQL = readFileSync('scripts/06-add-activities-table.sql', 'utf8')
    
    // Split into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('🔧 Executing:', statement.substring(0, 60) + '...')
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql: statement + ';'
        })
        
        if (error) {
          console.error('❌ Statement failed:', error.message)
          console.error('Failed statement:', statement)
        } else {
          console.log('✅ Statement executed successfully')
        }
      }
    }
    
    console.log('🎉 Activities migration completed!')
    
    // Test the table exists
    const { data, error: testError } = await supabase
      .from('activities')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('❌ Table test failed:', testError.message)
    } else {
      console.log('✅ Activities table test successful - table exists!')
    }
    
  } catch (error) {
    console.error('❌ Migration script error:', error.message)
    process.exit(1)
  }
}

applyActivitiesMigration()
