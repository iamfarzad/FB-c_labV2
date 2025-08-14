'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

type Tab = 'chat' | 'build' | 'learn'

interface StudioLayoutProps {
  tab: Tab
  onChangeTab?: (t: Tab) => void
  className?: string
  children: React.ReactNode
  left?: React.ReactNode
  right?: React.ReactNode
  showLeft?: boolean
  showRight?: boolean
}

export function StudioLayout({ tab, onChangeTab, className, children, left, right, showLeft = true, showRight = false }: StudioLayoutProps) {
  return (
    <div className={cn('min-h-[100dvh] bg-background flex flex-col', className)}>
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-screen-lg px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-accent" />
            <span className="text-sm font-semibold tracking-tight">F.B/c Studio</span>
          </div>
          <nav className="flex items-center gap-1 rounded-full border bg-card/70 p-0.5 text-xs">
            <StudioTab label="Chat" active={tab === 'chat'} onClick={() => onChangeTab?.('chat')} />
            <StudioTab label="Build" active={tab === 'build'} onClick={() => onChangeTab?.('build')} />
            <StudioTab label="Learn" active={tab === 'learn'} onClick={() => onChangeTab?.('learn')} />
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden md:block text-[11px] rounded-full border bg-card/60 px-2 py-0.5 text-muted-foreground">session • live</div>
            {/* Mobile sheets for left/right */}
            {showLeft && left ? (
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">Menu</Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[88vw] max-w-[360px] p-0">
                    <div className="h-full overflow-auto">{left}</div>
                  </SheetContent>
                </Sheet>
              </div>
            ) : null}
            {showRight && right ? (
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">Sections</Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[88vw] max-w-[360px] p-0">
                    <div className="h-full overflow-auto">{right}</div>
                  </SheetContent>
                </Sheet>
              </div>
            ) : null}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-screen-lg px-4 py-4 min-h-0">
          <div className={cn('grid gap-4', (showLeft && left) || (showRight && right) ? 'lg:grid-cols-[248px_1fr_320px]' : 'lg:grid-cols-1')}>
            {showLeft && left ? (
              <aside className="hidden lg:block min-h-0 overflow-auto border rounded-lg">
                {left}
              </aside>
            ) : null}
            <section className="min-h-0 overflow-hidden">
              {children}
            </section>
            {showRight && right ? (
              <aside className="hidden lg:block min-h-0 overflow-auto border rounded-lg">
                {right}
              </aside>
            ) : null}
          </div>
        </div>
      </main>
      <footer className="md:hidden sticky bottom-0 z-40 border-t bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-screen-lg px-4 h-12 grid grid-cols-3 text-xs">
          <MobileTab label="Chat" active={tab === 'chat'} onClick={() => onChangeTab?.('chat')} />
          <MobileTab label="Build" active={tab === 'build'} onClick={() => onChangeTab?.('build')} />
          <MobileTab label="Learn" active={tab === 'learn'} onClick={() => onChangeTab?.('learn')} />
        </div>
      </footer>
    </div>
  )
}

function StudioTab({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3 h-7 rounded-full transition-colors',
        active ? 'bg-background text-foreground' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {label}
    </button>
  )
}

function MobileTab({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-center',
        active ? 'text-foreground' : 'text-muted-foreground'
      )}
    >
      {label}
    </button>
  )
}


