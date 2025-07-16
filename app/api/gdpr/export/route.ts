import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase/server'
import { validateInput, GDPRExportSchema } from '@/lib/validation-schemas'
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
    const { email } = validateInput(GDPRExportSchema, await req.json())

    const supabase = getSupabase()

    // Log the export request
    await logActivity({
      type: 'gdpr_export_request',
      title: 'GDPR Export Request',
      description: `Data export requested for email: ${email}`,
      status: 'pending',
      metadata: {
        email,
        requestType: 'gdpr_export',
        timestamp: new Date().toISOString()
      }
    })

    // Collect all personal data
    const personalData: any = {
      exportRequestedAt: new Date().toISOString(),
      email,
      dataTypes: {},
      summary: {}
    }

    // 1. Lead data
    const { data: leads, error: leadsError } = await supabase
      .from('lead_summaries')
      .select('*')
      .eq('email', email)
      .is('deleted_at', null) // Only non-deleted records

    if (leadsError) {
      console.error('Error fetching leads for export:', leadsError)
    } else {
      personalData.dataTypes.leads = leads || []
      personalData.summary.leadsCount = leads?.length || 0
    }

    // 2. Meeting data
    let meetings: any[] = []
    if (leads && leads.length > 0) {
      const leadIds = leads.map(lead => lead.id)
      const { data: meetingsData, error: meetingsError } = await supabase
        .from('meetings')
        .select('*')
        .in('lead_id', leadIds)
        .is('deleted_at', null)

      if (meetingsError) {
        console.error('Error fetching meetings for export:', meetingsError)
      } else {
        meetings = meetingsData || []
        personalData.dataTypes.meetings = meetings
        personalData.summary.meetingsCount = meetings.length
      }
    }

    // 3. Email events
    const { data: emailEvents, error: emailEventsError } = await supabase
      .from('email_events')
      .select('*')
      .eq('recipient', email)
      .is('deleted_at', null)

    if (emailEventsError) {
      console.error('Error fetching email events for export:', emailEventsError)
    } else {
      personalData.dataTypes.emailEvents = emailEvents || []
      personalData.summary.emailEventsCount = emailEvents?.length || 0
    }

    // 4. Token usage logs
    const { data: tokenLogs, error: tokenLogsError } = await supabase
      .from('token_usage_logs')
      .select('*')
      .eq('user_id', email)
      .is('deleted_at', null)

    if (tokenLogsError) {
      console.error('Error fetching token logs for export:', tokenLogsError)
    } else {
      personalData.dataTypes.tokenUsage = tokenLogs || []
      personalData.summary.tokenUsageCount = tokenLogs?.length || 0
    }

    // 5. Consent logs
    const { data: consentLogs, error: consentLogsError } = await supabase
      .from('consent_logs')
      .select('*')
      .eq('email', email)

    if (consentLogsError) {
      console.error('Error fetching consent logs for export:', consentLogsError)
    } else {
      personalData.dataTypes.consentLogs = consentLogs || []
      personalData.summary.consentLogsCount = consentLogs?.length || 0
    }

    // 6. Activity logs
    const { data: activityLogs, error: activityLogsError } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_email', email)

    if (activityLogsError) {
      console.error('Error fetching activity logs for export:', activityLogsError)
    } else {
      personalData.dataTypes.activityLogs = activityLogs || []
      personalData.summary.activityLogsCount = activityLogs?.length || 0
    }

    // 7. GDPR deletion logs (if any)
    const { data: deletionLogs, error: deletionLogsError } = await supabase
      .from('gdpr_deletion_logs')
      .select('*')
      .eq('email', email)

    if (deletionLogsError) {
      console.error('Error fetching deletion logs for export:', deletionLogsError)
    } else {
      personalData.dataTypes.deletionLogs = deletionLogs || []
      personalData.summary.deletionLogsCount = deletionLogs?.length || 0
    }

    // Calculate data summary
    const totalRecords = Object.values(personalData.summary).reduce((sum: number, count: any) => sum + (count || 0), 0)
    personalData.summary.totalRecords = totalRecords

    // Add data processing information
    personalData.dataProcessingInfo = {
      dataController: 'FB-c_labV2',
      legalBasis: 'Legitimate interest and consent',
      dataRetentionPeriod: 'As long as necessary for business purposes or until deletion request',
      dataCategories: [
        'Personal identification data',
        'Contact information',
        'Professional information',
        'Communication history',
        'Usage analytics',
        'Consent records'
      ],
      dataSources: [
        'Direct user input',
        'Email interactions',
        'AI conversation logs',
        'Meeting records',
        'System activity logs'
      ]
    }

    // Add user rights information
    personalData.userRights = {
      rightToAccess: 'You have the right to access your personal data (this export)',
      rightToRectification: 'You can request correction of inaccurate data',
      rightToErasure: 'You can request deletion of your data',
      rightToRestriction: 'You can request restriction of data processing',
      rightToPortability: 'You can request data in a portable format (this export)',
      rightToObject: 'You can object to data processing',
      rightToWithdrawConsent: 'You can withdraw consent at any time'
    }

    // Create export log entry
    const exportLog = {
      email,
      export_requested_at: new Date().toISOString(),
      data_types: Object.keys(personalData.dataTypes),
      records_count: personalData.summary,
      status: 'completed',
      completed_at: new Date().toISOString()
    }

    // Insert export log
    const { error: logError } = await supabase
      .from('gdpr_export_logs')
      .insert(exportLog)

    if (logError) {
      console.error('Error logging export request:', logError)
    }

    // Log successful export
    await logActivity({
      type: 'gdpr_export_completed',
      title: 'GDPR Export Completed',
      description: `Data export completed for email: ${email}`,
      status: 'completed',
      metadata: {
        email,
        recordsExported: personalData.summary,
        timestamp: new Date().toISOString()
      }
    })

    // Send export via email
    try {
      const { EmailService } = await import('@/lib/email-service')
      
      // Create CSV attachments for each data type
      const attachments = []
      
      if (leads && leads.length > 0) {
        const csvContent = convertToCSV(leads)
        attachments.push({
          filename: 'leads_data.csv',
          content: csvContent,
          contentType: 'text/csv'
        })
      }
      
      if (meetings && meetings.length > 0) {
        const csvContent = convertToCSV(meetings)
        attachments.push({
          filename: 'meetings_data.csv',
          content: csvContent,
          contentType: 'text/csv'
        })
      }
      
      if (emailEvents && emailEvents.length > 0) {
        const csvContent = convertToCSV(emailEvents)
        attachments.push({
          filename: 'email_events_data.csv',
          content: csvContent,
          contentType: 'text/csv'
        })
      }

      await EmailService.sendEmail({
        to: email,
        subject: 'Your Personal Data Export - FB-c_labV2',
        html: `
          <h2>Your Personal Data Export</h2>
          <p>As requested, here is your personal data export from FB-c_labV2.</p>
          
          <h3>Data Summary</h3>
          <ul>
            <li>Lead records: ${personalData.summary.leadsCount || 0}</li>
            <li>Meeting records: ${personalData.summary.meetingsCount || 0}</li>
            <li>Email events: ${personalData.summary.emailEventsCount || 0}</li>
            <li>Token usage logs: ${personalData.summary.tokenUsageCount || 0}</li>
            <li>Consent logs: ${personalData.summary.consentLogsCount || 0}</li>
            <li>Activity logs: ${personalData.summary.activityLogsCount || 0}</li>
          </ul>
          
          <p><strong>Total records exported: ${totalRecords}</strong></p>
          
          <h3>Your Rights</h3>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data (this export)</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to data processing</li>
            <li>Withdraw consent at any time</li>
          </ul>
          
          <p>If you have any questions about your data or rights, please contact our support team.</p>
          
          <p>Best regards,<br>The FB-c_labV2 Team</p>
        `,
        attachments,
        tags: { type: 'gdpr_export', email }
      })
    } catch (emailError) {
      console.error('Error sending export email:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Data export completed successfully',
      exportSummary: {
        email,
        totalRecords,
        dataTypes: Object.keys(personalData.dataTypes),
        timestamp: new Date().toISOString()
      },
      // Include a subset of data in the response (for immediate access)
      sampleData: {
        leads: leads?.slice(0, 3) || [], // First 3 leads
        meetings: meetings?.slice(0, 3) || [], // First 3 meetings
        emailEvents: emailEvents?.slice(0, 3) || [] // First 3 email events
      }
    })

  } catch (error: any) {
    console.error('GDPR export error:', error)

    // Log the error
    await logActivity({
      type: 'gdpr_export_error',
      title: 'GDPR Export Error',
      description: `Error processing export request: ${error.message}`,
      status: 'failed',
      metadata: {
        error: error.message,
        timestamp: new Date().toISOString()
      }
    })

    return NextResponse.json(
      { 
        error: 'Failed to process export request',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// Helper function to convert data to CSV format
function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const csvRows = [headers.join(',')]
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header]
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value || ''
    })
    csvRows.push(values.join(','))
  }
  
  return csvRows.join('\n')
}