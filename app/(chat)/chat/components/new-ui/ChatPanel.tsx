"use client"

import type React from "react"

import { BarChart2, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BusinessToolbar } from "./BusinessToolbar"
import { ChatComposer } from "./ChatComposer"

const WelcomeCard = ({
  icon: Icon,
  title,
  description,
}: { icon: React.ElementType; title: string; description: string }) => (
  <div className="bg-dark-800 p-6 rounded-lg border border-dark-700 flex flex-col items-start text-left">
    <div className="w-12 h-12 bg-dark-700 rounded-lg flex items-center justify-center mb-4">
      <Icon className="h-6 w-6 text-gray-300" />
    </div>
    <h3 className="font-semibold text-white mb-1">{title}</h3>
    <p className="text-sm text-dark-600">{description}</p>
  </div>
)

export function ChatPanel() {
  return (
    <div className="flex h-full flex-col bg-dark-900 text-white">
      {/* Header */}
      <div className="flex h-20 shrink-0 items-center justify-between border-b border-dark-700 px-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/placeholder.svg?width=48&height=48" alt="Acme Inc" />
              <AvatarFallback>AC</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-dark-900" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Advanced Business AI</h1>
            <p className="text-sm text-gray-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Ready to assist with your business needs
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* Business Tools */}
        <BusinessToolbar />

        {/* Welcome Message */}
        <div className="text-center text-gray-400">
          <p>
            Welcome to your Advanced Business AI. I can help with ROI calculation, lead research, data analysis,
            scheduling, and much more. Let's transform your business operations together! 🚀
          </p>
        </div>

        {/* Welcome Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WelcomeCard icon={BarChart2} title="ROI Analysis" description="Calculate returns and business metrics" />
          <WelcomeCard icon={Users} title="Lead Generation" description="Research and capture potential clients" />
        </div>
      </div>

      {/* Composer */}
      <div className="px-8 pb-6 border-t border-dark-700 pt-6">
        <ChatComposer />
      </div>
    </div>
  )
}
