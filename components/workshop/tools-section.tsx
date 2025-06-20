"use client"

import React from "react"
import { Zap, Code, Cpu, Database, MessageSquare, Image, Video, Music, FileText, BarChart, Settings } from "lucide-react"

interface ToolsSectionProps {
  theme: "light" | "dark"
}

export const ToolsSection: React.FC<ToolsSectionProps> = ({ theme }) => {
  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"
  const cardBg = theme === "dark" ? "bg-[var(--glass-bg)]" : "bg-white"
  const cardBorder = theme === "dark" ? "border-[var(--glass-border)]" : "border-gray-200"

  const toolCategories = [
    {
      name: "AI Assistants",
      icon: <MessageSquare className="h-5 w-5 text-[var(--color-orange-accent)]" />,
      tools: [
        { name: "ChatGPT", description: "Advanced conversational AI for various tasks" },
        { name: "Claude", description: "AI assistant focused on helpful, harmless, and honest interactions" },
        { name: "Gemini", description: "Google's AI assistant with strong reasoning capabilities" },
        { name: "Perplexity", description: "AI-powered research and information assistant" }
      ]
    },
    {
      name: "Code Generation",
      icon: <Code className="h-5 w-5 text-[var(--color-orange-accent)]" />,
      tools: [
        { name: "GitHub Copilot", description: "AI pair programmer that helps you write better code" },
        { name: "Amazon CodeWhisperer", description: "AI coding companion with security scanning" },
        { name: "Tabnine", description: "AI code completion that works with your IDE" },
        { name: "Codeium", description: "Free AI coding assistant with fast completions" }
      ]
    },
    {
      name: "Image Generation",
      icon: <Image className="h-5 w-5 text-[var(--color-orange-accent)]" />,
      tools: [
        { name: "DALL-E", description: "Create realistic images from text descriptions" },
        { name: "Midjourney", description: "AI art generation through Discord" },
        { name: "Stable Diffusion", description: "Open-source image generation model" },
        { name: "Adobe Firefly", description: "AI image generation integrated with Adobe Creative Cloud" }
      ]
    },
    {
      name: "Video & Audio",
      icon: <Video className="h-5 w-5 text-[var(--color-orange-accent)]" />,
      tools: [
        { name: "Runway ML", description: "AI video editing and generation" },
        { name: "Synthesia", description: "Create AI videos with virtual presenters" },
        { name: "ElevenLabs", description: "AI voice generation and text-to-speech" },
        { name: "Murf AI", description: "AI voice generation for various applications" }
      ]
    },
    {
      name: "Data & Analysis",
      icon: <BarChart className="h-5 w-5 text-[var(--color-orange-accent)]" />,
      tools: [
        { name: "Pandas AI", description: "AI-powered data analysis with Python" },
        { name: "Tableau GPT", description: "AI-assisted data visualization" },
        { name: "Akkio", description: "No-code AI for business analytics" },
        { name: "MonkeyLearn", description: "Text analysis and data visualization" }
      ]
    },
    {
      name: "Automation",
      icon: <Settings className="h-5 w-5 text-[var(--color-orange-accent)]" />,
      tools: [
        { name: "Zapier", description: "Connect apps and automate workflows" },
        { name: "Make (Integromat)", description: "Visual platform for building automation" },
        { name: "n8n", description: "Open-source workflow automation" },
        { name: "Power Automate", description: "Microsoft's automation platform" }
      ]
    }
  ]

  return (
    <section className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-none bg-[var(--color-orange-accent)]/10 border border-[var(--color-orange-accent)]/30 mb-6">
            <Zap className="h-5 w-5 text-[var(--color-orange-accent)] mr-2" />
            <span className="text-sm font-tech-mono text-[var(--color-orange-accent)] uppercase tracking-tech-wide">Tools & Technologies</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl font-bold ${textColor} mb-6`}>
            AI Tools You'll <span className="gradient-text">Learn to Use</span>
          </h2>
          <p className={`text-xl ${mutedTextColor} max-w-3xl mx-auto`}>
            Hands-on experience with the latest AI tools and technologies used by professionals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {toolCategories.map((category, index) => (
            <div
              key={index}
              className={`${cardBg} ${cardBorder} border rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-orange-accent)]/10 flex items-center justify-center mr-3">
                  {category.icon}
                </div>
                <h3 className={`text-xl font-bold ${textColor}`}>{category.name}</h3>
              </div>
              <ul className="space-y-3">
                {category.tools.map((tool, toolIndex) => (
                  <li key={toolIndex} className="flex items-start">
                    <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--color-orange-accent)] mt-2 mr-2" />
                    <div>
                      <h4 className={`font-medium ${textColor}`}>{tool.name}</h4>
                      <p className={`text-sm ${mutedTextColor}`}>{tool.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={`${cardBg} ${cardBorder} border rounded-2xl p-8 md:p-12`}>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className={`text-2xl font-bold ${textColor} mb-6`}>Why These Tools?</h3>
              <p className={`${mutedTextColor} mb-6`}>
                I've carefully selected these tools based on their ease of use, capabilities, and real-world applicability.
                You'll learn tools that are actually being used in businesses today, not just theoretical concepts.
              </p>
              <div className="space-y-4">
                {[
                  "No prior experience needed - we'll start from the basics",
                  "Focus on practical, business-relevant applications",
                  "Hands-on exercises with each tool",
                  "Learn how to choose the right tool for each task"
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-orange-accent)]/10 flex items-center justify-center mt-0.5 mr-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-orange-accent)]" />
                    </div>
                    <span className={mutedTextColor}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-[var(--color-orange-accent)]/5 to-[var(--color-orange-accent-light)]/10 rounded-2xl p-8 border border-[var(--glass-border)]">
              <h4 className={`text-lg font-semibold ${textColor} mb-4`}>Tool Selection Criteria</h4>
              <ul className="space-y-4">
                {[
                  {
                    title: "Ease of Use",
                    description: "Intuitive interfaces with minimal learning curve"
                  },
                  {
                    title: "Affordability",
                    description: "Free or reasonably priced options with good value"
                  },
                  {
                    title: "Capabilities",
                    description: "Powerful features that solve real business problems"
                  },
                  {
                    title: "Support & Community",
                    description: "Good documentation and active user communities"
                  }
                ].map((item, index) => (
                  <li key={index}>
                    <h5 className={`font-medium ${textColor}`}>{item.title}</h5>
                    <p className={`text-sm ${mutedTextColor}`}>{item.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
