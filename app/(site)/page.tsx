import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern"
import { PageShell } from "@/components/page-shell"
import { ArrowRight, Bot, Cpu, Zap } from "lucide-react"
import { CtaSection } from "@/components/cta-section"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Automation Consultant | Farzad Bayat | 10,000+ Hours Experience",
  description: "Expert AI consultant with 10,000+ hours experience. Custom AI automation, chatbots, and workflow optimization for businesses. No hype, just results that work.",
  openGraph: {
    title: "AI Automation Consultant | Farzad Bayat | 10,000+ Hours Experience",
    description: "Expert AI consultant with 10,000+ hours experience. Custom AI automation, chatbots, and workflow optimization for businesses.",
    url: "https://farzadbayat.com",
  },
  alternates: {
    canonical: "https://farzadbayat.com",
  },
}

export default function HomePage() {
  return (
    <>
      <div className="relative w-full min-h-screen overflow-hidden flex items-center justify-center">
        {/* Animated Grid Background */}
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.1}
          duration={3}
          repeatDelay={1}
          className={cn(
            "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-0 h-full skew-y-12 fill-orange-accent/20 stroke-orange-accent/20",
          )}
        />

        <div className="container relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
          {/* Enhanced hero content with better typography */}
          <div className="max-w-4xl mx-auto space-y-8 w-full">
            <h1 className="text-5xl font-bold tracking-tight text-primary sm:text-6xl md:text-7xl lg:text-8xl text-balance leading-[0.9] bg-gradient-to-br from-foreground via-foreground to-foreground/80 bg-clip-text text-center mx-auto">
              AI Automation Consultant Without the Hype
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground text-balance font-medium">
              I'm Farzad Bayat—a self-taught AI consultant who spent 10,000+ hours figuring out what works so your
              business doesn't have to. Specializing in <strong>custom AI automation</strong>, <strong>intelligent chatbots</strong>, and <strong>workflow optimization</strong>.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-primary text-primary-foreground transition-all hover:bg-primary/90 shadow-lg hover:shadow-xl"
              >
                <Link href="/contact" title="Book free AI automation consultation with expert consultant">Book a Free AI Consultation</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-border bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all"
              >
                <Link href="/chat" title="Try F.B/c AI assistant for business automation demo">
                  Try F.B/c AI <Bot className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Subtle animated elements */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce" aria-hidden="true">
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-muted-foreground/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

      <PageShell>
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Why Choose Our AI Automation Services?</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            10,000+ hours of real-world <strong>AI implementation experience</strong> since 2020. No theory, only proven <strong>business automation solutions</strong> that deliver measurable results.
          </p>
          <Button asChild variant="link" className="mt-4 text-orange-accent hover:text-orange-accent/90">
            <Link href="/about" title="Read full story about AI consultant Farzad Bayat's experience">
              Read My Full Story <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </PageShell>

      <PageShell className="bg-secondary relative overflow-hidden">
        {/* Grid pattern for secondary sections */}
        <AnimatedGridPattern
          numSquares={20}
          maxOpacity={0.05}
          duration={5}
          repeatDelay={2}
          className="absolute inset-0 fill-orange-accent/10 stroke-orange-accent/10"
        />

        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Professional AI Services We Offer</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Custom <strong>AI solutions</strong> to integrate artificial intelligence into your business operations, from <strong>internal automation tools</strong> to comprehensive <strong>team training programs</strong>.
            </p>
          </div>
          <div className="grid gap-6">
            <Card className="neu-card transition-all">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-md">
                  <Zap className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <CardTitle>
                  <h3 className="text-xl">AI Consulting & Automation</h3>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Custom <strong>internal copilots</strong>, <strong>intelligent chatbots</strong>, and <strong>workflow automation systems</strong> tailored to your business needs.</p>
                <Button asChild variant="link" className="p-0 h-auto mt-2 text-orange-accent">
                  <Link href="/consulting" title="Explore AI consulting services and automation solutions">
                    See AI Consulting Services <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 bg-orange-accent/10 rounded-md">
                  <Cpu className="h-6 w-6 text-orange-accent" aria-hidden="true" />
                </div>
                <CardTitle>
                  <h3 className="text-xl">Hands-On AI Training Workshops</h3>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Practical <strong>AI training workshops</strong> for operations, marketing, product, and technical teams. Learn to implement <strong>AI tools</strong> effectively.
                </p>
                <Button asChild variant="link" className="p-0 h-auto mt-2 text-orange-accent">
                  <Link href="/workshop" title="Explore AI training workshops for business teams">
                    Explore AI Training Workshops <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageShell>

      <CtaSection
        title="Ready to implement AI automation that actually works?"
        subtitle="Let's identify the perfect AI use case for your business and get started with proven solutions."
        primaryCtaText="Book Your Free AI Consultation"
        primaryCtaLink="/contact"
        secondaryCtaText="Try F.B/c AI"
        secondaryCtaLink="/chat"
      />
    </>
  )
}
