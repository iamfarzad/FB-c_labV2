import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Automation Consultant | Farzad Bayat | 10,000+ Hours Experience",
  description:
    "Expert AI consultant with 10,000+ hours experience. Custom AI automation, chatbots, and workflow optimization for businesses. No hype, just results that work.",
}

export default function HomePage() {
  return (
    <div className="relative w-full min-h-[calc(100vh-4rem)] overflow-hidden flex items-center justify-center">
      <AnimatedGridPattern
        numSquares={40}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12",
        )}
      />

      <div className="container relative z-10 flex flex-col items-center justify-center text-center px-4">
        <div className="max-w-3xl mx-auto space-y-6 w-full">
          <h1 className="text-4xl font-bold font-display tracking-tight text-primary sm:text-5xl md:text-6xl lg:text-7xl text-balance">
            AI Automation Without the Hype
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground text-balance">
            I'm Farzad Bayat—a self-taught AI consultant. I spent 10,000+ hours figuring out what works so your business
            doesn't have to.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/contact">
                Book a Free Consultation <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
