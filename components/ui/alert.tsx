import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success:
          "border-green-500/50 text-green-700 dark:text-green-400 dark:border-green-900 [&>svg]:text-green-500",
        info: "border-blue-500/50 text-blue-700 dark:text-blue-400 dark:border-blue-900 [&>svg]:text-blue-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

const AlertIcon = {
  info: Info,
  error: XCircle,
  success: CheckCircle,
  warning: AlertCircle,
  default: Info,
}

type AlertIconType = keyof typeof AlertIcon

interface AlertWithIconProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertIconType
  title?: string
  description?: string
}

const AlertWithIcon = React.forwardRef<HTMLDivElement, AlertWithIconProps>(
  ({ variant = "default", title, description, className, children, ...props }, ref) => {
    const Icon = AlertIcon[variant] || AlertIcon.default

    return (
      <Alert
        ref={ref}
        variant={
          variant === "error"
            ? "destructive"
            : variant === "success"
              ? "success"
              : variant === "info"
                ? "info"
                : "default"
        }
        className={cn("flex items-start gap-3", className)}
        {...props}
      >
        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          {title && <AlertTitle>{title}</AlertTitle>}
          {description && <AlertDescription>{description}</AlertDescription>}
          {children}
        </div>
      </Alert>
    )
  }
)
AlertWithIcon.displayName = "AlertWithIcon"

export { Alert, AlertTitle, AlertDescription, AlertWithIcon }
