import { PageHeader, PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Check, Zap, Cpu } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern"

const consultingServices = [
  "Build internal chatbots connected to company data",
  "Automate customer service, HR, and operations tasks",
  "Design and deploy private/local AI copilots",
  "Build lightweight MVPs and test automation ideas quickly",
  "Debug, audit, or scale broken AI systems",
]

const workshopLevels = [
  { level: "Basic", audience: "For non-tech teams (marketing, ops, HR)" },
  { level: "Intermediate", audience: "For product, data, project leads" },
  { level: "Advanced", audience: "For developers or technical leads" },
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
            title="Practical AI Services That Deliver Results"
            subtitle="Whether you need automation, a custom chatbot, or internal AI copilots, I help you build what actually works—no fluff, no theory."
          />
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href="/contact">Book a Free Consultation</Link>
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
              <CardTitle className="text-2xl">AI Consulting</CardTitle>
              <CardDescription>
                Hands-on help for companies that want to use AI to cut costs, save time, and improve accuracy.
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
                <Link href="/contact">Request a Custom Quote</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="neu-card transition-all">
            <CardHeader className="text-center">
              <div className="mx-auto w-fit p-3 bg-primary/10 rounded-md mb-2">
                <Cpu className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">AI Workshops & Team Training</CardTitle>
              <CardDescription>Teach your team how to use AI tools properly—and build real things.</CardDescription>
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
                <Link href="/workshop">Join Free Digital Preview</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageShell>
    </>
  )
}
