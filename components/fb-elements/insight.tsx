import type React from "react"
import { cn } from "@/lib/utils"

export function Insight({ children, className }: InsightProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm",
        "shadow-sm hover:shadow-md transition-shadow",
        className
      )}
      role="region"
      aria-label="Insight"
    >
      <div className="p-4 md:p-5 space-y-3">{children}</div>
    </div>
  )
}

export function InsightHeader({
  icon: Icon,
  title,
  subtitle,
  variant = "default",
  className,
}: InsightHeaderProps) {
  const { text, badgeBg, ring } = getVariantClasses(variant)

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {Icon ? (
        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", badgeBg, ring)}>
          <Icon className={cn("w-4 h-4", text)} />
        </div>
      ) : null}
      <div className="min-w-0">
        {title ? (
          <h3 className="text-sm font-semibold leading-none tracking-tight text-foreground">
            {title}
          </h3>
        ) : null}
        {subtitle ? (
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">{subtitle}</p>
        ) : null}
      </div>
    </div>
  )
}

export function InsightBody({ children, className }: InsightBodyProps) {
  return <div className={cn("text-sm text-foreground/80 leading-relaxed", className)}>{children}</div>
}

export function InsightAction({
  children,
  onClick,
  className,
  variant = "default",
  disabled,
}: InsightActionProps) {
  const { text, outline } = getVariantClasses(variant)
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium",
        "transition-all duration-200",
        "hover:translate-y-[-1px] active:translate-y-0",
        outline,
        text,
        disabled && "opacity-60 cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  )
}

function getVariantClasses(variant: InsightVariant) {
  switch (variant) {
    case "research":
      return {
        text: "text-blue-600 dark:text-blue-300",
        badgeBg: "bg-blue-50 dark:bg-blue-900/30",
        ring: "ring-1 ring-blue-200/60 dark:ring-blue-800/50",
        outline: "border-blue-200 dark:border-blue-800 hover:bg-blue-50/60 dark:hover:bg-blue-900/20",
      }
    case "analysis":
      return {
        text: "text-amber-600 dark:text-amber-300",
        badgeBg: "bg-amber-50 dark:bg-amber-900/30",
        ring: "ring-1 ring-amber-200/60 dark:ring-amber-800/50",
        outline: "border-amber-200 dark:border-amber-800 hover:bg-amber-50/60 dark:hover:bg-amber-900/20",
      }
    case "recommendation":
      return {
        text: "text-emerald-600 dark:text-emerald-300",
        badgeBg: "bg-emerald-50 dark:bg-emerald-900/30",
        ring: "ring-1 ring-emerald-200/60 dark:ring-emerald-800/50",
        outline: "border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20",
      }
    default:
      return {
        text: "text-accent",
        badgeBg: "bg-accent/10",
        ring: "ring-1 ring-accent/20",
        outline: "border-accent/20 hover:bg-accent/10",
      }
  }
}

// Types last (project convention)
interface InsightProps {
  children: React.ReactNode
  className?: string
}

type InsightVariant = "default" | "research" | "analysis" | "recommendation"

interface InsightHeaderProps {
  icon?: React.ElementType
  title?: string
  subtitle?: string
  variant?: InsightVariant
  className?: string
}

interface InsightBodyProps {
  children: React.ReactNode
  className?: string
}

interface InsightActionProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  variant?: InsightVariant
  disabled?: boolean
}


