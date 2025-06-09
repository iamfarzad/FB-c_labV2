"use client"

import type React from "react"
import { ExternalLink, Globe } from "lucide-react"
import type { LinkData } from "@/lib/data-types"

interface LinkRendererProps {
  data: LinkData
  theme: "light" | "dark"
  className?: string
}

export const LinkRenderer: React.FC<LinkRendererProps> = ({ data, theme, className = "" }) => {
  return (
    <a
      href={data.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block glassmorphism rounded-xl p-4 hover:surface-glow transition-all duration-300 group ${className}`}
    >
      <div className="flex items-start space-x-4">
        {/* Thumbnail or icon */}
        <div className="flex-shrink-0">
          {data.thumbnail ? (
            <img
              src={data.thumbnail || "/placeholder.svg"}
              alt={data.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-[var(--color-orange-accent)]/10 flex items-center justify-center">
              <Globe size={24} className="text-[var(--color-orange-accent)]" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-orange-accent)] transition-colors duration-200 line-clamp-2">
              {data.title}
            </h3>
            <ExternalLink
              size={16}
              className="text-[var(--text-primary)]/50 group-hover:text-[var(--color-orange-accent)] transition-colors duration-200 flex-shrink-0 ml-2"
            />
          </div>

          {data.description && (
            <p className="text-sm text-[var(--text-primary)]/90 mt-2 line-clamp-3">{data.description}</p>
          )}

          {data.domain && (
            <div className="flex items-center mt-3">
              <span className="text-xs text-[var(--text-primary)]/50 bg-[var(--color-orange-accent)]/10 px-2 py-1 rounded-full">
                {data.domain}
              </span>
            </div>
          )}
        </div>
      </div>
    </a>
  )
}
