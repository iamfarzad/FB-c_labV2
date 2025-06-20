"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Search, LayoutDashboard, Cpu, Zap, CheckCircle } from "lucide-react"

interface ProcessStepProps {
  step: {
    id: number
    icon: React.ComponentType<{ className?: string }>
    title: string
    description: string
    color: string
  }
  index: number
  length: number
  theme?: "light" | "dark"
}

const ProcessStep: React.FC<ProcessStepProps> = ({ step, index, length, theme = "light" }) => {
  const isDark = theme === "dark"
  const accentGradient = "bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)]"
  const Icon = step.icon

  return (
    <div className="relative flex group">
      <div className={`absolute left-6 top-0 bottom-0 w-0.5 ${isDark ? 'bg-[var(--glass-border)]' : 'bg-gray-200'}`}>
        <div
          className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${accentGradient} shadow-lg`}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>

      <div className={cn("ml-12 pb-12 relative flex-1", index === length - 1 && 'pb-0')}>
        <div className={cn(
          "p-6 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
          isDark ? 'bg-[var(--glass-bg)] backdrop-blur-sm border border-[var(--glass-border)]' : 'bg-white border border-gray-200',
          "hover:shadow-[0_0_0_1px_var(--color-orange-accent)]"
        )}>
          <h3 className={cn("text-xl font-semibold mb-2 flex items-center", isDark ? 'text-[var(--color-light-silver)]' : 'text-[var(--color-gunmetal)]')}>
            <span className="mr-3 text-sm font-mono text-[var(--color-orange-accent)]">0{index + 1}</span>
            {step.title}
          </h3>
          <p className={cn("text-sm leading-relaxed", isDark ? 'text-[var(--color-light-silver)]/90' : 'text-[var(--color-gunmetal)]/90')}>
            {step.description}
          </p>
        </div>
      </div>
    </div>
  )
}

interface ProcessProps {
  theme?: "light" | "dark"
  className?: string
}

export const Process: React.FC<ProcessProps> = ({ theme = "light", className }) => {
  const isDark = theme === "dark"

  const processSteps = [
    {
      id: 1,
      icon: Search,
      title: "Discovery & Analysis",
      description: "We start by understanding your business needs, challenges, and goals to identify the best AI solutions. Our team analyzes your requirements and creates a tailored plan.",
      color: "from-[#ff5b04] to-[#ff8f6a]"
    },
    {
      id: 2,
      icon: LayoutDashboard,
      title: "Solution Design",
      description: "We design a comprehensive solution architecture, select the right technologies, and create wireframes and prototypes to visualize the end result.",
      color: "from-purple-500 to-blue-500"
    },
    {
      id: 3,
      icon: Cpu,
      title: "Development & Integration",
      description: "Our team builds and integrates the AI solution with your existing systems and workflows, ensuring seamless operation and optimal performance.",
      color: "from-pink-500 to-rose-500"
    },
    {
      id: 4,
      icon: Zap,
      title: "Testing & Optimization",
      description: "We rigorously test the solution, gather feedback, and optimize for performance, accuracy, and user experience.",
      color: "from-amber-500 to-orange-500"
    },
    {
      id: 5,
      icon: CheckCircle,
      title: "Deployment & Support",
      description: "We deploy the solution to production and provide ongoing support, maintenance, and updates to ensure long-term success.",
      color: "from-emerald-500 to-teal-500"
    }
  ]

  return (
    <section className={cn("py-20 relative overflow-hidden", className)} style={{
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)'
    }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className={cn(
            "inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4",
            isDark ? 'bg-[var(--glass-bg)] text-[var(--color-light-silver)]' : 'bg-[var(--color-orange-accent)/10] text-[var(--color-orange-accent)]'
          )}>
            Our Process
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{
            background: 'linear-gradient(to right, var(--color-orange-accent), var(--color-orange-accent-light))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            How We Work
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{
            color: isDark ? 'var(--color-light-silver)' : 'var(--color-gunmetal)'
          }}>
            A structured approach to delivering exceptional AI solutions tailored to your business needs.
          </p>
        </div>

        <div className="relative">
          {processSteps.map((step, index) => (
            <ProcessStep
              key={step.id}
              step={step}
              index={index}
              length={processSteps.length}
              theme={theme}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
