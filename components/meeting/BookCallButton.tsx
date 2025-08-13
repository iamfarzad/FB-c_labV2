"use client"

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { useMeeting } from '@/components/providers/meeting-provider'

interface BookCallButtonProps extends React.ComponentProps<typeof Button> {
  username?: string
  event?: string
  title?: string
  description?: string
}

export function BookCallButton({
  children,
  username,
  event,
  title,
  description,
  onClick,
  ...rest
}: BookCallButtonProps) {
  const meeting = useMeeting()

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    try { meeting.open({ username, event, title, description }) } catch {}
    onClick?.(e)
  }

  return (
    <Button {...rest} onClick={handleClick}>
      {children ?? 'Book a Call'}
    </Button>
  )
}

export default BookCallButton



