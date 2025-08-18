"use client"

import type React from "react"
import { Skeleton } from "@/components/ui/skeleton"

export function PanelSkeleton() {
  return (
    <div className="h-full w-full p-3">
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      </div>
    </div>
  )
}


