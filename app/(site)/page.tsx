import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="container">
      <section className="py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight">Modern UI, Clean Design</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          We are incrementally recreating the entire design and UI, keeping the brand colours and refactoring to a super
          clean, minimal, modern, and mature design.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/consulting">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/about">Learn More</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
