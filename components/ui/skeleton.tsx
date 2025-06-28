import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  variant?: 'default' | 'pulse' | 'wave' | 'shimmer'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  animation?: boolean
  width?: string | number
  height?: string | number
  count?: number
}

function Skeleton({
  className,
  variant = 'shimmer',
  rounded = 'md',
  animation = true,
  width,
  height,
  count = 1,
  ...props
}: SkeletonProps) {
  const baseClasses = "bg-muted relative overflow-hidden"
  
  const roundedClasses = {
    none: "",
    sm: "rounded-sm",
    md: "rounded-md", 
    lg: "rounded-lg",
    full: "rounded-full"
  }

  const variantClasses = {
    default: "animate-pulse",
    pulse: "animate-pulse",
    wave: "",
    shimmer: "skeleton-shimmer"
  }

  const skeletonElement = (
    <div
      className={cn(
        baseClasses,
        roundedClasses[rounded],
        variantClasses[variant],
        !animation && "animate-none",
        className
      )}
      style={{
        width: width || '100%',
        height: height || '1rem',
      }}
      {...props}
    >
      {variant === 'shimmer' && (
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-white/10 to-transparent" />
      )}
      {variant === 'wave' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/20 to-muted"
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </div>
  )

  if (count === 1) {
    return skeletonElement
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {skeletonElement}
        </div>
      ))}
    </div>
  )
}

// Predefined skeleton components for common use cases
const SkeletonText = ({ lines = 3, className, ...props }: { lines?: number, className?: string }) => (
  <div className={cn("space-y-2", className)} {...props}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        height="1rem"
        width={index === lines - 1 ? "75%" : "100%"}
        className="h-4"
      />
    ))}
  </div>
)

const SkeletonCard = ({ className, ...props }: { className?: string }) => (
  <div className={cn("space-y-4 p-4", className)} {...props}>
    <Skeleton className="h-40 w-full" rounded="lg" />
    <div className="space-y-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-8 w-20" rounded="md" />
      <Skeleton className="h-8 w-16" rounded="md" />
    </div>
  </div>
)

const SkeletonAvatar = ({ size = 'md', className, ...props }: { size?: 'sm' | 'md' | 'lg', className?: string }) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12", 
    lg: "h-16 w-16"
  }
  
  return (
    <Skeleton
      className={cn(sizeClasses[size], className)}
      rounded="full"
      {...props}
    />
  )
}

const SkeletonButton = ({ className, ...props }: { className?: string }) => (
  <Skeleton className={cn("h-10 w-24", className)} rounded="md" {...props} />
)

const SkeletonTable = ({ rows = 5, columns = 4, className, ...props }: { rows?: number, columns?: number, className?: string }) => (
  <div className={cn("space-y-4", className)} {...props}>
    {/* Header */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={index} className="h-6" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-4" />
        ))}
      </div>
    ))}
  </div>
)

// Hero section skeleton for your home page
const SkeletonHero = ({ className, ...props }: { className?: string }) => (
  <div className={cn("space-y-8 py-20 text-center", className)} {...props}>
    {/* Badge */}
    <Skeleton className="h-8 w-64 mx-auto" rounded="full" />
    
    {/* Main heading */}
    <div className="space-y-4">
      <Skeleton className="h-16 w-3/4 mx-auto" />
      <Skeleton className="h-12 w-2/3 mx-auto" />
    </div>
    
    {/* Description */}
    <div className="space-y-2 max-w-3xl mx-auto">
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-5/6 mx-auto" />
    </div>
    
    {/* AI Input */}
    <div className="space-y-4 max-w-xl mx-auto">
      <Skeleton className="h-12 w-full" rounded="full" />
      <div className="flex gap-4 justify-center">
        <Skeleton className="h-10 w-24" rounded="full" />
        <Skeleton className="h-10 w-32" rounded="full" />
      </div>
    </div>
  </div>
)

// Export all skeleton components
export { 
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonTable,
  SkeletonHero
} 