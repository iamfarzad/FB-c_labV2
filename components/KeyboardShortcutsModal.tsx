"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Keyboard, MessageSquare, Camera, Focus } from "lucide-react"

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0
  const modifier = isMac ? "⌘" : "Ctrl"

  const shortcuts = [
    {
      category: "Chat Actions",
      icon: MessageSquare,
      shortcuts: [
        { keys: [`${modifier}`, "Enter"], description: "Send message" },
        { keys: [`${modifier}`, "Shift", "N"], description: "Start new chat" },
        { keys: [`${modifier}`, "K"], description: "Focus input field" },
        { keys: [`${modifier}`, "Shift", "E"], description: "Export chat summary" },
      ],
    },
    {
      category: "Media Input",
      icon: Camera,
      shortcuts: [
        { keys: [`${modifier}`, "Shift", "V"], description: "Open voice input" },
        { keys: [`${modifier}`, "Shift", "C"], description: "Open camera" },
        { keys: [`${modifier}`, "Shift", "S"], description: "Share screen" },
      ],
    },
    {
      category: "Navigation",
      icon: Focus,
      shortcuts: [
        { keys: [`${modifier}`, "B"], description: "Toggle sidebar" },
        { keys: ["F1"], description: "Show keyboard shortcuts" },
        { keys: ["Esc"], description: "Close modals" },
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
            Use these keyboard shortcuts to navigate and interact with the AI assistant more efficiently.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {shortcuts.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-3">
              <div className="flex items-center gap-2">
                <category.icon className="w-4 h-4 text-primary" />
                <h3 className="font-medium">{category.category}</h3>
              </div>

              <div className="space-y-2">
                {category.shortcuts.map((shortcut, shortcutIndex) => (
                  <div key={shortcutIndex} className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <div key={keyIndex} className="flex items-center gap-1">
                          <Badge variant="outline" className="font-mono text-xs px-2 py-1">
                            {key}
                          </Badge>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-xs text-muted-foreground">+</span>
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
            <strong>Tip:</strong> Most shortcuts work globally, but some require the input field to be focused. Press{" "}
            <Badge variant="outline" className="mx-1 font-mono text-xs">
              {modifier}+K
            </Badge>{" "}
            to focus the input at any time.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
