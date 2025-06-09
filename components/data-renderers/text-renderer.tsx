"use client"

import type React from "react"
import { useState } from "react"
import { Copy, Check } from "lucide-react"
import type { TextData } from "@/lib/data-types"

interface TextRendererProps {
  data: TextData
  theme: "light" | "dark"
  className?: string
}

export const TextRenderer: React.FC<TextRendererProps> = ({ data, theme, className = "" }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy text:", error)
    }
  }

  const renderContent = () => {
    switch (data.format) {
      case "markdown":
        // Simple markdown rendering
        let content = data.content
        content = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        content = content.replace(/\*(.*?)\*/g, "<em>$1</em>")
        content = content.replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')
        content = content.replace(/\n/g, "<br>")
        return <div dangerouslySetInnerHTML={{ __html: content }} />

      case "html":
        return <div dangerouslySetInnerHTML={{ __html: data.content }} />

      default:
        return <div className="whitespace-pre-wrap">{data.content}</div>
    }
  }

  return (
    <div className={`relative group ${className}`}>
      <div className="prose prose-sm max-w-none text-[var(--text-primary)]">{renderContent()}</div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-lg glassmorphism hover:surface-glow"
        aria-label="Copy text"
      >
        {copied ? (
          <Check size={16} className="text-green-500" />
        ) : (
          <Copy size={16} className="text-[var(--text-primary)]" />
        )}
      </button>
    </div>
  )
}
