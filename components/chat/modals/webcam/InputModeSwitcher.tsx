"use client"

import type React from "react"
import { Camera, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type InputMode = "camera" | "upload"

interface InputModeSwitcherProps {
  currentMode: InputMode
  onModeChange: (mode: InputMode) => void
  isCameraDisabled: boolean
}

export const InputModeSwitcher: React.FC<InputModeSwitcherProps> = ({
  currentMode,
  onModeChange,
  isCameraDisabled,
}) => {
  return (
    <div className="flex gap-2 p-4 bg-black/30">
      <Button
        variant={currentMode === "camera" ? "default" : "outline"}
        size="sm"
        onClick={() => onModeChange("camera")}
        disabled={isCameraDisabled}
        className={cn(
          "bg-white/10 border-white/20 text-white hover:bg-white/20",
          currentMode === "camera" && "bg-white/20",
          isCameraDisabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <Camera className="w-4 h-4 mr-2" />
        Camera
      </Button>
      <Button
        variant={currentMode === "upload" ? "default" : "outline"}
        size="sm"
        onClick={() => onModeChange("upload")}
        className={cn(
          "bg-white/10 border-white/20 text-white hover:bg-white/20",
          currentMode === "upload" && "bg-white/20",
        )}
      >
        <Upload className="w-4 h-4 mr-2" />
        Upload Image
      </Button>
    </div>
  )
}
