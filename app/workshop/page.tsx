import { PageHeader, PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, Book } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Training Workshops for Business Teams - Hands-On AI Learning",
  description: "Professional AI training workshops for business teams. Learn practical AI implementation, automation tools, and AI strategies. No coding experience required.",
  openGraph: {
    title: "AI Training Workshops for Business Teams - Hands-On AI Learning",
    description: "Professional AI training workshops for business teams. Learn practical AI implementation, automation tools, and AI strategies.",
    url: "https://farzadbayat.com/workshop",
  },
  alternates: {
    canonical: "https://farzadbayat.com/workshop",
  },
}

const workshopFeatures = [
  "No prior coding or AI experience required",
  "Clear explanations of prompts, tokens, and APIs",
  "You'll leave knowing how to troubleshoot basic AI issues",
  "You learn by doing and build real automation tools",
]

export default function WorkshopPage() {
  return (
    <>
      <PageShell className="min-h-screen">
        <PageHeader
          title="Hands-On AI Training Workshops for Your Business Team"
          subtitle="Coming Soon – Get notified when the full workshop schedule is live. Learn practical AI implementation and automation strategies."
        />
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild size="lg">
            <Link href="/contact" title="Join AI workshop waitlist and get notified when training is available">Join the AI Workshop Waitlist</Link>
          </Button>
        </div>
      </PageShell>

      <PageShell className="min-h-screen">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <Card className="h-full neu-card transition-all">
            <CardHeader>
              <div className="p-3 bg-primary/10 rounded-md">
                <Book className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <CardTitle className="text-2xl">
                <h2>What to Expect from AI Training</h2>
              </CardTitle>
              <CardDescription>
                These <strong>AI workshops</strong> are built from real-world experience—not theory. Every session is designed to give your
                team a working understanding of <strong>AI automation</strong> and practical <strong>AI implementation</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold mb-4 text-primary">Workshop Benefits Include:</h3>
              <ul className="space-y-4">
                {workshopFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="h-full bg-secondary neu-card transition-all">
            <CardHeader>
              <CardTitle className="text-2xl">
                <h2>AI Workshop Details & Format</h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">AI Workshop Format</h3>
                <p className="text-muted-foreground">
                  <strong className="text-primary">3 hours theory:</strong> What LLMs are, how they work, risks, and
                  limitations in <strong>business automation</strong>.
                </p>
                <p className="text-muted-foreground">
                  <strong className="text-primary">3 hours hands-on:</strong> Build a <strong>chatbot</strong>, automate a task, or
                  create an <strong>AI assistant</strong> for your business.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">AI Training Delivery Options</h3>
                <p className="text-muted-foreground">On-site (Norway + Europe) or Remote (Global) <strong>AI training sessions</strong>.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/contact" title="Book AI consultation instead of workshop training">Book an AI Consultation Instead</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </PageShell>

      <PageShell className="bg-secondary">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Ready to Train Your Team in AI?</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Equip your team with practical <strong>AI skills</strong> and <strong>automation knowledge</strong>. Our hands-on <strong>AI training workshops</strong> focus on real-world applications that drive business results.
          </p>
          <div className="mt-8 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href="/contact" title="Contact us about AI training workshops for your business team">Get AI Training Information</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/consulting" title="Explore AI consulting services as alternative to workshops">Explore AI Consulting</Link>
            </Button>
          </div>
        </div>
      </PageShell>
    </>
  )
}
