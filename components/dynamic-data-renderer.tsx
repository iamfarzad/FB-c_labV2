"use client"

import type React from "react"
import { AlertTriangle } from "lucide-react"
import type { DataItem } from "@/lib/data-types"
import { TextRenderer } from "@/components/data-renderers/text-renderer"
import { CodeRenderer } from "@/components/data-renderers/code-renderer"
import { ImageRenderer } from "@/components/data-renderers/image-renderer"
import { TableRenderer } from "@/components/data-renderers/table-renderer"
import { LinkRenderer } from "@/components/data-renderers/link-renderer"

interface DynamicDataRendererProps {
  data: DataItem | DataItem[]
  theme: "light" | "dark"
  className?: string
  onCodeExecute?: (code: string, language: string) => void
  customRenderers?: Record<string, React.ComponentType<any>>
}

export const DynamicDataRenderer: React.FC<DynamicDataRendererProps> = ({
  data,
  theme,
  className = "",
  onCodeExecute,
  customRenderers = {},
}) => {
  const renderSingleItem = (item: DataItem, index?: number) => {
    const key = index !== undefined ? `${item.id}-${index}` : item.id
    const commonProps = { data: item, theme, key }

    // Check for custom renderer first
    if (customRenderers[item.type]) {
      const CustomRenderer = customRenderers[item.type]
      return <CustomRenderer {...commonProps} />
    }

    // Built-in renderers
    switch (item.type) {
      case "text":
        return <TextRenderer {...commonProps} />

      case "code":
        return <CodeRenderer {...commonProps} onExecute={onCodeExecute} />

      case "image":
        return <ImageRenderer {...commonProps} />

      case "table":
        return <TableRenderer {...commonProps} />

      case "link":
        return <LinkRenderer {...commonProps} />

      case "list":
        return (
          <div key={key} className="glassmorphism rounded-xl p-4">
            {item.ordered ? (
              <ol className="list-decimal list-inside space-y-2 text-[var(--text-primary)]">
                {item.items.map((listItem, i) => (
                  <li key={i}>{listItem}</li>
                ))}
              </ol>
            ) : (
              <ul className="list-disc list-inside space-y-2 text-[var(--text-primary)]">
                {item.items.map((listItem, i) => (
                  <li key={i}>{listItem}</li>
                ))}
              </ul>
            )}
          </div>
        )

      case "file":
        return (
          <div key={key} className="glassmorphism rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-orange-accent)]/10 flex items-center justify-center">
                  <span className="text-sm">📄</span>
                </div>
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">{item.filename}</h3>
                  <p className="text-sm text-[var(--text-primary)]/70">
                    {(item.size / 1024).toFixed(1)} KB • {item.mimeType}
                  </p>
                </div>
              </div>
              <a
                href={item.downloadUrl}
                download={item.filename}
                className="px-4 py-2 glass-button text-[var(--color-text-on-orange)] rounded-lg text-sm"
              >
                Download
              </a>
            </div>
          </div>
        )

      case "error":
        return (
          <div key={key} className="glassmorphism rounded-xl p-4 border border-red-500/30 bg-red-500/5">
            <div className="flex items-start space-x-3">
              <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-400 mb-1">Error</h3>
                <p className="text-sm text-red-300">{item.message}</p>
                {item.details && (
                  <details className="mt-2">
                    <summary className="text-xs text-red-400 cursor-pointer">Details</summary>
                    <pre className="text-xs text-red-300 mt-1 whitespace-pre-wrap">{item.details}</pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div key={key} className="glassmorphism rounded-xl p-4 border border-yellow-500/30 bg-yellow-500/5">
            <div className="flex items-center space-x-2">
              <AlertTriangle size={16} className="text-yellow-500" />
              <span className="text-sm text-yellow-400">Unsupported data type: {item.type}</span>
            </div>
          </div>
        )
    }
  }

  // Handle array of data items
  if (Array.isArray(data)) {
    return <div className={`space-y-4 ${className}`}>{data.map((item, index) => renderSingleItem(item, index))}</div>
  }

  // Handle single data item
  return <div className={className}>{renderSingleItem(data)}</div>
}
