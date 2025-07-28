"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Search, Brain, Target } from "lucide-react"
import { useChatContext } from "../context/ChatProvider"

interface LeadResearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LeadResearchModal({ isOpen, onClose }: LeadResearchModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    linkedinUrl: "",
  })
  const [isResearching, setIsResearching] = useState(false)
  const [researchProgress, setResearchProgress] = useState("")
  const [researchResult, setResearchResult] = useState("")

  const { addActivity } = useChatContext()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsResearching(true)
    setResearchProgress("")
    setResearchResult("")

    addActivity({
      type: "search",
      title: "Lead Research Started",
      description: `Researching ${formData.name} with AI-powered web search`,
      status: "in_progress",
    })

    try {
      const response = await fetch("/api/lead-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.type === "progress") {
                setResearchProgress((prev) => prev + data.content)
              } else if (data.type === "complete") {
                setResearchResult(data.research)
                setIsResearching(false)

                addActivity({
                  type: "complete",
                  title: "Lead Research Complete",
                  description: `Generated comprehensive profile for ${formData.name}`,
                  status: "completed",
                })
              }
            } catch (e) {
              console.error("Error parsing research data:", e)
            }
          }
        }
      }
    } catch (error) {
      console.error("Research error:", error)
      setIsResearching(false)

      addActivity({
        type: "error",
        title: "Research Failed",
        description: "Failed to complete lead research",
        status: "failed",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI-Powered Lead Research
          </DialogTitle>
          <DialogDescription>Research any lead with AI web search and analysis</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="john@company.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="company">Company (Optional)</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                  placeholder="Acme Corp"
                />
              </div>

              <div>
                <Label htmlFor="linkedin">LinkedIn URL (Optional)</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, linkedinUrl: e.target.value }))}
                  placeholder="https://linkedin.com/in/johndoe"
                />
              </div>

              <Button
                type="submit"
                disabled={isResearching || !formData.name || !formData.email}
                className="w-full gap-2"
              >
                {isResearching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Researching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Start AI Research
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Research Results */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <h3 className="font-semibold">Research Progress</h3>
            </div>

            {isResearching && (
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">AI is researching...</span>
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400 whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {researchProgress}
                </div>
              </div>
            )}

            {researchResult && (
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Research Complete</h4>
                <Textarea value={researchResult} readOnly className="min-h-[300px] text-sm" />
                <div className="mt-4 flex gap-2">
                  <Button size="sm" onClick={() => navigator.clipboard.writeText(researchResult)}>
                    Copy Research
                  </Button>
                  <Button size="sm" variant="outline" onClick={onClose}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
