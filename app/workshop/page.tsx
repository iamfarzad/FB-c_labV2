import { PageHeader, PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, Book } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MotionCard } from "@/components/ui/motion-card"
import { FadeIn } from "@/components/ui/fade-in"
import { ROICalculator } from "@/components/chat/tools/ROICalculator/ROICalculator"
import { ProgressTracker } from "@/components/experience/progress-tracker"
import { CourseProgressChip } from "@/components/workshop/CourseProgressChip"
import { CitationsDemo } from "@/components/experience/citations-demo"
import dynamic from "next/dynamic"
import { WORKSHOP_MODULES } from "@/components/workshop/education-modules"
import Script from "next/script"
// Move client-only components into a small client wrapper instead of ssr:false on a Server Component
const GamifiedSection = dynamic(() => import('@/components/workshop/GamifiedSection').then(mod => mod.GamifiedSection))
const VideoToAppLauncher = dynamic(() => import('@/components/workshop/VideoToAppLauncher').then(m => m.VideoToAppLauncher))

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
      <PageShell>
        <PageHeader
          title="Interactive AI Education"
          subtitle="Learn by doing. Explore modules, earn XP, and ask the AI as you go."
        />
        <div className="mt-6 flex items-center justify-center gap-x-3">
          <CourseProgressChip />
          <Button asChild variant="outline">
            <Link href="/chat?preset=bot">Build a chatbot</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/chat?preset=automation">Automate a task</Link>
          </Button>
        </div>
      </PageShell>

      <PageShell>
        <div className="mb-2 text-center text-sm text-muted-foreground">Course outline</div>
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <FadeIn>
          <MotionCard className="h-full neu-card transition-all">
            <CardHeader>
              <div className="p-3 bg-primary/10 rounded-md">
                <Book className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <CardTitle className="text-2xl">What to Expect from AI Training</CardTitle>
              <CardDescription>
                These AI workshops are built from real-world AI implementation experience—not theory. Every AI training session is designed to give your
                team a working understanding of AI automation and implementation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {workshopFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0 transition-transform group-hover:scale-110" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </MotionCard>
          </FadeIn>
          <FadeIn delay={0.08}>
          <MotionCard className="h-full bg-secondary neu-card transition-all">
            <CardHeader>
              <CardTitle className="text-2xl">Hands-on tools</CardTitle>
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
              <div>
                <h3 className="text-lg font-semibold">Preview the Hands-on Exercise</h3>
                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  <Button asChild variant="outline">
                    <Link href="/chat?preset=bot">Build your first chatbot</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/chat?preset=automation">Automate a task</Link>
                  </Button>
                </div>
                 <div className="mt-4">
                   <ROICalculator mode="card" />
                 </div>
                 <div className="mt-4">
                   <VideoToAppLauncher />
                 </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/contact">Book AI Consultation Instead</Link>
              </Button>
            </CardFooter>
          </MotionCard>
          </FadeIn>
        </div>
      </PageShell>

      <PageShell>
        <CitationsDemo />
      </PageShell>

      <PageShell>
        <div className="grid gap-8 md:grid-cols-2">
          {WORKSHOP_MODULES.map((m) => (
            <GamifiedSection key={m.id} module={m} />
          ))}
        </div>
      </PageShell>

      {/* SEO: JSON-LD Course schema */}
      <Script id="workshop-jsonld" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Course",
          "name": "Interactive AI Education",
          "description": "Hands-on modules to learn AI concepts, ROI, and practical integration.",
          "provider": {
            "@type": "Organization",
            "name": "F.B/c Lab",
            "sameAs": "https://farzadbayat.com"
          },
          "hasCourseInstance": [
            {
              "@type": "CourseInstance",
              "name": "Industrial Evolution",
              "courseMode": "self-paced",
              "description": "Explore eras 1.0 – 5.0 and the shift to human-centered AI."
            },
            {
              "@type": "CourseInstance",
              "name": "AI Integration",
              "courseMode": "self-paced",
              "description": "Apply AI to real workflows and estimate ROI."
            }
          ]
        }) }} />
    </>
  )
}
