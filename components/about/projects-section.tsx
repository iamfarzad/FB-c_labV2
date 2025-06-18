"use client"

import React from "react"
import { ArrowRight, ExternalLink, Github, Zap } from "lucide-react"
import Link from "next/link"

interface ProjectsSectionProps {
  theme: "light" | "dark"
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ theme }) => {
  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"
  const cardBg = theme === "dark" ? "bg-[var(--glass-bg)]" : "bg-white"
  const cardBorder = theme === "dark" ? "border-[var(--glass-border)]" : "border-gray-200"

  const projects = [
    {
      title: "AI-Powered Customer Support",
      description: "Built a custom chatbot that reduced response times by 80% and handled 60% of customer inquiries without human intervention.",
      technologies: ["OpenAI", "LangChain", "Pinecone", "Next.js"],
      link: "#",
      github: "#",
      image: "/project-customer-support.jpg"
    },
    {
      title: "Document Processing Automation",
      description: "Developed an AI system that automatically processes and categorizes documents, saving over 200 hours of manual work monthly.",
      technologies: ["Python", "OCR", "NLP", "FastAPI"],
      link: "#",
      github: "#",
      image: "/project-document.jpg"
    },
    {
      title: "Internal Knowledge Base Assistant",
      description: "Created an AI assistant that helps employees find information across company documents with 95% accuracy.",
      technologies: ["OpenAI", "Pinecone", "Next.js", "Supabase"],
      link: "#",
      github: "#",
      image: "/project-knowledge.jpg"
    },
    {
      title: "E-commerce Product Categorization",
      description: "Implemented a machine learning model that automatically categorizes products with 98% accuracy.",
      technologies: ["Python", "Scikit-learn", "FastAPI", "Docker"],
      link: "#",
      github: "#",
      image: "/project-ecommerce.jpg"
    },
    {
      title: "AI Content Moderation",
      description: "Built a content moderation system that identifies and flags inappropriate content with 99% accuracy.",
      technologies: ["Python", "TensorFlow", "NLP", "AWS"],
      link: "#",
      github: "#",
      image: "/project-moderation.jpg"
    },
    {
      title: "Process Automation Bot",
      description: "Developed a bot that automates repetitive tasks, saving over 150 hours of manual work per month.",
      technologies: ["Python", "Selenium", "RPA", "Docker"],
      link: "#",
      github: "#",
      image: "/project-automation.jpg"
    }
  ]

  return (
    <section className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-none bg-[var(--color-orange-accent)]/10 border border-[var(--color-orange-accent)]/30 mb-6">
            <Zap className="h-5 w-5 text-[var(--color-orange-accent)] mr-2" />
            <span className="text-sm font-tech-mono text-[var(--color-orange-accent)] uppercase tracking-tech-wide">Featured Work</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl font-bold ${textColor} mb-6`}>
            Recent <span className="gradient-text">Projects</span>
          </h2>
          <p className={`text-xl ${mutedTextColor} max-w-3xl mx-auto`}>
            A selection of projects that demonstrate my expertise in AI and automation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div 
              key={index}
              className={`${cardBg} ${cardBorder} border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="h-48 bg-gradient-to-br from-[var(--color-orange-accent)]/10 to-[var(--color-orange-accent-light)]/10 flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] mx-auto mb-4 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className={`text-xl font-bold ${textColor}`}>{project.title}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className={`${mutedTextColor} mb-4`}>{project.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech, techIndex) => (
                    <span 
                      key={techIndex}
                      className="text-xs px-3 py-1 rounded-full bg-[var(--color-orange-accent)]/10 text-[var(--color-orange-accent)]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-[var(--glass-border)]">
                  <a 
                    href={project.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-medium text-[var(--color-orange-accent)] hover:text-[var(--color-orange-accent-light)]"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Live Demo
                  </a>
                  <a 
                    href={project.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-medium text-[var(--color-orange-accent)] hover:text-[var(--color-orange-accent-light)]"
                  >
                    <Github className="h-4 w-4 mr-1" />
                    Code
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link 
            href="/contact" 
            className="group inline-flex items-center px-6 py-3 rounded-none bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] text-white font-semibold hover:shadow-lg hover:shadow-[var(--color-orange-accent)]/25 transition-all duration-300 transform hover:scale-105"
          >
            <span>Start Your Project</span>
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </section>
  )
}
