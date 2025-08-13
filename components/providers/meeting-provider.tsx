"use client"

import * as React from 'react'
import MeetingOverlay from '@/components/meeting/MeetingOverlay'

interface MeetingContextValue {
  open: (opts?: { username?: string; event?: string; title?: string; description?: string }) => void
  close: () => void
}

const MeetingContext = React.createContext<MeetingContextValue | undefined>(undefined)

export function useMeeting() {
  const ctx = React.useContext(MeetingContext)
  if (!ctx) throw new Error('useMeeting must be used within MeetingProvider')
  return ctx
}

export function MeetingProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [opts, setOpts] = React.useState<{ username?: string; event?: string; title?: string; description?: string }>({})

  const open = React.useCallback((o?: { username?: string; event?: string; title?: string; description?: string }) => {
    setOpts(o || {})
    setIsOpen(true)
  }, [])

  const close = React.useCallback(() => setIsOpen(false), [])

  return (
    <MeetingContext.Provider value={{ open, close }}>
      {children}
      <MeetingOverlay
        open={isOpen}
        onClose={close}
        username={opts.username}
        event={opts.event}
        title={opts.title}
        description={opts.description}
      />
    </MeetingContext.Provider>
  )
}

export default MeetingProvider


