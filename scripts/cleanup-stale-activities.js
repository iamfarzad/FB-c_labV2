import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ksmxqswuzrmdgckwxkvn.supabase.co"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanupStaleActivities() {
  try {
    console.log('🧹 Cleaning up stale activities...')
    
    // First, let's see what activities exist
    const { data: allActivities, error: selectError } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (selectError) {
      console.error('❌ Failed to fetch activities:', selectError.message)
      return
    }
    
    console.log(`📊 Found ${allActivities?.length || 0} total activities`)
    
    // Show activities by status
    const statusCounts = {}
    allActivities?.forEach(activity => {
      statusCounts[activity.status] = (statusCounts[activity.status] || 0) + 1
    })
    
    console.log('📈 Activity status breakdown:')
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`)
    })
    
    // Find stale activities (in_progress or pending for more than 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    
    const { data: staleActivities, error: staleError } = await supabase
      .from('activities')
      .select('*')
      .in('status', ['in_progress', 'pending'])
      .lt('created_at', fiveMinutesAgo)
    
    if (staleError) {
      console.error('❌ Failed to fetch stale activities:', staleError.message)
      return
    }
    
    console.log(`🔍 Found ${staleActivities?.length || 0} stale activities to clean up`)
    
    if (staleActivities && staleActivities.length > 0) {
      // Update stale activities to 'failed' status
      const { error: updateError } = await supabase
        .from('activities')
        .update({ 
          status: 'failed',
          description: activity => `${activity.description} (timed out - cleaned up)`
        })
        .in('status', ['in_progress', 'pending'])
        .lt('created_at', fiveMinutesAgo)
      
      if (updateError) {
        console.error('❌ Failed to update stale activities:', updateError.message)
        return
      }
      
      console.log('✅ Successfully cleaned up stale activities')
    } else {
      console.log('✅ No stale activities found')
    }
    
    // Also clean up very old completed activities (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    
    const { error: deleteError } = await supabase
      .from('activities')
      .delete()
      .eq('status', 'completed')
      .lt('created_at', oneHourAgo)
    
    if (deleteError) {
      console.error('❌ Failed to delete old completed activities:', deleteError.message)
    } else {
      console.log('✅ Cleaned up old completed activities')
    }
    
    // Show final status
    const { data: finalActivities, error: finalError } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!finalError && finalActivities) {
      const finalStatusCounts = {}
      finalActivities.forEach(activity => {
        finalStatusCounts[activity.status] = (finalStatusCounts[activity.status] || 0) + 1
      })
      
      console.log('\n📊 Final activity status:')
      Object.entries(finalStatusCounts).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`)
      })
      
      const activeCount = (finalStatusCounts['in_progress'] || 0) + (finalStatusCounts['pending'] || 0)
      console.log(`\n🎯 Active AI tasks: ${activeCount}`)
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message)
  }
}

cleanupStaleActivities() 