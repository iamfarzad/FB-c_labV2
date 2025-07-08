import { getSupabase } from "@/lib/supabase/server"
import { EmailService } from "@/lib/email-service"
import { MeetingScheduler } from "@/lib/meeting-scheduler"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const bookingData = await req.json()

    const supabase = getSupabase()

    // Check if slot is still available
    const { data: existingMeeting } = await supabase
      .from("meetings")
      .select("id")
      .eq("meeting_date", bookingData.preferredDate)
      .eq("meeting_time", bookingData.preferredTime)
      .eq("status", "scheduled")
      .single()

    if (existingMeeting) {
      return NextResponse.json({ error: "Time slot is no longer available" }, { status: 409 })
    }

    // Generate meeting link
    const meetingId = crypto.randomUUID()
    const meetingLink = MeetingScheduler.generateMeetingLink(meetingId)

    // Create meeting
    const { data: meeting, error } = await supabase
      .from("meetings")
      .insert({
        id: meetingId,
        lead_id: bookingData.leadId,
        name: bookingData.name,
        email: bookingData.email,
        company: bookingData.company,
        meeting_date: bookingData.preferredDate,
        meeting_time: bookingData.preferredTime,
        time_zone: bookingData.timeZone,
        status: "scheduled",
        meeting_link: meetingLink,
        notes: bookingData.message,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to book meeting" }, { status: 500 })
    }

    // Send confirmation email
    const emailSent = await EmailService.sendMeetingConfirmation({
      name: bookingData.name,
      email: bookingData.email,
      meetingDate: MeetingScheduler.formatMeetingDate(bookingData.preferredDate),
      meetingTime: MeetingScheduler.formatMeetingTime(bookingData.preferredTime, bookingData.timeZone),
      meetingLink,
      timeZone: bookingData.timeZone,
    })

    return NextResponse.json({
      success: true,
      meeting,
      emailSent,
    })
  } catch (error: any) {
    console.error("Meeting booking error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
