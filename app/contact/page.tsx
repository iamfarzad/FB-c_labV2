import { PageHeader, PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Calendar, Mail } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function ContactPage() {
  return (
    <PageShell>
      <PageHeader
        title="Book a Free AI Consultation"
        subtitle="Let’s talk about how AI can reduce costs, streamline your workflows, or help your team get started with real tools."
      />
      <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
        <Card className="flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 rounded-full bg-orange-accent/10 p-4">
            <Calendar className="h-8 w-8 text-orange-accent" />
          </div>
          <h3 className="text-xl font-bold">Book a 30-Minute Call</h3>
          <p className="mt-2 text-muted-foreground">Use my Calendly link to pick a time that works for you.</p>
          <Button asChild className="mt-6 w-full">
            <a href="https://calendly.com" target="_blank" rel="noopener noreferrer">
              Schedule a Call
            </a>
          </Button>
        </Card>
        <Card className="flex flex-col items-center justify-center p-8 text-center bg-secondary">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold">Send an Email</h3>
          <p className="mt-2 text-muted-foreground">Got a project or question? Email me directly.</p>
          <Button asChild className="mt-6 w-full bg-transparent" variant="outline">
            <a href="mailto:hello@farzadbayat.com">hello@farzadbayat.com</a>
          </Button>
        </Card>
      </div>
    </PageShell>
  )
}
