"use client"

import React from "react"
import { Star, Quote } from "lucide-react"

interface TestimonialsSectionProps {
  theme: "light" | "dark"
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ theme }) => {
  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"
  const cardBg = theme === "dark" ? "bg-[var(--glass-bg)]" : "bg-white"
  const cardBorder = theme === "dark" ? "border-[var(--glass-border)]" : "border-gray-200"

  const testimonials = [
    {
      quote: "Farzad transformed our customer support with an AI chatbot that handles 60% of our inquiries. The implementation was smooth and the results exceeded our expectations.",
      name: "Sarah Johnson",
      role: "Customer Support Manager, TechCorp",
      stars: 5,
      image: "/testimonial-1.jpg"
    },
    {
      quote: "The document processing system Farzad built for us has saved us countless hours of manual work. His attention to detail and problem-solving skills are exceptional.",
      name: "Michael Chen",
      role: "Operations Director, LegalFlow",
      stars: 5,
      image: "/testimonial-2.jpg"
    },
    {
      quote: "Working with Farzad was a game-changer for our e-commerce business. His AI solution improved our product categorization accuracy to 98%.",
      name: "Emily Rodriguez",
      role: "CEO, ShopEase",
      stars: 5,
      image: "/testimonial-3.jpg"
    },
    {
      quote: "Farzad's knowledge of AI and automation is impressive. He delivered our internal knowledge base assistant on time and within budget.",
      name: "David Kim",
      role: "CTO, InnovateX",
      stars: 5,
      image: "/testimonial-4.jpg"
    },
    {
      quote: "The content moderation system Farzad implemented has significantly reduced our manual review workload. His expertise in AI is truly valuable.",
      name: "Jessica Lee",
      role: "Content Manager, SocialPlus",
      stars: 5,
      image: "/testimonial-5.jpg"
    },
    {
      quote: "Farzad's process automation bot has saved us over 150 hours per month. His ability to understand our needs and deliver solutions is remarkable.",
      name: "Robert Taylor",
      role: "Operations Manager, DataFlow",
      stars: 5,
      image: "/testimonial-6.jpg"
    }
  ]

  return (
    <section className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-none bg-[var(--color-orange-accent)]/10 border border-[var(--color-orange-accent)]/30 mb-6">
            <Quote className="h-5 w-5 text-[var(--color-orange-accent)] mr-2" />
            <span className="text-sm font-tech-mono text-[var(--color-orange-accent)] uppercase tracking-tech-wide">Testimonials</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl font-bold ${textColor} mb-6`}>
            What Clients <span className="gradient-text">Say</span>
          </h2>
          <p className={`text-xl ${mutedTextColor} max-w-3xl mx-auto`}>
            Don't just take my word for it. Here's what my clients have to say about working with me.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className={`${cardBg} ${cardBorder} border rounded-2xl p-6 h-full flex flex-col`}
            >
              <div className="mb-4 flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i}
                    className={`h-5 w-5 ${i < testimonial.stars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              
              <blockquote className="flex-grow">
                <p className={`${mutedTextColor} italic mb-6`}>"{testimonial.quote}"</p>
              </blockquote>
              
              <div className="flex items-center pt-4 border-t border-[var(--glass-border)]">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] flex items-center justify-center text-white font-bold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <div>
                  <p className={`font-semibold ${textColor}`}>{testimonial.name}</p>
                  <p className={`text-sm ${mutedTextColor}`}>{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
