"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Keyboard, Send, Plus, Download, PanelLeft, ArrowUp, Mic, Camera, Monitor } from "lucide-react"

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const shortcuts = [
    {
      key: "Ctrl+Enter",
      description: "Send message",
      icon: <Send className="w-4 h-4" />,
    },
    {
      key: "Ctrl+N",
      description: "New chat",
      icon: <Plus className="w-4 h-4" />,
    },
    {
      key: "Ctrl+D",
      description: "Download chat summary",
      icon: <Download className="w-4 h-4" />,
    },
    {
      key: "Ctrl+B",
      description: "Toggle sidebar",
      icon: <PanelLeft className="w-4 h-4" />,
    },
    {
      key: "Ctrl+K",
      description: "Focus input",
      icon: <ArrowUp className="w-4 h-4" />,
    },
    {
      key: "Ctrl+Shift+V",
      description: "Voice input",
      icon: <Mic className="w-4 h-4" />,
    },
    {
      key: "Ctrl+Shift+C",
      description: "Camera capture",
      icon: <Camera className="w-4 h-4" />,
    },
    {
      key: "Ctrl+Shift+S",
      description: "Screen sharing",
      icon: <Monitor className="w-4 h-4" />,
    },
    {
      key: "F1",
      description: "Show keyboard shortcuts",
      icon: <Keyboard className="w-4 h-4" />,
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {shortcut.icon}
                  <span>{shortcut.description}</span>
                </div>
                <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded-md border">{shortcut.key}</kbd>
              </div>
            ))}
          </div>

          <div className="mt-6 text-sm text-muted-foreground">
            <p>Note: On Mac, use Command (⌘) instead of Ctrl for most shortcuts.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
