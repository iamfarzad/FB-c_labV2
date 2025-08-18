"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface RoiPanelProps {
  className?: string
  onBack?: () => void
}

export function RoiPanel({ className, onBack }: RoiPanelProps) {
  return (
    <div className={cn("h-full w-full p-3", className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">ROI Calculator (Design Only)</h3>
        {onBack && (
          <button type="button" className="btn-minimal" onClick={onBack}>Back to Chat</button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="md:col-span-2 card-minimal">
          <form className="grid gap-3" aria-label="ROI input form">
            <div>
              <label htmlFor="avgDeal" className="block text-sm font-medium text-foreground">Average deal size</label>
              <input id="avgDeal" name="avgDeal" type="number" inputMode="decimal" placeholder="e.g. 5000"
                className="input-enhanced mt-1" aria-describedby="avgDealHint" />
              <p id="avgDealHint" className="text-xs text-muted-foreground mt-1">Typical revenue per closed deal</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="leads" className="block text-sm font-medium text-foreground">Monthly qualified leads</label>
                <input id="leads" name="leads" type="number" inputMode="numeric" placeholder="e.g. 120" className="input-enhanced mt-1" />
              </div>
              <div>
                <label htmlFor="closeRate" className="block text-sm font-medium text-foreground">Close rate (%)</label>
                <input id="closeRate" name="closeRate" type="number" inputMode="decimal" placeholder="e.g. 12" className="input-enhanced mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="cost" className="block text-sm font-medium text-foreground">Monthly cost</label>
                <input id="cost" name="cost" type="number" inputMode="decimal" placeholder="e.g. 799" className="input-enhanced mt-1" />
              </div>
              <div>
                <label htmlFor="uplift" className="block text-sm font-medium text-foreground">Expected uplift (%)</label>
                <input id="uplift" name="uplift" type="number" inputMode="decimal" placeholder="e.g. 25" className="input-enhanced mt-1" />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button type="button" className="btn-primary px-4 py-2">Estimate ROI</button>
              <button type="button" className="btn-secondary px-4 py-2">Reset</button>
            </div>
          </form>
        </div>

        <div className="space-y-3">
          <div className="card-elevated">
            <div className="text-sm text-muted-foreground">Estimated Monthly Revenue</div>
            <div className="text-2xl font-bold text-foreground mt-1">$24,500</div>
          </div>
          <div className="card-elevated">
            <div className="text-sm text-muted-foreground">Estimated ROI</div>
            <div className="text-2xl font-bold text-foreground mt-1">+210%</div>
          </div>
          <div className="card-elevated">
            <div className="text-sm text-muted-foreground">Payback Period</div>
            <div className="text-2xl font-bold text-foreground mt-1">~2.3 weeks</div>
          </div>
        </div>
      </div>
    </div>
  )
}


