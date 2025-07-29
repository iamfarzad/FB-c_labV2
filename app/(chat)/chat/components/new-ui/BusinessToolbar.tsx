"use client"

import { Calculator, Search, BarChart2, Users, Calendar, UploadCloud, Monitor } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const tools = [
  {
    name: "ROI Calculator",
    category: "Analytics",
    icon: Calculator,
    color: "from-green-500 to-teal-500",
  },
  {
    name: "Lead Research",
    category: "Research",
    icon: Search,
    color: "from-blue-500 to-indigo-600",
  },
  {
    name: "Data Analysis",
    category: "Analytics",
    icon: BarChart2,
    color: "from-purple-500 to-violet-600",
  },
  {
    name: "Lead Management",
    category: "CRM",
    icon: Users,
    color: "from-orange-500 to-red-500",
  },
  {
    name: "Schedule Meeting",
    category: "Scheduling",
    icon: Calendar,
    color: "from-cyan-500 to-sky-500",
  },
  {
    name: "Document Upload",
    category: "Documents",
    icon: UploadCloud,
    color: "from-emerald-500 to-green-600",
  },
  {
    name: "Screen Share",
    category: "Media",
    icon: Monitor,
    color: "from-pink-500 to-rose-500",
  },
]

const ToolCard = ({ tool }: { tool: (typeof tools)[0] }) => (
  <div
    className={`flex-shrink-0 w-44 h-32 rounded-lg p-4 flex flex-col justify-between bg-gradient-to-br ${tool.color} cursor-pointer transition-transform hover:scale-105`}
  >
    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
      <tool.icon className="h-5 w-5 text-white" />
    </div>
    <div>
      <h3 className="font-semibold text-white text-sm">{tool.name}</h3>
      <p className="text-xs text-white/80">{tool.category}</p>
    </div>
  </div>
)

export function BusinessToolbar() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-blue-500 rounded-full" />
        <h2 className="font-semibold text-lg">Business Tools</h2>
        <Badge className="bg-dark-800 text-gray-300 border border-dark-700">{tools.length}</Badge>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 horizontal-scroll">
        {tools.map((tool) => (
          <ToolCard key={tool.name} tool={tool} />
        ))}
      </div>
    </div>
  )
}
