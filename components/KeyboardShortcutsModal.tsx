"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, Plus, Download, Sidebar, Focus, Mic, Camera, Monitor, Keyboard } from "lucide-react"

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0
  const modifierKey = isMac ? "⌘" : "Ctrl"

  const shortcuts = [
    {
      category: "Chat Actions",
      items: [
        {
          icon: MessageSquare,
          action: "Send Message",
          shortcut: `${modifierKey} + Enter`,
          description: "Send your current message",
        },
        {
          icon: Plus,
          action: "New Chat",
          shortcut: `${modifierKey} + N`,
          description: "Start a new conversation",
        },
        {
          icon: Focus,
          action: "Focus Input",
          shortcut: `${modifierKey} + K`,
          description: "Focus the message input field",
        },
      ],
    },
    {
      category: "Interface",
      items: [
        {
          icon: Sidebar,
          action: "Toggle Sidebar",
          shortcut: `${modifierKey} + B`,
          description: "Show/hide the activity sidebar",
        },
        {
          icon: Download,
          action: "Export Summary",
          shortcut: `${modifierKey} + E`,
          description: "Download chat summary",
        },
      ],
    },
    {
      category: "Input Methods",
      items: [
        {
          icon: Mic,
          action: "Voice Input",
          shortcut: `${modifierKey} + Shift + V`,
          description: "Open voice recording modal",
        },
        {
          icon: Camera,
          action: "Camera",
          shortcut: `${modifierKey} + Shift + C`,
          description: "Open webcam capture modal",
        },
        {
          icon: Monitor,
          action: "Screen Share",
          shortcut: `${modifierKey} + Shift + S`,
          description: "Open screen sharing modal",
        },
      ],
    },
    {
      category: "Help",
      items: [
        {
          icon: Keyboard,
          action: "Show Shortcuts",
          shortcut: "F1",
          description: "Show this help dialog",
        },
      ],
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate and interact with the AI assistant more efficiently.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {shortcuts.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                {category.category}
              </h3>
              <div className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{item.action}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {item.shortcut}
                    </Badge>
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
              {modifierKey} + K
            </Badge>{" "}
            to focus the input anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
