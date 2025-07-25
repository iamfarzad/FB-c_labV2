"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, Sparkles, MessageSquare, Camera, Mic, Monitor, FileText, Zap, ArrowRight } from "lucide-react"

interface WelcomeScreenProps {
  onExampleClick?: (example: string) => void
}

export function WelcomeScreen({ onExampleClick }: WelcomeScreenProps) {
  const examplePrompts = [
    {
      title: "Analyze Business Process",
      prompt: "Help me identify automation opportunities in my customer service workflow",
      icon: Zap,
      category: "Automation",
    },
    {
      title: "AI Strategy Planning",
      prompt: "Create an AI implementation roadmap for a mid-size manufacturing company",
      icon: Bot,
      category: "Strategy",
    },
    {
      title: "Cost-Benefit Analysis",
      prompt: "Calculate ROI for implementing chatbots in our support department",
      icon: FileText,
      category: "Analysis",
    },
    {
      title: "Technology Comparison",
      prompt: "Compare different AI solutions for document processing and data extraction",
      icon: Sparkles,
      category: "Research",
    },
  ]

  const features = [
    {
      icon: MessageSquare,
      title: "Intelligent Chat",
      description: "Advanced AI conversations with context awareness",
    },
    {
      icon: Camera,
      title: "Visual Analysis",
      description: "Upload images for AI-powered analysis and insights",
    },
    {
      icon: Mic,
      title: "Voice Input",
      description: "Speak naturally and get transcribed responses",
    },
    {
      icon: Monitor,
      title: "Screen Sharing",
      description: "Share your screen for real-time collaboration",
    },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mb-6">
          <Bot className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
          Welcome to F.B/c AI Assistant
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your intelligent partner for AI automation consulting, business analysis, and strategic planning. Start a
          conversation to explore how AI can transform your business.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature, index) => (
          <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Example Prompts */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Get Started with These Examples</h2>
          <p className="text-muted-foreground">Click any example below to begin your AI consultation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {examplePrompts.map((example, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50 group"
              onClick={() => onExampleClick?.(example.prompt)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <example.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{example.title}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {example.category}
                      </Badge>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm leading-relaxed">{example.prompt}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="text-center space-y-4">
        <h3 className="text-lg font-semibold">Or start with a quick action</h3>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Camera className="w-4 h-4" />
            Upload Image
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Mic className="w-4 h-4" />
            Voice Input
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Monitor className="w-4 h-4" />
            Screen Share
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <FileText className="w-4 h-4" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center text-sm text-muted-foreground bg-muted/30 rounded-lg p-4">
        <p>
          💡 <strong>Pro tip:</strong> Use keyboard shortcuts for faster navigation. Press{" "}
          <kbd className="px-2 py-1 bg-background rounded border text-xs">F1</kbd> to see all available shortcuts.
        </p>
      </div>
    </div>
  )
}
