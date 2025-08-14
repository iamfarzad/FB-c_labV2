"use client"

import { useEffect, useCallback } from "react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"

interface KeyboardShortcutsOptions {
  onNewChat?: () => void
  onSendMessage?: () => void
  onExportSummary?: () => void
  onToggleSidebar?: () => void
  onFocusInput?: () => void
  onOpenVoice?: () => void
  onOpenCamera?: () => void
  onOpenScreenShare?: () => void
  disabled?: boolean
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}) {
  const { setTheme, theme } = useTheme()
  const router = useRouter()

  const {
    onNewChat,
    onSendMessage,
    onExportSummary,
    onToggleSidebar,
    onFocusInput,
    onOpenVoice,
    onOpenCamera,
    onOpenScreenShare,
    disabled = false,
  } = options

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (disabled) return

      // Don't trigger shortcuts when user is typing in input fields
      const target = event.target as HTMLElement
      const isInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true" ||
        target.closest('[contenteditable="true"]')

      // Allow some shortcuts even in input fields
      const allowInInput = ["Escape", "F1"]
      if (isInputField && !allowInInput.includes(event.key)) {
        // Only allow Ctrl/Cmd shortcuts in input fields
        if (!(event.ctrlKey || event.metaKey)) return
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0
      const modifier = isMac ? event.metaKey : event.ctrlKey
      const altModifier = event.altKey
      const shiftModifier = event.shiftKey

      // Theme Toggle: Ctrl/Cmd + D
      if (modifier && event.key === "d" && !altModifier && !shiftModifier) {
        event.preventDefault()
        setTheme(theme === "dark" ? "light" : "dark")
        return
      }

      // New Chat: Ctrl/Cmd + N
      if (modifier && event.key === "n" && !altModifier && !shiftModifier) {
        event.preventDefault()
        onNewChat?.()
        return
      }

      // Send Message: Ctrl/Cmd + Enter (when in input)
      if (modifier && event.key === "Enter" && !altModifier && !shiftModifier) {
        event.preventDefault()
        onSendMessage?.()
        return
      }

      // Export Summary: Ctrl/Cmd + E
      if (modifier && event.key === "e" && !altModifier && !shiftModifier) {
        event.preventDefault()
        onExportSummary?.()
        return
      }

      // Toggle Sidebar: Ctrl/Cmd + B
      if (modifier && event.key === "b" && !altModifier && !shiftModifier) {
        event.preventDefault()
        onToggleSidebar?.()
        return
      }

      // Focus Input: Ctrl/Cmd + K or /
      if (
        (modifier && event.key === "k" && !altModifier && !shiftModifier) ||
        (event.key === "/" && !modifier && !altModifier && !shiftModifier && !isInputField)
      ) {
        event.preventDefault()
        onFocusInput?.()
        return
      }

      // Voice Input: Ctrl/Cmd + Shift + V
      if (modifier && shiftModifier && event.key === "V" && !altModifier) {
        event.preventDefault()
        onOpenVoice?.()
        return
      }

      // Camera: Ctrl/Cmd + Shift + C
      if (modifier && shiftModifier && event.key === "C" && !altModifier) {
        event.preventDefault()
        onOpenCamera?.()
        return
      }

      // Screen Share: Ctrl/Cmd + Shift + S
      if (modifier && shiftModifier && event.key === "S" && !altModifier) {
        event.preventDefault()
        onOpenScreenShare?.()
        return
      }

      // Navigation shortcuts
      // Home: Alt + H
      if (altModifier && event.key === "h" && !modifier && !shiftModifier) {
        event.preventDefault()
        router.push("/")
        return
      }

      // Chat: Alt + C
      if (altModifier && event.key === "c" && !modifier && !shiftModifier) {
        event.preventDefault()
        router.push("/chat")
        return
      }

      // Consulting: Alt + 1
      if (altModifier && event.key === "1" && !modifier && !shiftModifier) {
        event.preventDefault()
        router.push("/consulting")
        return
      }

      // About: Alt + 2
      if (altModifier && event.key === "2" && !modifier && !shiftModifier) {
        event.preventDefault()
        router.push("/about")
        return
      }

      // Workshop shortcut removed; workshop is accessible via collab sidebar

      // Contact: Alt + 4
      if (altModifier && event.key === "4" && !modifier && !shiftModifier) {
        event.preventDefault()
        router.push("/contact")
        return
      }

      // Escape to close modals/clear focus
      if (event.key === "Escape") {
        event.preventDefault()
        // Let parent components handle escape
        return
      }

      // Help: F1 or Ctrl/Cmd + ?
      if (
        event.key === "F1" ||
        (modifier && event.key === "?" && !altModifier && !shiftModifier) ||
        (modifier && shiftModifier && event.key === "/" && !altModifier)
      ) {
        event.preventDefault()
        // Show help modal or toast
        showKeyboardShortcuts()
        return
      }
    },
    [
      disabled,
      theme,
      setTheme,
      router,
      onNewChat,
      onSendMessage,
      onExportSummary,
      onToggleSidebar,
      onFocusInput,
      onOpenVoice,
      onOpenCamera,
      onOpenScreenShare,
    ],
  )

  useEffect(() => {
    if (disabled) return

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown, disabled])

  return {
    shortcuts: getShortcutsList(),
  }
}

// Helper function to show keyboard shortcuts
function showKeyboardShortcuts() {
  // Create a simple toast or modal showing shortcuts
  const shortcuts = getShortcutsList()
  const shortcutText = shortcuts
    .map((section) => {
      return `${section.category}:\n${section.shortcuts.map((s) => `  ${s.key} - ${s.description}`).join("\n")}`
    })
    .join("\n\n")

  // For now, just log to console - in a real app you'd show a modal
  console.info("Keyboard Shortcuts:\n\n" + shortcutText)

  // You could also show a toast notification
  if (typeof window !== "undefined" && "Notification" in window) {
    // Simple browser notification as fallback
    new Notification("Keyboard Shortcuts", {
      body: "Check console for full list of shortcuts",
      icon: "/favicon.ico",
    })
  }
}

// Get list of all shortcuts for help display
function getShortcutsList() {
  const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0
  const mod = isMac ? "⌘" : "Ctrl"

  return [
    {
      category: "General",
      shortcuts: [
        { key: `${mod} + D`, description: "Toggle dark/light theme" },
        { key: `${mod} + K or /`, description: "Focus search/input" },
        { key: "Esc", description: "Close modal or clear focus" },
        { key: `${mod} + ? or F1`, description: "Show keyboard shortcuts" },
      ],
    },
    {
      category: "Chat",
      shortcuts: [
        { key: `${mod} + N`, description: "Start new chat" },
        { key: `${mod} + Enter`, description: "Send message" },
        { key: `${mod} + E`, description: "Export chat summary" },
        { key: `${mod} + B`, description: "Toggle sidebar" },
      ],
    },
    {
      category: "Media",
      shortcuts: [
        { key: `${mod} + Shift + V`, description: "Open voice input" },
        { key: `${mod} + Shift + C`, description: "Open camera" },
        { key: `${mod} + Shift + S`, description: "Start screen share" },
      ],
    },
    {
      category: "Navigation",
      shortcuts: [
        { key: "Alt + H", description: "Go to Home" },
        { key: "Alt + C", description: "Go to Chat" },
        { key: "Alt + 1", description: "Go to Consulting" },
        { key: "Alt + 2", description: "Go to About" },
        // Workshop removed from global nav; accessible in collab shell
        { key: "Alt + 4", description: "Go to Contact" },
      ],
    },
  ]
}
