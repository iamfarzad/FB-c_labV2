import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <section className="container flex flex-col items-center justify-center text-center py-20 md:py-32 lg:py-40">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold font-display sm:text-5xl md:text-6xl lg:text-7xl tracking-tighter">
          No Hype, Just AI That <span className="text-primary">Actually Works</span>.
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          With over 10,000 hours of hands-on experience, I build custom AI solutions that streamline your business, not
          just create buzz. Let's build something real.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/consulting">
              Book a Free Consultation <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/workshop">View Workshops</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
