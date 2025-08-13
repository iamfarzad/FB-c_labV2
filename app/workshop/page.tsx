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
import { CourseOutline } from "@/components/workshop/CourseOutline"
import dynamic from "next/dynamic"
const WorkshopPanel = dynamic(() => import('@/components/workshop/WorkshopPanel').then(m => m.WorkshopPanel), { ssr: false })
import { CitationsDemo } from "@/components/experience/citations-demo"
import dynamic from "next/dynamic"
import { WORKSHOP_MODULES } from "@/components/workshop/education-modules"
import Script from "next/script"
// Move client-only components into a small client wrapper instead of ssr:false on a Server Component
const GamifiedSection = dynamic(() => import('@/components/workshop/GamifiedSection').then(mod => mod.GamifiedSection))
const VideoToAppLauncher = dynamic(() => import('@/components/workshop/VideoToAppLauncher').then(m => m.VideoToAppLauncher))

export const metadata = {
  title: "AI Fundamentals Workshop | Farzad Bayat",
  description: "Mini‑workshop on how AI works: foundations, prompting, grounding (RAG), safety, and a hands‑on lab.",
  keywords: ["AI training", "AI workshops", "AI team training", "AI automation training", "AI implementation workshops"],
  openGraph: {
    title: "AI Fundamentals Workshop | Farzad Bayat",
    description: "How AI works: foundations, prompting, grounding (RAG), safety, and a hands‑on lab.",
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
          title="AI Fundamentals Workshop"
          subtitle="Learn how AI works: foundations, prompting, grounding, safety, then apply it in a hands‑on lab."
        />
        <div className="mt-6 flex items-center justify-center gap-x-3">
          <CourseProgressChip />
          <Button asChild>
            <Link href="/workshop/modules">Start Workshop</Link>
          </Button>
        </div>
      </PageShell>

      <PageShell>
        <WorkshopPanel />
      </PageShell>

      <PageShell>
        <CitationsDemo />
      </PageShell>

      <PageShell>
        <div className="grid gap-8 md:grid-cols-2">
          {WORKSHOP_MODULES.map((m) => (
            <div id={`m-${m.id}`} key={m.id}>
              <GamifiedSection module={m} />
            </div>
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
