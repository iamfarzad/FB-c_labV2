"use client"

import type React from "react"
import { useState } from "react"
import { Copy, Check, Play, Download } from "lucide-react"
import { highlightCode, getLanguageIcon } from "@/lib/syntax-highlighter"
import type { CodeData } from "@/lib/data-types"

interface CodeRendererProps {
  data: CodeData
  theme: "light" | "dark"
  className?: string
  onExecute?: (code: string, language: string) => void
}

export const CodeRenderer: React.FC<CodeRendererProps> = ({ data, theme, className = "", onExecute }) => {
  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy code:", error)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([data.content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = data.filename || `code.${data.language}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const highlightedCode = highlightCode(data.content, data.language)
  const shouldTruncate = data.content.split("\n").length > 20
  const displayCode =
    shouldTruncate && !isExpanded ? data.content.split("\n").slice(0, 20).join("\n") + "\n..." : data.content

  return (
    <div className={`relative group ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 glassmorphism rounded-t-xl border-b border-[var(--glass-border)]">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getLanguageIcon(data.language)}</span>
          <span className="text-sm font-medium text-[var(--text-primary)]">{data.language.toUpperCase()}</span>
          {data.filename && (
            <>
              <span className="text-[var(--text-primary)]/50">•</span>
              <span className="text-sm text-[var(--text-primary)]/90">{data.filename}</span>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {data.executable && onExecute && (
            <button
              onClick={() => onExecute(data.content, data.language)}
              className="p-2 rounded-lg glassmorphism hover:surface-glow transition-all duration-200"
              aria-label="Execute code"
            >
              <Play size={16} className="text-green-500" />
            </button>
          )}

          <button
            onClick={handleDownload}
            className="p-2 rounded-lg glassmorphism hover:surface-glow transition-all duration-200"
            aria-label="Download code"
          >
            <Download size={16} className="text-[var(--text-primary)]" />
          </button>

          <button
            onClick={handleCopy}
            className="p-2 rounded-lg glassmorphism hover:surface-glow transition-all duration-200"
            aria-label="Copy code"
          >
            {copied ? (
              <Check size={16} className="text-green-500" />
            ) : (
              <Copy size={16} className="text-[var(--text-primary)]" />
            )}
          </button>
        </div>
      </div>

      {/* Description */}
      {data.description && (
        <div className="p-3 bg-[var(--color-orange-accent)]/5 border-b border-[var(--glass-border)]">
          <p className="text-sm text-[var(--text-primary)]/80">{data.description}</p>
        </div>
      )}

      {/* Code content */}
      <div className="relative">
        <pre className="p-4 overflow-x-auto text-sm glassmorphism rounded-b-xl">
          <code
            className="language-${data.language}"
            dangerouslySetInnerHTML={{
              __html: highlightCode(displayCode, data.language),
            }}
          />
        </pre>

        {/* Expand/Collapse button */}
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute bottom-4 right-4 px-3 py-1 text-xs glassmorphism rounded-lg hover:surface-glow transition-all duration-200"
          >
            {isExpanded ? "Show Less" : "Show More"}
          </button>
        )}
      </div>

      {/* Syntax highlighting styles */}
      <style jsx>{`
        .syntax-keyword {
          color: #569cd6;
          font-weight: bold;
        }
        .syntax-string {
          color: #ce9178;
        }
        .syntax-comment {
          color: #6a9955;
          font-style: italic;
        }
        .syntax-number {
          color: #b5cea8;
        }
        .inline-code {
          background: var(--color-orange-accent)/10;
          padding: 2px 4px;
          border-radius: 4px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.9em;
        }
      `}</style>
    </div>
  )
}
