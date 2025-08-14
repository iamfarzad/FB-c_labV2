import { PageHeader } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CourseProgressChip } from "@/components/workshop/CourseProgressChip"
import { WorkshopPanel } from "@/components/workshop/WorkshopPanel"
import Script from "next/script"

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
      <section className="min-h-[100dvh] grid grid-rows-[auto,1fr]">
        <div className="container py-6 md:py-8">
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
        </div>
        <div className="min-h-0">
          <WorkshopPanel />
        </div>
      </section>

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
