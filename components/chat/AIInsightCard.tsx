"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles,
  ArrowRight,
  Target
} from '@/lib/icon-mapping'
import { cn } from '@/lib/utils'

interface AIInsightCardProps {
  content: string
  className?: string
  onContinue?: (suggestion: string) => void
}

interface ParsedInsight {
  type: 'research' | 'analysis' | 'recommendations' | 'default'
  title: string
  keyPoint: string
  actionSuggestion: string
  companyName?: string
}

export function AIInsightCard({ content, className, onContinue }: AIInsightCardProps) {
  const parseContent = (text: string): ParsedInsight => {
    const cleanContent = text.trim()

    // Extract company name
    const companyMatch = cleanContent.match(/(\w+(?:\.\w+)?(?:\.com)?)/i)
    const companyName = companyMatch ? companyMatch[1].replace('.com', '') : undefined

    // Determine type and extract key insight
    let type: ParsedInsight['type'] = 'default'
    let title = 'AI Insight'
    let keyPoint = cleanContent.split('.')[0] || 'Analysis complete'
    let actionSuggestion = 'Continue our conversation'

    if (cleanContent.toLowerCase().includes('research') || cleanContent.toLowerCase().includes('founded')) {
      type = 'research'
      title = companyName ? `${companyName} Research` : 'Company Research'
      keyPoint = `${companyName || 'Company'} operates in a competitive market with growth opportunities`
      actionSuggestion = 'Explore strategic recommendations'
    } else if (cleanContent.toLowerCase().includes('recommend') || cleanContent.toLowerCase().includes('enhance')) {
      type = 'recommendations'
      title = 'Strategic Recommendations'
      keyPoint = 'AI-powered optimization opportunities identified'
      actionSuggestion = 'Discuss implementation strategy'
    } else if (cleanContent.toLowerCase().includes('analyz')) {
      type = 'analysis'
      title = 'Business Analysis'
      keyPoint = 'Key insights and patterns discovered'
      actionSuggestion = 'Dive deeper into findings'
    }

    return {
      type,
      title,
      keyPoint,
      actionSuggestion,
      companyName
    }
  }

  const insight = parseContent(content)

  const handleContinue = () => {
    if (onContinue) {
      onContinue(insight.actionSuggestion)
    }
  }

  const getTypeIcon = (type: ParsedInsight['type']) => {
    switch (type) {
      case 'research': return Target
      case 'analysis': return Sparkles
      case 'recommendations': return ArrowRight
      default: return Sparkles
    }
  }

  const IconComponent = getTypeIcon(insight.type)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn("w-full max-w-[700px] mx-auto", className)}
    >
      {/* Compact Insight Card */}
      <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 md:p-5 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
            <IconComponent className="w-4 h-4 text-accent" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-xs bg-accent/10 text-accent border-accent/20">
                {insight.title}
              </Badge>
            </div>
            
            <p className="text-sm text-foreground/80 leading-relaxed mb-3">
              {insight.keyPoint}
            </p>
            
            {/* Action Button */}
            <Button 
              size="sm" 
              variant="ghost"
              onClick={handleContinue}
              className="h-8 px-3 text-xs bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 rounded-lg transition-all duration-200 hover:scale-[1.02]"
            >
              <ArrowRight className="w-3 h-3 mr-1.5" />
              {insight.actionSuggestion}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
