import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    
    // Update ALL stale activities (in_progress or pending) to 'failed' status
    const { error: updateError } = await supabase
      .from('activities')
      .update({ 
        status: 'failed',
        description: 'Activity timed out and was cleaned up'
      })
      .in('status', ['in_progress', 'pending'])
    
    if (updateError) {
      console.error('Failed to update stale activities:', updateError)
      return NextResponse.json({ error: 'Failed to cleanup activities' }, { status: 500 })
    }
    
    // Also clean up very old completed activities (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    
    const { error: deleteError } = await supabase
      .from('activities')
      .delete()
      .eq('status', 'completed')
      .lt('created_at', oneHourAgo)
    
    if (deleteError) {
      console.error('Failed to delete old completed activities:', deleteError)
    }
    
    // Get current activity counts
    const { data: activities, error: countError } = await supabase
      .from('activities')
      .select('status')
    
    if (countError) {
      console.error('Failed to get activity counts:', countError)
      return NextResponse.json({ error: 'Failed to get activity counts' }, { status: 500 })
    }
    
    const statusCounts = activities?.reduce((acc, activity) => {
      acc[activity.status] = (acc[activity.status] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}
    
    const activeCount = (statusCounts['in_progress'] || 0) + (statusCounts['pending'] || 0)
    
    return NextResponse.json({
      success: true,
      message: 'Activities cleaned up successfully',
      activeCount,
      statusCounts
    })
    
  } catch (error: any) {
    console.error('Activity cleanup error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred'
    }, { status: 500 })
  }
} 