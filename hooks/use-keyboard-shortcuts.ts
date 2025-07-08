"use client"

import { useEffect } from "react"

interface KeyboardShortcutsProps {
  onNewChat?: () => void
  onSendMessage?: () => void
  onExportSummary?: () => void
  onToggleSidebar?: () => void
  onFocusInput?: () => void
  onOpenVoice?: () => void
  onOpenCamera?: () => void
  onOpenScreenShare?: () => void
}

export function useKeyboardShortcuts({
  onNewChat,
  onSendMessage,
  onExportSummary,
  onToggleSidebar,
  onFocusInput,
  onOpenVoice,
  onOpenCamera,
  onOpenScreenShare,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0
      const modifier = isMac ? event.metaKey : event.ctrlKey

      // Prevent default for our shortcuts
      if (modifier || event.key === "F1") {
        switch (true) {
          case modifier && event.key === "n" && !event.shiftKey:
            event.preventDefault()
            onNewChat?.()
            break
          case modifier && event.key === "Enter":
            event.preventDefault()
            onSendMessage?.()
            break
          case modifier && event.key === "e" && !event.shiftKey:
            event.preventDefault()
            onExportSummary?.()
            break
          case modifier && event.key === "b" && !event.shiftKey:
            event.preventDefault()
            onToggleSidebar?.()
            break
          case modifier && event.key === "k" && !event.shiftKey:
            event.preventDefault()
            onFocusInput?.()
            break
          case modifier && event.shiftKey && event.key === "V":
            event.preventDefault()
            onOpenVoice?.()
            break
          case modifier && event.shiftKey && event.key === "C":
            event.preventDefault()
            onOpenCamera?.()
            break
          case modifier && event.shiftKey && event.key === "S":
            event.preventDefault()
            onOpenScreenShare?.()
            break
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [
    onNewChat,
    onSendMessage,
    onExportSummary,
    onToggleSidebar,
    onFocusInput,
    onOpenVoice,
    onOpenCamera,
    onOpenScreenShare,
  ])
}
