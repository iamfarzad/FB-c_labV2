"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
  {
    variants: {
      variant: {
        default: "border-input focus-visible:ring-ring",
        error: "border-destructive focus-visible:ring-destructive",
        success: "border-green-500 focus-visible:ring-green-500",
        warning: "border-yellow-500 focus-visible:ring-yellow-500",
      },
      size: {
        sm: "min-h-[60px] px-2 py-1 text-xs",
        default: "min-h-[80px] px-3 py-2",
        lg: "min-h-[120px] px-4 py-3 text-base",
      },
      resize: {
        none: "resize-none",
        vertical: "resize-y",
        horizontal: "resize-x",
        both: "resize",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      resize: "vertical",
    },
  },
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  autoResize?: boolean
  maxHeight?: number
  showCharCount?: boolean
  maxLength?: number
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant,
      size,
      resize,
      autoResize = false,
      maxHeight = 200,
      showCharCount = false,
      maxLength,
      ...props
    },
    ref,
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    const [charCount, setCharCount] = React.useState(0)

    // Combine refs
    React.useImperativeHandle(ref, () => textareaRef.current!)

    // Auto-resize functionality
    React.useEffect(() => {
      const textarea = textareaRef.current
      if (!textarea || !autoResize) return

      const adjustHeight = () => {
        textarea.style.height = "auto"
        const newHeight = Math.min(textarea.scrollHeight, maxHeight)
        textarea.style.height = `${newHeight}px`
      }

      adjustHeight()
      textarea.addEventListener("input", adjustHeight)

      return () => textarea.removeEventListener("input", adjustHeight)
    }, [autoResize, maxHeight, props.value])

    // Character count tracking
    React.useEffect(() => {
      if (showCharCount && typeof props.value === "string") {
        setCharCount(props.value.length)
      }
    }, [props.value, showCharCount])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (showCharCount) {
        setCharCount(e.target.value.length)
      }
      props.onChange?.(e)
    }

    return (
      <div className="relative">
        <textarea
          className={cn(textareaVariants({ variant, size, resize }), autoResize && "overflow-hidden", className)}
          ref={textareaRef}
          maxLength={maxLength}
          {...props}
          onChange={handleChange}
        />

        {showCharCount && (
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-1 rounded">
            {charCount}
            {maxLength && `/${maxLength}`}
          </div>
        )}
      </div>
    )
  },
)
Textarea.displayName = "Textarea"

export { Textarea, textareaVariants }
