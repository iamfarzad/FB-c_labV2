"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TimelineEntry } from "./timeline"

interface TimelineStackProps {
  items: TimelineEntry[]
  className?: string
}

export function TimelineStack({ items, className }: TimelineStackProps) {
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className={cn("relative w-full max-w-2xl mx-auto", className)}>
        <div className="relative h-[600px] overflow-y-auto">
          <div className="relative space-y-8">
            {items.map((item) => (
              <div key={`${item.year}-${item.title}`} className="relative">
                <Card className="relative bg-background/80 backdrop-blur-sm border-border/50 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      {item.icon && (
                        <div 
                          className="p-2 rounded-lg"
                          style={{ 
                            backgroundColor: `${item.color}15`,
                            color: item.color
                          }}
                        >
                          <item.icon className="h-5 w-5" />
                        </div>
                      )}
                      <CardTitle className="text-lg font-semibold">
                        {item.title}
                        <span className="block text-sm font-normal text-muted-foreground mt-1">
                          {item.year}
                        </span>
                      </CardTitle>
                    </div>
                  </CardHeader>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative w-full max-w-2xl mx-auto", className)}>
      <div className="relative h-[600px] overflow-y-auto">
        <div className="relative space-y-8">
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.div
                key={`${item.year}-${index}`}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { 
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: [0.16, 0.77, 0.47, 0.97]
                  } 
                }}
                viewport={{ once: true, margin: "-20% 0%" }}
              >
                <Card className="relative bg-background/80 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      {item.icon && (
                        <div 
                          className="p-2 rounded-lg"
                          style={{ 
                            backgroundColor: `${item.color}15`,
                            color: item.color
                          }}
                        >
                          <item.icon className="h-5 w-5" />
                        </div>
                      )}
                      <CardTitle className="text-lg font-semibold">
                        {item.title}
                        <span className="block text-sm font-normal text-muted-foreground mt-1">
                          {item.year}
                        </span>
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    {item.details && (
                      <p className="mt-2 text-sm text-muted-foreground/80">
                        {item.details}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
