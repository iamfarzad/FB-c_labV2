import type React from "react"
import { cn } from "@/lib/utils"

interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function PageShell({ children, className, ...props }: PageShellProps) {
  return (
    <section className={cn("container py-12 md:py-20", className)} {...props}>
      {children}
    </section>
  )
}

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
}

export function PageHeader({ title, subtitle, className, ...props }: PageHeaderProps) {
  return (
    <div className={cn("mx-auto max-w-3xl text-center", className)} {...props}>
      <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl md:text-5xl lg:text-6xl text-balance">
        {title}
      </h1>
      {subtitle && <p className="mt-6 text-lg leading-8 text-muted-foreground text-balance">{subtitle}</p>}
    </div>
  )
}
