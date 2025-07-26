import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern"
import { PageShell } from "@/components/page-shell"
import { ArrowRight, Bot, Cpu, Zap } from "lucide-react"
import { CtaSection } from "@/components/cta-section"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "AI Consulting & Automation Expert | Farzad Bayat",
  description: "AI consultant Farzad Bayat delivers practical AI automation, chatbots, and workflow solutions. 10,000+ hours of real-world AI implementation experience.",
  keywords: ["AI consulting", "AI automation", "AI consultant", "business AI", "AI implementation"],
  openGraph: {
    title: "AI Consulting & Automation Expert | Farzad Bayat",
    description: "AI consultant Farzad Bayat delivers practical AI automation, chatbots, and workflow solutions. 10,000+ hours of real-world AI implementation experience.",
  }
}

export default function HomePage() {
  return (
    <>
      <div className="relative w-full min-h-screen overflow-hidden">
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

        <div className="container relative z-10 flex flex-col items-center justify-center h-full text-center">
          {/* Enhanced hero content with better typography and SEO optimization */}
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-5xl font-bold tracking-tight text-primary sm:text-6xl md:text-7xl lg:text-8xl text-balance leading-[0.9] bg-gradient-to-br from-foreground via-foreground to-foreground/80 bg-clip-text">
              AI Automation & Consulting That Actually Works
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground text-balance font-medium">
              I'm Farzad Bayat—an experienced AI consultant with 10,000+ hours building practical AI automation, chatbots, and workflow solutions for businesses that need real results.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="transition-all hover:bg-primary/90 text-foreground shadow-lg hover:shadow-xl"
              >
                <Link href="/contact">Book Your Free AI Consultation</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-border bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all"
              >
                <Link href="/chat">
                  Try My AI Assistant <Bot className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Subtle animated elements */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-muted-foreground/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

      <PageShell>
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Why Choose My AI Consulting Services?</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            10,000+ hours of real-world AI implementation since 2020. No theory, only proven AI automation and consulting solutions that work in practice.
          </p>
          <Button asChild variant="link" className="mt-4 text-orange-accent hover:text-orange-accent/90">
            <Link href="/about">
              Read My Full AI Consulting Story <ArrowRight className="ml-2 h-4 w-4" />
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
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Professional AI Services & Solutions</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Custom AI automation solutions to integrate artificial intelligence into your business, from internal AI tools to comprehensive team training programs.
            </p>
          </div>
          <div className="grid gap-6">
            <Card className="neu-card transition-all">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-md">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI Consulting & Automation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Custom internal AI copilots, intelligent chatbots, and advanced workflow automation solutions.</p>
                <Button asChild variant="link" className="p-0 h-auto mt-2 text-orange-accent">
                  <Link href="/consulting">
                    Explore AI Consulting Services <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 bg-orange-accent/10 rounded-md">
                  <Cpu className="h-6 w-6 text-orange-accent" />
                </div>
                <CardTitle>Hands-On AI Training & Workshops</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Practical AI workshops for operations, marketing, product, and technical teams. Learn real AI implementation skills.
                </p>
                <Button asChild variant="link" className="p-0 h-auto mt-2 text-orange-accent">
                  <Link href="/workshop">
                    Discover AI Training Programs <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageShell>

      <CtaSection
        title="Ready to implement AI automation that actually works?"
        subtitle="Let's identify your AI use case and get started with practical solutions."
        primaryCtaText="Book Your Free AI Consultation"
        primaryCtaLink="/contact"
        secondaryCtaText="Try the AI Demo"
        secondaryCtaLink="/chat"
      />
    </>
  )
}
