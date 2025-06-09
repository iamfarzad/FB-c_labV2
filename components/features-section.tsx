"use client"

import type React from "react"
import { Mic, Video, Brain, Zap, Shield, Globe } from "lucide-react"

interface FeaturesSectionProps {
  theme: "light" | "dark"
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ theme }) => {
  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"

  const features = [
    {
      icon: Mic,
      title: "Voice Intelligence",
      description: "Natural speech recognition and synthesis for seamless voice interactions.",
      gradient: "from-blue-500 to-purple-600",
    },
    {
      icon: Video,
      title: "Vision Capabilities",
      description: "Advanced computer vision for image analysis and real-time video processing.",
      gradient: "from-green-500 to-teal-600",
    },
    {
      icon: Brain,
      title: "Deep Learning",
      description: "Powered by cutting-edge AI models for intelligent responses and insights.",
      gradient: "from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)]",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized performance with sub-second response times for all interactions.",
      gradient: "from-yellow-500 to-orange-600",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Enterprise-grade security with end-to-end encryption and privacy protection.",
      gradient: "from-red-500 to-pink-600",
    },
    {
      icon: Globe,
      title: "Multi-Language",
      description: "Support for 50+ languages with real-time translation capabilities.",
      gradient: "from-indigo-500 to-blue-600",
    },
  ]

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold gradient-text">Powerful Features</h2>
          <p className={`text-xl ${mutedTextColor} max-w-2xl mx-auto`}>
            Discover the capabilities that make F.B/c AI the most advanced assistant platform
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative glassmorphism rounded-2xl p-8 hover:surface-glow transition-all duration-500 transform hover:-translate-y-2"
            >
              {/* Icon */}
              <div className="relative mb-6">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon size={28} className="text-white" />
                </div>
                {/* Glow Effect */}
                <div
                  className={`absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`}
                />
              </div>

              {/* Content */}
              <div className="space-y-3">
                <h3
                  className={`text-xl font-bold ${textColor} group-hover:text-[var(--color-orange-accent)] transition-colors duration-300`}
                >
                  {feature.title}
                </h3>
                <p className={`${mutedTextColor} leading-relaxed`}>{feature.description}</p>
              </div>

              {/* Hover Border Effect */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[var(--color-orange-accent)]/20 transition-colors duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
