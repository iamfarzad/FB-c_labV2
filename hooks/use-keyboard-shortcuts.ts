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
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0
      const modifier = isMac ? e.metaKey : e.ctrlKey

      // Prevent shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.contentEditable === "true"
      ) {
        // Allow Ctrl+Enter to send message even in textarea
        if (modifier && e.key === "Enter") {
          e.preventDefault()
          onSendMessage?.()
          return
        }
        return
      }

      // Handle shortcuts
      if (modifier && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case "n":
            if (e.shiftKey) {
              e.preventDefault()
              onNewChat?.()
            }
            break
          case "k":
            e.preventDefault()
            onFocusInput?.()
            break
          case "e":
            if (e.shiftKey) {
              e.preventDefault()
              onExportSummary?.()
            }
            break
          case "b":
            e.preventDefault()
            onToggleSidebar?.()
            break
          case "enter":
            e.preventDefault()
            onSendMessage?.()
            break
        }
      }

      // Voice, camera, screen share shortcuts
      if (modifier && e.shiftKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case "v":
            e.preventDefault()
            onOpenVoice?.()
            break
          case "c":
            e.preventDefault()
            onOpenCamera?.()
            break
          case "s":
            e.preventDefault()
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
