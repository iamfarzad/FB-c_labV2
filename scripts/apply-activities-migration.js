import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabaseUrl = "https://ksmxqswuzrmdgckwxkvn.supabase.co"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyActivitiesMigration() {
  try {
    console.log('Applying activities table migration...')
    
    // Read the migration SQL
    const migrationSQL = readFileSync('scripts/06-add-activities-table.sql', 'utf8')
    
    // Split into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)
    
    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 50) + '...')
      
      const { error } = await supabase.rpc('exec_sql', { 
        sql: statement + ';'
      })
      
      if (error) {
        console.error('Statement failed:', error)
        console.error('Failed statement:', statement)
      } else {
        console.log('✅ Statement executed successfully')
      }
    }
    
    console.log('Activities migration completed!')
    
    // Test the table exists
    const { data, error: testError } = await supabase
      .from('activities')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('Table test failed:', testError)
    } else {
      console.log('✅ Activities table test successful - table exists!')
    }
    
  } catch (error) {
    console.error('Migration script error:', error)
    process.exit(1)
  }
}

applyActivitiesMigration()
