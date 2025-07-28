import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables from .env file
function loadEnv() {
  try {
    const envPath = join(process.cwd(), '.env')
    const envContent = readFileSync(envPath, 'utf8')
    const envVars = {}
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim()
        if (value && !key.startsWith('#')) {
          envVars[key.trim()] = value.replace(/^["']|["']$/g, '')
        }
      }
    })
    
    return envVars
  } catch (error) {
    console.error('Error loading .env file:', error.message)
    return {}
  }
}

const env = loadEnv()

// Initialize Supabase client
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixStuckActivities() {
  try {
    console.log('🔧 Fixing stuck activities...')
    
    // Find activities that have been in progress for more than 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - (5 * 60 * 1000)).toISOString()
    
    const { data: stuckActivities, error: fetchError } = await supabase
      .from('activities')
      .select('*')
      .eq('status', 'in_progress')
      .lt('created_at', fiveMinutesAgo)
    
    if (fetchError) {
      console.error('Error fetching stuck activities:', fetchError)
      return
    }
    
    console.log(`Found ${stuckActivities.length} stuck activities`)
    
    if (stuckActivities.length === 0) {
      console.log('✅ No stuck activities found')
      return
    }
    
    // Update all stuck activities to failed status
    const { data: updatedActivities, error: updateError } = await supabase
      .from('activities')
      .update({ 
        status: 'failed',
        metadata: { timeout_reason: 'Activity timed out after 5 minutes' }
      })
      .eq('status', 'in_progress')
      .lt('created_at', fiveMinutesAgo)
      .select()
    
    if (updateError) {
      console.error('Error updating stuck activities:', updateError)
      return
    }
    
    console.log(`✅ Successfully updated ${updatedActivities.length} stuck activities to failed status`)
    
    // Log the fixed activities
    updatedActivities.forEach(activity => {
      console.log(`  - ${activity.title}: ${activity.description}`)
    })
    
  } catch (error) {
    console.error('Error fixing stuck activities:', error)
  }
}

// Run the fix
fixStuckActivities()
  .then(() => {
    console.log('🎉 Stuck activities fix completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Failed to fix stuck activities:', error)
    process.exit(1)
  })
