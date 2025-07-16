import { EmailService } from "@/lib/email-service"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("🧪 Testing email functionality...")
    console.log("📧 RESEND_API_KEY configured:", !!process.env.RESEND_API_KEY)

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "RESEND_API_KEY environment variable is not configured",
          message: "Please add your Resend API key to environment variables",
          debug: {
            hasApiKey: false,
            apiKeyLength: 0,
          },
        },
        { status: 500 },
      )
    }

    // Validate API key format
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey.startsWith("re_")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Resend API key format",
          message: "Resend API keys should start with 're_'",
          debug: {
            hasApiKey: true,
            apiKeyLength: apiKey.length,
            apiKeyPrefix: apiKey.substring(0, 3),
          },
        },
        { status: 500 },
      )
    }

    // Test lead follow-up email
    const testLeadData = {
      name: "John Doe",
      email: "test@fbcai.com", // Use a test email - replace with your email for testing
      company: "Test Company Inc.",
      leadScore: 85,
      aiCapabilities: ["Video Analysis", "Lead Research", "Content Generation"],
      consultantBrief:
        "Based on our conversation, I see great potential for AI automation in your sales process. Your interest in video analysis and lead research suggests you could benefit from our comprehensive AI toolkit that could increase your team's efficiency by 40-60%.",
    }

    console.log("📤 Sending lead follow-up email...")
    const leadEmailSent = await EmailService.sendLeadWelcomeEmail(testLeadData)

    // Test meeting confirmation email
    const testMeetingData = {
      name: "Jane Smith",
      email: "test@fbcai.com", // Use a test email - replace with your email for testing
      meetingDate: "Friday, January 12, 2024",
      meetingTime: "2:00 PM",
      meetingLink: "https://meet.fbcai.com/consultation/test-meeting-123",
      timeZone: "EST",
    }

    console.log("📅 Sending meeting confirmation email...")
    const meetingEmailSent = await EmailService.sendMeetingConfirmation(testMeetingData)

    console.log("✅ Email test completed!")
    console.log("📊 Results:", { leadEmailSent, meetingEmailSent })

    return NextResponse.json({
      success: true,
      results: {
        leadFollowUp: leadEmailSent,
        meetingConfirmation: meetingEmailSent,
      },
      message: "Test emails sent successfully! Check your inbox at test@fbcai.com",
      debug: {
        hasApiKey: true,
        apiKeyLength: apiKey.length,
        apiKeyValid: true,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error("❌ Email test error:", error)

    // Detailed error analysis
    let errorAnalysis = "Unknown error"
    if (error.message?.includes("API key")) {
      errorAnalysis = "API key authentication failed"
    } else if (error.message?.includes("network")) {
      errorAnalysis = "Network connection issue"
    } else if (error.message?.includes("rate limit")) {
      errorAnalysis = "Rate limit exceeded"
    } else if (error.message?.includes("domain")) {
      errorAnalysis = "Domain verification required"
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        errorAnalysis,
        message: "Failed to send test emails. Check the error details below.",
        debug: {
          hasApiKey: !!process.env.RESEND_API_KEY,
          apiKeyLength: process.env.RESEND_API_KEY?.length || 0,
          errorType: error.constructor.name,
          timestamp: new Date().toISOString(),
        },
        troubleshooting: [
          "1. Verify your Resend API key is correct: re_BWHLgAW5_H3R31GtZf5moYo3KGesi59n2",
          "2. Check if your domain is verified in Resend dashboard",
          "3. Ensure you haven't exceeded rate limits",
          "4. Try sending to a verified email address first",
        ],
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Email test endpoint ready. Send a POST request to test email functionality.",
    endpoints: {
      testEmails: "POST /api/test-email",
      leadFollowUp: "Test lead follow-up email with AI capabilities summary",
      meetingConfirmation: "Test meeting confirmation with calendar details",
    },
    configuration: {
      hasResendApiKey: !!process.env.RESEND_API_KEY,
      apiKeyLength: process.env.RESEND_API_KEY?.length || 0,
      fromEmail: "noreply@fbcai.com",
      testEmail: "test@fbcai.com",
    },
  })
}
