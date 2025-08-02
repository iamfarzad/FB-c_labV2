import Link from "next/link"
import { Button } from "./ui/button"
import { PageShell } from "./page-shell"
import { Bot } from "lucide-react"
import { AnimatedGridPattern } from "./ui/animated-grid-pattern"

interface CtaSectionProps {
  title: string
  subtitle: string
  primaryCtaText: string
  primaryCtaLink: string
  secondaryCtaText: string
  secondaryCtaLink: string
}

export function CtaSection({
  title,
  subtitle,
  primaryCtaLink,
  primaryCtaText,
  secondaryCtaLink,
  secondaryCtaText,
}: CtaSectionProps) {
  return (
    <PageShell>
      <div className="relative rounded-lg bg-secondary p-8 md:p-12 overflow-hidden">
        <AnimatedGridPattern
          numSquares={12}
          maxOpacity={0.04}
          duration={8}
          repeatDelay={4}
          className="absolute inset-0 fill-accent/10 stroke-accent/10"
        />
        <div className="relative z-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">{title}</h2>
          <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">{subtitle}</p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href={primaryCtaLink}>{primaryCtaText}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={secondaryCtaLink}>
                {secondaryCtaText} <Bot className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
