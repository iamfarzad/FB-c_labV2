"use client"

import { useState, useCallback, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"

interface UseApiRequestOptions {
  showSuccessToast?: boolean
  showErrorToast?: boolean
  retryAttempts?: number
  retryDelay?: number
  timeout?: number
}

interface ApiRequestState {
  isLoading: boolean
  error: Error | null
  data: any
}

export function useApiRequest(options: UseApiRequestOptions = {}) {
  const {
    showSuccessToast = false,
    showErrorToast = true,
    retryAttempts = 0,
    retryDelay = 1000,
    timeout = 30000,
  } = options

  const { toast } = useToast()
  const abortControllerRef = useRef<AbortController | null>(null)

  const [state, setState] = useState<ApiRequestState>({
    isLoading: false,
    error: null,
    data: null,
  })

  const execute = useCallback(
    async (
      url: string,
      options: RequestInit = {},
      customOptions: {
        successMessage?: string
        errorMessage?: string
        transform?: (data: any) => any
      } = {},
    ) => {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController()

      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      let attempt = 0
      const maxAttempts = retryAttempts + 1

      while (attempt < maxAttempts) {
        try {
          // Create timeout promise
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Request timeout")), timeout)
          })

          // Create fetch promise
          const fetchPromise = fetch(url, {
            ...options,
            headers: {
              "Content-Type": "application/json",
              ...options.headers,
            },
            signal: abortControllerRef.current.signal,
          })

          // Race between fetch and timeout
          const response = (await Promise.race([fetchPromise, timeoutPromise])) as Response

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          let data
          const contentType = response.headers.get("content-type")

          if (contentType?.includes("application/json")) {
            data = await response.json()
          } else if (contentType?.includes("text/")) {
            data = await response.text()
          } else {
            data = await response.blob()
          }

          // Transform data if transformer provided
          if (customOptions.transform) {
            data = customOptions.transform(data)
          }

          setState((prev) => ({ ...prev, data, isLoading: false }))

          if (showSuccessToast && customOptions.successMessage) {
            toast({
              title: "Success",
              description: customOptions.successMessage,
            })
          }

          return data
        } catch (error: any) {
          attempt++

          if (error.name === "AbortError") {
            setState((prev) => ({ ...prev, isLoading: false }))
            return null
          }

          if (attempt >= maxAttempts) {
            const finalError = new Error(customOptions.errorMessage || error.message || "Request failed")

            setState((prev) => ({
              ...prev,
              error: finalError,
              isLoading: false,
            }))

            if (showErrorToast) {
              toast({
                title: "Request Failed",
                description: finalError.message,
                variant: "destructive",
              })
            }

            throw finalError
          }

          // Wait before retry
          if (attempt < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt))
          }
        }
      }
    },
    [showSuccessToast, showErrorToast, retryAttempts, retryDelay, timeout, toast],
  )

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, data: null })
  }, [])

  return {
    ...state,
    execute,
    cancel,
    reset,
  }
}
