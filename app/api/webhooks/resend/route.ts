import { type NextRequest, NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase/server"
import { logActivity } from "@/lib/activity-logger"

// Webhook signature verification
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  if (!secret) {
    console.warn("RESEND_WEBHOOK_SECRET not configured")
    return true // Allow in development
  }

  try {
    const crypto = require("crypto")
    const expectedSignature = crypto.createHmac("sha256", secret).update(payload, "utf8").digest("hex")

    return signature === `sha256=${expectedSignature}`
  } catch (error) {
    console.error("Webhook signature verification error:", error)
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("resend-signature") || ""
    const payload = await req.text()

    // Verify webhook signature
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET
    if (!verifyWebhookSignature(payload, signature, webhookSecret || "")) {
      console.error("Invalid webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(payload)
    console.log("Resend webhook event:", event.type, event.data)

    const supabase = getSupabase()

    // Process different event types
    switch (event.type) {
      case "email.sent":
        await handleEmailSent(supabase, event.data)
        break
      case "email.delivered":
        await handleEmailDelivered(supabase, event.data)
        break
      case "email.bounced":
        await handleEmailBounced(supabase, event.data)
        break
      case "email.complained":
        await handleEmailComplained(supabase, event.data)
        break
      case "email.opened":
        await handleEmailOpened(supabase, event.data)
        break
      case "email.clicked":
        await handleEmailClicked(supabase, event.data)
        break
      default:
        console.log(`Unhandled webhook event type: ${event.type}`)
    }

    // Log the webhook event
    await logActivity({
      type: "webhook_received",
      description: `Resend webhook: ${event.type}`,
      metadata: {
        eventType: event.type,
        emailId: event.data?.email_id,
        to: event.data?.to,
        subject: event.data?.subject,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function handleEmailSent(supabase: any, data: any) {
  try {
    await supabase.from("email_events").insert({
      email_id: data.email_id,
      event_type: "sent",
      recipient: data.to?.[0] || data.to,
      subject: data.subject,
      event_data: data,
      created_at: new Date().toISOString(),
    })

    // Update email campaign status if applicable
    if (data.tags?.campaign_id) {
      await supabase
        .from("email_campaigns")
        .update({
          sent_count: supabase.raw("sent_count + 1"),
          last_sent_at: new Date().toISOString(),
        })
        .eq("id", data.tags.campaign_id)
    }
  } catch (error) {
    console.error("Error handling email.sent:", error)
  }
}

async function handleEmailDelivered(supabase: any, data: any) {
  try {
    await supabase.from("email_events").insert({
      email_id: data.email_id,
      event_type: "delivered",
      recipient: data.to?.[0] || data.to,
      subject: data.subject,
      event_data: data,
      created_at: new Date().toISOString(),
    })

    // Update email campaign delivery stats
    if (data.tags?.campaign_id) {
      await supabase
        .from("email_campaigns")
        .update({
          delivered_count: supabase.raw("delivered_count + 1"),
        })
        .eq("id", data.tags.campaign_id)
    }
  } catch (error) {
    console.error("Error handling email.delivered:", error)
  }
}

async function handleEmailBounced(supabase: any, data: any) {
  try {
    await supabase.from("email_events").insert({
      email_id: data.email_id,
      event_type: "bounced",
      recipient: data.to?.[0] || data.to,
      subject: data.subject,
      event_data: data,
      bounce_reason: data.bounce?.reason,
      created_at: new Date().toISOString(),
    })

    // Update email campaign bounce stats
    if (data.tags?.campaign_id) {
      await supabase
        .from("email_campaigns")
        .update({
          bounced_count: supabase.raw("bounced_count + 1"),
        })
        .eq("id", data.tags.campaign_id)
    }

    // Mark email as bounced in leads table if applicable
    if (data.to) {
      await supabase
        .from("leads")
        .update({
          email_status: "bounced",
          last_email_bounce: new Date().toISOString(),
        })
        .eq("email", data.to?.[0] || data.to)
    }
  } catch (error) {
    console.error("Error handling email.bounced:", error)
  }
}

async function handleEmailComplained(supabase: any, data: any) {
  try {
    await supabase.from("email_events").insert({
      email_id: data.email_id,
      event_type: "complained",
      recipient: data.to?.[0] || data.to,
      subject: data.subject,
      event_data: data,
      created_at: new Date().toISOString(),
    })

    // Update email campaign complaint stats
    if (data.tags?.campaign_id) {
      await supabase
        .from("email_campaigns")
        .update({
          complained_count: supabase.raw("complained_count + 1"),
        })
        .eq("id", data.tags.campaign_id)
    }

    // Mark email as complained in leads table
    if (data.to) {
      await supabase
        .from("leads")
        .update({
          email_status: "complained",
          unsubscribed: true,
          unsubscribed_at: new Date().toISOString(),
        })
        .eq("email", data.to?.[0] || data.to)
    }
  } catch (error) {
    console.error("Error handling email.complained:", error)
  }
}

async function handleEmailOpened(supabase: any, data: any) {
  try {
    await supabase.from("email_events").insert({
      email_id: data.email_id,
      event_type: "opened",
      recipient: data.to?.[0] || data.to,
      subject: data.subject,
      event_data: data,
      created_at: new Date().toISOString(),
    })

    // Update email campaign open stats
    if (data.tags?.campaign_id) {
      await supabase
        .from("email_campaigns")
        .update({
          opened_count: supabase.raw("opened_count + 1"),
        })
        .eq("id", data.tags.campaign_id)
    }

    // Update lead engagement
    if (data.to) {
      await supabase
        .from("leads")
        .update({
          last_email_opened: new Date().toISOString(),
          email_engagement_score: supabase.raw("COALESCE(email_engagement_score, 0) + 1"),
        })
        .eq("email", data.to?.[0] || data.to)
    }
  } catch (error) {
    console.error("Error handling email.opened:", error)
  }
}

async function handleEmailClicked(supabase: any, data: any) {
  try {
    await supabase.from("email_events").insert({
      email_id: data.email_id,
      event_type: "clicked",
      recipient: data.to?.[0] || data.to,
      subject: data.subject,
      event_data: data,
      click_url: data.link?.url,
      created_at: new Date().toISOString(),
    })

    // Update email campaign click stats
    if (data.tags?.campaign_id) {
      await supabase
        .from("email_campaigns")
        .update({
          clicked_count: supabase.raw("clicked_count + 1"),
        })
        .eq("id", data.tags.campaign_id)
    }

    // Update lead engagement (clicks are worth more than opens)
    if (data.to) {
      await supabase
        .from("leads")
        .update({
          last_email_clicked: new Date().toISOString(),
          email_engagement_score: supabase.raw("COALESCE(email_engagement_score, 0) + 3"),
        })
        .eq("email", data.to?.[0] || data.to)
    }
  } catch (error) {
    console.error("Error handling email.clicked:", error)
  }
}
