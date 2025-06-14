"use client"

import React from "react"
import { Zap, CheckCircle, Users, BarChart, Lightbulb, Target } from "lucide-react"

interface WhyItWorksProps {
  theme: "light" | "dark"
}

export const WhyItWorks: React.FC<WhyItWorksProps> = ({ theme }) => {
  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"
  const cardBg = theme === "dark" ? "bg-[var(--glass-bg)]" : "bg-white"
  const cardBorder = theme === "dark" ? "border-[var(--glass-border)]" : "border-gray-200"

  const methodology = [
    {
      icon: <Lightbulb className="h-6 w-6 text-[var(--color-orange-accent)]" />,
      title: "Learn by Doing",
      description: "Our hands-on approach ensures you don't just learn theory but gain practical, applicable skills."
    },
    {
      icon: <Users className="h-6 w-6 text-[var(--color-orange-accent)]" />,
      title: "Small Groups",
      description: "Limited class sizes ensure personalized attention and better learning outcomes."
    },
    {
      icon: <BarChart className="h-6 w-6 text-[var(--color-orange-accent)]" />,
      title: "Progressive Learning",
      description: "Carefully structured content that builds from basic to advanced concepts."
    },
    {
      icon: <Target className="h-6 w-6 text-[var(--color-orange-accent)]" />,
      title: "Real-World Focus",
      description: "Case studies and examples from actual business applications."
    }
  ]

  const results = [
    {
      value: "98%",
      label: "Satisfaction Rate",
      description: "of participants rate the workshop as excellent or very good"
    },
    {
      value: "85%",
      label: "Implementation Rate",
      description: "of attendees implement at least one AI solution within 30 days"
    },
    {
      value: "10x",
      label: "ROI",
      description: "Average return on investment reported by workshop participants"
    },
    {
      value: "4.9/5",
      label: "Instructor Rating",
      description: "Average rating for workshop instruction and content quality"
    }
  ]

  const testimonials = [
    {
      quote: "This workshop completely changed how I approach my work. I've already automated several time-consuming tasks.",
      author: "Sarah K., Marketing Director"
    },
    {
      quote: "The hands-on exercises made all the difference. I was able to apply what I learned immediately.",
      author: "Michael T., Small Business Owner"
    },
    {
      quote: "Farzad's teaching style is engaging and effective. I came in with no AI experience and left feeling confident.",
      author: "Emily R., Project Manager"
    },
    {
      quote: "Best professional development investment I've made this year. The practical focus was exactly what I needed.",
      author: "David L., Operations Lead"
    }
  ]

  return (
    <section className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-none bg-[var(--color-orange-accent)]/10 border border-[var(--color-orange-accent)]/30 mb-6">
            <Zap className="h-5 w-5 text-[var(--color-orange-accent)] mr-2" />
            <span className="text-sm font-tech-mono text-[var(--color-orange-accent)] uppercase tracking-tech-wide">Our Approach</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl font-bold ${textColor} mb-6`}>
            Why This Workshop <span className="gradient-text">Works</span>
          </h2>
          <p className={`text-xl ${mutedTextColor} max-w-3xl mx-auto`}>
            A proven methodology that delivers real, measurable results for participants.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div>
            <h3 className={`text-2xl font-bold ${textColor} mb-6`}>Our Methodology</h3>
            <div className="space-y-6">
              {methodology.map((item, index) => (
                <div key={index} className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-orange-accent)]/10 flex items-center justify-center">
                      {item.icon}
                    </div>
                  </div>
                  <div>
                    <h4 className={`text-lg font-bold ${textColor} mb-1`}>{item.title}</h4>
                    <p className={mutedTextColor}>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className={`${cardBg} ${cardBorder} border rounded-2xl p-8`}>
            <h3 className={`text-2xl font-bold ${textColor} mb-6`}>Proven Results</h3>
            <div className="grid grid-cols-2 gap-6">
              {results.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-[var(--color-orange-accent)] mb-2">{item.value}</div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-sm mt-1">{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`${cardBg} ${cardBorder} border rounded-2xl p-8 md:p-12 mb-16`}>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className={`text-2xl font-bold ${textColor} mb-6`}>What Makes Us Different</h3>
              <ul className="space-y-4">
                {[
                  "No fluff, just practical skills you can use immediately",
                  "Taught by an industry practitioner, not just a trainer",
                  "Focus on real business applications, not just theory",
                  "Ongoing support after the workshop",
                  "Small class sizes for better learning"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-orange-accent)]/10 flex items-center justify-center mt-0.5 mr-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-orange-accent)]" />
                    </div>
                    <span className={mutedTextColor}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className={`text-2xl font-bold ${textColor} mb-6`}>Success Stories</h3>
              <div className="space-y-6">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="relative pl-6">
                    <div className="absolute left-0 top-1 text-[var(--color-orange-accent)]">"</div>
                    <blockquote className={`italic ${mutedTextColor} mb-2`}>{testimonial.quote}</blockquote>
                    <div className="text-sm font-medium">{testimonial.author}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className={`text-2xl font-bold ${textColor} mb-6`}>Ready to Transform Your Business with AI?</h3>
          <p className={`text-xl ${mutedTextColor} max-w-3xl mx-auto mb-8`}>
            Join our next workshop and start implementing AI solutions that deliver real results.
          </p>
          <a 
            href="#register" 
            className="inline-flex items-center px-8 py-4 rounded-none bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] text-white font-semibold text-lg shadow-2xl hover:shadow-[var(--color-orange-accent)]/25 transition-all duration-300 transform hover:scale-105"
          >
            <span>Reserve Your Spot Now</span>
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
          <p className={`text-sm ${mutedTextColor} mt-4`}>
            Limited seats available. Next workshop starts in <span className="font-semibold text-[var(--color-orange-accent)]">14 days</span>
          </p>
        </div>
      </div>
    </section>
  )
}
