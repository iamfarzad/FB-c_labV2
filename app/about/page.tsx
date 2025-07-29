"use client"

import type React from "react"

import { Award, BookOpen, Cpu, Eye, ShieldCheck, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) => (
  <div className="bg-dark-800 p-6 rounded-xl border border-dark-700/50 transition-all hover:border-blue-500/50 hover:bg-dark-700/50">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 bg-dark-700 rounded-lg flex items-center justify-center">
        <Icon className="h-6 w-6 text-blue-400" />
      </div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
    </div>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </div>
)

const AudiencePill = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-dark-800 border border-dark-700 rounded-full px-4 py-2 text-center text-gray-300">{children}</div>
)

export default function AboutPage() {
  return (
    <div className="w-full bg-dark-900 text-gray-300">
      <main className="container mx-auto px-4 py-16 sm:py-24">
        {/* Hero Section */}
        <section className="text-center mb-24">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Where Live AI Meets Practical Business Transformation
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-400 mb-8">
            F.B/c Consulting is a next-generation AI consulting service and technology showcase founded by Farzad Bayat.
            We demonstrate, not just discuss, the power of advanced AI for real business results.
          </p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-6 text-lg">
            Book a Free Discovery Workshop
          </Button>
        </section>

        {/* What Makes F.B/c Unique Section */}
        <section className="mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
            What Makes F.B/c Consulting Unique
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Eye}
              title="Live, Real-World Proof"
              description="Experience our AI solving your problems in real-time with your data. No slides, no hypotheticals—just live, practical demonstrations."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Business Value First"
              description="Every solution revolves around tangible outcomes: reducing costs, increasing productivity, and improving customer experience, with clear ROI."
            />
            <FeatureCard
              icon={Cpu}
              title="Multi-Modal, Modern AI"
              description="Powered solely by Google Gemini, we handle text, voice, vision, code, and video analysis under one unified, enterprise-grade platform."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Transparency & Trust"
              description="A real-time activity panel shows you exactly how our AI works. We are privacy-first, storing only essential data and never full chat logs."
            />
            <FeatureCard
              icon={BookOpen}
              title="Hands-On Training & Consulting"
              description="From free discovery workshops to bespoke AI integrations and team training, we provide hands-on guidance tailored to your needs."
            />
            <FeatureCard
              icon={Award}
              title="Immediate, Actionable Insights"
              description="Every conversation ends with a branded PDF summary of insights, next steps, and clear ROI, creating high-credibility leads."
            />
          </div>
        </section>

        {/* Who It's For Section */}
        <section className="text-center mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Who It's For</h2>
          <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-4">
            <AudiencePill>Fast-growing tech teams, scale-ups, and enterprises</AudiencePill>
            <AudiencePill>Business leaders who want to see working AI before investing</AudiencePill>
            <AudiencePill>Companies requiring private, trustworthy, and customizable AI</AudiencePill>
            <AudiencePill>Teams seeking proof that the tech will work for them</AudiencePill>
          </div>
        </section>

        {/* In Short Section */}
        <section className="max-w-4xl mx-auto bg-dark-800 border border-dark-700 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">In Short: Your Partner in Practical AI</h2>
          <p className="text-lg text-gray-400">
            F.B/c Consulting replaces theoretical sales pitches with hands-on, transparent demonstrations—delivering
            actionable insights and automation for clients ready to see what advanced AI can actually do in their
            business, today.
          </p>
        </section>
      </main>
    </div>
  )
}
