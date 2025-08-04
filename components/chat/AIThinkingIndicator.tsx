"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  FileSearch, // Using FileSearch instead of Search
  Calculator, 
  FileText, 
  ImageIcon, 
  Zap, 
  Sparkles,
  Loader2,
  Eye,
  Mic,
  Monitor,
  TrendingUp
} from '@/lib/icon-mapping'
import { FbcIcon } from '@/components/ui/fbc-icon'
import { cn } from '@/lib/utils'

export type AIThinkingContext = 
  | 'analyzing_document'
  | 'searching_web' 
  | 'calculating_roi'
  | 'processing_image'
  | 'generating_code'
  | 'researching_leads'
  | 'creating_content'
  | 'voice_processing'
  | 'screen_analysis'
  | 'streaming'
  | 'default'

interface AIThinkingIndicatorProps {
  context?: AIThinkingContext
  stage?: string
  progress?: number
  className?: string
}

interface ThinkingConfig {
  icon: React.ElementType
  animation: any
  message: string
  color: string
  bgColor: string
}

const thinkingConfigs: Record<AIThinkingContext, ThinkingConfig> = {
  analyzing_document: {
    icon: FileText,
    animation: { 
      rotate: [0, 5, -5, 0],
      scale: [1, 1.05, 1]
    },
    message: "Analyzing your document...",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  searching_web: {
    icon: FileSearch,
    animation: { 
      scale: [1, 1.1, 1], 
      rotate: [0, 180, 360] 
    },
    message: "Searching for information...",
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  calculating_roi: {
    icon: Calculator,
    animation: { 
      y: [0, -2, 0],
      rotate: [0, 10, -10, 0]
    },
    message: "Calculating ROI metrics...",
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  processing_image: {
    icon: ImageIcon,
    animation: { 
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7]
    },
    message: "Processing and analyzing image...",
    color: "text-orange-600",
    bgColor: "bg-orange-50"
  },
  generating_code: {
    icon: Zap,
    animation: { 
      opacity: [0.5, 1, 0.5],
      scale: [1, 1.1, 1]
    },
    message: "Generating code solution...",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50"
  },
  researching_leads: {
    icon: TrendingUp,
    animation: { 
      y: [0, -3, 0],
      x: [0, 2, -2, 0]
    },
    message: "Researching lead information...",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50"
  },
  creating_content: {
    icon: Sparkles,
    animation: { 
      rotate: [0, 360],
      scale: [1, 1.1, 1]
    },
    message: "Creating business content...",
    color: "text-pink-600",
    bgColor: "bg-pink-50"
  },
  voice_processing: {
    icon: Mic,
    animation: { 
      scale: [1, 1.3, 1],
      opacity: [0.6, 1, 0.6]
    },
    message: "Processing voice input...",
    color: "text-red-600",
    bgColor: "bg-red-50"
  },
  screen_analysis: {
    icon: Monitor,
    animation: { 
      scale: [1, 1.05, 1],
      rotate: [0, 2, -2, 0]
    },
    message: "Analyzing screen content...",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50"
  },
  streaming: {
    icon: FbcIcon,
    animation: { 
      opacity: [0.5, 1, 0.5]
    },
    message: "Generating response...",
    color: "text-accent",
    bgColor: "bg-accent/10"
  },
  default: {
    icon: Brain,
    animation: { 
      rotate: [0, 10, -10, 0],
      scale: [1, 1.05, 1]
    },
    message: "AI is thinking...",
    color: "text-accent",
    bgColor: "bg-accent/10"
  }
}

export function AIThinkingIndicator({ 
  context = 'default', 
  stage, 
  progress, 
  className 
}: AIThinkingIndicatorProps) {
  const config = thinkingConfigs[context]
  const IconComponent = config.icon

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn("flex gap-3 w-full justify-start", className)}
    >
      {/* AI Avatar */}
      <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-1">
        <FbcIcon className="w-3 h-3 text-accent" />
      </div>

      {/* Thinking Content */}
      <div className={cn(
        "p-3 rounded-2xl border border-border/10 max-w-sm",
        config.bgColor,
        "dark:bg-muted/20 dark:border-border/20"
      )}>
        <div className="flex items-center gap-3">
          {/* Animated Icon */}
          <motion.div
            animate={config.animation}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={cn("flex-shrink-0", config.color)}
          >
            <IconComponent className="w-4 h-4" />
          </motion.div>

          {/* Content */}
          <div className="flex flex-col min-w-0">
            {/* Main Message */}
            <span className="text-sm font-medium text-foreground">
              {stage || config.message}
            </span>

            {/* Progress Bar */}
            {progress !== undefined && (
              <div className="w-32 h-1.5 bg-muted/60 rounded-full mt-2 overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-full", config.color.replace('text-', 'bg-'))}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            )}

            {/* Animated Dots */}
            <div className="flex items-center gap-1 mt-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    opacity: [0.3, 1, 0.3], 
                    scale: [1, 1.2, 1] 
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    delay: i * 0.2 
                  }}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    config.color.replace('text-', 'bg-')
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Streaming Response Indicator (for when AI is actively typing)
export function StreamingIndicator({ className }: { className?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn("flex items-center gap-2", className)}
    >
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1 h-4 bg-accent rounded-full"
            animate={{
              scaleY: [1, 2, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">Generating response...</span>
    </motion.div>
  )
}

// Context Detection Utility
export function detectAIContext(
  userInput: string = '', 
  apiEndpoint: string = '',
  imageUrl?: string
): AIThinkingContext {
  const input = userInput.toLowerCase()
  const endpoint = apiEndpoint.toLowerCase()

  // Image processing
  if (imageUrl || endpoint.includes('analyze-image') || endpoint.includes('vision')) {
    return 'processing_image'
  }

  // Document analysis
  if (endpoint.includes('analyze-document') || endpoint.includes('pdf') || 
      input.includes('document') || input.includes('analyze file')) {
    return 'analyzing_document'
  }

  // Web search
  if (endpoint.includes('search') || endpoint.includes('google') || 
      input.includes('search') || input.includes('find information')) {
    return 'searching_web'
  }

  // ROI calculations
  if (endpoint.includes('roi') || input.includes('roi') || 
      input.includes('calculate') || input.includes('return on investment')) {
    return 'calculating_roi'
  }

  // Voice processing
  if (endpoint.includes('voice') || endpoint.includes('audio') || 
      input.includes('voice') || input.includes('speak')) {
    return 'voice_processing'
  }

  // Screen analysis
  if (endpoint.includes('screen') || input.includes('screen') || 
      input.includes('screenshot')) {
    return 'screen_analysis'
  }

  // Lead research
  if (endpoint.includes('lead') || input.includes('lead') || 
      input.includes('research') || input.includes('prospect')) {
    return 'researching_leads'
  }

  // Code generation
  if (input.includes('code') || input.includes('programming') || 
      input.includes('function') || input.includes('script')) {
    return 'generating_code'
  }

  // Business content
  if (input.includes('content') || input.includes('business') || 
      input.includes('marketing') || input.includes('proposal')) {
    return 'creating_content'
  }

  // Streaming response
  if (endpoint.includes('chat') || endpoint.includes('stream')) {
    return 'streaming'
  }

  return 'default'
}
