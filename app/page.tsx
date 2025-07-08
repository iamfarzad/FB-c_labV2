import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern"
import { PageShell } from "@/components/page-shell"
import { ArrowRight, Bot, Cpu, Zap } from "lucide-react"
import { CtaSection } from "@/components/cta-section"
import { cn } from "@/lib/utils"

export default function HomePage() {
  return (
    <>
      <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden">
        {/* Animated Grid Background */}
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.1}
          duration={3}
          repeatDelay={1}
          className={cn(
            "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12 fill-orange-accent/20 stroke-orange-accent/20",
          )}
        />

        <div className="container relative z-10 flex flex-col items-center justify-center h-full text-center">
          {/* Enhanced hero content with better typography */}
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-5xl font-bold tracking-tight text-primary sm:text-6xl md:text-7xl lg:text-8xl text-balance leading-[0.9] bg-gradient-to-br from-foreground via-foreground to-foreground/80 bg-clip-text">
              AI Automation Without the Hype
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground text-balance font-medium">
              I'm Farzad Bayat—a self-taught AI consultant who spent 10,000+ hours figuring out what works so your
              business doesn't have to.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300"
              >
                <Link href="/contact">Book a Free Consultation</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-300"
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
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Why Work With Me?</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            10,000+ hours of real-world AI implementation since 2020. No theory, only what works in practice.
          </p>
          <Button asChild variant="link" className="mt-4 text-orange-accent hover:text-orange-accent/90">
            <Link href="/about">
              Read My Full Story <ArrowRight className="ml-2 h-4 w-4" />
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
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">What I Offer</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Custom solutions to integrate AI into your business, from internal tools to team training.
            </p>
          </div>
          <div className="grid gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 bg-orange-accent/10 rounded-md">
                  <Zap className="h-6 w-6 text-orange-accent" />
                </div>
                <CardTitle>AI Consulting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Custom internal copilots, chatbots, and workflow automation.</p>
                <Button asChild variant="link" className="p-0 h-auto mt-2 text-orange-accent">
                  <Link href="/consulting">
                    See Consulting <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 bg-orange-accent/10 rounded-md">
                  <Cpu className="h-6 w-6 text-orange-accent" />
                </div>
                <CardTitle>Hands-On AI Training</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Practical workshops for ops, marketing, product, and technical teams.
                </p>
                <Button asChild variant="link" className="p-0 h-auto mt-2 text-orange-accent">
                  <Link href="/workshop">
                    Explore Workshops <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageShell>

      <CtaSection
        title="Ready to use AI that actually works?"
        subtitle="Let's identify a use case and get started."
        primaryCtaText="Book Your Free Consultation"
        primaryCtaLink="/contact"
        secondaryCtaText="Try the AI Demo"
        secondaryCtaLink="/chat"
      />
    </>
  )
}
