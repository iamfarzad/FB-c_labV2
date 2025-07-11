import { PageHeader, PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, Book } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const workshopFeatures = [
  "No prior coding or AI experience required",
  "Clear explanations of prompts, tokens, and APIs",
  "You’ll leave knowing how to troubleshoot basic AI issues",
  "You learn by doing and build real tools",
]

export default function WorkshopPage() {
  return (
    <>
      <PageShell className="min-h-screen">
        <PageHeader
          title="Hands-On AI Workshops for Your Team"
          subtitle="Coming Soon – Get notified when the full workshop schedule is live."
        />
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild size="lg">
            <Link href="/contact">Join the Waitlist</Link>
          </Button>
        </div>
      </PageShell>

      <PageShell className="min-h-screen">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <Card className="h-full neu-card transition-all">
            <CardHeader>
              <div className="p-3 bg-primary/10 rounded-md">
                <Book className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">What to Expect</CardTitle>
              <CardDescription>
                These workshops are built from real-world experience—not theory. Every session is designed to give your
                team a working understanding of AI.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {workshopFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="h-full bg-secondary neu-card transition-all">
            <CardHeader>
              <CardTitle className="text-2xl">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">Workshop Format</h3>
                <p className="text-muted-foreground">
                  <strong className="text-primary">3 hours theory:</strong> What LLMs are, how they work, risks, and
                  limitations.
                </p>
                <p className="text-muted-foreground">
                  <strong className="text-primary">3 hours hands-on:</strong> Build a chatbot, automate a task, or
                  create an assistant.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Delivery Options</h3>
                <p className="text-muted-foreground">On-site (Norway + Europe) or Remote (Global).</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/contact">Book a Consultation Instead</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </PageShell>
    </>
  )
}
