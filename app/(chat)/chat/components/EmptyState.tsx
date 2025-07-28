"use client"

import { Sparkles, MessageSquare, FileText, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  onExampleQuery: (query: string) => void
}

export const EmptyState = ({ onExampleQuery }: EmptyStateProps) => (
  <div className="text-center py-16 px-4 h-full flex flex-col items-center justify-center">
    <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
      <Sparkles className="w-12 h-12 text-primary" />
    </div>
    <h3 className="text-2xl font-semibold mb-4 text-foreground">Welcome to F.B/c AI</h3>
    <p className="text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed text-base">
      I'm your AI assistant ready to help with business analysis, automation, and consultation. Start by asking a
      question or uploading a document.
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
      <Button
        variant="outline"
        className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-accent/10 transition-all duration-200 scale-hover bg-transparent"
        onClick={() => onExampleQuery("Tell me about AI automation for my business.")}
      >
        <MessageSquare className="w-5 h-5" />
        <span className="text-sm font-medium">Ask about AI automation</span>
      </Button>
      <Button
        variant="outline"
        className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-accent/10 transition-all duration-200 scale-hover bg-transparent"
      >
        <FileText className="w-5 h-5" />
        <span className="text-sm font-medium">Upload a document</span>
      </Button>
      <Button
        variant="outline"
        className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-accent/10 transition-all duration-200 scale-hover bg-transparent"
        onClick={() => onExampleQuery("Perform a business analysis on a tech startup.")}
      >
        <Zap className="w-5 h-5" />
        <span className="text-sm font-medium">Business analysis</span>
      </Button>
    </div>
  </div>
)
