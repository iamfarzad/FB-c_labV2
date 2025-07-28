"use client"

import { useState, useCallback, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"

interface UseFileUploadOptions {
  allowedTypes?: string[]
  maxSize?: number
  maxFiles?: number
  onUploadStart?: (files: File[]) => void
  onUploadProgress?: (progress: number) => void
  onUploadComplete?: (results: FileUploadResult[]) => void
  onUploadError?: (error: Error) => void
}

interface FileUploadResult {
  file: File
  url?: string
  data?: string
  error?: string
}

interface FileUploadState {
  isUploading: boolean
  progress: number
  uploadedFiles: FileUploadResult[]
  error: Error | null
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const {
    allowedTypes = ["*/*"],
    maxSize = 10 * 1024 * 1024, // 10MB default
    maxFiles = 1,
    onUploadStart,
    onUploadProgress,
    onUploadComplete,
    onUploadError,
  } = options

  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [state, setState] = useState<FileUploadState>({
    isUploading: false,
    progress: 0,
    uploadedFiles: [],
    error: null,
  })

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file size
      if (file.size > maxSize) {
        return `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
      }

      // Check file type
      if (allowedTypes.length > 0 && !allowedTypes.includes("*/*")) {
        const isAllowed = allowedTypes.some((type) => {
          if (type.endsWith("/*")) {
            return file.type.startsWith(type.slice(0, -1))
          }
          return file.type === type || file.name.toLowerCase().endsWith(type.replace(".", ""))
        })

        if (!isAllowed) {
          return `File type not allowed. Allowed types: ${allowedTypes.join(", ")}`
        }
      }

      return null
    },
    [allowedTypes, maxSize],
  )

  const uploadFiles = useCallback(
    async (files: File[]): Promise<FileUploadResult[]> => {
      if (files.length > maxFiles) {
        throw new Error(`Maximum ${maxFiles} file(s) allowed`)
      }

      const results: FileUploadResult[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const validationError = validateFile(file)

        if (validationError) {
          results.push({ file, error: validationError })
          continue
        }

        try {
          // Update progress
          const progress = ((i + 1) / files.length) * 100
          setState((prev) => ({ ...prev, progress }))
          onUploadProgress?.(progress)

          // For images, convert to base64
          if (file.type.startsWith("image/")) {
            const data = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result as string)
              reader.onerror = reject
              reader.readAsDataURL(file)
            })
            results.push({ file, data })
          } else {
            // For other files, upload to server
            const formData = new FormData()
            formData.append("file", file)

            const response = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            })

            if (!response.ok) {
              throw new Error(`Upload failed: ${response.statusText}`)
            }

            const result = await response.json()
            results.push({ file, url: result.url })
          }
        } catch (error) {
          console.error("File upload error:", error)
          results.push({
            file,
            error: error instanceof Error ? error.message : "Upload failed",
          })
        }
      }

      return results
    },
    [maxFiles, validateFile, onUploadProgress],
  )

  const handleFileSelect = useCallback(
    async (files: File[] | FileList) => {
      const fileArray = Array.from(files)

      if (fileArray.length === 0) return

      setState((prev) => ({
        ...prev,
        isUploading: true,
        progress: 0,
        error: null,
      }))

      try {
        onUploadStart?.(fileArray)
        const results = await uploadFiles(fileArray)

        setState((prev) => ({
          ...prev,
          uploadedFiles: [...prev.uploadedFiles, ...results],
          isUploading: false,
          progress: 100,
        }))

        onUploadComplete?.(results)

        // Show success toast for successful uploads
        const successCount = results.filter((r) => !r.error).length
        if (successCount > 0) {
          toast({
            title: "Upload Complete",
            description: `${successCount} file(s) uploaded successfully`,
          })
        }

        // Show error toast for failed uploads
        const errorCount = results.filter((r) => r.error).length
        if (errorCount > 0) {
          toast({
            title: "Upload Errors",
            description: `${errorCount} file(s) failed to upload`,
            variant: "destructive",
          })
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Upload failed")
        setState((prev) => ({
          ...prev,
          error: err,
          isUploading: false,
        }))
        onUploadError?.(err)
        toast({
          title: "Upload Failed",
          description: err.message,
          variant: "destructive",
        })
      }
    },
    [uploadFiles, onUploadStart, onUploadComplete, onUploadError, toast],
  )

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const clearUploads = useCallback(() => {
    setState((prev) => ({
      ...prev,
      uploadedFiles: [],
      error: null,
      progress: 0,
    }))
  }, [])

  const removeFile = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index),
    }))
  }, [])

  return {
    ...state,
    fileInputRef,
    handleFileSelect,
    openFileDialog,
    clearUploads,
    removeFile,
    validateFile,
  }
}
