import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, company, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // In a real implementation, you would:
    // 1. Send email via service like Resend, SendGrid, or Nodemailer
    // 2. Store in database for tracking
    // 3. Send auto-reply confirmation

    // For now, we'll log the contact form submission
    console.info('Contact form submission:', {
      name,
      email,
      company,
      subject,
      message,
      timestamp: new Date().toISOString()
    })

    // Simulate email sending (replace with actual email service)
    const emailData = {
      to: 'hello@farzadbayat.com',
      from: 'noreply@farzadbayat.com',
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>Submitted at: ${new Date().toLocaleString()}</small></p>
      `
    }

    // TODO: Integrate with actual email service
    // await sendEmail(emailData)

    return NextResponse.json({
      success: true,
      message: "Contact form submitted successfully"
    })

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: "Failed to submit contact form" },
      { status: 500 }
    )
  }
}