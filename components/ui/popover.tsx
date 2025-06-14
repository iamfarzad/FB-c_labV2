"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogTrigger } from "./dialog"
import { cn } from "@/lib/utils"

interface PopoverProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

const Popover = ({
  children,
  open,
  onOpenChange,
  className,
  ...props
}: PopoverProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const isControlled = open !== undefined
  const isOpenState = isControlled ? open : isOpen

  const handleOpenChange = (open: boolean) => {
    if (!isControlled) {
      setIsOpen(open)
    }
    onOpenChange?.(open)
  }

  return (
    <Dialog open={isOpenState} onOpenChange={handleOpenChange} {...props}>
      {children}
    </Dialog>
  )
}

interface PopoverTriggerProps {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

const PopoverTrigger = ({
  children,
  className,
  asChild = false,
  ...props
}: PopoverTriggerProps) => (
  <DialogTrigger
    className={cn("outline-none focus:ring-2 focus:ring-[var(--color-orange-accent)] focus:ring-offset-2 focus:ring-offset-[var(--glass-bg)] rounded-lg transition-all", className)}
    asChild={asChild}
    {...props}
  >
    {children}
  </DialogTrigger>
)

interface PopoverContentProps {
  children: React.ReactNode
  className?: string
  sideOffset?: number
  align?: "start" | "center" | "end"
  side?: "top" | "right" | "bottom" | "left"
}

const PopoverContent = ({
  children,
  className,
  ...props
}: PopoverContentProps) => (
  <DialogContent
    className={cn(
      "z-[102] w-[95vw] max-w-2xl p-0 sm:rounded-2xl",
      className
    )}
    {...props}
  >
    {children}
  </DialogContent>
)

interface PopoverHeaderProps {
  children: React.ReactNode
  className?: string
}

const PopoverHeader = ({
  children,
  className,
  ...props
}: PopoverHeaderProps) => (
  <div
    className={cn(
      "flex flex-col space-y-2 border-b border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 sm:px-8 sm:py-6",
      className
    )}
    {...props}
  >
    {children}
  </div>
)

interface PopoverBodyProps {
  children: React.ReactNode
  className?: string
}

const PopoverBody = ({
  children,
  className,
  ...props
}: PopoverBodyProps) => (
  <div
    className={cn("p-6 sm:px-8 sm:pb-8 overflow-y-auto max-h-[70vh]", className)}
    {...props}
  >
    {children}
  </div>
)

interface PopoverFooterProps {
  children: React.ReactNode
  className?: string
}

const PopoverFooter = ({
  children,
  className,
  ...props
}: PopoverFooterProps) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-3 border-t border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 sm:flex-row sm:justify-end sm:px-8 sm:py-6",
      className
    )}
    {...props}
  >
    {children}
  </div>
)

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter
}
