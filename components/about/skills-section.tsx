"use client"

import React from "react"
import { motion } from "framer-motion"
import { Code, Cpu, Database, Lock, MessageSquare, Zap, Brain, CpuIcon, Server, Bot, Shield, Terminal } from "lucide-react"
import { SkillCard } from "@/components/ui/skill-card"

interface SkillsSectionProps {
  theme: "light" | "dark"
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ theme }) => {
  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"
  const cardBg = theme === "dark" ? "bg-[var(--glass-bg)]" : "bg-white"
  const cardBorder = theme === "dark" ? "border-[var(--glass-border)]" : "border-gray-200"

  // Skill data with proficiency levels (0-100)
  const skillCategories = [
    {
      icon: Brain,
      title: "AI & Machine Learning",
      description: "Building intelligent systems that learn and adapt",
      skills: [
        { name: "Natural Language Processing", level: 90 },
        { name: "LLM Integration", level: 88 },
        { name: "Computer Vision", level: 75 },
        { name: "Prompt Engineering", level: 92 },
        { name: "Model Fine-tuning", level: 85 }
      ],
      color: "from-purple-600 to-indigo-600"
    },
    {
      icon: Terminal,
      title: "Development",
      description: "Crafting clean, efficient, and maintainable code",
      skills: [
        { name: "Python", level: 95 },
        { name: "TypeScript/JavaScript", level: 90 },
        { name: "Next.js/React", level: 88 },
        { name: "Node.js", level: 85 },
        { name: "API Development", level: 92 }
      ],
      color: "from-blue-600 to-cyan-500"
    },
    {
      icon: Server,
      title: "Infrastructure",
      description: "Scalable and reliable systems architecture",
      skills: [
        { name: "Vector Databases", level: 85 },
        { name: "Cloud Platforms (AWS/GCP)", level: 82 },
        { name: "Docker & Kubernetes", level: 80 },
        { name: "CI/CD Pipelines", level: 85 },
        { name: "Serverless Architecture", level: 78 }
      ],
      color: "from-emerald-600 to-teal-500"
    },
    {
      icon: Bot,
      title: "AI Integration",
      description: "Seamlessly embedding AI into applications",
      skills: [
        { name: "Chatbot Development", level: 92 },
        { name: "Workflow Automation", level: 90 },
        { name: "API Integrations", level: 88 },
        { name: "Custom AI Solutions", level: 85 },
        { name: "Process Optimization", level: 88 }
      ],
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: Shield,
      title: "Security",
      description: "Protecting data and ensuring compliance",
      skills: [
        { name: "Data Privacy", level: 90 },
        { name: "Model Security", level: 85 },
        { name: "Ethical AI", level: 88 },
        { name: "Compliance", level: 82 },
        { name: "Documentation", level: 90 }
      ],
      color: "from-rose-600 to-pink-500"
    },
    {
      icon: CpuIcon,
      title: "Tools & Frameworks",
      description: "Leveraging the best tools for the job",
      skills: [
        { name: "OpenAI API", level: 95 },
        { name: "LangChain", level: 88 },
        { name: "Hugging Face", level: 85 },
        { name: "Pinecone", level: 82 },
        { name: "Git & GitHub", level: 90 }
      ],
      color: "from-fuchsia-600 to-purple-600"
    }
  ]

  // Animation variants for staggered children
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 0.77, 0.47, 0.97]
      }
    }
  }

  return (
    <section id="skills" className="py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ 
            opacity: 1, 
            y: 0,
            transition: { 
              duration: 0.6,
              ease: [0.16, 0.77, 0.47, 0.97]
            } 
          }}
          viewport={{ once: true, margin: "-10%" }}
        >
          <div className="inline-flex items-center px-4 py-2 rounded-none bg-[var(--color-orange-accent)]/10 border border-[var(--color-orange-accent)]/30 mb-6">
            <Zap className="h-5 w-5 text-[var(--color-orange-accent)] mr-2" />
            <span className="text-sm font-tech-mono text-[var(--color-orange-accent)] uppercase tracking-tech-wide">Skills & Expertise</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold ${textColor} mb-4`}>
            My <span className="gradient-text">Technical Skills</span>
          </h2>
          <p className={`text-lg ${mutedTextColor} max-w-3xl mx-auto`}>
            Interactive showcase of my technical expertise. Click or hover on cards to explore details.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
        >
          {skillCategories.map((category, index) => (
            <motion.div key={index} variants={item} className="h-full">
              <SkillCard 
                icon={category.icon}
                title={category.title}
                description={category.description}
                skills={category.skills}
                color={category.color}
                theme={theme}
                className="h-full"
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="glassmorphism rounded-2xl p-8 mt-16 overflow-hidden relative group"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ 
            opacity: 1, 
            y: 0,
            transition: { 
              duration: 0.6,
              delay: 0.2,
              ease: [0.16, 0.77, 0.47, 0.97]
            } 
          }}
          viewport={{ once: true, margin: "-10%" }}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-orange-accent)]/5 to-transparent" />
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] text-[var(--color-text-on-orange)] mb-4">
                Continuous Learning
              </div>
              <h3 className={`text-2xl font-bold ${textColor} mb-4`}>Always Evolving</h3>
              <p className={`${mutedTextColor} mb-6`}>
                The field of AI moves incredibly fast. I dedicate time each week to stay current with the latest advancements, tools, and best practices in AI and software development.
              </p>
              <p className={mutedTextColor}>
                I believe in learning by doing, which is why I regularly build personal projects and contribute to open-source to expand my skill set.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "AI Research", level: 90 },
                { name: "System Design", level: 85 },
                { name: "Problem Solving", level: 95 },
                { name: "Team Collaboration", level: 90 },
                { name: "Technical Writing", level: 80 },
                { name: "Mentoring", level: 85 }
              ].map((skill, index) => (
                <motion.div 
                  key={index}
                  className="group/skill"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { 
                      duration: 0.5,
                      delay: 0.1 * (index % 2) + 0.1 * Math.floor(index / 2),
                      ease: [0.16, 0.77, 0.47, 0.97]
                    } 
                  }}
                  viewport={{ once: true, margin: "-10%" }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-medium ${textColor} transition-colors duration-300 group-hover/skill:text-[var(--color-orange-accent)]`}>
                      {skill.name}
                    </span>
                    <span className="text-xs font-bold text-[var(--color-orange-accent)] bg-clip-text bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)]">
                      {skill.level}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)]"
                      initial={{ width: 0 }}
                      whileInView={{ 
                        width: `${skill.level}%`,
                        transition: { 
                          duration: 1,
                          delay: 0.1 * (index % 2) + 0.1 * Math.floor(index / 2),
                          ease: [0.16, 0.77, 0.47, 0.97]
                        } 
                      }}
                      viewport={{ once: true, margin: "-10%" }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-gradient-to-br from-[var(--color-orange-accent)]/5 to-transparent blur-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.div>
      </div>
    </section>
  )
}
