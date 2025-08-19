"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  FileText,
  Download,
  Upload,
  Type,
  ImageIcon,
  Square,
  Circle,
  Minus,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Save,
  Plus,
  Trash2,
  Move,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
} from "lucide-react"

interface PDFElement {
  id: string
  type: "text" | "image" | "shape"
  x: number
  y: number
  width: number
  height: number
  content?: string
  fontSize?: number
  fontWeight?: string
  textAlign?: string
  color?: string
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  rotation?: number
}

export function PDFPanel() {
  const [pages, setPages] = useState<PDFElement[][]>([[]])
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedTool, setSelectedTool] = useState<"select" | "text" | "image" | "rectangle" | "circle" | "line">(
    "select",
  )
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState("")
  const canvasRef = useRef<HTMLDivElement>(null)

  const tools = [
    { id: "select", icon: Move, label: "Select", color: "text-slate-600" },
    { id: "text", icon: Type, label: "Text", color: "text-blue-600" },
    { id: "image", icon: ImageIcon, label: "Image", color: "text-green-600" },
    { id: "rectangle", icon: Square, label: "Rectangle", color: "text-purple-600" },
    { id: "circle", icon: Circle, label: "Circle", color: "text-orange-600" },
    { id: "line", icon: Minus, label: "Line", color: "text-red-600" },
  ]

  const textFormatting = [
    { id: "bold", icon: Bold, label: "Bold" },
    { id: "italic", icon: Italic, label: "Italic" },
    { id: "underline", icon: Underline, label: "Underline" },
    { id: "left", icon: AlignLeft, label: "Align Left" },
    { id: "center", icon: AlignCenter, label: "Align Center" },
    { id: "right", icon: AlignRight, label: "Align Right" },
  ]

  const addElement = (type: PDFElement["type"], x = 100, y = 100) => {
    const newElement: PDFElement = {
      id: `element-${Date.now()}`,
      type,
      x,
      y,
      width: type === "text" ? 200 : 100,
      height: type === "text" ? 40 : 100,
      content: type === "text" ? "New Text" : undefined,
      fontSize: 16,
      fontWeight: "normal",
      textAlign: "left",
      color: "#000000",
      backgroundColor: type === "shape" ? "#f3f4f6" : "transparent",
      borderColor: "#d1d5db",
      borderWidth: 1,
      rotation: 0,
    }

    const updatedPages = [...pages]
    updatedPages[currentPage] = [...updatedPages[currentPage], newElement]
    setPages(updatedPages)
    setSelectedElement(newElement.id)
  }

  const deleteElement = (elementId: string) => {
    const updatedPages = [...pages]
    updatedPages[currentPage] = updatedPages[currentPage].filter((el) => el.id !== elementId)
    setPages(updatedPages)
    setSelectedElement(null)
  }

  const addPage = () => {
    setPages([...pages, []])
    setCurrentPage(pages.length)
  }

  const deletePage = () => {
    if (pages.length > 1) {
      const updatedPages = pages.filter((_, index) => index !== currentPage)
      setPages(updatedPages)
      setCurrentPage(Math.max(0, currentPage - 1))
    }
  }

  const exportPDF = () => {
    // Simulate PDF export
    const blob = new Blob(["PDF content would be generated here"], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "document.pdf"
    a.click()
    URL.revokeObjectURL(url)
  }

  const currentPageElements = pages[currentPage] || []
  const selectedElementData = currentPageElements.find((el) => el.id === selectedElement)

  return (
    <div className="h-full flex bg-slate-50">
      {/* Left Toolbar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        {/* Tools Section */}
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900 mb-3">Tools</h3>
          <div className="grid grid-cols-2 gap-2">
            {tools.map((tool) => {
              const Icon = tool.icon
              return (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id as any)}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    selectedTool === tool.id
                      ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs">{tool.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Text Formatting */}
        {selectedElementData?.type === "text" && (
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-3">Text Format</h3>
            <div className="grid grid-cols-3 gap-1 mb-3">
              {textFormatting.map((format) => {
                const Icon = format.icon
                return (
                  <button
                    key={format.id}
                    className="p-2 rounded border border-slate-200 hover:border-slate-300 text-slate-600"
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                )
              })}
            </div>
            <div className="space-y-2">
              <Input type="number" placeholder="Font Size" value={selectedElementData.fontSize} className="text-sm" />
              <Input type="color" value={selectedElementData.color} className="h-8" />
            </div>
          </div>
        )}

        {/* Pages */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900">Pages</h3>
            <Button size="sm" variant="outline" onClick={addPage}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {pages.map((_, index) => (
              <div
                key={index}
                className={`p-2 rounded border cursor-pointer transition-all duration-200 ${
                  currentPage === index ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-slate-300"
                }`}
                onClick={() => setCurrentPage(index)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">Page {index + 1}</span>
                  {pages.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deletePage()
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 mt-auto">
          <div className="space-y-2">
            <Button className="w-full" onClick={exportPDF}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              <Upload className="w-4 h-4 mr-2" />
              Import PDF
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              <Save className="w-4 h-4 mr-2" />
              Save Project
            </Button>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <FileText className="w-3 h-3 mr-1" />
              PDF Editor
            </Badge>
            <span className="text-sm text-slate-600">
              Page {currentPage + 1} of {pages.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setZoom(Math.max(25, zoom - 25))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-slate-600 min-w-12 text-center">{zoom}%</span>
            <Button size="sm" variant="outline" onClick={() => setZoom(Math.min(200, zoom + 25))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline">
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-slate-100 p-8">
          <div className="max-w-4xl mx-auto">
            <div
              ref={canvasRef}
              className="bg-white shadow-lg mx-auto relative"
              style={{
                width: `${(8.5 * 96 * zoom) / 100}px`,
                height: `${(11 * 96 * zoom) / 100}px`,
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
              }}
              onClick={(e) => {
                if (selectedTool !== "select") {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = ((e.clientX - rect.left) * 100) / zoom
                  const y = ((e.clientY - rect.top) * 100) / zoom
                  addElement(selectedTool === "text" ? "text" : "shape", x, y)
                }
              }}
            >
              {/* Render Elements */}
              {currentPageElements.map((element) => (
                <div
                  key={element.id}
                  className={`absolute cursor-pointer border-2 transition-all duration-200 ${
                    selectedElement === element.id
                      ? "border-emerald-500 border-dashed"
                      : "border-transparent hover:border-slate-300"
                  }`}
                  style={{
                    left: element.x,
                    top: element.y,
                    width: element.width,
                    height: element.height,
                    backgroundColor: element.backgroundColor,
                    color: element.color,
                    fontSize: element.fontSize,
                    fontWeight: element.fontWeight,
                    textAlign: element.textAlign as any,
                    transform: `rotate(${element.rotation}deg)`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedElement(element.id)
                  }}
                  onDoubleClick={() => {
                    if (element.type === "text") {
                      setIsEditing(true)
                      setEditText(element.content || "")
                    }
                  }}
                >
                  {element.type === "text" && (
                    <div className="w-full h-full flex items-center justify-center p-2">
                      {isEditing && selectedElement === element.id ? (
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onBlur={() => {
                            const updatedPages = [...pages]
                            const elementIndex = updatedPages[currentPage].findIndex((el) => el.id === element.id)
                            if (elementIndex !== -1) {
                              updatedPages[currentPage][elementIndex].content = editText
                              setPages(updatedPages)
                            }
                            setIsEditing(false)
                          }}
                          className="w-full h-full resize-none border-none bg-transparent"
                          autoFocus
                        />
                      ) : (
                        element.content
                      )}
                    </div>
                  )}

                  {selectedElement === element.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteElement(element.id)
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}

              {/* Grid overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-10">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
