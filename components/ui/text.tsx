import { cn } from "@/lib/utils"
import { HTMLAttributes } from "react"

interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  as?: 'p' | 'span' | 'div' | 'small' | 'strong' | 'em'
  variant?: 'default' | 'muted' | 'accent' | 'destructive'
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  className?: string
  children: React.ReactNode
}

export function Text({
  as: Component = 'p',
  variant = 'default',
  size = 'base',
  weight = 'normal',
  className,
  children,
  ...props
}: TextProps) {
  const baseStyles = 'leading-relaxed'
  
  const variants = {
    default: 'text-foreground',
    muted: 'text-muted-foreground',
    accent: 'text-accent',
    destructive: 'text-destructive',
  }
  
  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
  }
  
  const weights = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  }

  return (
    <Component
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        weights[weight],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
