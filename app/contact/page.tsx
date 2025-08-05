import { PageHeader, PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Calendar, Mail } from "lucide-react"
import { Card } from "@/components/ui/card"

export const metadata = {
  title: "Book AI Consultation | Contact Farzad Bayat - AI Consultant",
  description: "Book your free AI consultation with Farzad Bayat. Discuss AI automation, chatbot development, and AI implementation for your business.",
  keywords: ["AI consultation", "book AI consultant", "AI automation consultation", "contact AI expert", "AI implementation help"],
  openGraph: {
    title: "Book AI Consultation | Contact Farzad Bayat - AI Consultant",
    description: "Book your free AI consultation with Farzad Bayat. Discuss AI automation, chatbot development, and AI implementation for your business.",
  }
}

export default function ContactPage() {
  return (
    <PageShell>
      <PageHeader
        title="Book Your Free AI Consultation Call"
        subtitle="Let's discuss how AI automation can reduce costs, streamline your workflows, or help your team get started with real AI implementation tools."
      />
      <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
        <Card className="neu-card transition-all flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold">Schedule Your AI Consultation</h3>
          <p className="mt-2 text-muted-foreground">Use my Calendly link to book a 30-minute AI consultation call that works for your schedule.</p>
          <Button asChild className="mt-6 w-full">
            <a href="https://calendly.com/farzad-bayat/30min" target="_blank" rel="noopener noreferrer">
              Book Your AI Consultation
            </a>
          </Button>
        </Card>
        <Card className="neu-card transition-all flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold">Email AI Consultant Directly</h3>
          <p className="mt-2 text-muted-foreground">Have an AI automation project or question? Email me directly for personalized AI consulting advice.</p>
          <Button asChild className="mt-6 w-full bg-transparent" variant="outline">
            <a href="/contact-form">Send Message</a>
          </Button>
        </Card>
      </div>
    </PageShell>
  )
}
