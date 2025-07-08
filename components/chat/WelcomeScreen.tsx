"use client"

import { Bot, Zap, Code, FileText, ImageIcon, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface WelcomeScreenProps {
  onExampleClick?: (example: string) => void
}

export function WelcomeScreen({ onExampleClick }: WelcomeScreenProps) {
  const examples = [
    {
      icon: <Code className="w-4 h-4" />,
      text: "Generate a React component for a product card",
    },
    {
      icon: <FileText className="w-4 h-4" />,
      text: "Summarize this article for me",
    },
    {
      icon: <ImageIcon className="w-4 h-4" />,
      text: "Analyze this image and tell me what you see",
    },
    {
      icon: <MessageSquare className="w-4 h-4" />,
      text: "Help me draft an email to my team",
    },
  ]

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Bot className="w-8 h-8 text-primary" />
      </div>

      <h1 className="text-2xl font-bold mb-2">Welcome to F.B/c AI Assistant</h1>

      <p className="text-muted-foreground max-w-md mb-8">
        I'm here to help with AI automation, analysis, and consultation. How can I assist you today?
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
        {examples.map((example, index) => (
          <Button
            key={index}
            variant="outline"
            className={cn(
              "h-auto py-3 px-4 justify-start text-left",
              "hover:bg-accent hover:text-accent-foreground",
              "transition-colors",
            )}
            onClick={() => onExampleClick?.(example.text)}
          >
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-md">{example.icon}</div>
              <span className="text-sm">{example.text}</span>
            </div>
          </Button>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Zap className="w-4 h-4" />
        <span>Powered by Gemini 2.5 Flash</span>
      </div>
    </div>
  )
}
