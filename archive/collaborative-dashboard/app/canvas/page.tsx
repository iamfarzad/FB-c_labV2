"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Pen,
  Brush,
  Eraser,
  Square,
  Circle,
  Triangle,
  Type,
  Undo,
  Redo,
  Download,
  Upload,
  Trash2,
  Users,
  Palette,
  Move,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import Link from "next/link"

type Tool = "pen" | "brush" | "eraser" | "rectangle" | "circle" | "triangle" | "text" | "move"

interface DrawingPoint {
  x: number
  y: number
  tool: Tool
  color: string
  size: number
  timestamp: number
}

interface CollaboratorCursor {
  id: string
  name: string
  x: number
  y: number
  color: string
}

export default function CanvasPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentTool, setCurrentTool] = useState<Tool>("pen")
  const [currentColor, setCurrentColor] = useState("#059669")
  const [brushSize, setBrushSize] = useState(3)
  const [zoom, setZoom] = useState(100)
  const [collaborators] = useState([
    { id: "1", name: "Sarah", color: "#ef4444" },
    { id: "2", name: "Mike", color: "#3b82f6" },
    { id: "3", name: "Alex", color: "#f59e0b" },
  ])
  const [collaboratorCursors, setCollaboratorCursors] = useState<CollaboratorCursor[]>([])

  const colors = [
    "#059669",
    "#ef4444",
    "#3b82f6",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#84cc16",
    "#f97316",
    "#6b7280",
    "#000000",
    "#ffffff",
  ]

  const tools = [
    { id: "pen" as Tool, icon: Pen, label: "Pen" },
    { id: "brush" as Tool, icon: Brush, label: "Brush" },
    { id: "eraser" as Tool, icon: Eraser, label: "Eraser" },
    { id: "rectangle" as Tool, icon: Square, label: "Rectangle" },
    { id: "circle" as Tool, icon: Circle, label: "Circle" },
    { id: "triangle" as Tool, icon: Triangle, label: "Triangle" },
    { id: "text" as Tool, icon: Type, label: "Text" },
    { id: "move" as Tool, icon: Move, label: "Move" },
  ]

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 1200
    canvas.height = 800

    // Set default styles
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Simulate collaborative cursors
    const interval = setInterval(() => {
      setCollaboratorCursors((prev) =>
        collaborators.map((collab) => ({
          id: collab.id,
          name: collab.name,
          x: Math.random() * 1200,
          y: Math.random() * 800,
          color: collab.color,
        })),
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [collaborators])

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)

    setIsDrawing(true)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(x, y)
  }, [])

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return

      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) * (canvas.width / rect.width)
      const y = (e.clientY - rect.top) * (canvas.height / rect.height)

      ctx.globalCompositeOperation = currentTool === "eraser" ? "destination-out" : "source-over"
      ctx.strokeStyle = currentTool === "eraser" ? "rgba(0,0,0,1)" : currentColor
      ctx.lineWidth = brushSize * (currentTool === "brush" ? 2 : 1)

      if (currentTool === "pen" || currentTool === "brush" || currentTool === "eraser") {
        ctx.lineTo(x, y)
        ctx.stroke()
      }
    },
    [isDrawing, currentTool, currentColor, brushSize],
  )

  const stopDrawing = useCallback(() => {
    setIsDrawing(false)
  }, [])

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = "canvas-drawing.png"
    link.href = canvas.toDataURL()
    link.click()
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900">Collaborative Canvas</h1>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                  {collaborators.length + 1} collaborators
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={downloadCanvas}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" size="sm" onClick={clearCanvas}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Tools Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="w-5 h-5 text-emerald-600" />
                Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Drawing Tools */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Drawing Tools</h3>
                <div className="grid grid-cols-2 gap-2">
                  {tools.map((tool) => {
                    const Icon = tool.icon
                    return (
                      <Button
                        key={tool.id}
                        variant={currentTool === tool.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentTool(tool.id)}
                        className={`h-12 ${
                          currentTool === tool.id
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "hover:bg-emerald-50 hover:border-emerald-200"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </Button>
                    )
                  })}
                </div>
              </div>

              <Separator />

              {/* Colors */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Colors</h3>
                <div className="grid grid-cols-4 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setCurrentColor(color)}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${
                        currentColor === color
                          ? "border-emerald-600 scale-110"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <Separator />

              {/* Brush Size */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Brush Size: {brushSize}px</h3>
                <Slider
                  value={[brushSize]}
                  onValueChange={(value) => setBrushSize(value[0])}
                  max={20}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Undo className="w-4 h-4 mr-2" />
                  Undo
                </Button>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Redo className="w-4 h-4 mr-2" />
                  Redo
                </Button>
              </div>

              <Separator />

              {/* Collaborators */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Active Users
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                    <span className="font-medium">You</span>
                  </div>
                  {collaborators.map((collab) => (
                    <div key={collab.id} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: collab.color }} />
                      <span>{collab.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Canvas Area */}
          <Card className="lg:col-span-4">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Drawing Canvas</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleZoomOut}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-slate-600 min-w-[60px] text-center">{zoom}%</span>
                  <Button variant="outline" size="sm" onClick={handleZoomIn}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="relative overflow-auto border border-slate-200 rounded-lg bg-white">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="cursor-crosshair"
                  style={{
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: "top left",
                    width: "1200px",
                    height: "800px",
                  }}
                />

                {/* Collaborative Cursors */}
                {collaboratorCursors.map((cursor) => (
                  <div
                    key={cursor.id}
                    className="absolute pointer-events-none z-10 transition-all duration-300"
                    style={{
                      left: `${cursor.x * (zoom / 100)}px`,
                      top: `${cursor.y * (zoom / 100)}px`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                      style={{ backgroundColor: cursor.color }}
                    />
                    <div
                      className="absolute top-5 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs text-white font-medium whitespace-nowrap shadow-lg"
                      style={{ backgroundColor: cursor.color }}
                    >
                      {cursor.name}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
