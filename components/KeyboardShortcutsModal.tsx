"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Keyboard, Command } from "lucide-react"

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0
  const modifierKey = isMac ? "⌘" : "Ctrl"

  const shortcuts = [
    {
      category: "Chat Controls",
      items: [
        { keys: [`${modifierKey}`, "N"], description: "Start new chat" },
        { keys: [`${modifierKey}`, "Enter"], description: "Send message" },
        { keys: [`${modifierKey}`, "K"], description: "Focus input field" },
        { keys: [`${modifierKey}`, "E"], description: "Export chat summary" },
      ],
    },
    {
      category: "Navigation",
      items: [
        { keys: [`${modifierKey}`, "B"], description: "Toggle sidebar" },
        { keys: ["F1"], description: "Show keyboard shortcuts" },
        { keys: ["Shift", "Enter"], description: "New line in message" },
      ],
    },
    {
      category: "Media Input",
      items: [
        { keys: [`${modifierKey}`, "Shift", "V"], description: "Open voice input" },
        { keys: [`${modifierKey}`, "Shift", "C"], description: "Open camera" },
        { keys: [`${modifierKey}`, "Shift", "S"], description: "Share screen" },
      ],
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate and control the AI assistant more efficiently.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {shortcuts.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                {category.category}
              </h3>
              <div className="space-y-2">
                {category.items.map((shortcut, shortcutIndex) => (
                  <div key={shortcutIndex} className="flex items-center justify-between py-2">
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <div key={keyIndex} className="flex items-center gap-1">
                          <Badge variant="outline" className="font-mono text-xs px-2 py-1">
                            {key === "⌘" ? <Command className="w-3 h-3" /> : key}
                          </Badge>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground text-xs">+</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {categoryIndex < shortcuts.length - 1 && <Separator />}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> Most shortcuts work globally throughout the application. Press{" "}
            <Badge variant="outline" className="font-mono text-xs">
              F1
            </Badge>{" "}
            anytime to view this help.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
