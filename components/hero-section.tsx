"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ArrowRight, Sparkles, Zap, Brain, MessageSquare, Play, ChevronDown } from "lucide-react"
import Link from "next/link"
import { WarpBackground } from "./magicui/warp-background"


interface HeroSectionProps {
  theme: "light" | "dark"
  onStartChat: () => void
}

export const HeroSection: React.FC<HeroSectionProps> = ({ theme, onStartChat }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [currentFeature, setCurrentFeature] = useState(0)

  const features = [
    { icon: Brain, text: "AI-Powered Intelligence" },
    { icon: Zap, text: "Lightning Fast Responses" },
    { icon: Sparkles, text: "Creative Problem Solving" },
  ]

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"
  const gridColor = theme === "dark" ? "rgba(211, 219, 221, 0.4)" : "rgba(35, 48, 56, 0.4)"

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <WarpBackground 
        className="absolute inset-0 z-10 pointer-events-none"
        perspective={150}
        beamsPerSide={4}
        beamSize={8}
        beamDelayMax={2}
        beamDelayMin={0}
        beamDuration={4}
        gridColor={gridColor}
      >
        <div className="absolute inset-0" />
      </WarpBackground>
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Hero Content */}
        <div className={`space-y-8 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-none glassmorphism border-2 border-[var(--color-orange-accent)]/30 bg-[var(--color-orange-accent)]/10">
            <Sparkles size={16} className="text-[var(--color-orange-accent)]" />
            <span className="text-sm font-tech-mono font-medium text-[var(--color-orange-accent)] tracking-tech-wide uppercase">Next-Generation AI Assistant</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-tech font-bold leading-none tracking-tech-wide">
              <span className={`block ${textColor} uppercase`}>Transform Your</span>
              <span className="block gradient-text uppercase">Workflow with AI</span>
            </h1>
            <p className={`text-xl sm:text-2xl font-tech ${mutedTextColor} max-w-3xl mx-auto leading-relaxed tracking-tech`}>
              Experience the future of intelligent assistance. Voice, vision, and text capabilities combined in one
              powerful platform.
            </p>
          </div>

          {/* Rotating Features */}
          <div className="h-16 flex items-center justify-center">
            <div className="relative">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 flex items-center space-x-3 transition-all duration-500 ${
                    index === currentFeature
                      ? "opacity-100 transform translate-y-0"
                      : "opacity-0 transform translate-y-4"
                  }`}
                >
                  <div className="p-2 rounded-none bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)]">
                    <feature.icon size={20} className="text-white" />
                  </div>
                  <span className={`text-lg font-tech font-medium ${textColor} tracking-tech`}>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Sharp Chat Entry Button */}
            <Link href="/chat">
              <button className="group relative overflow-hidden px-7 py-3.5 rounded-none bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] text-white font-tech font-semibold text-base tracking-tech-wide uppercase shadow-2xl hover:shadow-[var(--color-orange-accent)]/25 transition-all duration-200 transform hover:scale-105 hover:-translate-y-2">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-orange-accent-light)] to-[var(--color-orange-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Shimmer Effect */}
                <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer" />

                                  <div className="relative flex items-center space-x-3">
                  <MessageSquare size={22} className="group-hover:rotate-12 transition-transform duration-300" />
                  <span>Start Chatting Now</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </button>
            </Link>

            {/* Secondary Button */}
            <button className="group flex items-center space-x-2 px-5 py-2.5 rounded-none glassmorphism hover:surface-glow transition-all duration-200 transform hover:scale-105 hover:-translate-y-1">
              <Play
                size={16}
                className="text-[var(--color-orange-accent)] group-hover:scale-110 transition-transform"
              />
              <span className={`font-tech font-medium ${textColor} tracking-tech uppercase`}>Watch Demo</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 pt-16 border-t border-[var(--glass-border)]">
            {[
              { number: "10K+", label: "Active Users" },
              { number: "99.9%", label: "Uptime" },
              { number: "24/7", label: "AI Support" },
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-3xl sm:text-4xl font-tech font-bold gradient-text group-hover:scale-110 transition-transform duration-200 tracking-tech-wide">
                  {stat.number}
                </div>
                <div className={`text-sm font-tech-mono ${mutedTextColor} mt-1 tracking-tech-wide uppercase`}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center space-y-2">
            <span className={`text-xs ${mutedTextColor}`}>Scroll to explore</span>
            <ChevronDown size={20} className="text-[var(--color-orange-accent)]" />
          </div>
        </div>
      </div>

      {/* Additional Styles */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(200%) skewX(-12deg);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animate-shimmer {
          animation: shimmer 1.5s ease-out;
        }
      `}</style>
    </section>
  )
}
