import type React from "react"
import { CheckCircle, Zap, Eye, BarChart, Bot, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: { icon: React.ElementType; title: string; description: string }) => (
  <div className="bg-dark-800 p-6 rounded-lg border border-dark-700">
    <div className="flex items-center gap-4 mb-3">
      <Icon className="h-6 w-6 text-blue-400" />
      <h3 className="text-xl font-semibold text-white">{title}</h3>
    </div>
    <p className="text-gray-400">{description}</p>
  </div>
)

const ValuePill = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2 bg-dark-700 text-gray-300 px-4 py-2 rounded-full">
    <CheckCircle className="h-5 w-5 text-green-500" />
    <span>{children}</span>
  </div>
)

export default function AboutPage() {
  return (
    <div className="bg-dark-900 text-white">
      <div className="container mx-auto px-4 py-16 md:px-6 md:py-24">
        {/* Hero Section */}
        <section className="text-center mb-24">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
            Demonstrating the Future of Business AI
          </h1>
          <p className="max-w-3xl mx-auto text-lg text-gray-300 mb-8">
            F.B/c Consulting is where live, future-ready AI meets practical business transformation. We replace
            theoretical sales pitches with hands-on, transparent demonstrations—delivering actionable insights for
            clients ready to see what advanced AI can actually do.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
              <Link href="/chat">Experience the Live Demo</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-dark-600 hover:bg-dark-800">
              Book a Workshop
            </Button>
          </div>
        </section>

        {/* What Makes Us Unique Section */}
        <section className="mb-24">
          <h2 className="text-3xl font-bold text-center mb-12">What Makes F.B/c Consulting Unique</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Zap}
              title="Live, Real-World Proof"
              description="Instead of slides, experience our AI solving your problems in a live demo using your own data, documents, and workflow."
            />
            <FeatureCard
              icon={BarChart}
              title="Business Value First"
              description="Every solution revolves around tangible outcomes: reducing costs, increasing productivity, and improving customer experience with clear ROI."
            />
            <FeatureCard
              icon={Bot}
              title="Multi-Modal, Modern AI"
              description="Powered solely by Google Gemini—all text, voice, image, and video analysis happens under one unified, enterprise-grade platform."
            />
            <FeatureCard
              icon={Eye}
              title="Transparency & Trust"
              description="A real-time activity panel shows every action the AI is making. All data use is privacy-first and secure."
            />
            <FeatureCard
              icon={Users}
              title="Hands-On Training & Consulting"
              description="From free discovery workshops to bespoke AI integrations and team training, we provide hands-on guidance."
            />
            <FeatureCard
              icon={CheckCircle}
              title="Actionable Insights"
              description="Every conversation ends with a branded PDF summary of insights, next steps, and clear ROI, delivered to your inbox."
            />
          </div>
        </section>

        {/* Core Values Section */}
        <section className="text-center mb-24">
          <h2 className="text-3xl font-bold text-center mb-8">Our Commitment to Your Success</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <ValuePill>Reducing Costs</ValuePill>
            <ValuePill>Increasing Productivity</ValuePill>
            <ValuePill>Automating Workflows</ValuePill>
            <ValuePill>Improving Customer Experience</ValuePill>
          </div>
        </section>

        {/* Who It's For Section */}
        <section className="bg-dark-800 rounded-lg p-12 border border-dark-700">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Who It's For</h2>
              <p className="text-gray-400 mb-6">
                We partner with forward-thinking teams who are ready to harness practical AI for their core operations.
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-400 mt-1 shrink-0" />
                  <span>Fast-growing tech teams, scale-ups, and enterprises.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-400 mt-1 shrink-0" />
                  <span>Business leaders who want to see working AI before investing.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-400 mt-1 shrink-0" />
                  <span>Companies requiring private, trustworthy, and customizable AI workflows.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-400 mt-1 shrink-0" />
                  <span>Teams seeking not just expertise—but proof that the tech will work for them.</span>
                </li>
              </ul>
            </div>
            <div className="text-center">
              <p className="text-lg text-gray-300 mb-4">Founded by</p>
              <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-400">
                Farzad Bayat
              </p>
              <p className="text-md text-gray-500 mt-2">Next-Generation AI Consultant</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
