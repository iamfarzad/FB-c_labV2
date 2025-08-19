import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { FbcIcon as FbcIconPolished } from "@/components/ui/fbc-icon"
import { DatabaseWithRestApi } from "@/components/ui/DatabaseWithRestApi"
import { BookCallButton } from "@/components/meeting/BookCallButton"

export default function TestLandingPage() {
  return (
    <>
      {/* Hero Section (kept as-is style) */}
      <PageShell className="pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-16 relative">
            <div className="absolute inset-0 flex justify-center items-center">
              <div className="w-56 h-56 bg-accent/20 rounded-full blur-xl animate-pulse" />
              <div className="absolute w-64 h-64 bg-accent/10 rounded-full blur-2xl animate-pulse [animation-delay:0.5s]" />
            </div>
            <div className="relative z-10">
              <div className="absolute inset-0 -z-10">
                <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full 
                                bg-[conic-gradient(from_0deg,theme(colors.accent.DEFAULT),transparent_60%)] 
                                opacity-30 blur-2xl animate-[spin_14s_linear_infinite]" />
                <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/20 animate-pulse" />
              </div>
              <FbcIconPolished className="w-48 h-48" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl">
            Build AI That Actually <span className="text-accent">Works</span>
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
            I'm Farzad Bayat, an AI consultant with 10,000+ hours of hands-on experience. 
            I build practical AI automation solutions that deliver real business results—not just hype.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <BookCallButton size="lg" className="bg-accent hover:bg-accent/90" title="Book Your Free AI Consultation">
              Start Your AI Project
              <ArrowRight className="ml-2 h-4 w-4" />
            </BookCallButton>
            <Button asChild variant="outline" size="lg" className="border-primary hover:bg-primary/10">
              <Link href="/chat" className="flex items-center">
                <span className="mr-2">💬</span>
                Talk with F.B/c AI
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-muted-foreground hover:text-foreground">
              <Link href="/about">Learn My Story</Link>
            </Button>
          </div>
        </div>
      </PageShell>

      {/* Features Section (converted to DatabaseWithRestApi visual) */}
      <PageShell>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">AI Solutions That Drive Results</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            From intelligent chatbots to workflow automation, I build AI systems that solve real business problems.
          </p>
        </div>

        <div className="w-full flex items-center justify-center">
          <DatabaseWithRestApi
            title="F.B/c Conversational Orchestration"
            circleText="F.B/c"
            buttonTexts={{ first: "F.B/c AI", second: "production" }}
            badgeTexts={{ first: "Session", second: "Intent", third: "Tools", fourth: "ROI" }}
            lightColor="#ff5b04"
          />
        </div>
        
      </PageShell>
    </>
  )
}


