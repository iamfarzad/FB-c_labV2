import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ksmxqswuzrmdgckwxkvn.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testRealtimeActivities() {
  try {
    console.log('🧪 Testing realtime activities functionality...')
    
    // 1. Test that activities table exists and is accessible
    console.log('📋 Testing activities table access...')
    const { data: existingActivities, error: selectError } = await supabase
      .from('activities')
      .select('*')
      .limit(5)
    
    if (selectError) {
      console.error('❌ Failed to select from activities table:', selectError.message)
      return
    }
    
    console.log('✅ Activities table is accessible')
    console.log(`📊 Found ${existingActivities?.length || 0} existing activities`)
    
    // 2. Test inserting a new activity
    console.log('📝 Testing activity insertion...')
    const testActivity = {
      type: 'test',
      title: 'Realtime Test Activity',
      description: 'Testing realtime functionality',
      status: 'completed',
      metadata: { test: true, timestamp: new Date().toISOString() }
    }
    
    const { data: newActivity, error: insertError } = await supabase
      .from('activities')
      .insert(testActivity)
      .select()
      .single()
    
    if (insertError) {
      console.error('❌ Failed to insert activity:', insertError.message)
      return
    }
    
    console.log('✅ Activity inserted successfully:', newActivity.id)
    
    // 3. Test realtime subscription
    console.log('📡 Testing realtime subscription...')
    
    return new Promise((resolve) => {
      const channel = supabase
        .channel('test-activities-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'activities'
          },
          (payload) => {
            console.log('✅ Realtime event received:', payload.new.title)
            supabase.removeChannel(channel)
            resolve(true)
          }
        )
        .subscribe((status) => {
          console.log('📡 Subscription status:', status)
          if (status === 'SUBSCRIBED') {
            console.log('✅ Realtime subscription active')
            
            // Insert another test activity to trigger the realtime event
            setTimeout(async () => {
              const { error: triggerError } = await supabase
                .from('activities')
                .insert({
                  type: 'realtime_test',
                  title: 'Realtime Trigger Test',
                  description: 'This should trigger a realtime event',
                  status: 'completed',
                  metadata: { realtime_test: true }
                })
              
              if (triggerError) {
                console.error('❌ Failed to trigger realtime event:', triggerError.message)
                supabase.removeChannel(channel)
                resolve(false)
              }
            }, 1000)
          }
        })
      
      // Timeout after 10 seconds
      setTimeout(() => {
        console.log('⏰ Realtime test timed out')
        supabase.removeChannel(channel)
        resolve(false)
      }, 10000)
    })
    
  } catch (error) {
    console.error('❌ Test error:', error.message)
    return false
  }
}

// Run the test
testRealtimeActivities().then((success) => {
  if (success) {
    console.log('🎉 Realtime activities test PASSED!')
    console.log('✅ Your Supabase realtime setup is working correctly')
  } else {
    console.log('❌ Realtime activities test FAILED')
    console.log('🔧 Check your realtime configuration')
  }
  process.exit(success ? 0 : 1)
}) 