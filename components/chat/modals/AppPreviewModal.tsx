"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink, X } from "lucide-react"

interface AppPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  appHtml: string
  appTitle: string
  onDownload: () => void
}

export function AppPreviewModal({ 
  isOpen, 
  onClose, 
  appHtml, 
  appTitle,
  onDownload 
}: AppPreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {appTitle} - Interactive Preview
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download App
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 p-6 pt-4">
          <div className="h-full border rounded-lg overflow-hidden bg-card">
            <iframe
              srcDoc={appHtml}
              className="w-full h-full border-0"
              title={`${appTitle} Interactive App`}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
        
        <div className="p-6 pt-0 border-t bg-muted/50">
          <p className="text-sm text-muted-foreground text-center">
            🎯 Your interactive learning app is running above. Try all the interactive elements!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
