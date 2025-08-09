import { PageHeader, PageShell } from "@/components/page-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Lightbulb, Star, Users } from "lucide-react"
import { FbcIcon } from "@/components/ui/fbc-icon"
import { FbcIcon as FbcIconPolished } from "@/fbc-logo-icon/components/fbc-icon"
import { ClientBrain, ClientZap, ClientSparkles, ClientTarget } from "@/components/ui/client-icons"
import type { Metadata } from "next"
import { MotionStagger, MotionItem } from "@/components/ui/client-animations"

export const metadata: Metadata = {
  title: "Farzad Bayat - AI Consultant & Automation Expert | Build AI That Actually Works",
  description: "Expert AI consultant with 10,000+ hours experience. I build practical AI automation solutions that deliver real business results. From chatbots to workflow automation - AI that works.",
  keywords: ["AI consultant", "AI automation", "artificial intelligence", "business automation", "AI implementation", "Farzad Bayat"],
  openGraph: {
    title: "Farzad Bayat - AI Consultant & Automation Expert | Build AI That Actually Works",
    description: "Expert AI consultant with 10,000+ hours experience. I build practical AI automation solutions that deliver real business results.",
    url: "https://farzadbayat.com",
  },
  alternates: {
    canonical: "https://farzadbayat.com",
  },
}

const features = [
  {
    icon: ClientBrain,
    title: "ROI Calculator & Business Case",
    description: "Estimate savings and payback with real numbers for your workflow. Get a clear, lead-ready business case."
  },
  {
    icon: ClientZap,
    title: "Document & Screenshot Analysis",
    description: "Upload a process doc or screenshot—get automation opportunities and next steps in seconds."
  },
  {
    icon: ClientTarget,
    title: "AI Copilots & Chatbots",
    description: "Design practical copilots powered by your data and tools that actually ship and scale."
  },
  {
    icon: ClientSparkles,
    title: "Live Screen Share Feedback",
    description: "Share your screen for fast, actionable guidance—like having an AI systems co‑pilot in the room."
  }
]

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "CEO, TechStart",
    content: "Farzad's AI automation saved us 20 hours per week. The chatbot he built understands our customers better than we expected."
  },
  {
    name: "Michael Chen",
    role: "Operations Director",
    content: "The workflow automation Farzad implemented reduced our processing time by 60%. Incredible results."
  },
  {
    name: "Lisa Rodriguez",
    role: "Marketing Manager",
    content: "Working with Farzad was a game-changer. His AI solutions are practical and actually work in the real world."
  }
]

const stats = [
  { number: "10,000+", label: "Hours of AI Experience" },
  { number: "50+", label: "AI Projects Delivered" },
  { number: "95%", label: "Client Satisfaction Rate" },
  { number: "4+", label: "Years in AI Consulting" }
]

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <PageShell className="pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-16 relative">
            {/* Pulsating orange glow background */}
            <div className="absolute inset-0 flex justify-center items-center">
              <div className="w-56 h-56 bg-accent/20 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute w-64 h-64 bg-accent/10 rounded-full blur-2xl animate-pulse [animation-delay:0.5s]"></div>
            </div>
            {/* F.B/c Icon */}
            <div className="relative z-10">
              <FbcIconPolished className="w-48 h-48" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl">
            Build AI That Actually <span className="text-accent">Works</span>
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
            Practical AI, shipped. Get a personalized plan, ROI estimate, and a clear path from idea to working automation.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
              <Link href="/contact">
                Book Free AI Consultation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary hover:bg-primary/10">
              <Link href="/chat" className="flex items-center">
                <FbcIcon className="mr-2 h-4 w-4" />
                Try the AI Demo
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-muted-foreground hover:text-foreground">
              <Link href="/workshop">Team Workshop</Link>
            </Button>
          </div>
        </div>
      </PageShell>

      {/* Features Section */}
      <PageShell>
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            AI That Drives Measurable Results
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore capabilities built around business value—from discovery to ROI to deployment.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <MotionStagger className="contents">
            {features.map((feature) => (
              <MotionItem key={feature.title}>
                <Card className="neu-card transition-all hover:shadow-lg">
                  <CardContent className="p-6 text-center">
                    <feature.icon className="mx-auto h-12 w-12 text-accent mb-4" />
                    <h3 className="text-lg font-semibold text-primary mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </MotionItem>
            ))}
          </MotionStagger>
        </div>
      </PageShell>

      {/* How It Works Section */}
      <PageShell className="bg-secondary">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">How It Works</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            A simple, respectful flow that meets you where you are and produces a lead-ready summary.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <MotionStagger className="contents">
            <MotionItem>
              <Card className="neu-card">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-primary mb-2">1) Share Context</h3>
                  <p className="text-muted-foreground">Tell me about one process you’d fix. Upload a doc or screenshot if helpful.</p>
                </CardContent>
              </Card>
            </MotionItem>
            <MotionItem>
              <Card className="neu-card">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-primary mb-2">2) Explore Capabilities</h3>
                  <p className="text-muted-foreground">Try ROI, doc/image analysis, or live feedback—opt in as you like.</p>
                </CardContent>
              </Card>
            </MotionItem>
            <MotionItem>
              <Card className="neu-card">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-primary mb-2">3) Get Your Plan</h3>
                  <p className="text-muted-foreground">Receive a personalized summary with ROI and next steps. Then book a call or workshop.</p>
                </CardContent>
              </Card>
            </MotionItem>
          </MotionStagger>
        </div>
      </PageShell>

      {/* Testimonials Section */}
      <PageShell className="bg-secondary">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            What Clients Say
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Real results from real businesses using AI automation.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <MotionStagger className="contents">
            {testimonials.map((testimonial) => (
              <MotionItem key={testimonial.name}>
                <Card className="neu-card">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                    <div>
                      <div className="font-semibold text-primary">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              </MotionItem>
            ))}
          </MotionStagger>
        </div>
      </PageShell>

      {/* Why Choose Me Section */}
      <PageShell>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl mb-6">
              Why Work With Me?
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-primary">Outcome-First, Not Hype</h3>
                  <p className="text-muted-foreground">You get working automation, a clear ROI view, and a PDF you can share with stakeholders.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-primary">Guided, Respectful Flow</h3>
                  <p className="text-muted-foreground">Try capabilities at your pace. I surface value, not pressure.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ClientTarget className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-primary">Fast Prototyping</h3>
                  <p className="text-muted-foreground">Move from idea to working copilot or workflow quickly—then iterate.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg p-8">
            <h3 className="text-xl font-bold text-primary mb-4">Ready to Transform Your Business?</h3>
            <p className="text-muted-foreground mb-6">
              Book a free consultation to map your first automation and see the ROI potential.
            </p>
            <Button asChild className="w-full bg-accent hover:bg-accent/90">
              <Link href="/contact">Schedule Free Consultation</Link>
            </Button>
          </div>
        </div>
      </PageShell>

      {/* Services Preview */}
      <PageShell className="bg-secondary">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            How I Can Help Your Business
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            From strategy to implementation, you’ll get a practical plan and working AI.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <MotionStagger className="contents">
            <MotionItem>
              <Card className="neu-card">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-primary mb-4">AI Consulting & Strategy</h3>
                  <p className="text-muted-foreground mb-6">
                    Assess your processes, pick high‑ROI opportunities, and design copilots that ship.
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/consulting">Learn More</Link>
                  </Button>
                </CardContent>
              </Card>
            </MotionItem>
            <MotionItem>
              <Card className="neu-card">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-primary mb-4">Hands-On AI Workshop</h3>
                  <p className="text-muted-foreground mb-6">
                    Bring your workflow. Leave with a prototype, a playbook, and next steps your team can own.
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/workshop">Join Workshop</Link>
                  </Button>
                </CardContent>
              </Card>
            </MotionItem>
          </MotionStagger>
        </div>
      </PageShell>

      {/* CTA Section */}
      <PageShell>
        <div className="text-center bg-gradient-to-r from-accent/10 to-primary/10 rounded-2xl p-12">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl mb-4">
            Get Your Personalized AI Plan & ROI Snapshot
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            In one session, we’ll outline the automation opportunity, the expected impact, and the fastest way to ship a working result.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
              <Link href="/contact">
                Book Free Consultation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/workshop">Team Workshop</Link>
            </Button>
          </div>
        </div>
      </PageShell>
    </>
  )
}
