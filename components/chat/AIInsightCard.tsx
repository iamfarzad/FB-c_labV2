"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { 
  Brain, 
  Target, 
  ArrowRight, 
  AlertTriangle,
  Info,
  Sparkles,
  Check,
  Monitor
} from '@/lib/icon-mapping'
import { cn } from '@/lib/utils'

interface AIInsightCardProps {
  content: string
  className?: string
}

interface ParsedInsight {
  type: 'research' | 'analysis' | 'recommendations' | 'questions' | 'default'
  title: string
  summary?: string
  keyPoints: string[]
  recommendations?: string[]
  questions?: string[]
  companyInfo?: {
    name: string
    domain: string
    description: string
  }
}

export function AIInsightCard({ content, className }: AIInsightCardProps) {
  const parseContent = (text: string): ParsedInsight => {
    // Remove duplicate sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const uniqueSentences = [...new Set(sentences.map(s => s.trim()))]
    const cleanContent = uniqueSentences.join('. ') + '.'

    // Detect company research
    const companyMatch = cleanContent.match(/research.*?(\w+\.com)/i)
    const companyName = companyMatch ? companyMatch[1] : null

    // Extract key information
    const keyPoints: string[] = []
    const recommendations: string[] = []
    const questions: string[] = []

    // Parse bullet points and lists
    const bulletMatches = cleanContent.match(/\*\s*([^*]+)/g)
    if (bulletMatches) {
      bulletMatches.forEach(match => {
        const point = match.replace(/^\*\s*/, '').trim()
        if (point.includes('?')) {
          questions.push(point)
        } else if (point.toLowerCase().includes('enhance') || 
                   point.toLowerCase().includes('improve') || 
                   point.toLowerCase().includes('optimize')) {
          recommendations.push(point)
        } else {
          keyPoints.push(point)
        }
      })
    }

    // Determine type
    let type: ParsedInsight['type'] = 'default'
    let title = 'AI Analysis'

    if (cleanContent.toLowerCase().includes('research') && companyName) {
      type = 'research'
      title = `Company Research: ${companyName}`
    } else if (questions.length > 0) {
      type = 'questions'
      title = 'Strategic Questions'
    } else if (recommendations.length > 0) {
      type = 'recommendations'
      title = 'AI Recommendations'
    } else if (cleanContent.toLowerCase().includes('analyz')) {
      type = 'analysis'
      title = 'Business Analysis'
    }

    // Extract company info if it's a research type
    let companyInfo: ParsedInsight['companyInfo'] | undefined
    if (type === 'research' && companyName) {
      const descMatch = cleanContent.match(/is an? ([^.]+)/i)
      companyInfo = {
        name: companyName.replace('.com', ''),
        domain: companyName,
        description: descMatch ? descMatch[1] : 'AI-powered business solution'
      }
    }

    // Create summary
    const summary = uniqueSentences.slice(0, 2).join('. ') + '.'

    return {
      type,
      title,
      summary,
      keyPoints,
      recommendations,
      questions,
      companyInfo
    }
  }

  const insight = parseContent(content)

  const getTypeConfig = (type: ParsedInsight['type']) => {
    switch (type) {
      case 'research':
        return {
          icon: Monitor,
          color: 'from-blue-500 to-cyan-500',
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          badge: 'Company Research',
          badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
        }
      case 'analysis':
        return {
          icon: Brain,
          color: 'from-purple-500 to-indigo-500',
          bgColor: 'bg-purple-50 dark:bg-purple-950/20',
          borderColor: 'border-purple-200 dark:border-purple-800',
          badge: 'AI Analysis',
          badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
        }
      case 'recommendations':
        return {
          icon: Sparkles,
          color: 'from-amber-500 to-orange-500',
          bgColor: 'bg-amber-50 dark:bg-amber-950/20',
          borderColor: 'border-amber-200 dark:border-amber-800',
          badge: 'Recommendations',
          badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
        }
      case 'questions':
        return {
          icon: Target,
          color: 'from-green-500 to-emerald-500',
          bgColor: 'bg-green-50 dark:bg-green-950/20',
          borderColor: 'border-green-200 dark:border-green-800',
          badge: 'Strategic Questions',
          badgeColor: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
        }
      default:
        return {
          icon: Sparkles,
          color: 'from-gray-500 to-slate-500',
          bgColor: 'bg-gray-50 dark:bg-gray-950/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          badge: 'AI Insight',
          badgeColor: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
        }
    }
  }

  const config = getTypeConfig(insight.type)
  const IconComponent = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn("w-full max-w-2xl", className)}
    >
      <Card className={cn(
        "border-2 shadow-lg backdrop-blur-sm",
        config.bgColor,
        config.borderColor
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl bg-gradient-to-r flex items-center justify-center shadow-md",
              config.color
            )}>
              <IconComponent className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className={config.badgeColor}>
                  {config.badge}
                </Badge>
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-3 h-3 text-muted-foreground" />
                </motion.div>
              </div>
              
              <h3 className="font-semibold text-lg text-foreground leading-tight">
                {insight.title}
              </h3>
              
              {insight.summary && (
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {insight.summary}
                </p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Company Info Section */}
          {insight.companyInfo && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card/50 rounded-lg p-4 border border-border/50"
            >
              <div className="flex items-center gap-2 mb-2">
                <Monitor className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-sm">Company Profile</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{insight.companyInfo.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {insight.companyInfo.domain}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {insight.companyInfo.description}
                </p>
              </div>
            </motion.div>
          )}

          {/* Key Points */}
          {insight.keyPoints.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-sm">Key Insights</span>
              </div>
              <div className="space-y-2">
                {insight.keyPoints.map((point, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-2 text-sm"
                  >
                    <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-foreground/90">{point}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recommendations */}
          {insight.recommendations && insight.recommendations.length > 0 && (
            <>
              <Separator className="opacity-30" />
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="font-medium text-sm">Recommendations</span>
                </div>
                <div className="space-y-2">
                  {insight.recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-start gap-2 text-sm"
                    >
                      <ArrowRight className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <span className="text-foreground/90">{rec}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </>
          )}

          {/* Strategic Questions */}
          {insight.questions && insight.questions.length > 0 && (
            <>
              <Separator className="opacity-30" />
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-sm">Strategic Questions</span>
                </div>
                <div className="space-y-3">
                  {insight.questions.map((question, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="bg-card/30 rounded-lg p-3 border border-border/30 hover:border-green-300 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <span className="text-sm text-foreground/90 group-hover:text-foreground transition-colors">
                          {question}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </>
          )}

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="pt-2"
          >
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full hover:bg-accent/50 transition-colors"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Continue Conversation
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
