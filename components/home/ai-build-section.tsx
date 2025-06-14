"use client"

import { ArrowRight } from "lucide-react"
import { TechCircuitAnimation } from "@/components/ui/tech-circuit-animation"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface AIBuildSectionProps {
  theme: "light" | "dark"
}

export const AIBuildSection: React.FC<AIBuildSectionProps> = ({ theme }) => {
  const textColor = theme === "dark" ? "text-white" : "text-gray-900"
  const mutedTextColor = theme === "dark" ? "text-gray-300" : "text-gray-600"
  const cardBg = theme === "dark" ? "bg-gray-800" : "bg-white"
  const cardBorder = theme === "dark" ? "border-gray-700" : "border-gray-200"

  const { theme: currentTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-10">
        <TechCircuitAnimation theme={mounted ? (currentTheme as 'light' | 'dark') : 'dark'} />
      </div>
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            I Don't Just Talk About AI
            <span className="text-orange-500"> — I Build It</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            This entire website runs on AI systems I developed myself. 
            Try my assistant now and experience the same technology I can implement for your business.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Interactive Demo */}
          <div className={`${cardBg} rounded-2xl p-8 border ${cardBorder} transition-all hover:shadow-lg hover:-translate-y-1 relative overflow-hidden`}>
            {/* Tech animation background */}
            <div className="absolute inset-0 -z-10 opacity-30">
              <TechCircuitAnimation theme={mounted ? (theme as 'light' | 'dark') : 'dark'} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent -z-10" />
            <h3 className="text-2xl font-bold text-white mb-4 relative">
              <span className="relative z-10">🤖 Try My AI Assistant</span>
            </h3>
            <p className="text-gray-300 mb-6">
              Ask about your business challenges. Watch it analyze your company in real-time.
            </p>
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors">
              Start Conversation
            </button>
            <div className="mt-4 text-sm text-gray-400">
              ✓ Real-time business intelligence<br/>
              ✓ Document analysis & insights<br/>
              ✓ Voice interaction with my cloned voice
            </div>
          </div>

          {/* Right: Proof Points */}
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">1</span>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white mb-2">Built From Scratch</h4>
                <p className="text-gray-300">
                  10,000+ hours developing custom AI solutions. Not a ChatGPT wrapper—real enterprise technology.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">2</span>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white mb-2">Proven Results</h4>
                <p className="text-gray-300">
                  This system generates qualified leads 24/7 and showcases AI capabilities that close deals.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">3</span>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white mb-2">Your Business Next</h4>
                <p className="text-gray-300">
                  What you experience here, I can build for your company. Custom AI that fits your workflow.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 relative">
          <div className={`${cardBg} rounded-2xl p-8 border ${cardBorder} max-w-4xl mx-auto relative overflow-hidden`}>
            {/* Subtle tech animation in background */}
            <div className="absolute inset-0 -z-10 opacity-10">
              <TechCircuitAnimation theme={mounted ? (theme as 'light' | 'dark') : 'dark'} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent -z-10" />
            <h3 className="text-2xl font-bold text-white mb-4 relative">
              <span className="relative z-10">See What AI Can Really Do for Your Business</span>
            </h3>
            <p className="text-gray-300 mb-6">
              You've experienced the technology. Now let's identify your highest-impact AI opportunity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
                Book Free Consultation
              </button>
              <button className="border border-gray-600 text-white hover:bg-gray-700 font-semibold py-3 px-8 rounded-lg transition-colors">
                Try 30-Min Workshop
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
