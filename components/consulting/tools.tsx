"use client"

import React from "react"
import { Cpu, Bot, Zap, Database, Code, Lock, Check } from "lucide-react"

interface ToolsProps {
  theme: "light" | "dark"
}

export const Tools: React.FC<ToolsProps> = ({ theme }) => {
  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"
  const cardBg = theme === "dark" ? "bg-[var(--glass-bg)]" : "bg-white"
  const cardBorder = theme === "dark" ? "border-[var(--glass-border)]" : "border-gray-200"

  const toolCategories = [
    {
      icon: Cpu,
      title: "AI Models",
      items: ["OpenAI GPT-4o", "Claude 3", "Gemini", "Llama 3", "Mistral"],
      color: "from-purple-500 to-blue-500"
    },
    {
      icon: Bot,
      title: "Frameworks",
      items: ["LangChain", "LlamaIndex", "Hugging Face", "Pinecone", "Weaviate"],
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Database,
      title: "Vector DBs",
      items: ["Pinecone", "Weaviate", "Chroma", "Qdrant", "Milvus"],
      color: "from-green-500 to-teal-500"
    },
    {
      icon: Code,
      title: "Development",
      items: ["Python", "TypeScript", "Next.js", "FastAPI", "Docker"],
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Lock,
      title: "Deployment",
      items: ["Vercel", "AWS", "GCP", "Docker", "Kubernetes"],
      color: "from-red-500 to-pink-500"
    }
  ]

  return (
    <section className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-none bg-[var(--color-orange-accent)]/10 border border-[var(--color-orange-accent)]/30 mb-6">
            <Zap className="h-5 w-5 text-[var(--color-orange-accent)] mr-2" />
            <span className="text-sm font-tech-mono text-[var(--color-orange-accent)] uppercase tracking-tech-wide">Technologies</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl font-bold ${textColor} mb-6`}>
            Tools & <span className="gradient-text">Technologies</span> We Use
          </h2>
          <p className={`text-xl ${mutedTextColor} max-w-3xl mx-auto`}>
            We work with the latest AI tools and frameworks to build robust, scalable solutions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {toolCategories.map((category, index) => (
            <div 
              key={index}
              className={`${cardBg} ${cardBorder} border rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} text-white mb-4`}>
                <category.icon className="h-6 w-6" />
              </div>
              <h3 className={`text-xl font-bold ${textColor} mb-4`}>{category.title}</h3>
              <ul className="space-y-3">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <Check className="h-5 w-5 text-[var(--color-orange-accent)] flex-shrink-0 mt-0.5 mr-3" />
                    <span className={mutedTextColor}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          <div className={`${cardBg} ${cardBorder} border rounded-2xl p-6 md:col-span-2 lg:col-span-1`}>
            <div className="h-full flex flex-col">
              <h3 className={`text-xl font-bold ${textColor} mb-4`}>Custom Solutions</h3>
              <p className={`${mutedTextColor} mb-6 flex-grow`}>
                Don't see a specific tool or technology you need? We can work with custom solutions and integrate with your existing tech stack.
              </p>
              <div className="pt-4 border-t border-[var(--glass-border)]">
                <p className={`text-sm ${mutedTextColor} mb-4`}>
                  We stay up-to-date with the latest AI advancements to bring you cutting-edge solutions.
                </p>
                <div className="flex items-center">
                  <div className="flex -space-x-2 mr-3">
                    {[1, 2, 3].map((i) => (
                      <div 
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] border-2 border-[var(--glass-bg)]"
                      />
                    ))}
                  </div>
                  <span className={`text-sm ${mutedTextColor}`}>
                    <span className="font-semibold text-[var(--color-orange-accent)]">50+</span> technologies supported
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
