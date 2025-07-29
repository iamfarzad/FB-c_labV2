"use client"

import { Calculator, Search, FileText, Users, Calendar, Upload, Monitor, Mic, Camera, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"

interface BusinessToolbarProps {
  onToolClick: (tool: string) => void
}

const businessTools = [
  {
    id: "roi-calc",
    label: "ROI Calculator",
    icon: Calculator,
    color: "from-emerald-500 to-teal-600",
    description: "Calculate return on investment",
  },
  {
    id: "research",
    label: "Lead Research",
    icon: Search,
    color: "from-blue-500 to-indigo-600",
    description: "Research potential leads",
  },
  {
    id: "analysis",
    label: "Document Analysis",
    icon: FileText,
    color: "from-purple-500 to-violet-600",
    description: "Analyze business documents",
  },
  {
    id: "leads",
    label: "Lead Management",
    icon: Users,
    color: "from-orange-500 to-red-600",
    description: "Manage your leads",
  },
  {
    id: "meeting",
    label: "Schedule Meeting",
    icon: Calendar,
    color: "from-pink-500 to-rose-600",
    description: "Schedule appointments",
  },
  {
    id: "upload",
    label: "File Upload",
    icon: Upload,
    color: "from-cyan-500 to-blue-600",
    description: "Upload documents",
  },
  {
    id: "screen",
    label: "Screen Share",
    icon: Monitor,
    color: "from-slate-500 to-gray-600",
    description: "Share your screen",
  },
]

const mediaTools = [
  { id: "voice", label: "Voice Input", icon: Mic, color: "from-green-500 to-emerald-600" },
  { id: "webcam", label: "Webcam", icon: Camera, color: "from-yellow-500 to-orange-600" },
]

export function BusinessToolbar({ onToolClick }: BusinessToolbarProps) {
  return (
    <div className="border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
      <div className="px-6 py-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Business Tools</span>
          </div>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
          <span className="text-xs text-slate-500 dark:text-slate-400">Click any tool to get started</span>
        </div>

        <TooltipProvider>
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              {businessTools.map((tool) => (
                <Tooltip key={tool.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToolClick(tool.id)}
                      className="shrink-0 gap-2 h-9 px-3 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-105 hover:shadow-md"
                    >
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${tool.color}`} />
                      <tool.icon className="h-3 w-3" />
                      <span className="text-xs font-medium">{tool.label}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{tool.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}

              <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 mx-2 self-center" />

              {mediaTools.map((tool) => (
                <Tooltip key={tool.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToolClick(tool.id)}
                      className="shrink-0 gap-2 h-9 px-3 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-105"
                    >
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${tool.color}`} />
                      <tool.icon className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{tool.label}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </ScrollArea>
        </TooltipProvider>
      </div>
    </div>
  )
}
