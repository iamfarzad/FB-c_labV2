/**
 * Meeting scheduler for 30-minute consultations
 */

export interface TimeSlot {
  date: string
  time: string
  available: boolean
}

export interface Meeting {
  id: string
  leadId: string
  name: string
  email: string
  company?: string
  meetingDate: string
  meetingTime: string
  timeZone: string
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show"
  meetingLink: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface BookingRequest {
  leadId: string
  name: string
  email: string
  company?: string
  preferredDate: string
  preferredTime: string
  timeZone: string
  message?: string
}

export class MeetingScheduler {
  private static readonly BUSINESS_HOURS = {
    start: 9, // 9 AM
    end: 17, // 5 PM
  }

  private static readonly WORKING_DAYS = [1, 2, 3, 4, 5] // Monday to Friday
  private static readonly MEETING_DURATION = 30 // minutes
  private static readonly TIME_SLOTS = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ]

  static async getAvailableSlots(date: string): Promise<TimeSlot[]> {
    try {
      const response = await fetch(`/api/meetings/booked-slots?date=${date}`)
      const bookedSlots = await response.json()

      const dateObj = new Date(date)
      const dayOfWeek = dateObj.getDay()

      // Check if it's a working day
      if (!this.WORKING_DAYS.includes(dayOfWeek)) {
        return []
      }

      // Check if it's not in the past
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (dateObj < today) {
        return []
      }

      const bookedTimes = new Set(bookedSlots.map((slot: any) => slot.meeting_time))

      return this.TIME_SLOTS.map((time) => ({
        date,
        time,
        available: !bookedTimes.has(time),
      }))
    } catch (error) {
      console.error("Failed to get available slots:", error)
      return []
    }
  }

  static async bookMeeting(booking: BookingRequest): Promise<{ success: boolean; meeting?: Meeting; error?: string }> {
    try {
      const response = await fetch("/api/meetings/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking),
      })

      const result = await response.json()

      if (!response.ok) {
        return { success: false, error: result.error }
      }

      return { success: true, meeting: result.meeting }
    } catch (error: any) {
      console.error("Failed to book meeting:", error)
      return { success: false, error: error.message }
    }
  }

  static async getMeetings(filters?: {
    status?: string
    date?: string
    leadId?: string
  }): Promise<Meeting[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.append("status", filters.status)
      if (filters?.date) params.append("date", filters.date)
      if (filters?.leadId) params.append("leadId", filters.leadId)

      const response = await fetch(`/api/meetings?${params.toString()}`)
      const meetings = await response.json()

      return meetings || []
    } catch (error) {
      console.error("Failed to get meetings:", error)
      return []
    }
  }

  static async updateMeetingStatus(meetingId: string, status: Meeting["status"], notes?: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/meetings/${meetingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      })

      return response.ok
    } catch (error) {
      console.error("Failed to update meeting status:", error)
      return false
    }
  }

  static generateMeetingLink(meetingId: string): string {
    // In production, integrate with Zoom, Google Meet, or Calendly
    return `https://meet.fbcai.com/consultation/${meetingId}`
  }

  static formatMeetingDate(date: string): string {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  static formatMeetingTime(time: string, timeZone = "EST"): string {
    return `${time} (${timeZone})`
  }

  static getNextAvailableSlot(): Promise<TimeSlot | null> {
    // Get next available slot starting from tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    return this.findNextAvailableSlot(tomorrow)
  }

  private static async findNextAvailableSlot(startDate: Date): Promise<TimeSlot | null> {
    for (let i = 0; i < 14; i++) {
      // Check next 2 weeks
      const checkDate = new Date(startDate)
      checkDate.setDate(startDate.getDate() + i)

      const dateString = checkDate.toISOString().split("T")[0]
      const slots = await this.getAvailableSlots(dateString)

      const availableSlot = slots.find((slot) => slot.available)
      if (availableSlot) {
        return availableSlot
      }
    }

    return null
  }
}
