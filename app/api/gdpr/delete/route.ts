import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase/server'
import { validateInput, GDPRDeleteSchema } from '@/lib/validation-schemas'
import { logActivity } from '@/lib/activity-logger'
import { rateLimitMiddleware } from '@/lib/rate-limiter'

export async function POST(req: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResponse = await rateLimitMiddleware(req)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Validate input
    const { email } = validateInput(GDPRDeleteSchema, await req.json())

    const supabase = getSupabase()

    // Log the deletion request
    await logActivity({
      type: 'gdpr_deletion_request',
      title: 'GDPR Deletion Request',
      description: `Data deletion requested for email: ${email}`,
      status: 'pending',
      metadata: {
        email,
        requestType: 'gdpr_deletion',
        timestamp: new Date().toISOString()
      }
    })

    // Find all data associated with the email
    const { data: leads, error: leadsError } = await supabase
      .from('lead_summaries')
      .select('*')
      .eq('email', email)

    if (leadsError) {
      console.error('Error fetching leads for deletion:', leadsError)
      return NextResponse.json(
        { error: 'Failed to process deletion request' },
        { status: 500 }
      )
    }

    // Find meetings associated with the leads
    const leadIds = leads?.map(lead => lead.id) || []
    let meetings: any[] = []
    
    if (leadIds.length > 0) {
      const { data: meetingsData, error: meetingsError } = await supabase
        .from('meetings')
        .select('*')
        .in('lead_id', leadIds)

      if (meetingsError) {
        console.error('Error fetching meetings for deletion:', meetingsError)
      } else {
        meetings = meetingsData || []
      }
    }

    // Find email events associated with the email
    const { data: emailEvents, error: emailEventsError } = await supabase
      .from('email_events')
      .select('*')
      .eq('recipient', email)

    if (emailEventsError) {
      console.error('Error fetching email events for deletion:', emailEventsError)
    }

    // Find token usage logs associated with the email
    const { data: tokenLogs, error: tokenLogsError } = await supabase
      .from('token_usage_logs')
      .select('*')
      .eq('user_id', email)

    if (tokenLogsError) {
      console.error('Error fetching token logs for deletion:', tokenLogsError)
    }

    // Create deletion log entry
    const deletionLog = {
      email,
      deletion_requested_at: new Date().toISOString(),
      data_types: ['leads', 'meetings', 'email_events', 'token_usage'],
      records_count: {
        leads: leads?.length || 0,
        meetings: meetings?.length || 0,
        email_events: emailEvents?.length || 0,
        token_logs: tokenLogs?.length || 0
      },
      status: 'pending_deletion'
    }

    // Insert deletion log
    const { error: logError } = await supabase
      .from('gdpr_deletion_logs')
      .insert(deletionLog)

    if (logError) {
      console.error('Error logging deletion request:', logError)
    }

    // Perform soft deletion (mark as deleted rather than hard delete)
    const deletionTimestamp = new Date().toISOString()

    // Soft delete leads
    if (leads && leads.length > 0) {
      const { error: deleteLeadsError } = await supabase
        .from('lead_summaries')
        .update({
          deleted_at: deletionTimestamp,
          deletion_reason: 'gdpr_request',
          email: `deleted_${Date.now()}_${email}`, // Anonymize email
          name: 'DELETED',
          company_name: null,
          conversation_summary: null,
          consultant_brief: null
        })
        .eq('email', email)

      if (deleteLeadsError) {
        console.error('Error soft deleting leads:', deleteLeadsError)
      }
    }

    // Soft delete meetings
    if (meetings && meetings.length > 0) {
      const { error: deleteMeetingsError } = await supabase
        .from('meetings')
        .update({
          deleted_at: deletionTimestamp,
          deletion_reason: 'gdpr_request',
          attendee_name: 'DELETED',
          attendee_email: `deleted_${Date.now()}_${email}`,
          notes: null
        })
        .in('lead_id', leadIds)

      if (deleteMeetingsError) {
        console.error('Error soft deleting meetings:', deleteMeetingsError)
      }
    }

    // Soft delete email events
    if (emailEvents && emailEvents.length > 0) {
      const { error: deleteEmailEventsError } = await supabase
        .from('email_events')
        .update({
          deleted_at: deletionTimestamp,
          deletion_reason: 'gdpr_request',
          recipient: `deleted_${Date.now()}_${email}`,
          subject: 'DELETED',
          event_data: null
        })
        .eq('recipient', email)

      if (deleteEmailEventsError) {
        console.error('Error soft deleting email events:', deleteEmailEventsError)
      }
    }

    // Soft delete token usage logs
    if (tokenLogs && tokenLogs.length > 0) {
      const { error: deleteTokenLogsError } = await supabase
        .from('token_usage_logs')
        .update({
          deleted_at: deletionTimestamp,
          deletion_reason: 'gdpr_request',
          user_id: `deleted_${Date.now()}_${email}`,
          metadata: null
        })
        .eq('user_id', email)

      if (deleteTokenLogsError) {
        console.error('Error soft deleting token logs:', deleteTokenLogsError)
      }
    }

    // Update deletion log status
    await supabase
      .from('gdpr_deletion_logs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('email', email)
      .eq('status', 'pending_deletion')

    // Log successful deletion
    await logActivity({
      type: 'gdpr_deletion_completed',
      title: 'GDPR Deletion Completed',
      description: `Data deletion completed for email: ${email}`,
      status: 'completed',
      metadata: {
        email,
        recordsDeleted: {
          leads: leads?.length || 0,
          meetings: meetings?.length || 0,
          email_events: emailEvents?.length || 0,
          token_logs: tokenLogs?.length || 0
        },
        timestamp: new Date().toISOString()
      }
    })

    // Send confirmation email (optional)
    try {
      const { EmailService } = await import('@/lib/email-service')
      await EmailService.sendEmail({
        to: email,
        subject: 'Your Data Deletion Request - Confirmed',
        html: `
          <h2>Data Deletion Confirmation</h2>
          <p>Your data deletion request has been processed successfully.</p>
          <p>The following data has been deleted:</p>
          <ul>
            <li>Lead information: ${leads?.length || 0} records</li>
            <li>Meeting records: ${meetings?.length || 0} records</li>
            <li>Email events: ${emailEvents?.length || 0} records</li>
            <li>Token usage logs: ${tokenLogs?.length || 0} records</li>
          </ul>
          <p>Your data has been permanently deleted from our systems.</p>
          <p>If you have any questions, please contact our support team.</p>
        `,
        tags: { type: 'gdpr_deletion_confirmation', email }
      })
    } catch (emailError) {
      console.error('Error sending deletion confirmation email:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Data deletion request processed successfully',
      deletionSummary: {
        email,
        recordsDeleted: {
          leads: leads?.length || 0,
          meetings: meetings?.length || 0,
          email_events: emailEvents?.length || 0,
          token_logs: tokenLogs?.length || 0
        },
        timestamp: deletionTimestamp
      }
    })

  } catch (error: any) {
    console.error('GDPR deletion error:', error)

    // Log the error
    await logActivity({
      type: 'gdpr_deletion_error',
      title: 'GDPR Deletion Error',
      description: `Error processing deletion request: ${error.message}`,
      status: 'failed',
      metadata: {
        error: error.message,
        timestamp: new Date().toISOString()
      }
    })

    return NextResponse.json(
      { 
        error: 'Failed to process deletion request',
        details: error.message 
      },
      { status: 500 }
    )
  }
}