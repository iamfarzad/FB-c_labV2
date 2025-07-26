import { PageHeader, PageShell } from "@/components/page-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Award, BookOpen, Heart, MessageSquare, Target } from "lucide-react"

export const metadata = {
  title: "About Farzad Bayat - AI Consultant & Automation Expert",
  description: "Meet Farzad Bayat, AI consultant with 10,000+ hours of real-world AI implementation experience. From TV production to AI automation expert.",
  keywords: ["Farzad Bayat", "AI consultant", "AI automation expert", "AI implementation", "business AI"],
  openGraph: {
    title: "About Farzad Bayat - AI Consultant & Automation Expert",
    description: "Meet Farzad Bayat, AI consultant with 10,000+ hours of real-world AI implementation experience.",
  }
}

const coreValues = [
  { icon: Target, text: "Deliver real business value through AI automation, not hype" },
  { icon: BookOpen, text: "Commit to continuous AI learning and innovation" },
  { icon: Heart, text: "Uphold ethical and responsible AI consulting practices" },
  { icon: MessageSquare, text: "Communicate transparently about AI implementation, always" },
]

const skills = [
  { name: "AI Research & Implementation", value: 90 },
  { name: "AI System Design", value: 85 },
  { name: "AI Problem Solving", value: 95 },
  { name: "AI Team Collaboration", value: 90 },
]

const timeline = [
  { year: 2020, milestone: "Began self-learning AI & automation, built Optix.io AI platform" },
  { year: 2021, milestone: "Launched iWriter.ai for Norwegian SMEs - AI automation success" },
  { year: 2022, milestone: "Developed 'Talk to Eve' AI for workplace mental wellness" },
  { year: 2023, milestone: "Built ZingZang Lab (AI music app), expanded AI consulting services" },
  { year: 2024, milestone: "Ran hands-on AI workshops, launched F.B AI Consulting" },
]

export default function AboutPage() {
  return (
    <>
      <PageShell>
        <PageHeader
          title="Self-Taught AI Consultant. Results-Focused. AI Automation That Actually Works."
          subtitle="I'm Farzad Bayat—AI consultant, builder, and systems thinker. I don't just talk about AI. I build, test, and deliver practical AI automation solutions."
        />
      </PageShell>

      <PageShell>
        <div className="grid md:grid-cols-3 gap-10 items-start">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">My AI Consulting Journey</h2>
            <p className="mt-4 text-muted-foreground">
              After 17 years creating and producing TV shows, documentaries, and commercials for major networks across
              the globe, I found myself at a crossroads. I wanted to build something lasting—AI tools that actually help
              businesses succeed.
            </p>
            <p className="mt-4 text-muted-foreground">
              In 2020, I launched my first AI startup, Optix.io, and dove headfirst into the world of AI technology and automation. It
              was a hard reset: I had no formal tech background. I broke things, rebuilt them, and learned AI implementation by
              doing—starting with GPT-2. Since then, I've discovered what really works in AI automation. My philosophy: you have to build
              and break AI systems yourself to truly understand them.
            </p>
          </div>
          <div className="flex justify-center">
            <Avatar className="w-48 h-48 border-4 border-border shadow-lg">
              <AvatarImage src="/placeholder.svg?width=200&height=200" alt="Farzad Bayat - AI Consultant and Automation Expert" />
              <AvatarFallback>FB</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </PageShell>

      <PageShell className="bg-secondary">
        <h2 className="text-center text-2xl font-bold tracking-tight text-primary sm:text-3xl">AI Consulting Core Values</h2>
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {coreValues.map((value) => (
            <Card key={value.text} className="neu-card transition-all flex flex-col items-center justify-center p-8 text-center">
              <CardContent className="p-6 text-center">
                <value.icon className="mx-auto h-10 w-10 text-orange-accent" />
                <p className="mt-4 font-medium">{value.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageShell>

      <PageShell>
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">My AI Consulting Strengths</h2>
            <div className="mt-6 space-y-4">
              {skills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-base font-medium text-primary">{skill.name}</span>
                    <span className="text-sm font-medium text-orange-accent">{skill.value}%</span>
                  </div>
                  <Progress value={skill.value} className="[&>div]:bg-orange-accent" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">AI Implementation Timeline & Milestones</h2>
            <div className="mt-6 flow-root">
              <ul className="-mb-8">
                {timeline.map((event, eventIdx) => (
                  <li key={event.year}>
                    <div className="relative pb-8">
                      {eventIdx !== timeline.length - 1 ? (
                        <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-border" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-orange-accent/20 text-orange-accent flex items-center justify-center ring-8 ring-background">
                            <Award className="h-5 w-5" />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-muted-foreground">{event.year}</p>
                            <p className="font-medium text-primary">{event.milestone}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </PageShell>

      <PageShell className="bg-secondary">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">Ready for AI Automation That Works?</h2>
          <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">
            Ready for a direct path to working AI automation in your business? Let's discuss your AI implementation needs.
          </p>
          <div className="mt-8 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href="/contact">Book Your Free AI Consultation Call</Link>
            </Button>
          </div>
        </div>
      </PageShell>
    </>
  )
}
