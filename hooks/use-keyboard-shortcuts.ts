"use client"

import { useEffect } from "react"

interface KeyboardShortcutsConfig {
  onNewChat?: () => void
  onSendMessage?: () => void
  onExportSummary?: () => void
  onToggleSidebar?: () => void
  onFocusInput?: () => void
  onOpenVoice?: () => void
  onOpenCamera?: () => void
  onOpenScreenShare?: () => void
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0
      const modifier = isMac ? event.metaKey : event.ctrlKey

      // Don't trigger shortcuts when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === "true"
      ) {
        // Allow Ctrl+Enter to send message even in input fields
        if (modifier && event.key === "Enter" && config.onSendMessage) {
          event.preventDefault()
          config.onSendMessage()
          return
        }
        return
      }

      // Ctrl/Cmd + N - New Chat
      if (modifier && event.key === "n" && !event.shiftKey && !event.altKey) {
        event.preventDefault()
        config.onNewChat?.()
        return
      }

      // Ctrl/Cmd + Enter - Send Message
      if (modifier && event.key === "Enter" && !event.shiftKey && !event.altKey) {
        event.preventDefault()
        config.onSendMessage?.()
        return
      }

      // Ctrl/Cmd + E - Export Summary
      if (modifier && event.key === "e" && !event.shiftKey && !event.altKey) {
        event.preventDefault()
        config.onExportSummary?.()
        return
      }

      // Ctrl/Cmd + B - Toggle Sidebar
      if (modifier && event.key === "b" && !event.shiftKey && !event.altKey) {
        event.preventDefault()
        config.onToggleSidebar?.()
        return
      }

      // Ctrl/Cmd + K - Focus Input
      if (modifier && event.key === "k" && !event.shiftKey && !event.altKey) {
        event.preventDefault()
        config.onFocusInput?.()
        return
      }

      // Ctrl/Cmd + Shift + V - Voice Input
      if (modifier && event.shiftKey && event.key === "V" && !event.altKey) {
        event.preventDefault()
        config.onOpenVoice?.()
        return
      }

      // Ctrl/Cmd + Shift + C - Camera
      if (modifier && event.shiftKey && event.key === "C" && !event.altKey) {
        event.preventDefault()
        config.onOpenCamera?.()
        return
      }

      // Ctrl/Cmd + Shift + S - Screen Share
      if (modifier && event.shiftKey && event.key === "S" && !event.altKey) {
        event.preventDefault()
        config.onOpenScreenShare?.()
        return
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [config])
}
