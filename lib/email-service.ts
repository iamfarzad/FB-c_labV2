import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailTemplate {
  to: string
  subject: string
  html: string
  tags?: Record<string, string>
}

export class EmailService {
  static async sendEmail(template: EmailTemplate) {
    try {
      const { data, error } = await resend.emails.send({
        from: "F.B/c <contact@farzadbayat.com>",
        to: [template.to],
        subject: template.subject,
        html: template.html,
        tags: template.tags,
      })

      if (error) {
        console.error("Resend error:", error)
        throw new Error(`Failed to send email: ${error.message}`)
      }

      return { success: true, emailId: data?.id }
    } catch (error: any) {
      console.error("Email service error:", error)
      throw error
    }
  }

  static async sendLeadWelcomeEmail(lead: { name: string; email: string; company?: string }) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to F.B/c</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e1e5e9; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6c757d; }
            .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .highlight { background: #f8f9fa; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to F.B/c</h1>
              <p>Thank you for your interest in our AI consulting services</p>
            </div>
            
            <div class="content">
              <h2>Hello ${lead.name}!</h2>
              
              <p>Thank you for reaching out to F.B/c. We're excited to learn more about ${lead.company ? `${lead.company}'s` : "your"} AI transformation journey.</p>
              
              <div class="highlight">
                <h3>What's Next?</h3>
                <ul>
                  <li>We'll review your inquiry within 24 hours</li>
                  <li>Schedule a discovery call to understand your needs</li>
                  <li>Provide a customized AI strategy proposal</li>
                </ul>
              </div>
              
              <p>In the meantime, feel free to explore our resources:</p>
              
              <a href="https://www.farzadbayat.com/consulting" class="btn">View Our Services</a>
              
              <p>If you have any immediate questions, don't hesitate to reply to this email.</p>
              
              <p>Best regards,<br>
              <strong>Farzad Bayat</strong><br>
              Founder, F.B/c<br>
              AI Strategy & Implementation</p>
            </div>
            
            <div class="footer">
              <p>F.B/c - AI Consulting & Strategy</p>
              <p>www.farzadbayat.com | contact@farzadbayat.com</p>
            </div>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: lead.email,
      subject: `Welcome to F.B/c - Let's Transform Your Business with AI`,
      html,
      tags: { type: "lead_welcome", lead_email: lead.email },
    })
  }

  static async sendMeetingConfirmationEmail(meeting: {
    attendeeEmail: string
    attendeeName: string
    date: string
    time: string
    duration: number
    meetingLink?: string
  }) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Meeting Confirmed - F.B/c</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e1e5e9; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6c757d; }
            .meeting-details { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .btn { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .btn-secondary { background: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Meeting Confirmed</h1>
              <p>Your consultation with F.B/c is scheduled</p>
            </div>
            
            <div class="content">
              <h2>Hello ${meeting.attendeeName}!</h2>
              
              <p>Great news! Your AI consultation meeting with F.B/c has been confirmed.</p>
              
              <div class="meeting-details">
                <h3>📅 Meeting Details</h3>
                <p><strong>Date:</strong> ${meeting.date}</p>
                <p><strong>Time:</strong> ${meeting.time}</p>
                <p><strong>Duration:</strong> ${meeting.duration} minutes</p>
                ${meeting.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meeting.meetingLink}">${meeting.meetingLink}</a></p>` : ""}
              </div>
              
              <p>To make the most of our time together, please consider:</p>
              <ul>
                <li>Prepare specific questions about your AI initiatives</li>
                <li>Think about your current challenges and goals</li>
                <li>Have any relevant data or documentation ready</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                ${meeting.meetingLink ? `<a href="${meeting.meetingLink}" class="btn">Join Meeting</a>` : ""}
                <a href="https://www.farzadbayat.com/contact" class="btn btn-secondary">Contact Us</a>
              </div>
              
              <p>Looking forward to our conversation!</p>
              
              <p>Best regards,<br>
              <strong>Farzad Bayat</strong><br>
              Founder, F.B/c<br>
              AI Strategy & Implementation</p>
            </div>
            
            <div class="footer">
              <p>F.B/c - AI Consulting & Strategy</p>
              <p>www.farzadbayat.com | contact@farzadbayat.com</p>
              <p><small>Need to reschedule? Reply to this email.</small></p>
            </div>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: meeting.attendeeEmail,
      subject: `Meeting Confirmed: AI Consultation with F.B/c - ${meeting.date}`,
      html,
      tags: { type: "meeting_confirmation", attendee_email: meeting.attendeeEmail },
    })
  }

  static async sendCampaignEmail(campaign: {
    to: string
    subject: string
    content: string
    campaignId: string
    recipientName?: string
  }) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${campaign.subject}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e1e5e9; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>F.B/c</h1>
              <p>AI Consulting & Strategy</p>
            </div>
            
            <div class="content">
              ${campaign.recipientName ? `<h2>Hello ${campaign.recipientName}!</h2>` : "<h2>Hello!</h2>"}
              
              ${campaign.content}
              
              <p>Best regards,<br>
              <strong>Farzad Bayat</strong><br>
              Founder, F.B/c</p>
            </div>
            
            <div class="footer">
              <p>F.B/c - AI Consulting & Strategy</p>
              <p>www.farzadbayat.com | contact@farzadbayat.com</p>
              <p><small><a href="https://www.farzadbayat.com/unsubscribe?email=${campaign.to}">Unsubscribe</a></small></p>
            </div>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: campaign.to,
      subject: campaign.subject,
      html,
      tags: { type: "campaign", campaign_id: campaign.campaignId },
    })
  }

  static async sendTestEmail(to: string) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Test Email - F.B/c</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; padding: 20px; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .status { background: #d1fae5; color: #065f46; padding: 15px; border-radius: 6px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🧪 Test Email</h1>
              <p>F.B/c Email System</p>
            </div>
            
            <div class="status">
              <h2>✅ Email System Working!</h2>
              <p>This test email confirms that the F.B/c email system is properly configured and working.</p>
            </div>
            
            <p><strong>Test Details:</strong></p>
            <ul>
              <li>Sent from: contact@farzadbayat.com</li>
              <li>Timestamp: ${new Date().toISOString()}</li>
              <li>Domain: www.farzadbayat.com</li>
              <li>Service: Resend</li>
            </ul>
            
            <p>If you received this email, the webhook integration should also be working properly.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e1e5e9;">
            
            <p style="text-align: center; color: #6b7280; font-size: 14px;">
              F.B/c - AI Consulting & Strategy<br>
              www.farzadbayat.com
            </p>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to,
      subject: "Test Email - F.B/c System Check",
      html,
      tags: { type: "test_email" },
    })
  }
}
