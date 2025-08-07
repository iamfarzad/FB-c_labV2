/**
 * Unified Email API Endpoint
 * Handles all email sending for leads using Resend
 */

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getSupabase } from '@/lib/supabase/server'
import { z } from 'zod'

// Initialize Resend with fallback for build time
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Email request schema
const emailRequestSchema = z.object({
  leadId: z.string().uuid(),
  emailType: z.enum([
    'welcome',
    'follow_up',
    'report',
    'meeting_confirmation',
    'proposal',
    'check_in'
  ]),
  customData: z.record(z.any()).optional()
})

// Email templates
const emailTemplates = {
  welcome: {
    subject: 'Welcome to F.B Consulting - Your AI Transformation Journey Begins',
    template: (lead: any, data: any) => `
      <h2>Welcome ${lead.name}!</h2>
      
      <p>Thank you for your interest in F.B Consulting's AI solutions.</p>
      
      <p>Based on our conversation, I understand that ${lead.company || 'your company'} is facing these challenges:</p>
      <ul>
        ${(lead.painPoints || []).map((p: string) => `<li>${p}</li>`).join('')}
      </ul>
      
      <h3>Your Personalized AI Readiness Score: ${lead.ai_readiness || 50}%</h3>
      
      <p>This score indicates ${getReadinessMessage(lead.ai_readiness || 50)}</p>
      
      <h3>Next Steps:</h3>
      <ol>
        <li>Schedule a discovery call to dive deeper into your needs</li>
        <li>Receive a customized AI implementation roadmap</li>
        <li>Get a detailed ROI projection for your investment</li>
      </ol>
      
      <p><strong>Ready to transform your business with AI?</strong></p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/meetings/book?lead=${lead.id}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Schedule Your Discovery Call</a></p>
      
      <p>Best regards,<br>
      F.B Consulting Team</p>
    `
  },
  
  follow_up: {
    subject: 'Following Up - Your AI Transformation Opportunity',
    template: (lead: any, data: any) => `
      <h2>Hi ${lead.name},</h2>
      
      <p>I wanted to follow up on our recent conversation about AI solutions for ${lead.company || 'your company'}.</p>
      
      <p>Since we last spoke, I've been thinking about your specific challenges and have identified several immediate opportunities where AI could make a significant impact:</p>
      
      <ul>
        <li><strong>Process Automation:</strong> Reduce manual work by up to 60%</li>
        <li><strong>Data Intelligence:</strong> Turn your existing data into actionable insights</li>
        <li><strong>Customer Experience:</strong> Enhance satisfaction with AI-powered support</li>
      </ul>
      
      <h3>Success Story:</h3>
      <p>A company similar to yours recently implemented our AI solutions and achieved:</p>
      <ul>
        <li>40% reduction in operational costs</li>
        <li>2.5x improvement in processing speed</li>
        <li>35% increase in customer satisfaction scores</li>
      </ul>
      
      <p><strong>Would you like to see how we achieved these results?</strong></p>
      
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/meetings/book?lead=${lead.id}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Book a 15-Minute Demo</a></p>
      
      <p>Looking forward to helping you transform ${lead.company || 'your business'}!</p>
      
      <p>Best regards,<br>
      F.B Consulting Team</p>
    `
  },
  
  report: {
    subject: 'Your Personalized AI Implementation Report',
    template: (lead: any, data: any) => `
      <h2>Your AI Implementation Report is Ready, ${lead.name}!</h2>
      
      <p>Based on our analysis of ${lead.company || 'your company'}, we've prepared a comprehensive report outlining your AI transformation opportunity.</p>
      
      <h3>Report Highlights:</h3>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h4>Estimated Annual Savings: $${data.estimatedSavings || '250,000'}</h4>
        <h4>ROI Timeline: ${data.roiTimeline || '6-8 months'}</h4>
        <h4>Efficiency Gain: ${data.efficiencyGain || '45%'}</h4>
      </div>
      
      <h3>Key Recommendations:</h3>
      <ol>
        ${(data.recommendations || [
          'Implement intelligent document processing',
          'Deploy predictive analytics for demand forecasting',
          'Automate customer service with AI chatbots'
        ]).map((r: string) => `<li>${r}</li>`).join('')}
      </ol>
      
      <h3>Implementation Phases:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Phase</th>
          <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Duration</th>
          <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Expected Outcome</th>
        </tr>
        <tr>
          <td style="padding: 8px;">Discovery & Planning</td>
          <td style="padding: 8px;">2 weeks</td>
          <td style="padding: 8px;">Complete AI roadmap</td>
        </tr>
        <tr>
          <td style="padding: 8px;">Pilot Implementation</td>
          <td style="padding: 8px;">4 weeks</td>
          <td style="padding: 8px;">First AI system live</td>
        </tr>
        <tr>
          <td style="padding: 8px;">Full Deployment</td>
          <td style="padding: 8px;">8 weeks</td>
          <td style="padding: 8px;">Complete transformation</td>
        </tr>
      </table>
      
      <p><strong>Ready to get started?</strong></p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/meetings/book?lead=${lead.id}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Schedule Implementation Call</a></p>
      
      <p>Best regards,<br>
      F.B Consulting Team</p>
    `
  },
  
  meeting_confirmation: {
    subject: 'Meeting Confirmed - AI Discovery Call',
    template: (lead: any, data: any) => `
      <h2>Meeting Confirmed!</h2>
      
      <p>Hi ${lead.name},</p>
      
      <p>Your AI discovery call has been confirmed for:</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>📅 ${data.meetingDate || 'Tuesday, January 15, 2025'}</h3>
        <h3>🕐 ${data.meetingTime || '2:00 PM EST'}</h3>
        <h3>⏱️ Duration: ${data.duration || '30 minutes'}</h3>
        <h3>📍 Location: ${data.location || 'Video Call (link will be sent)'}</h3>
      </div>
      
      <h3>What We'll Cover:</h3>
      <ul>
        <li>Deep dive into your current challenges</li>
        <li>Live demo of relevant AI solutions</li>
        <li>Customized implementation roadmap</li>
        <li>ROI projections and timeline</li>
        <li>Q&A and next steps</li>
      </ul>
      
      <h3>To Prepare:</h3>
      <p>Please think about:</p>
      <ul>
        <li>Your top 3 business priorities for the next year</li>
        <li>Current bottlenecks in your operations</li>
        <li>Your budget range for technology investments</li>
      </ul>
      
      <p><a href="${data.meetingLink || '#'}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Add to Calendar</a></p>
      
      <p>Looking forward to our conversation!</p>
      
      <p>Best regards,<br>
      F.B Consulting Team</p>
    `
  }
}

function getReadinessMessage(score: number): string {
  if (score >= 80) return "your organization is highly prepared for AI adoption with strong foundations in place"
  if (score >= 60) return "your company shows good potential for AI implementation with some areas to strengthen"
  if (score >= 40) return "there are significant opportunities for improvement before full AI adoption"
  return "we recommend starting with foundational improvements to maximize AI benefits"
}

export async function POST(req: NextRequest) {
  try {
    // Check if Resend is available
    if (!resend) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 503 }
      )
    }

    // Parse and validate request
    const body = await req.json()
    const validatedData = emailRequestSchema.parse(body)
    
    // Get lead data from Supabase
    const supabase = getSupabase()
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', validatedData.leadId)
      .single()
    
    if (leadError || !lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }
    
    // Get email template
    const template = emailTemplates[validatedData.emailType]
    if (!template) {
      return NextResponse.json(
        { error: 'Invalid email type' },
        { status: 400 }
      )
    }
    
    // Generate email content
    const emailHtml = template.template(lead, validatedData.customData || {})
    
    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'F.B Consulting <noreply@fbconsulting.ai>',
      to: [lead.email],
      subject: template.subject,
      html: emailHtml,
      tags: [
        { name: 'lead_id', value: lead.id },
        { name: 'email_type', value: validatedData.emailType }
      ]
    })
    
    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }
    
    // Log email send in activities
    await supabase
      .from('activities')
      .insert({
        type: 'email_sent',
        title: `Email sent to ${lead.name}`,
        description: `${validatedData.emailType} email sent to ${lead.email}`,
        metadata: {
          lead_id: lead.id,
          email_type: validatedData.emailType,
          resend_id: data?.id
        }
      })
    
    // Create follow-up task if needed
    if (validatedData.emailType === 'welcome' || validatedData.emailType === 'follow_up') {
      const followUpDate = new Date()
      followUpDate.setDate(followUpDate.getDate() + 3) // Follow up in 3 days
      
      await supabase
        .from('follow_up_tasks')
        .insert({
          lead_id: lead.id,
          task_type: 'email',
          scheduled_for: followUpDate.toISOString(),
          status: 'scheduled',
          task_data: {
            email_type: 'follow_up',
            previous_email: validatedData.emailType
          }
        })
    }
    
    return NextResponse.json({
      success: true,
      emailId: data?.id,
      message: 'Email sent successfully'
    })
    
  } catch (error) {
    console.error('Email API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}