"use client"

import React from "react"
import { CheckCircle, Clock, MessageSquare, Zap, Mail, Phone, Users, Calendar } from "lucide-react"

interface WhatToExpectProps {
  theme: "light" | "dark"
}

export const WhatToExpect: React.FC<WhatToExpectProps> = ({ theme }) => {
  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"
  const cardBg = theme === "dark" ? "bg-[var(--glass-bg)]" : "bg-white"
  const cardBorder = theme === "dark" ? "border-[var(--glass-border)]" : "border-gray-200"

  const responseTimes = [
    {
      channel: "Live Chat",
      icon: <MessageSquare className="h-5 w-5 text-[var(--color-orange-accent)]" />,
      time: "Within minutes",
      availability: "Mon-Fri, 9am-5pm CET"
    },
    {
      channel: "Email",
      icon: <Mail className="h-5 w-5 text-[var(--color-orange-accent)]" />,
      time: "Within 24 hours",
      availability: "24/7"
    },
    {
      channel: "Phone",
      icon: <Phone className="h-5 w-5 text-[var(--color-orange-accent)]" />,
      time: "Immediate",
      availability: "Mon-Fri, 9am-5pm CET"
    },
    {
      channel: "Contact Form",
      icon: <MessageSquare className="h-5 w-5 text-[var(--color-orange-accent)]" />,
      time: "Within 24 hours",
      availability: "24/7"
    },
    {
      channel: "Consultation Call",
      icon: <Calendar className="h-5 w-5 text-[var(--color-orange-accent)]" />,
      time: "Scheduled",
      availability: "Based on availability"
    },
    {
      channel: "Social Media",
      icon: <Users className="h-5 w-5 text-[var(--color-orange-accent)]" />,
      time: "Within 48 hours",
      availability: "24/7"
    }
  ]

  const faqs = [
    {
      question: "What information should I include in my message?",
      answer: "Please include your name, contact information, and a detailed description of your inquiry. The more details you provide, the better we can assist you."
    },
    {
      question: "Do you offer support for your services?",
      answer: "Yes, we provide support for all our services. Please contact us through any of our support channels, and our team will be happy to assist you."
    },
    {
      question: "How can I schedule a consultation call?",
      answer: "You can schedule a consultation call by using our online booking system or by contacting us directly through email or phone."
    },
    {
      question: "What are your business hours?",
      answer: "Our standard business hours are Monday to Friday, 9:00 AM to 5:00 PM CET. We are closed on weekends and public holidays."
    },
    {
      question: "Do you offer emergency support?",
      answer: "Yes, we offer emergency support for critical issues. Please indicate that your request is urgent when contacting us."
    },
    {
      question: "How can I provide feedback about your services?",
      answer: "We welcome your feedback! You can share your thoughts through our contact form, email, or by leaving a review on our social media pages."
    }
  ]

  return (
    <section className="py-20 relative bg-gradient-to-b from-[var(--color-orange-accent)]/5 to-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-none bg-[var(--color-orange-accent)]/10 border border-[var(--color-orange-accent)]/30 mb-6">
            <Zap className="h-5 w-5 text-[var(--color-orange-accent)] mr-2" />
            <span className="text-sm font-tech-mono text-[var(--color-orange-accent)] uppercase tracking-tech-wide">What to Expect</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl font-bold ${textColor} mb-6`}>
            Our <span className="gradient-text">Response Times</span>
          </h2>
          <p className={`text-xl ${mutedTextColor} max-w-3xl mx-auto`}>
            We're committed to responding to your inquiries as quickly as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {responseTimes.map((item, index) => (
            <div 
              key={index}
              className={`${cardBg} ${cardBorder} border rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-orange-accent)]/10 flex items-center justify-center mr-3">
                  {item.icon}
                </div>
                <h3 className={`text-xl font-bold ${textColor}`}>{item.channel}</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-[var(--color-orange-accent)]">Response Time</p>
                  <p className={`font-medium ${textColor}`}>{item.time}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-orange-accent)]">Availability</p>
                  <p className={mutedTextColor}>{item.availability}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={`${cardBg} ${cardBorder} border rounded-2xl p-8 md:p-12`}>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className={`text-2xl font-bold ${textColor} mb-6`}>Our Support Process</h3>
              <div className="space-y-6">
                {[
                  {
                    step: "1",
                    title: "Submit Your Request",
                    description: "Reach out through any of our contact channels with your inquiry."
                  },
                  {
                    step: "2",
                    title: "Receive Confirmation",
                    description: "Get an immediate confirmation that we've received your message."
                  },
                  {
                    step: "3",
                    title: "Initial Response",
                    description: "Our team will respond within the specified response time for your chosen channel."
                  },
                  {
                    step: "4",
                    title: "Resolution Process",
                    description: "We'll work on your request and keep you updated on our progress."
                  },
                  {
                    step: "5",
                    title: "Follow-up",
                    description: "We'll follow up to ensure your inquiry has been fully resolved."
                  }
                ].map((item, index) => (
                  <div key={index} className="flex">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-orange-accent)]/10 flex items-center justify-center">
                        <span className="text-[var(--color-orange-accent)] font-bold">{item.step}</span>
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
            
            <div>
              <h3 className={`text-2xl font-bold ${textColor} mb-6`}>Frequently Asked Questions</h3>
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="group">
                    <h4 className={`flex items-center text-lg font-semibold ${textColor} mb-2`}>
                      <CheckCircle className="h-5 w-5 text-[var(--color-orange-accent)] mr-2 flex-shrink-0" />
                      {faq.question}
                    </h4>
                    <p className={`${mutedTextColor} pl-7`}>{faq.answer}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 p-6 rounded-xl bg-gradient-to-br from-[var(--color-orange-accent)]/5 to-[var(--color-orange-accent-light)]/10 border border-[var(--glass-border)]">
                <h4 className={`font-bold ${textColor} mb-3 flex items-center`}>
                  <Zap className="h-5 w-5 text-[var(--color-orange-accent)] mr-2" />
                  Need Help Urgently?
                </h4>
                <p className={`${mutedTextColor} mb-4`}>
                  For urgent matters, please call us directly at{' '}
                  <a href="tel:+49123456789" className="text-[var(--color-orange-accent)] hover:underline">
                    +49 123 456 789
                  </a>{' '}
                  during business hours.
                </p>
                <p className={`${mutedTextColor} text-sm`}>
                  Outside of business hours? Send us an email at{' '}
                  <a href="mailto:support@farzad.com" className="text-[var(--color-orange-accent)] hover:underline">
                    support@farzad.com
                  </a>{' '}
                  and we'll get back to you as soon as possible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
