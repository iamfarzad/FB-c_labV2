"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { UploadCloud, FileIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useChatContext } from "@/app/(chat)/chat/context/ChatProvider"
import { cn } from "@/lib/utils"

interface UploadedFile {
  file: File
  progress: number
  error?: string
}

export function EnhancedFileUpload() {
  const { addActivity } = useChatContext()
  const [files, setFiles] = useState<UploadedFile[]>([])

  const uploadReal = useCallback(async (uploadedFile: UploadedFile) => {
    try {
      const form = new FormData()
      form.append('file', uploadedFile.file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      if (!res.ok) throw new Error(await res.text())
      const j = await res.json()
      addActivity({ type: 'file-upload', status: 'success', content: `${uploadedFile.file.name} → ${j.url}` })
      setFiles(prev => prev.map(f => f.file === uploadedFile.file ? { ...f, progress: 100 } : f))
    } catch (e: any) {
      const msg = e?.message || 'Upload failed'
      setFiles(prev => prev.map(f => f.file === uploadedFile.file ? { ...f, error: msg } : f))
      addActivity({ type: 'file-upload', status: 'error', content: `${uploadedFile.file.name}: ${msg}` })
    }
  }, [addActivity])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({ file, progress: 0 }))
    setFiles((prev) => [...prev, ...newFiles])
    addActivity({ type: 'file-upload', status: 'in-progress', content: `${acceptedFiles.length} file(s) added` })
    newFiles.forEach((f) => uploadReal(f))
  }, [addActivity, uploadReal])

  const simulateUpload = (uploadedFile: UploadedFile) => {
    const interval = setInterval(() => {
      setFiles((prev) =>
        prev.map((f) => {
          if (f.file === uploadedFile.file) {
            const newProgress = f.progress + 10
            if (newProgress >= 100) {
              clearInterval(interval)
              addActivity({ type: "file-upload", status: "success", content: `${f.file.name} uploaded` })
              return { ...f, progress: 100 }
            }
            return { ...f, progress: newProgress }
          }
          return f
        }),
      )
    }, 200)
  }

  const removeFile = (fileName: string) => {
    setFiles((prev) => prev.filter((f) => f.file.name !== fileName))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground">
      <h3 className="font-semibold mb-2">File Upload</h3>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">
          {isDragActive ? "Drop the files here..." : "Drag 'n' drop files here, or click to select"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">Max 10MB per file</p>
      </div>
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map(({ file, progress, error }) => (
            <div key={file.name} className="flex items-center gap-3 p-2 border rounded-md">
              <FileIcon className="h-6 w-6 flex-shrink-0" />
              <div className="flex-grow overflow-hidden">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <Progress value={progress} className="h-2 mt-1" />
                {error && <p className="text-xs text-destructive mt-1">{error}</p>}
              </div>
              <Button onClick={() => removeFile(file.name)} variant="ghost" size="icon" className="flex-shrink-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
