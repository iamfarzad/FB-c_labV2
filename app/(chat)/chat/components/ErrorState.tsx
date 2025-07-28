"use client"

import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface ErrorStateProps {
  error: Error
  onRetry: () => void
}

export const ErrorState = ({ error, onRetry }: ErrorStateProps) => (
  <div className="p-4">
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Chat Error</AlertTitle>
      <AlertDescription>
        <p>{error.message || "An unexpected error occurred."}</p>
        <Button onClick={onRetry} variant="link" className="p-0 h-auto mt-2 text-destructive-foreground">
          Try again
        </Button>
      </AlertDescription>
    </Alert>
  </div>
)
