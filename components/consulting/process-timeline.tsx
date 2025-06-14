"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Search, LayoutDashboard, Code, TestTube2, Rocket } from "lucide-react"
import { CheckCircle2 } from "lucide-react"

interface ProcessTimelineProps {
  className?: string
}

const PROCESS_STEPS = [
  {
    id: "process-1",
    title: "Discovery & Analysis",
    description: "We start by understanding your business needs, challenges, and goals to identify the best AI solutions. Our team analyzes your requirements and creates a tailored plan.",
    icon: Search,
    benefits: [
      "Comprehensive needs assessment",
      "Competitor analysis",
      "Requirement documentation",
      "Success metrics definition"
    ]
  },
  {
    id: "process-2",
    title: "Solution Design",
    description: "We design a comprehensive solution architecture, select the right technologies, and create wireframes and prototypes to visualize the end result.",
    icon: LayoutDashboard,
    benefits: [
      "Solution architecture",
      "Technology stack selection",
      "UI/UX wireframes",
      "Prototype development"
    ]
  },
  {
    id: "process-3",
    title: "Development & Integration",
    description: "Our team builds and integrates the AI solution with your existing systems and workflows, ensuring seamless operation and optimal performance.",
    icon: Code,
    benefits: [
      "Agile development",
      "Continuous integration",
      "API development",
      "System integration"
    ]
  },
  {
    id: "process-4",
    title: "Testing & Optimization",
    description: "We rigorously test the solution, gather feedback, and optimize for performance, accuracy, and user experience.",
    icon: TestTube2,
    benefits: [
      "Unit & integration testing",
      "Performance optimization",
      "User acceptance testing",
      "Security audits"
    ]
  },
  {
    id: "process-5",
    title: "Deployment & Support",
    description: "We deploy the solution to production and provide ongoing support, maintenance, and updates to ensure long-term success and ROI.",
    icon: Rocket,
    benefits: [
      "CI/CD pipeline setup",
      "Performance monitoring",
      "Maintenance & updates",
      "24/7 support"
    ]
  },
]

/**
 * A component that displays a vertical timeline of the development process
 * with interactive cards for each step.
 * 
 * @component
 * @example
 * <ProcessTimeline />
 */
export function ProcessTimeline({ className }: ProcessTimelineProps) {
  return (
    <section className={cn("process-section", className)}>
      <div className="process-container">
        <div className="process-header">
          <span className="process-subtitle">How We Work</span>
          <h2 className="process-title">Our Process</h2>
          <p className="process-description">
            A transparent, collaborative approach to delivering AI solutions that drive real business impact
          </p>
        </div>

        <div className="process-steps">
          <div className="process-line" />
          
          {PROCESS_STEPS.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.id} className="process-step">
                <div className="process-step-icon">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="process-step-content">
                  <h3 className="process-step-title">{step.title}</h3>
                  <p className="process-step-description">
                    {step.description}
                  </p>
                  <div className="process-benefits">
                    <div className="process-benefits-title">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Key Benefits</span>
                    </div>
                    <div className="process-benefits-list">
                      {step.benefits.map((benefit, i) => (
                        <div key={`${step.id}-benefit-${i}`} className="process-benefit">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
