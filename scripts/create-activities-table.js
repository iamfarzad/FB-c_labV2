import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ksmxqswuzrmdgckwxkvn.supabase.co"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  console.log('📋 Get it from: https://supabase.com/dashboard/project/ksmxqswuzrmdgckwxkvn/settings/api')
  console.log('🔑 Then run: export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createActivitiesTable() {
  try {
    console.log('🚀 Creating activities table...')
    
    // Check if activities table already exists
    const { data: existingTable, error: checkError } = await supabase
      .from('activities')
      .select('*')
      .limit(1)
    
    if (existingTable) {
      console.log('✅ Activities table already exists!')
      return
    }
    
    if (checkError && !checkError.message.includes('relation "public.activities" does not exist')) {
      console.error('❌ Unexpected error checking table:', checkError.message)
      return
    }
    
    console.log('📋 Activities table does not exist, creating it...')
    
    // Create the activities table using raw SQL
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS activities (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (createError) {
      console.error('❌ Failed to create table:', createError.message)
      console.log('🔄 Trying alternative approach...')
      
      // Try using the SQL editor approach
      console.log('📝 Please run this SQL in your Supabase Dashboard SQL Editor:')
      console.log(`
        CREATE TABLE IF NOT EXISTS activities (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- RLS for activities table
        ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Allow anonymous insert for activities" ON activities 
          FOR INSERT WITH CHECK (true);

        CREATE POLICY "Allow public read access for activities" ON activities 
          FOR SELECT USING (true);

        -- Indexes for activities
        CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
        CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
        CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

        -- Enable realtime for activities table
        ALTER PUBLICATION supabase_realtime ADD TABLE activities;
      `)
      return
    }
    
    console.log('✅ Activities table created successfully!')
    
    // Enable RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE activities ENABLE ROW LEVEL SECURITY;'
    })
    
    if (rlsError) {
      console.warn('⚠️ Could not enable RLS:', rlsError.message)
    } else {
      console.log('✅ RLS enabled')
    }
    
    // Create policies
    const policies = [
      `CREATE POLICY "Allow anonymous insert for activities" ON activities FOR INSERT WITH CHECK (true);`,
      `CREATE POLICY "Allow public read access for activities" ON activities FOR SELECT USING (true);`
    ]
    
    for (const policy of policies) {
      const { error: policyError } = await supabase.rpc('exec_sql', { sql: policy })
      if (policyError) {
        console.warn('⚠️ Could not create policy:', policyError.message)
      }
    }
    
    console.log('✅ Policies created')
    
    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);',
      'CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);',
      'CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);'
    ]
    
    for (const index of indexes) {
      const { error: indexError } = await supabase.rpc('exec_sql', { sql: index })
      if (indexError) {
        console.warn('⚠️ Could not create index:', indexError.message)
      }
    }
    
    console.log('✅ Indexes created')
    
    // Enable realtime
    const { error: realtimeError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER PUBLICATION supabase_realtime ADD TABLE activities;'
    })
    
    if (realtimeError) {
      console.warn('⚠️ Could not enable realtime:', realtimeError.message)
    } else {
      console.log('✅ Realtime enabled')
    }
    
    console.log('🎉 Activities table setup completed!')
    
    // Test the table
    const { data, error: testError } = await supabase
      .from('activities')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('❌ Table test failed:', testError.message)
    } else {
      console.log('✅ Activities table test successful!')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

createActivitiesTable() 