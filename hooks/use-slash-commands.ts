"use client"

import { useState, useCallback } from "react"

export interface SlashCommand {
  command: string
  description: string
  action: (args?: string) => void
}

export function useSlashCommands() {
  const [showCommands, setShowCommands] = useState(false)
  const [filteredCommands, setFilteredCommands] = useState<SlashCommand[]>([])

  const commands: SlashCommand[] = [
    {
      command: "/help",
      description: "Show available commands",
      action: () => console.info("Help command"),
    },
    {
      command: "/clear",
      description: "Clear chat history",
      action: () => console.info("Clear command"),
    },
    {
      command: "/voice",
      description: "Open voice input",
      action: () => console.info("Voice command"),
    },
    {
      command: "/camera",
      description: "Open camera",
      action: () => console.info("Camera command"),
    },
    {
      command: "/screen",
      description: "Start screen share",
      action: () => console.info("Screen command"),
    },
  ]

  const handleInputChange = useCallback((value: string) => {
    if (value.startsWith("/")) {
      const query = value.slice(1).toLowerCase()
      const filtered = commands.filter(
        (cmd) => cmd.command.toLowerCase().includes(query) || cmd.description.toLowerCase().includes(query),
      )
      setFilteredCommands(filtered)
      setShowCommands(true)
    } else {
      setShowCommands(false)
    }
  }, []) // Removed commands from dependency array

  const executeCommand = useCallback((command: string) => {
    const cmd = commands.find((c) => c.command === command)
    if (cmd) {
      cmd.action()
      setShowCommands(false)
      return true
    }
    return false
  }, []) // Removed commands from dependency array

  return {
    showCommands,
    filteredCommands,
    handleInputChange,
    executeCommand,
    hideCommands: () => setShowCommands(false),
  }
}
