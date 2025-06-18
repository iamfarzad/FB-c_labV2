"use client"

import React, { useEffect } from "react"
import { Bot, MessageSquare, FileText, Brain, ArrowRight, Server, Database, Code, Zap, Lock, Sparkles, Cpu, BarChart, Settings, Terminal, Video, Mic, Image, Search, FileCode, Users, Globe, Shield, Clock, Lightbulb, ImageIcon } from "lucide-react"
import { DatabaseWithRestApi } from "@/components/ui/database-with-rest-api"

interface ProofSectionProps {
  theme: "light" | "dark"
}

interface FunctionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  category: string;
  theme?: 'light' | 'dark';
}

const FunctionCard: React.FC<FunctionCardProps> = ({ 
  icon, 
  title, 
  description, 
  category,
  theme = 'light' 
}) => {
  return (
    <div className="card-minimal feature-card">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-orange text-white">
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-caption text-orange">
              {category}
            </span>
          </div>
          <h3 className="text-heading mb-1">
            {title}
          </h3>
          <p className="text-body">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export const ProofSection: React.FC<ProofSectionProps> = ({ theme }) => {

  const functions = [
    {
      icon: <Mic className="w-5 h-5" />,
      title: "Voice Interaction",
      description: "Natural voice commands and responses for hands-free operation",
      category: "Core Features"
    },
    {
      icon: <Video className="w-5 h-5" />,
      title: "Video Learning",
      description: "Analyze and learn from video content with AI-powered insights",
      category: "Core Features"
    },
    {
      icon: <Code className="w-5 h-5" />,
      title: "Code Execution",
      description: "Run and test code snippets directly in the chat interface",
      category: "Developer Tools"
    },
    {
      icon: <ImageIcon className="w-5 h-5" />,
      title: "Image Generation",
      description: "Create stunning visuals from text descriptions with AI",
      category: "Creative Tools"
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "Conversation History",
      description: "Save and revisit your chat history anytime, anywhere",
      category: "Core Features"
    },
    {
      icon: <Search className="w-5 h-5" />,
      title: "Web Search",
      description: "Get real-time information with built-in web search capabilities",
      category: "Core Features"
    }
  ]

  // Add floating animation to cards
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>('.feature-card')
    cards.forEach((card, index) => {
      card.style.animation = `float 6s ease-in-out ${index * 0.2}s infinite`
    })
  }, [])

  const categories = ['All', 'Core Features', 'Developer Tools', 'Creative Tools']
  const [activeCategory, setActiveCategory] = React.useState('All')
  
  const filteredFunctions = activeCategory === 'All' 
    ? functions 
    : functions.filter(func => func.category === activeCategory)

  return (
    <section className={`py-20 relative overflow-hidden ${theme === 'dark' ? 'dark bg-[var(--color-gunmetal)]' : 'light bg-[var(--color-light-silver)]'}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 dot-pattern opacity-30" />
      
      <div className="process-container relative z-10">
        {/* Header */}
        <div className="process-header">
          <div className="inline-flex items-center gap-2 process-subtitle">
            <Sparkles className="h-4 w-4" />
            F.B/c AI in Action
          </div>
          <h2 className="process-title">
            See <span className="text-orange">F.B/c AI</span> in Action
          </h2>
          <p className="process-description">
            Every feature you see here is powered by the same AI I can build for your business. Try my assistant, upload a document, or ask for a custom solution—live.
          </p>
        </div>

        {/* Functions Showcase */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 text-sm font-medium transition-all ${
                  activeCategory === category
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          <div className="grid-minimal">
            {filteredFunctions.map((func, index) => (
              <FunctionCard
                key={index}
                icon={func.icon}
                title={func.title}
                description={func.description}
                category={func.category}
                theme={theme}
              />
            ))}
          </div>
        </div>

        {/* Key Features */}
        <div className="relative max-w-4xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-background/80 to-background/50 backdrop-blur-sm border border-border/50">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Powerful AI at Your Fingertips
            </h3>
            <p className="text-muted-foreground">
              F.B/c combines multiple AI capabilities into one seamless chat experience. Here's what makes it special:
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-background/50 border border-border/30 hover:border-[var(--color-orange-accent)]/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[var(--color-orange-accent)]/10 flex items-center justify-center mb-4">
                <Mic className="w-6 h-6 text-[var(--color-orange-accent)]" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Voice First</h4>
              <p className="text-sm text-muted-foreground">Speak naturally and get intelligent responses in real-time</p>
            </div>
            
            <div className="p-6 rounded-xl bg-background/50 border border-border/30 hover:border-[var(--color-orange-accent)]/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[var(--color-orange-accent)]/10 flex items-center justify-center mb-4">
                <Video className="w-6 h-6 text-[var(--color-orange-accent)]" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Video Learning</h4>
              <p className="text-sm text-muted-foreground">Extract knowledge and insights from video content</p>
            </div>
            
            <div className="p-6 rounded-xl bg-background/50 border border-border/30 hover:border-[var(--color-orange-accent)]/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[var(--color-orange-accent)]/10 flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-[var(--color-orange-accent)]" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Developer Friendly</h4>
              <p className="text-sm text-muted-foreground">Built-in code execution and technical tools</p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <a 
            href="/chat"
            className="relative inline-flex items-center px-8 py-4 overflow-hidden text-lg font-medium text-white group rounded-full bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] hover:from-[var(--color-orange-accent-light)] hover:to-[var(--color-orange-accent)] transition-all duration-500 hover:shadow-lg hover:shadow-[var(--color-orange-accent)]/30"
          >
            <span className="relative z-10 flex items-center">
              Try F.B/c Chat Now
              <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-[var(--color-orange-accent-light)] to-[var(--color-orange-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </a>
          
          {/* Animated dots */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">
            {[1, 2, 3].map((i) => (
              <span 
                key={i}
                className="w-2 h-2 rounded-full bg-[var(--color-orange-accent)] opacity-20"
                style={{
                  animation: `pulse 2s ease-in-out ${i * 0.3}s infinite`,
                  transform: 'scale(1)'
                }}
              ></span>
            ))}
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
        .gradient-text {
          background: linear-gradient(90deg, var(--color-orange-accent), var(--color-orange-accent-light));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
          position: relative;
          display: inline-block;
        }
        .gradient-text::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, var(--color-orange-accent), var(--color-orange-accent-light));
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.3s ease;
        }
        .gradient-text:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }
      `}</style>
    </section>
  )
}
