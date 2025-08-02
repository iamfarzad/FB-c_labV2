import { PageHeader, PageShell } from "@/components/page-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Award, BookOpen, Heart, MessageSquare, Target } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Farzad Bayat - Self-Taught AI Consultant with 10,000+ Hours Experience",
  description: "Learn about Farzad Bayat, an expert AI consultant with 10,000+ hours of hands-on experience. From TV production to AI automation - discover his journey building practical AI solutions.",
  keywords: ["Farzad Bayat", "AI consultant", "AI automation expert", "AI implementation", "business AI"],
  openGraph: {
    title: "About Farzad Bayat - Self-Taught AI Consultant with 10,000+ Hours Experience",
    description: "Learn about Farzad Bayat, an expert AI consultant with 10,000+ hours of hands-on experience. From TV production to AI automation.",
    url: "https://farzadbayat.com/about",
  },
  alternates: {
    canonical: "https://farzadbayat.com/about",
  },
}

const coreValues = [
  { icon: Target, text: "Deliver real business value through AI automation, not hype" },
  { icon: BookOpen, text: "Commit to continuous AI learning and innovation" },
  { icon: Heart, text: "Uphold ethical and responsible AI consulting practices" },
  { icon: MessageSquare, text: "Communicate transparently about AI implementation, always" },
]

const skills = [
  { name: "AI Research & Implementation", value: 90 },
  { name: "System Design & Architecture", value: 85 },
  { name: "Problem Solving & Analysis", value: 95 },
  { name: "Team Collaboration & Training", value: 90 },
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
          title="Self-Taught AI Consultant. Results-Focused. AI That Actually Works."
          subtitle="I'm Farzad Bayat—AI consultant, builder, and systems thinker. I don't just talk about AI. I build, test, and deliver proven automation solutions."
        />
      </PageShell>

      <PageShell>
        <div className="grid md:grid-cols-3 gap-10 items-start">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">My AI Automation Journey</h2>
            <p className="mt-4 text-muted-foreground">
              After 17 years creating and producing TV shows, documentaries, and commercials for major networks across
              the globe, I found myself at a crossroads. I wanted to build something lasting—<strong>AI tools that actually help
              people</strong> and deliver measurable business results.
            </p>
            <p className="mt-4 text-muted-foreground">
              In 2020, I launched my first startup, Optix.io, and dove headfirst into the world of <strong>artificial intelligence and automation</strong>. It
              was a hard reset: I had no formal tech background. I broke things, rebuilt them, and learned by
              doing—starting with GPT-2. Since then, I've discovered what really works in <strong>AI implementation</strong>. My philosophy: you have to build
              and break things yourself to truly understand them.
            </p>
          </div>
          <div className="flex justify-center">
            <Avatar className="w-48 h-48 border-4 border-border shadow-lg">
              <AvatarImage src="/placeholder.svg?width=200&height=200" alt="Farzad Bayat - AI Automation Consultant with 10,000+ hours experience in artificial intelligence and business automation" />
              <AvatarFallback>FB</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </PageShell>

      <PageShell className="bg-secondary">
        <h2 className="text-center text-2xl font-bold tracking-tight text-primary sm:text-3xl">Core Values in AI Consulting</h2>
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {coreValues.map((value) => (
            <Card key={value.text} className="neu-card transition-all flex flex-col items-center justify-center p-8 text-center">
              <CardContent className="p-6 text-center">
                <value.icon className="mx-auto h-10 w-10 text-accent" aria-hidden="true" />
                <h3 className="mt-4 font-medium text-base">{value.text}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageShell>

      <PageShell>
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">My AI Expertise & Strengths</h2>
            <div className="mt-6 space-y-4">
              {skills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-base font-medium text-primary">{skill.name}</span>
                    <span className="text-sm font-medium text-accent">{skill.value}%</span>
                  </div>
                  <Progress value={skill.value} className="[&>div]:bg-accent" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">Timeline & AI Milestones</h2>
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
                          <span className="h-8 w-8 rounded-full bg-accent/20 text-accent flex items-center justify-center ring-8 ring-background">
                            <Award className="h-5 w-5" aria-hidden="true" />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <h3 className="text-sm text-muted-foreground font-semibold">{event.year}</h3>
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
          <h2 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">Let's Connect & Discuss Your AI Needs</h2>
          <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">
            Ready for a direct path to working <strong>AI automation solutions</strong> in your business? Let's discuss your specific <strong>AI implementation needs</strong>.
          </p>
          <div className="mt-8 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href="/contact" title="Book free AI consultation call with expert consultant Farzad Bayat">Book a Free AI Consultation Call</Link>
            </Button>
          </div>
        </div>
      </PageShell>
    </>
  )
}
