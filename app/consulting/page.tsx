import { PageHeader, PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Check, Zap, Cpu } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Consulting Services - Custom Automation & Chatbot Development",
  description: "Professional AI consulting services including custom chatbots, workflow automation, internal copilots, and AI implementation. Expert consultation with 10,000+ hours experience.",
  openGraph: {
    title: "AI Consulting Services - Custom Automation & Chatbot Development",
    description: "Professional AI consulting services including custom chatbots, workflow automation, internal copilots, and AI implementation.",
    url: "https://farzadbayat.com/consulting",
  },
  alternates: {
    canonical: "https://farzadbayat.com/consulting",
  },
}

const consultingServices = [
  "Build internal chatbots connected to company data",
  "Automate customer service, HR, and operations tasks",
  "Design and deploy private/local AI copilots",
  "Build lightweight MVPs and test automation ideas quickly",
  "Debug, audit, or scale broken AI systems",
]

const workshopLevels = [
  { level: "Basic Level", audience: "For non-tech teams (marketing, ops, HR)" },
  { level: "Intermediate Level", audience: "For product, data, project leads" },
  { level: "Advanced Level", audience: "For developers or technical leads" },
]

export default function ConsultingPage() {
  return (
    <>
      <PageShell className="relative overflow-hidden">
        <AnimatedGridPattern
          numSquares={15}
          maxOpacity={0.03}
          duration={6}
          repeatDelay={3}
          className="absolute inset-0 fill-orange-accent/5 stroke-orange-accent/5"
        />
        <div className="relative z-10">
          <PageHeader
            title="Professional AI Consulting Services That Deliver Results"
            subtitle="Whether you need automation, a custom chatbot, or internal AI copilots, I help you build what actually works—no fluff, no theory, just proven AI solutions."
          />
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href="/contact" title="Book free AI consulting consultation to discuss your automation needs">Book a Free AI Consultation</Link>
            </Button>
          </div>
        </div>
      </PageShell>

      <PageShell>
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <Card className="neu-card transition-all">
            <CardHeader className="text-center">
              <div className="mx-auto w-fit p-3 bg-primary/10 rounded-md mb-2">
                <Zap className="h-8 w-8 text-primary" aria-hidden="true" />
              </div>
              <CardTitle className="text-2xl">
                <h2>AI Consulting & Custom Automation</h2>
              </CardTitle>
              <CardDescription>
                Hands-on help for companies that want to use <strong>AI automation</strong> to cut costs, save time, and improve accuracy with <strong>custom AI solutions</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold mb-3 text-primary">Our AI Consulting Services Include:</h3>
              <ul className="space-y-3">
                {consultingServices.map((service, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" aria-hidden="true" />
                    <span className="text-muted-foreground">{service}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-6 w-full">
                <Link href="/contact" title="Request custom AI consulting quote for your business automation needs">Request a Custom AI Quote</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="neu-card transition-all">
            <CardHeader className="text-center">
              <div className="mx-auto w-fit p-3 bg-primary/10 rounded-md mb-2">
                <Cpu className="h-8 w-8 text-primary" aria-hidden="true" />
              </div>
              <CardTitle className="text-2xl">
                <h2>AI Workshops & Team Training</h2>
              </CardTitle>
              <CardDescription>Teach your team how to use <strong>AI tools</strong> properly—and build real <strong>automation solutions</strong> with hands-on training.</CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold mb-4 text-primary">Training Levels Available:</h3>
              <div className="space-y-4">
                {workshopLevels.map(({ level, audience }) => (
                  <div key={level}>
                    <h4 className="font-semibold text-base">{level}</h4>
                    <p className="text-sm text-muted-foreground">{audience}</p>
                  </div>
                ))}
              </div>
              <Button asChild variant="outline" className="mt-6 w-full bg-transparent">
                <Link href="/workshop" title="Join free AI workshop preview for business teams">Join Free AI Workshop Preview</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageShell>

      <PageShell className="bg-secondary">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Ready to Transform Your Business with AI?</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Get started with proven <strong>AI automation solutions</strong> that deliver measurable results. From <strong>custom chatbots</strong> to <strong>workflow optimization</strong>, we'll help you implement AI that actually works.
          </p>
          <div className="mt-8 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href="/contact" title="Schedule AI consultation to discuss your business automation requirements">Schedule Your AI Consultation</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/about" title="Learn more about AI consultant Farzad Bayat's experience and expertise">Learn About Our Expertise</Link>
            </Button>
          </div>
        </div>
      </PageShell>
    </>
  )
}
