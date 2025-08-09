import { PageHeader, PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, Book } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MotionStagger, MotionItem, MotionRise } from "@/components/ui/client-animations"
import { WorkshopPersonalizer } from "@/components/workshop/WorkshopPersonalizer"

export const metadata = {
  title: "AI Training Workshops & Team Programs | Farzad Bayat",
  description: "Hands-on AI training workshops for your team. Learn AI automation, chatbot development, and AI implementation skills from real-world experience.",
  keywords: ["AI training", "AI workshops", "AI team training", "AI automation training", "AI implementation workshops"],
  openGraph: {
    title: "AI Training Workshops & Team Programs | Farzad Bayat",
    description: "Hands-on AI training workshops for your team. Learn AI automation, chatbot development, and AI implementation skills.",
  }
}

const workshopFeatures = [
  "No prior coding or AI experience required for AI training",
  "Clear explanations of AI prompts, tokens, and APIs",
  "You'll leave knowing how to troubleshoot basic AI implementation issues",
  "You learn AI automation by doing and build real AI tools",
]

export default function WorkshopPage() {
  return (
    <>
      <PageShell className="min-h-screen">
        <MotionRise>
          <PageHeader
            title="Hands-On AI Training Workshops for Your Team"
            subtitle="Coming Soon – Get notified when the full AI workshop schedule is live. Learn AI automation and implementation skills."
          />
        </MotionRise>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild size="lg">
            <Link href="/workshop-waitlist">Join Workshop Waitlist</Link>
          </Button>
        </div>
      </PageShell>

      <PageShell>
        <WorkshopPersonalizer />
      </PageShell>

      <PageShell className="min-h-screen">
        <MotionStagger className="grid md:grid-cols-2 gap-10 items-center">
          <MotionItem>
            <Card className="h-full neu-card transition-all">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-md">
                  <Book className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">What to Expect from AI Training</CardTitle>
                <CardDescription>
                  Hands-on and practical: understand what matters, build a small but working automation, and leave with a plan.
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
          </MotionItem>
          <MotionItem>
            <Card className="h-full bg-secondary neu-card transition-all">
              <CardHeader>
                <CardTitle className="text-2xl">AI Training Workshop Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold">AI Workshop Format</h3>
                  <p className="text-muted-foreground">
                    <strong className="text-primary">3 hours AI theory:</strong> What AI LLMs are, how they work, AI risks, and
                    AI limitations.
                  </p>
                  <p className="text-muted-foreground">
                    <strong className="text-primary">3 hours hands-on AI:</strong> Build an AI chatbot, automate tasks with AI, or
                    create an AI assistant.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">AI Training Delivery Options</h3>
                  <p className="text-muted-foreground">On-site AI training (Norway + Europe) or Remote AI workshops (Global).</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/contact">Prefer 1:1? Book Consultation</Link>
                </Button>
              </CardFooter>
            </Card>
          </MotionItem>
        </MotionStagger>
      </PageShell>
    </>
  )
}
