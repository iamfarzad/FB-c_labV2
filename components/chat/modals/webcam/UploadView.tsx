"use client"

import type React from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImageIcon } from "lucide-react"

interface UploadViewProps {
  onFileSelect: () => void
}

export const UploadView: React.FC<UploadViewProps> = ({ onFileSelect }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="p-4 rounded-full bg-blue-500/20 mb-4 mx-auto w-fit">
          <Upload className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Upload Image</h3>
        <p className="text-white/70 text-sm mb-4">Select an image file to analyze with AI</p>
        <Button onClick={onFileSelect} className="bg-blue-500 hover:bg-blue-600 text-white">
          <ImageIcon className="w-4 h-4 mr-2" />
          Choose Image File
        </Button>
        <div className="text-xs text-white/50 space-y-1 mt-4">
          <p>• Supported: JPEG, PNG, GIF</p>
          <p>• Maximum size: 10MB</p>
        </div>
      </div>
    </div>
  )
}
