import { PageHeader, PageShell } from "@/components/page-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Lightbulb, Star, Users } from "lucide-react"
import { FbcIcon } from "@/components/ui/fbc-icon"
import { FbcIcon as FbcIconPolished } from "@/fbc-logo-icon/components/fbc-icon"
import { ClientBrain, ClientZap, ClientSparkles, ClientTarget } from "@/components/ui/client-icons"
import type { Metadata } from "next"
import { MotionCard } from "@/components/ui/motion-card"
import { FadeIn } from "@/components/ui/fade-in"
import { ProgressTracker } from "@/components/experience/progress-tracker"
import { CitationsDemo } from "@/components/experience/citations-demo"

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
    title: "AI Strategy & Implementation",
    description: "Custom AI solutions designed for your specific business needs and workflows."
  },
  {
    icon: FbcIcon,
    title: "Intelligent Chatbots",
    description: "Advanced conversational AI that understands context and delivers real value."
  },
  {
    icon: ClientZap,
    title: "Workflow Automation",
    description: "Streamline repetitive tasks with smart automation that learns and adapts."
  },
  {
    icon: ClientTarget,
    title: "Rapid Prototyping",
    description: "Quick proof-of-concepts to validate AI solutions before full implementation."
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
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
              <Link href="/contact">
                Start Your AI Project
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary hover:bg-primary/10">
              <Link href="/chat" className="flex items-center">
                <FbcIcon className="mr-2 h-4 w-4" />
                Talk with F.B/c AI
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-muted-foreground hover:text-foreground">
              <Link href="/about">Learn My Story</Link>
            </Button>
          </div>
        </div>
      </PageShell>


      {/* Features Section */}
      <PageShell>
        <div className="mb-6 flex justify-center">
          <ProgressTracker />
        </div>
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            AI Solutions That Drive Results
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            From intelligent chatbots to workflow automation, I build AI systems that solve real business problems.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 0.06}>
              <MotionCard className="neu-card transition-all hover:shadow-lg">
                <CardContent className="p-6 text-center">
                  <feature.icon className="mx-auto h-12 w-12 text-accent mb-4 transition-transform group-hover:scale-110" />
                  <h3 className="text-lg font-semibold text-primary mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </MotionCard>
            </FadeIn>
          ))}
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
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="neu-card">
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
          ))}
        </div>
      </PageShell>

      {/* Citations Preview */}
      <PageShell>
        <CitationsDemo />
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
                  <h3 className="font-semibold text-primary">Practical Experience</h3>
                  <p className="text-muted-foreground">10,000+ hours building real AI solutions, not just theory.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-primary">Business-Focused</h3>
                  <p className="text-muted-foreground">I understand business needs and build AI that delivers ROI.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ClientTarget className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-primary">Rapid Implementation</h3>
                  <p className="text-muted-foreground">Quick prototypes and fast deployment to get results sooner.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg p-8">
            <h3 className="text-xl font-bold text-primary mb-4">Ready to Transform Your Business?</h3>
            <p className="text-muted-foreground mb-6">
              Let's discuss how AI automation can streamline your workflows and boost productivity.
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
            From strategy to implementation, I provide end-to-end AI solutions.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Card className="neu-card">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-primary mb-4">AI Consulting & Strategy</h3>
              <p className="text-muted-foreground mb-6">
                Comprehensive AI assessment and strategic planning to identify the best opportunities for automation in your business.
              </p>
              <Button asChild variant="outline">
                <Link href="/consulting">Learn More</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="neu-card">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-primary mb-4">Hands-On AI Workshop</h3>
              <p className="text-muted-foreground mb-6">
                Interactive workshop where you'll build your first AI automation tool and learn practical implementation strategies.
              </p>
              <Button asChild variant="outline">
                <Link href="/workshop">Join Workshop</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageShell>

      {/* CTA Section */}
      <PageShell>
        <div className="text-center bg-gradient-to-r from-accent/10 to-primary/10 rounded-2xl p-12">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl mb-4">
            Ready to Build AI That Works?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Stop wasting time on AI solutions that don't deliver. Let's build something that actually moves your business forward.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
              <Link href="/contact">
                Start Your Project Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/chat">Try AI Chat Demo</Link>
            </Button>
          </div>
        </div>
      </PageShell>
    </>
  )
}
