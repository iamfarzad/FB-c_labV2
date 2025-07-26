import { PageHeader, PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Check, Zap, Cpu } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern"

export const metadata = {
  title: "AI Consulting Services & Automation Solutions | Farzad Bayat",
  description: "Professional AI consulting services including chatbot development, workflow automation, and AI copilot implementation. 10,000+ hours of real-world AI experience.",
  keywords: ["AI consulting services", "AI automation", "chatbot development", "AI copilot", "workflow automation", "AI implementation"],
  openGraph: {
    title: "AI Consulting Services & Automation Solutions | Farzad Bayat",
    description: "Professional AI consulting services including chatbot development, workflow automation, and AI copilot implementation.",
  }
}

const consultingServices = [
  "Build intelligent AI chatbots connected to company data and systems",
  "Automate customer service, HR, and operations tasks with AI",
  "Design and deploy private/local AI copilots for your business",
  "Build lightweight AI MVPs and test automation ideas quickly",
  "Debug, audit, or scale broken AI systems and implementations",
]

const workshopLevels = [
  { level: "Basic AI Training", audience: "For non-tech teams (marketing, ops, HR) - AI fundamentals" },
  { level: "Intermediate AI Implementation", audience: "For product, data, project leads - AI automation skills" },
  { level: "Advanced AI Development", audience: "For developers or technical leads - AI system design" },
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
            title="Professional AI Consulting Services That Deliver Real Results"
            subtitle="Whether you need AI automation, custom chatbot development, or internal AI copilot implementation, I help you build AI solutions that actually work—no fluff, no theory."
          />
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href="/contact">Book Your Free AI Consultation</Link>
            </Button>
          </div>
        </div>
      </PageShell>

      <PageShell>
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <Card className="neu-card transition-all">
            <CardHeader className="text-center">
              <div className="mx-auto w-fit p-3 bg-primary/10 rounded-md mb-2">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">AI Consulting & Automation Services</CardTitle>
              <CardDescription>
                Hands-on AI consulting help for companies that want to use artificial intelligence to cut costs, save time, and improve accuracy through automation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {consultingServices.map((service, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">{service}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-6 w-full">
                <Link href="/contact">Request Your Custom AI Consulting Quote</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="neu-card transition-all">
            <CardHeader className="text-center">
              <div className="mx-auto w-fit p-3 bg-primary/10 rounded-md mb-2">
                <Cpu className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">AI Workshops & Team Training Programs</CardTitle>
              <CardDescription>Teach your team how to use AI tools properly and build real AI automation solutions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workshopLevels.map(({ level, audience }) => (
                  <div key={level}>
                    <h4 className="font-semibold">{level}</h4>
                    <p className="text-sm text-muted-foreground">{audience}</p>
                  </div>
                ))}
              </div>
              <Button asChild variant="outline" className="mt-6 w-full bg-transparent">
                <Link href="/workshop">Join Free AI Training Preview</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageShell>
    </>
  )
}
