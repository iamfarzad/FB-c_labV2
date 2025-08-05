import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, company, teamSize, location, interests, message } = body

    // Validate required fields
    if (!name || !email || !company) {
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

    // Log the waitlist signup
    console.log('Workshop waitlist signup:', {
      name,
      email,
      company,
      teamSize,
      location,
      interests,
      message,
      timestamp: new Date().toISOString()
    })

    // In a real implementation, you would:
    // 1. Store in database (e.g., Supabase, PostgreSQL)
    // 2. Add to email marketing list (e.g., Mailchimp, ConvertKit)
    // 3. Send confirmation email
    // 4. Notify admin of new signup

    // Simulate email sending (replace with actual email service)
    const emailData = {
      to: 'hello@farzadbayat.com',
      from: 'noreply@farzadbayat.com',
      subject: `New Workshop Waitlist Signup: ${company}`,
      html: `
        <h2>New AI Training Workshop Waitlist Signup</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${company}</p>
        ${teamSize ? `<p><strong>Team Size:</strong> ${teamSize}</p>` : ''}
        ${location ? `<p><strong>Preferred Location:</strong> ${location}</p>` : ''}
        ${interests && interests.length > 0 ? `
          <p><strong>Workshop Interests:</strong></p>
          <ul>
            ${interests.map((interest: string) => `<li>${interest}</li>`).join('')}
          </ul>
        ` : ''}
        ${message ? `<p><strong>Additional Information:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>` : ''}
        <hr>
        <p><small>Submitted at: ${new Date().toLocaleString()}</small></p>
      `
    }

    // TODO: Integrate with actual email service and database
    // await sendEmail(emailData)
    // await saveToDatabase(body)
    // await addToMailingList({ email, name, company })

    // Send confirmation email to user (TODO: implement)
    const confirmationEmail = {
      to: email,
      from: 'hello@farzadbayat.com',
      subject: 'Welcome to the AI Training Workshop Waitlist!',
      html: `
        <h2>Thanks for joining the AI Training Workshop waitlist!</h2>
        <p>Hi ${name},</p>
        <p>You've successfully joined the waitlist for AI training workshops. Here's what happens next:</p>
        <ul>
          <li>I'll notify you as soon as workshop dates are available</li>
          <li>You'll get priority access to booking</li>
          <li>I may reach out to discuss your team's specific AI training needs</li>
        </ul>
        <p>In the meantime, feel free to <a href="https://farzadbayat.com/contact">book a free AI consultation</a> to discuss your immediate AI automation needs.</p>
        <p>Best regards,<br>Farzad Bayat<br>AI Consultant & Trainer</p>
      `
    }

    return NextResponse.json({
      success: true,
      message: "Successfully joined workshop waitlist"
    })

  } catch (error) {
    console.error('Workshop waitlist error:', error)
    return NextResponse.json(
      { error: "Failed to join workshop waitlist" },
      { status: 500 }
    )
  }
}