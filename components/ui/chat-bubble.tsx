import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const chatBubbleVariants = cva(
  "rounded-2xl px-5 py-4 max-w-[85%] break-words shadow-lg transition-all duration-200",
  {
    variants: {
      variant: {
        user: "bg-gradient-to-br from-accent to-accent/90 text-accent-foreground backdrop-blur-sm border border-accent/20",
        assistant: "bg-gradient-to-br from-card to-card/80 text-foreground border border-border/30 shadow-md hover:shadow-lg backdrop-blur-sm",
        system: "bg-muted/50 text-muted-foreground border border-border/20",
      },
      size: {
        default: "px-5 py-4",
        sm: "px-4 py-3 text-sm",
        lg: "px-6 py-5",
      },
    },
    defaultVariants: {
      variant: "assistant",
      size: "default",
    },
  }
)

export interface ChatBubbleProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chatBubbleVariants> {}

const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        chatBubbleVariants({ variant, size }),
        // Enhanced word wrapping styles
        "word-wrap-break-word overflow-wrap-break-word hyphens-auto",
        className
      )}
      style={{
        wordWrap: "break-word",
        overflowWrap: "break-word",
        hyphens: "auto",
      }}
      {...props}
    />
  )
)
ChatBubble.displayName = "ChatBubble"

export { ChatBubble, chatBubbleVariants }
