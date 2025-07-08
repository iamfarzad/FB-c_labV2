"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, MessageSquare, Camera, Mic, Monitor, Youtube, Zap, Brain, Target } from "lucide-react"

interface WelcomeScreenProps {
  onExampleClick?: (example: string) => void
}

export function WelcomeScreen({ onExampleClick }: WelcomeScreenProps) {
  const examplePrompts = [
    {
      category: "AI Automation",
      icon: Zap,
      color: "bg-blue-500",
      examples: [
        "How can AI automate my customer service workflow?",
        "What are the best AI tools for content creation?",
        "Help me build a chatbot for my business",
      ],
    },
    {
      category: "Business Analysis",
      icon: Target,
      color: "bg-green-500",
      examples: [
        "Analyze my business processes for automation opportunities",
        "What AI solutions would work best for my industry?",
        "Create a roadmap for implementing AI in my company",
      ],
    },
    {
      category: "Technical Help",
      icon: Brain,
      color: "bg-purple-500",
      examples: [
        "Explain how machine learning can improve my operations",
        "What's the ROI of implementing AI automation?",
        "Help me choose between different AI platforms",
      ],
    },
  ]

  const features = [
    {
      icon: MessageSquare,
      title: "Smart Chat",
      description: "AI-powered conversations with context awareness",
    },
    {
      icon: Camera,
      title: "Vision Analysis",
      description: "Upload images for AI-powered visual analysis",
    },
    {
      icon: Mic,
      title: "Voice Input",
      description: "Speak naturally and get instant transcription",
    },
    {
      icon: Monitor,
      title: "Screen Sharing",
      description: "Share your screen for real-time assistance",
    },
    {
      icon: Youtube,
      title: "Video Learning",
      description: "Transform videos into interactive learning apps",
    },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
            F.B/c AI Assistant
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your intelligent partner for AI automation and business transformation. Get personalized insights, automate
          workflows, and unlock your business potential.
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Badge variant="secondary" className="gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Online & Ready
          </Badge>
          <Badge variant="outline">Powered by Gemini 2.5</Badge>
          <Badge variant="outline">Real-time Analysis</Badge>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {features.map((feature, index) => (
          <Card key={index} className="p-4 hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-0 text-center space-y-2">
              <div className="w-10 h-10 mx-auto bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-medium text-sm">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Example Prompts */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Get Started with These Examples</h2>
          <p className="text-muted-foreground">Click any example to begin your AI automation journey</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {examplePrompts.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 ${category.color} rounded-lg flex items-center justify-center`}>
                  <category.icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-medium">{category.category}</h3>
              </div>
              <div className="space-y-2">
                {category.examples.map((example, exampleIndex) => (
                  <Button
                    key={exampleIndex}
                    variant="ghost"
                    className="w-full text-left justify-start h-auto p-3 text-sm hover:bg-muted/50"
                    onClick={() => onExampleClick?.(example)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2 shrink-0 text-muted-foreground" />
                    <span className="text-wrap">{example}</span>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Start Tips */}
      <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-orange-900 dark:text-orange-100">Pro Tips for Better Results</h3>
              <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1">
                <li>• Be specific about your industry and business challenges</li>
                <li>• Upload images or share your screen for visual analysis</li>
                <li>• Use voice input for natural, conversational interactions</li>
                <li>• Ask follow-up questions to dive deeper into solutions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
