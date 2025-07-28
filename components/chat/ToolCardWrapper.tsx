"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface ToolCardWrapperProps {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
  icon?: React.ReactNode
}

export function ToolCardWrapper({ 
  children, 
  className,
  title,
  description,
  icon 
}: ToolCardWrapperProps) {
  return (
    <div className={cn("card-minimal space-y-4", className)}>
      {(title || icon) && (
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex-shrink-0 text-accent">
              {icon}
            </div>
          )}
          <div className="flex-1">
            {title && (
              <h3 className="text-lg font-semibold text-foreground">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}
