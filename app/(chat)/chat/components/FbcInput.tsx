"use client"

import type React from "react"
import { useState } from "react"
import { Globe, BarChart, Search, Zap, ImageIcon, Upload, Plus, ChevronDown, Mic, Video, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const ActionButton = ({
  icon: Icon,
  label,
  hasDropdown = false,
}: {
  icon: React.ElementType
  label: string
  hasDropdown?: boolean
}) => (
  <Button
    variant="ghost"
    className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 h-8 px-3"
  >
    <Icon className="h-4 w-4" />
    <span className="text-sm font-medium">{label}</span>
    {hasDropdown && <ChevronDown className="h-3 w-3 ml-0.5" />}
  </Button>
)

export function FbcInput() {
  const [message, setMessage] = useState("")

  return (
    <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-2xl shadow-2xl shadow-gray-500/10 dark:shadow-black/20 p-4">
      <div className="relative">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message F.B/c AI or @mention an agent..."
          className="w-full min-h-[60px] p-4 pr-32 text-base bg-transparent border-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:placeholder-gray-400"
        />
        <div className="absolute top-1/2 right-4 -translate-y-1/2 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-full"
          >
            <Mic className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-full"
          >
            <Video className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            className="bg-gray-900 dark:bg-gray-100 text-white dark:text-black rounded-full h-10 w-10 shadow-md hover:bg-gray-700 dark:hover:bg-gray-300"
            disabled={!message.trim()}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700/50 mt-2 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <ActionButton icon={Globe} label="Auto" />
          <ActionButton icon={BarChart} label="ROI Analysis" />
          <ActionButton icon={Search} label="Lead Research" />
          <ActionButton icon={Zap} label="Automate" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div>
                <ActionButton icon={ImageIcon} label="Image Gen" hasDropdown />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Generate from prompt</DropdownMenuItem>
              <DropdownMenuItem>Analyze image</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ActionButton icon={Upload} label="Upload" />
          <ActionButton icon={Plus} label="Multi-Panel" />
        </div>
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 h-8 px-3"
              >
                <span className="text-sm font-medium">Select Models</span>
                <ChevronDown className="h-3 w-3 ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Gemini 2.5 (Default)</DropdownMenuItem>
              <DropdownMenuItem>Gemini Flash</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
