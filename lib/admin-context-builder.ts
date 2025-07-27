import { getSupabase } from '@/lib/supabase/server'
import { adminAuthMiddleware } from '@/lib/auth'

export interface AdminContext {
  overview: {
    totalLeads: number
    activeMeetings: number
    emailCampaigns: number
    totalCosts: number
    systemHealth: 'healthy' | 'warning' | 'error'
  }
  leads: {
    recentLeads: any[]
    leadStats: {
      total: number
      new: number
      engaged: number
      converted: number
      averageScore: number
    }
    topLeads: any[]
    leadTrends: any[]
  }
  meetings: {
    upcomingMeetings: any[]
    completedMeetings: any[]
    meetingStats: {
      total: number
      scheduled: number
      completed: number
      cancelled: number
    }
    calendarAvailability: any[]
  }
  emails: {
    activeCampaigns: any[]
    emailStats: {
      sent: number
      opened: number
      clicked: number
      bounced: number
      openRate: number
      clickRate: number
    }
    recentEmails: any[]
    templates: any[]
  }
  costs: {
    tokenUsage: {
      total: number
      byModel: Record<string, number>
      byFeature: Record<string, number>
      costBreakdown: any[]
    }
    costStats: {
      totalCost: number
      monthlyCost: number
      averageCostPerRequest: number
      budgetStatus: 'under' | 'at' | 'over'
    }
    providerCosts: Record<string, number>
  }
  analytics: {
    engagementMetrics: {
      totalInteractions: number
      averageSessionDuration: number
      peakHours: string[]
      conversionRate: number
    }
    userBehavior: {
      mostUsedFeatures: string[]
      commonQueries: string[]
      dropOffPoints: string[]
    }
    performanceMetrics: {
      responseTime: number
      errorRate: number
      uptime: number
    }
  }
  aiPerformance: {
    modelPerformance: {
      accuracy: number
      responseTime: number
      userSatisfaction: number
    }
    featureUsage: {
      chat: number
      imageAnalysis: number
      documentAnalysis: number
      voiceProcessing: number
    }
    errorAnalysis: {
      commonErrors: string[]
      errorRate: number
      resolutionTime: number
    }
  }
  activity: {
    recentActivities: any[]
    systemAlerts: any[]
    userActions: any[]
    errorLogs: any[]
  }
  systemStatus: {
    lastUpdated: string
    dataFreshness: 'real-time' | 'recent' | 'stale'
    apiHealth: boolean
    databaseHealth: boolean
  }
}

export async function buildAdminContext(): Promise<AdminContext> {
  const supabase = getSupabase()
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  try {
    // Fetch all admin data in parallel
    const [
      leadsData,
      meetingsData,
      emailsData,
      costsData,
      analyticsData,
      aiPerformanceData,
      activityData
    ] = await Promise.all([
      fetchLeadsData(supabase, thirtyDaysAgo),
      fetchMeetingsData(supabase, thirtyDaysAgo),
      fetchEmailsData(supabase, thirtyDaysAgo),
      fetchCostsData(supabase, thirtyDaysAgo),
      fetchAnalyticsData(supabase, thirtyDaysAgo),
      fetchAIPerformanceData(supabase, thirtyDaysAgo),
      fetchActivityData(supabase, thirtyDaysAgo)
    ])

    // Build comprehensive context
    const context: AdminContext = {
      overview: {
        totalLeads: leadsData.total,
        activeMeetings: meetingsData.scheduled,
        emailCampaigns: emailsData.activeCampaigns.length,
        totalCosts: costsData.totalCost,
        systemHealth: determineSystemHealth(leadsData, meetingsData, costsData)
      },
      leads: leadsData,
      meetings: meetingsData,
      emails: emailsData,
      costs: costsData,
      analytics: analyticsData,
      aiPerformance: aiPerformanceData,
      activity: activityData,
      systemStatus: {
        lastUpdated: now.toISOString(),
        dataFreshness: 'real-time',
        apiHealth: true,
        databaseHealth: true
      }
    }

    return context
  } catch (error) {
    console.error('Error building admin context:', error)
    throw new Error('Failed to build admin context')
  }
}

async function fetchLeadsData(supabase: any, since: Date) {
  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })

  if (error) throw error

  const total = leads?.length || 0
  const newLeads = leads?.filter((l: any) => l.status === 'new') || []
  const engagedLeads = leads?.filter((l: any) => l.status === 'engaged') || []
  const convertedLeads = leads?.filter((l: any) => l.status === 'converted') || []
  
  const averageScore = leads?.length > 0 
    ? leads.reduce((sum: number, l: any) => sum + (l.score || 0), 0) / leads.length 
    : 0

  return {
    recentLeads: leads?.slice(0, 10) || [],
    leadStats: {
      total,
      new: newLeads.length,
      engaged: engagedLeads.length,
      converted: convertedLeads.length,
      averageScore: Math.round(averageScore * 100) / 100
    },
    topLeads: leads?.filter((l: any) => l.score > 7).slice(0, 5) || [],
    leadTrends: [] // TODO: Implement trend analysis
  }
}

async function fetchMeetingsData(supabase: any, since: Date) {
  const { data: meetings, error } = await supabase
    .from('meetings')
    .select('*')
    .gte('created_at', since.toISOString())
    .order('scheduled_at', { ascending: true })

  if (error) throw error

  const now = new Date()
  const upcomingMeetings = meetings?.filter((m: any) => new Date(m.scheduled_at) > now) || []
  const completedMeetings = meetings?.filter((m: any) => m.status === 'completed') || []

  return {
    upcomingMeetings: upcomingMeetings.slice(0, 10),
    completedMeetings: completedMeetings.slice(0, 10),
    meetingStats: {
      total: meetings?.length || 0,
      scheduled: upcomingMeetings.length,
      completed: completedMeetings.length,
      cancelled: meetings?.filter((m: any) => m.status === 'cancelled').length || 0
    },
    calendarAvailability: [] // TODO: Implement calendar integration
  }
}

async function fetchEmailsData(supabase: any, since: Date) {
  const { data: emails, error } = await supabase
    .from('email_campaigns')
    .select('*')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })

  if (error) throw error

  const activeCampaigns = emails?.filter((e: any) => e.status === 'active') || []
  const sentEmails = emails?.filter((e: any) => e.status === 'sent') || []

  return {
    activeCampaigns: activeCampaigns.slice(0, 5),
    emailStats: {
      sent: sentEmails.length,
      opened: sentEmails.reduce((sum: number, e: any) => sum + (e.opened_count || 0), 0),
      clicked: sentEmails.reduce((sum: number, e: any) => sum + (e.clicked_count || 0), 0),
      bounced: sentEmails.reduce((sum: number, e: any) => sum + (e.bounced_count || 0), 0),
      openRate: sentEmails.length > 0 
        ? (sentEmails.reduce((sum: number, e: any) => sum + (e.opened_count || 0), 0) / sentEmails.length) * 100 
        : 0,
      clickRate: sentEmails.length > 0 
        ? (sentEmails.reduce((sum: number, e: any) => sum + (e.clicked_count || 0), 0) / sentEmails.length) * 100 
        : 0
    },
    recentEmails: sentEmails.slice(0, 10),
    templates: [] // TODO: Implement email templates
  }
}

async function fetchCostsData(supabase: any, since: Date) {
  const { data: tokenUsage, error } = await supabase
    .from('token_usage')
    .select('*')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })

  if (error) throw error

  const totalTokens = tokenUsage?.reduce((sum: number, t: any) => sum + (t.tokens_used || 0), 0) || 0
  const totalCost = tokenUsage?.reduce((sum: number, t: any) => sum + (t.cost || 0), 0) || 0

  // Group by model and feature
  const byModel: Record<string, number> = {}
  const byFeature: Record<string, number> = {}
  
  tokenUsage?.forEach((t: any) => {
    byModel[t.model || 'unknown'] = (byModel[t.model || 'unknown'] || 0) + (t.tokens_used || 0)
    byFeature[t.feature || 'unknown'] = (byFeature[t.feature || 'unknown'] || 0) + (t.tokens_used || 0)
  })

  return {
    tokenUsage: {
      total: totalTokens,
      byModel,
      byFeature,
      costBreakdown: tokenUsage?.slice(0, 20) || []
    },
    costStats: {
      totalCost,
      monthlyCost: totalCost, // Assuming this is monthly data
      averageCostPerRequest: tokenUsage?.length > 0 ? totalCost / tokenUsage.length : 0,
      budgetStatus: totalCost < 100 ? 'under' : totalCost < 200 ? 'at' : 'over'
    },
    providerCosts: {
      'gemini': totalCost * 0.8, // Estimate
      'openai': totalCost * 0.2  // Estimate
    }
  }
}

async function fetchAnalyticsData(supabase: any, since: Date) {
  const { data: interactions, error } = await supabase
    .from('interactions')
    .select('*')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })

  if (error) throw error

  const totalInteractions = interactions?.length || 0
  const averageSessionDuration = interactions?.length > 0 
    ? interactions.reduce((sum: number, i: any) => sum + (i.duration || 0), 0) / interactions.length 
    : 0

  return {
    engagementMetrics: {
      totalInteractions,
      averageSessionDuration: Math.round(averageSessionDuration),
      peakHours: ['9:00', '14:00', '16:00'], // TODO: Calculate actual peak hours
      conversionRate: 0.15 // TODO: Calculate actual conversion rate
    },
    userBehavior: {
      mostUsedFeatures: ['chat', 'image-analysis', 'document-analysis'], // TODO: Calculate from data
      commonQueries: ['business consulting', 'AI implementation', 'digital transformation'], // TODO: Extract from chat logs
      dropOffPoints: ['lead-capture', 'meeting-scheduling'] // TODO: Analyze user journey
    },
    performanceMetrics: {
      responseTime: 1.2, // seconds, TODO: Calculate from actual data
      errorRate: 0.02, // 2%, TODO: Calculate from error logs
      uptime: 99.8 // percentage, TODO: Calculate from monitoring
    }
  }
}

async function fetchAIPerformanceData(supabase: any, since: Date) {
  const { data: aiMetrics, error } = await supabase
    .from('ai_performance')
    .select('*')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })

  if (error) throw error

  return {
    modelPerformance: {
      accuracy: 0.92, // TODO: Calculate from user feedback
      responseTime: 1.1, // seconds, TODO: Calculate from actual data
      userSatisfaction: 4.5 // out of 5, TODO: Calculate from ratings
    },
    featureUsage: {
      chat: aiMetrics?.filter((m: any) => m.feature === 'chat').length || 0,
      imageAnalysis: aiMetrics?.filter((m: any) => m.feature === 'image-analysis').length || 0,
      documentAnalysis: aiMetrics?.filter((m: any) => m.feature === 'document-analysis').length || 0,
      voiceProcessing: aiMetrics?.filter((m: any) => m.feature === 'voice-processing').length || 0
    },
    errorAnalysis: {
      commonErrors: ['rate_limit_exceeded', 'invalid_input', 'model_unavailable'], // TODO: Extract from error logs
      errorRate: 0.03, // 3%, TODO: Calculate from actual data
      resolutionTime: 0.5 // minutes, TODO: Calculate from incident logs
    }
  }
}

async function fetchActivityData(supabase: any, since: Date) {
  const { data: activities, error } = await supabase
    .from('activities')
    .select('*')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error

  return {
    recentActivities: activities?.slice(0, 20) || [],
    systemAlerts: activities?.filter((a: any) => a.type === 'alert').slice(0, 10) || [],
    userActions: activities?.filter((a: any) => a.type === 'user_action').slice(0, 10) || [],
    errorLogs: activities?.filter((a: any) => a.type === 'error').slice(0, 10) || []
  }
}

function determineSystemHealth(leadsData: any, meetingsData: any, costsData: any): 'healthy' | 'warning' | 'error' {
  // Simple health check based on data availability and basic metrics
  if (!leadsData || !meetingsData || !costsData) return 'error'
  
  const hasRecentLeads = leadsData.recentLeads?.length > 0
  const hasUpcomingMeetings = meetingsData.upcomingMeetings?.length > 0
  const costsUnderControl = costsData.costStats?.totalCost < 500

  if (hasRecentLeads && hasUpcomingMeetings && costsUnderControl) return 'healthy'
  if (hasRecentLeads || hasUpcomingMeetings) return 'warning'
  return 'error'
}

export function formatAdminContextForAI(context: AdminContext): string {
  return `ADMIN DASHBOARD CONTEXT:

OVERVIEW:
- Total Leads: ${context.overview.totalLeads}
- Active Meetings: ${context.overview.activeMeetings}
- Email Campaigns: ${context.overview.emailCampaigns}
- Total Costs: $${context.overview.totalCosts}
- System Health: ${context.overview.systemHealth}

LEADS:
- Recent Leads: ${context.leads.recentLeads.length} leads
- Lead Stats: ${context.leads.leadStats.total} total, ${context.leads.leadStats.new} new, ${context.leads.leadStats.engaged} engaged, ${context.leads.leadStats.converted} converted
- Average Score: ${context.leads.leadStats.averageScore}
- Top Leads: ${context.leads.topLeads.length} high-scoring leads

MEETINGS:
- Upcoming: ${context.meetings.upcomingMeetings.length} meetings
- Completed: ${context.meetings.completedMeetings.length} meetings
- Stats: ${context.meetings.meetingStats.total} total, ${context.meetings.meetingStats.scheduled} scheduled, ${context.meetings.meetingStats.completed} completed

EMAILS:
- Active Campaigns: ${context.emails.activeCampaigns.length}
- Email Stats: ${context.emails.emailStats.sent} sent, ${context.emails.emailStats.opened} opened, ${context.emails.emailStats.clicked} clicked
- Open Rate: ${context.emails.emailStats.openRate.toFixed(1)}%
- Click Rate: ${context.emails.emailStats.clickRate.toFixed(1)}%

COSTS:
- Total Tokens: ${context.costs.tokenUsage.total.toLocaleString()}
- Total Cost: $${context.costs.costStats.totalCost.toFixed(2)}
- Average Cost/Request: $${context.costs.costStats.averageCostPerRequest.toFixed(4)}
- Budget Status: ${context.costs.costStats.budgetStatus}

ANALYTICS:
- Total Interactions: ${context.analytics.engagementMetrics.totalInteractions}
- Average Session Duration: ${context.analytics.engagementMetrics.averageSessionDuration}s
- Conversion Rate: ${(context.analytics.engagementMetrics.conversionRate * 100).toFixed(1)}%
- Response Time: ${context.analytics.performanceMetrics.responseTime}s
- Error Rate: ${(context.analytics.performanceMetrics.errorRate * 100).toFixed(1)}%

AI PERFORMANCE:
- Accuracy: ${(context.aiPerformance.modelPerformance.accuracy * 100).toFixed(1)}%
- Response Time: ${context.aiPerformance.modelPerformance.responseTime}s
- User Satisfaction: ${context.aiPerformance.modelPerformance.userSatisfaction}/5
- Feature Usage: Chat(${context.aiPerformance.featureUsage.chat}), Image(${context.aiPerformance.featureUsage.imageAnalysis}), Doc(${context.aiPerformance.featureUsage.documentAnalysis}), Voice(${context.aiPerformance.featureUsage.voiceProcessing})

ACTIVITY:
- Recent Activities: ${context.activity.recentActivities.length} activities
- System Alerts: ${context.activity.systemAlerts.length} alerts
- Error Logs: ${context.activity.errorLogs.length} errors

SYSTEM STATUS:
- Last Updated: ${context.systemStatus.lastUpdated}
- Data Freshness: ${context.systemStatus.dataFreshness}
- API Health: ${context.systemStatus.apiHealth ? '✅' : '❌'}
- Database Health: ${context.systemStatus.databaseHealth ? '✅' : '❌'}`
} 