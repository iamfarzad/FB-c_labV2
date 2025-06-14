"use client"

import { useEffect } from "react"
import AIShowcase from "@/components/ai/AIShowcase"

export default function AIShowcasePage() {
  // Set page title
  useEffect(() => {
    document.title = "AI Showcase | F.B/c AI"
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <AIShowcase />
    </div>
  )
}
