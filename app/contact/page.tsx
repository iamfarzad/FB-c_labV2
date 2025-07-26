import { PageHeader, PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Calendar, Mail } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact AI Consultant - Book Free AI Automation Consultation",
  description: "Contact expert AI consultant Farzad Bayat for free consultation. Get help with AI automation, custom chatbots, and workflow optimization. Book your call today.",
  openGraph: {
    title: "Contact AI Consultant - Book Free AI Automation Consultation",
    description: "Contact expert AI consultant Farzad Bayat for free consultation. Get help with AI automation, custom chatbots, and workflow optimization.",
    url: "https://farzadbayat.com/contact",
  },
  alternates: {
    canonical: "https://farzadbayat.com/contact",
  },
}

export default function ContactPage() {
  return (
    <PageShell>
      <PageHeader
        title="Book a Free AI Automation Consultation"
        subtitle="Let's talk about how AI can reduce costs, streamline your workflows, or help your team get started with real automation tools that deliver results."
      />
      <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
        <Card className="neu-card transition-all flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <Calendar className="h-8 w-8 text-primary" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold">Schedule a 30-Minute AI Consultation Call</h2>
          <p className="mt-2 text-muted-foreground">Use my Calendly link to pick a time that works for you. Discuss <strong>AI automation opportunities</strong> for your business.</p>
          <Button asChild className="mt-6 w-full">
            <a href="https://calendly.com" target="_blank" rel="noopener noreferrer" title="Schedule free AI consultation call with expert consultant">
              Schedule a Free AI Call
            </a>
          </Button>
        </Card>
        <Card className="neu-card transition-all flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <Mail className="h-8 w-8 text-primary" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold">Send an Email for AI Project Inquiry</h2>
          <p className="mt-2 text-muted-foreground">Got an <strong>AI automation project</strong> or specific question about <strong>custom AI solutions</strong>? Email me directly.</p>
          <Button asChild className="mt-6 w-full bg-transparent" variant="outline">
            <a href="mailto:hello@farzadbayat.com" title="Email AI consultant directly for project inquiries">hello@farzadbayat.com</a>
          </Button>
        </Card>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">Ready to Get Started with AI Automation?</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Whether you need <strong>custom chatbots</strong>, <strong>workflow automation</strong>, or <strong>AI training for your team</strong>, I'm here to help you implement solutions that actually work.
        </p>
      </div>
    </PageShell>
  )
}
