import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ksmxqswuzrmdgckwxkvn.supabase.co"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkRealtimeSetup() {
  try {
    console.log('🔍 Checking realtime setup...')
    
    // Check if activities table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('activities')
      .select('count')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Activities table error:', tableError.message)
      return
    }
    
    console.log('✅ Activities table exists and is accessible')
    
    // Check realtime publication tables
    const { data: publicationTables, error: pubError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT tablename 
          FROM pg_publication_tables 
          WHERE pubname = 'supabase_realtime'
          ORDER BY tablename;
        `
      })
    
    if (pubError) {
      console.error('❌ Failed to check publication tables:', pubError.message)
      
      // Try alternative approach
      console.log('🔄 Trying alternative check...')
      const { data: altCheck, error: altError } = await supabase
        .rpc('exec_sql', {
          sql: `
            SELECT schemaname, tablename 
            FROM pg_tables 
            WHERE tablename IN ('activities', 'lead_summaries', 'lead_search_results')
            ORDER BY tablename;
          `
        })
      
      if (altError) {
        console.error('❌ Alternative check failed:', altError.message)
      } else {
        console.log('📋 Available tables:', altCheck)
      }
      return
    }
    
    console.log('📡 Realtime publication tables:')
    publicationTables.forEach(table => {
      console.log(`  - ${table.tablename}`)
    })
    
    const hasActivities = publicationTables.some(table => table.tablename === 'activities')
    
    if (hasActivities) {
      console.log('✅ Activities table is in realtime publication')
    } else {
      console.log('❌ Activities table is NOT in realtime publication')
      console.log('🔧 Adding activities table to realtime publication...')
      
      const { error: addError } = await supabase
        .rpc('exec_sql', {
          sql: 'ALTER PUBLICATION supabase_realtime ADD TABLE activities;'
        })
      
      if (addError) {
        console.error('❌ Failed to add activities to realtime:', addError.message)
      } else {
        console.log('✅ Successfully added activities to realtime publication')
      }
    }
    
    // Check RLS policies
    const { data: policies, error: policyError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT tablename, policyname, permissive, roles, cmd
          FROM pg_policies 
          WHERE tablename = 'activities'
          ORDER BY policyname;
        `
      })
    
    if (policyError) {
      console.error('❌ Failed to check policies:', policyError.message)
    } else {
      console.log('🔒 Activities table RLS policies:')
      policies.forEach(policy => {
        console.log(`  - ${policy.policyname}: ${policy.cmd}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Check error:', error.message)
  }
}

// Run the check
checkRealtimeSetup().then(() => {
  console.log('🔍 Realtime setup check completed')
  process.exit(0)
}) 