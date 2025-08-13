"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getAllModules } from "@/lib/modules"

export default function ModulesPage() {
  const [hoveredModule, setHoveredModule] = useState<number | null>(null)
  const modules = getAllModules()

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold mb-6">Interactive Learning Modules</h1>
          <p className="text-xl text-muted-foreground">
            Explore our collection of interactive experiences designed to help you understand how AI and LLMs work
            through visual, hands-on learning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((module) => (
            <motion.div
              key={module.id}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden"
              onHoverStart={() => setHoveredModule(module.id)}
              onHoverEnd={() => setHoveredModule(null)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: module.id * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 z-10" />

              <div
                className={`absolute inset-0 bg-gradient-to-br ${
                  module.phase === 1
                    ? "from-blue-500/20 to-purple-500/20"
                    : module.phase === 2
                      ? "from-pink-500/20 to-orange-500/20"
                      : "from-green-500/20 to-teal-500/20"
                } opacity-60 z-0`}
              />

              <div className="absolute top-4 left-4 z-20">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    module.phase === 1
                      ? "bg-blue-500/20 text-blue-200"
                      : module.phase === 2
                        ? "bg-pink-500/20 text-pink-200"
                        : "bg-green-500/20 text-green-200"
                  }`}
                >
                  Phase {module.phase}
                </span>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-6 z-20">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:translate-y-0 translate-y-2 transition-transform duration-300">
                  {module.title}
                </h3>
                <p className="text-white/80 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {module.description}
                </p>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Link href={`/modules/${module.slug}`} className="text-white flex items-center hover:underline">
                    Explore <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Module-specific preview */}
              <div className="absolute inset-0 flex items-center justify-center">
                {module.slug === "ai-hierarchy-visual" && (
                  <div className="w-[60%] h-[60%] relative">
                    <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-pulse" />
                    <div className="absolute inset-[15%] rounded-full border-4 border-purple-500/20 animate-pulse [animation-delay:200ms]" />
                    <div className="absolute inset-[30%] rounded-full border-4 border-pink-500/20 animate-pulse [animation-delay:400ms]" />
                    <div className="absolute inset-[45%] rounded-full border-4 border-orange-500/20 animate-pulse [animation-delay:600ms]" />
                  </div>
                )}

                {module.slug === "tokenization-visualizer" && (
                  <div className="flex flex-wrap gap-1 max-w-[80%] justify-center">
                    {["Hello", "world", "!", "How", "does", "token", "ization", "work", "?"].map((token, i) => (
                      <div
                        key={i}
                        className="px-2 py-1 rounded bg-blue-500/20 text-blue-600 dark:text-blue-300 text-sm border border-blue-500/30"
                      >
                        {token}
                      </div>
                    ))}
                  </div>
                )}

                {module.slug === "attention-mechanism-demo" && (
                  <div className="relative">
                    <div className="flex gap-1 mb-8 flex-wrap justify-center">
                      {["The", "cat", "sat", "on", "the", "mat", "because", "it", "was", "comfortable"].map(
                        (word, i) => (
                          <div
                            key={i}
                            className={`px-2 py-1 rounded text-sm ${i === 7 ? "bg-blue-500 text-white" : ""}`}
                          >
                            {word}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {module.slug === "llm-parameter-growth" && (
                  <div className="flex items-end gap-2 h-[60%]">
                    <div className="h-[20%] w-4 bg-blue-500/40 rounded-t"></div>
                    <div className="h-[40%] w-4 bg-purple-500/40 rounded-t"></div>
                    <div className="h-[60%] w-4 bg-blue-500/40 rounded-t"></div>
                    <div className="h-[80%] w-4 bg-purple-500/40 rounded-t"></div>
                    <div className="h-[100%] w-4 bg-blue-500/40 rounded-t"></div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

