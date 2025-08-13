import { PageHeader, PageShell } from "@/components/page-shell"
import { BookCallButton } from '@/components/meeting/BookCallButton'
import { Button } from "@/components/ui/button"
import { Calendar, Mail } from "lucide-react"
import { Card } from "@/components/ui/card"
import { MotionCard } from "@/components/ui/motion-card"
import { FadeIn } from "@/components/ui/fade-in"
import { ProgressTracker } from "@/components/experience/progress-tracker"
import { CitationsDemo } from "@/components/experience/citations-demo"

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
      <div className="mx-auto mt-16 max-w-4xl">
        <div className="mb-6 flex justify-center">
          <ProgressTracker />
        </div>
      </div>
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
        <FadeIn>
        <MotionCard className="neu-card transition-all flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold">Schedule Your AI Consultation</h3>
          <p className="mt-2 text-muted-foreground">Book a free 30‑minute call. Picks a time from my live availability.</p>
          <div className="mt-6 w-full rounded-xl border bg-background/60 p-6 text-center">
            <p className="text-muted-foreground mb-4">Prefer a popup? Use the button below.</p>
            <BookCallButton title="Book Your Free AI Consultation">Open Scheduler</BookCallButton>
          </div>
        </MotionCard>
        </FadeIn>
        <FadeIn delay={0.08}>
        <MotionCard className="neu-card transition-all flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold">Email AI Consultant Directly</h3>
          <p className="mt-2 text-muted-foreground">Have an AI automation project or question? Email me directly for personalized AI consulting advice.</p>
          <Button asChild className="mt-6 w-full bg-transparent" variant="outline">
            <a href="/contact-form">Send Message</a>
          </Button>
        </MotionCard>
        </FadeIn>
      </div>
      <div className="mx-auto mt-8 max-w-4xl">
        <CitationsDemo />
      </div>
    </PageShell>
  )
}
