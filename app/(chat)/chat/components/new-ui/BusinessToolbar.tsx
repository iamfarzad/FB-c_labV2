"use client"

import { useState } from "react"
import { Calculator, Search, TrendingUp, Users, Calendar, Upload, Monitor, ChevronRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card } from "@/components/ui/card"

interface BusinessToolbarProps {
  onToolClick: (tool: string) => void
}

const businessTools = [
  {
    id: "roi-calc",
    label: "ROI Calculator",
    icon: Calculator,
    description: "Calculate returns and business metrics",
    color: "from-emerald-500 to-teal-600",
    category: "Analytics",
  },
  {
    id: "research",
    label: "Lead Research",
    icon: Search,
    description: "Research and analyze potential clients",
    color: "from-blue-500 to-indigo-600",
    category: "Research",
  },
  {
    id: "analysis",
    label: "Data Analysis",
    icon: TrendingUp,
    description: "Analyze business data and trends",
    color: "from-purple-500 to-violet-600",
    category: "Analytics",
  },
  {
    id: "leads",
    label: "Lead Management",
    icon: Users,
    description: "Manage and track leads",
    color: "from-orange-500 to-red-600",
    category: "CRM",
  },
  {
    id: "meeting",
    label: "Schedule Meeting",
    icon: Calendar,
    description: "Schedule and manage appointments",
    color: "from-cyan-500 to-blue-600",
    category: "Scheduling",
  },
  {
    id: "upload",
    label: "Document Upload",
    icon: Upload,
    description: "Upload and analyze documents",
    color: "from-green-500 to-emerald-600",
    category: "Documents",
  },
  {
    id: "screen",
    label: "Screen Share",
    icon: Monitor,
    description: "Share and analyze screens",
    color: "from-pink-500 to-rose-600",
    category: "Media",
  },
]

export function BusinessToolbar({ onToolClick }: BusinessToolbarProps) {
  const [hoveredTool, setHoveredTool] = useState<string | null>(null)

  return (
    <div className="border-b border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Business Tools</h3>
            <Badge variant="secondary" className="text-xs px-2 py-0.5">
              {businessTools.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            View All
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <TooltipProvider>
            {businessTools.map((tool) => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Card
                    className={`group relative shrink-0 cursor-pointer border-0 bg-gradient-to-br ${tool.color} p-4 min-w-[140px] transition-all duration-300 hover:scale-105 hover:shadow-lg`}
                    onClick={() => onToolClick(tool.id)}
                    onMouseEnter={() => setHoveredTool(tool.id)}
                    onMouseLeave={() => setHoveredTool(null)}
                  >
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="relative">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <tool.icon className="h-5 w-5 text-white" />
                        </div>
                        {hoveredTool === tool.id && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-white/30 rounded-full flex items-center justify-center">
                            <Sparkles className="h-2.5 w-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-white leading-tight">{tool.label}</p>
                        <p className="text-xs text-white/70 mt-1">{tool.category}</p>
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Card>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <div className="text-center">
                    <p className="font-medium">{tool.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}
