"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Keyboard, X } from "lucide-react"

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0)
  }, [])

  const mod = isMac ? "⌘" : "Ctrl"

  const shortcutSections = [
    {
      category: "General",
      shortcuts: [
        { key: [`${mod}`, "D"], description: "Toggle dark/light theme" },
        { key: [`${mod}`, "K"], description: "Focus search/input" },
        { key: ["/"], description: "Focus search/input (alternative)" },
        { key: ["Esc"], description: "Close modal or clear focus" },
        { key: [`${mod}`, "?"], description: "Show keyboard shortcuts" },
        { key: ["F1"], description: "Show help" },
      ],
    },
    {
      category: "Chat",
      shortcuts: [
        { key: [`${mod}`, "N"], description: "Start new chat" },
        { key: [`${mod}`, "Enter"], description: "Send message" },
        { key: [`${mod}`, "E"], description: "Export chat summary" },
        { key: [`${mod}`, "B"], description: "Toggle sidebar" },
      ],
    },
    {
      category: "Media & Tools",
      shortcuts: [
        { key: [`${mod}`, "Shift", "V"], description: "Open voice input" },
        { key: [`${mod}`, "Shift", "C"], description: "Open camera" },
        { key: [`${mod}`, "Shift", "S"], description: "Start screen share" },
      ],
    },
    {
      category: "Navigation",
      shortcuts: [
        { key: ["Alt", "H"], description: "Go to Home" },
        { key: ["Alt", "C"], description: "Go to Chat" },
        { key: ["Alt", "1"], description: "Go to Consulting" },
        { key: ["Alt", "2"], description: "Go to About" },
        // Workshop moved into collab shell sidebar
        { key: ["Alt", "4"], description: "Go to Contact" },
      ],
    },
  ]

  const KeyCombo = ({ keys }: { keys: string[] }) => (
    <div className="flex items-center gap-1">
      {keys.map((key, index) => (
        <div key={index} className="flex items-center gap-1">
          <Badge variant="outline" className="px-2 py-1 text-xs font-mono bg-muted/50">
            {key}
          </Badge>
          {index < keys.length - 1 && <span className="text-muted-foreground text-xs">+</span>}
        </div>
      ))}
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>Speed up your workflow with these keyboard shortcuts</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {shortcutSections.map((section) => (
            <div key={section.category}>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">{section.category}</h3>
              <div className="space-y-2">
                {section.shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50">
                    <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                    <KeyCombo keys={shortcut.key} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            Press{" "}
            <Badge variant="outline" className="px-1 py-0.5 text-xs">
              F1
            </Badge>{" "}
            or{" "}
            <Badge variant="outline" className="px-1 py-0.5 text-xs">
              {mod} + ?
            </Badge>{" "}
            anytime to see shortcuts
          </div>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
