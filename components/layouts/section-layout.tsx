"use client"

import React, { useRef } from "react"
import { SectionSideText } from "@/components/magicui/section-side-text"

type SectionConfig = {
  id: string
  title: string
  /** Optional: Custom scroll offset for this section (0-1) */
  scrollOffset?: number
}

type SectionLayoutProps = {
  children: React.ReactNode
  /** Section configurations for side text */
  sections: SectionConfig[]
  /** Position of the side text */
  sideTextPosition?: "left" | "right"
  /** Additional class names for the layout */
  className?: string
}

export const SectionLayout: React.FC<SectionLayoutProps> = ({
  children,
  sections = [],
  sideTextPosition = "left",
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {sections.length > 0 && (
        <SectionSideText
          position={sideTextPosition}
          sections={sections}
          scrollContainerRef={containerRef}
        />
      )}
      <div className="container mx-auto px-4 py-16">
        {children}
      </div>
    </div>
  )
}
